import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { registerHooks } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import test, { after as afterAll, before } from 'node:test';

import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';

import * as schema from '../lib/db/schema.ts';

/**
 * A payment Zeke drafts is refused at the real submit route before anyone's
 * approval is taken.
 *
 * On 2026-09-26 two checkers approved a Zeke draft of 15,000 USD in /queue and
 * the executor could only report "The payment details for this approval could
 * not be found": a Zeke draft carries no request for the executor to replay
 * (lib/queue/approval-dead-end.ts). This file drafts one through Zeke's local
 * planner, into the app's proposal store writing through to Postgres, then posts
 * app/api/proposals/[id]/submit/route.ts as each checker, as the queue and the
 * chat's "Approve now" do. tests/approval-dead-end.test.mjs covers the rule, the
 * executor and the queue's reading of the answer.
 *
 * Everything is real and on PGlite except `cookies()`, where the route reads its
 * session, and `after()`: the stubs from tests/approved-payout-once.test.mjs.
 */

process.env.DATABASE_URL = 'postgres://pglite.invalid/approval-dead-end-route';
process.env.CUSTOMER_SESSION_SECRET = 'approval-dead-end-route-session-secret-0123456789abcdef0123456789';
process.env.FEATURE_KYB_GATE = 'true';
process.env.USE_MOCK_APIS = 'true';
process.env.SPLASH_DATA_DIR = path.join(os.tmpdir(), 'splash-approval-dead-end-route-no-data');
delete process.env.SPLASH_COMPLIANCE_CONFIG_ID;
delete process.env.SPLASH_CUSTODY_PACKAGE_ID;
delete process.env.REDIS_URL;

// ── A request scope outside Next ────────────────────────────────────────────

const scope = { cookies: new Map(), deferred: [] };
globalThis.__approvalDeadEndScope = scope;

const stubModule = (source) => `data:text/javascript,${encodeURIComponent(source)}`;

const NEXT_HEADERS = stubModule(`
  const jar = () => globalThis.__approvalDeadEndScope.cookies;
  export async function cookies() {
    return {
      get: (name) => (jar().has(name) ? { name, value: jar().get(name) } : undefined),
      getAll: () => [...jar()].map(([name, value]) => ({ name, value })),
      has: (name) => jar().has(name),
      set: () => {},
      delete: () => {},
    };
  }
  export async function headers() {
    return new Headers();
  }
`);

const NEXT_SERVER = stubModule(`
  export * from 'next/server.js';
  export function after(task) {
    globalThis.__approvalDeadEndScope.deferred.push(task);
  }
`);

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'next/headers') return { url: NEXT_HEADERS, shortCircuit: true };
    if (specifier === 'next/server') return { url: NEXT_SERVER, shortCircuit: true };
    if (context.parentURL?.startsWith('data:')) {
      return nextResolve(specifier, { ...context, parentURL: import.meta.url });
    }
    return nextResolve(specifier, context);
  },
});

// ── The workspace ───────────────────────────────────────────────────────────

/** Who asks Zeke, and the two checkers who used to approve its drafts. */
const PEOPLE = {
  requester: { id: 'usr_demo', email: 'demo@acme.test', role: 'admin' },
  nadia: { id: 'usr_nadia', email: 'nadia@acme.test', role: 'checker' },
  priya: { id: 'usr_priya', email: 'priya@acme.test', role: 'checker' },
};
const ORG = 'acme';

let client;
let app;

async function applyMigrations() {
  const files = (await readdir(new URL('../drizzle', import.meta.url))).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sqlText = await readFile(new URL(`../drizzle/${file}`, import.meta.url), 'utf8');
    for (const statement of sqlText.split('--> statement-breakpoint')) {
      const trimmed = statement.trim();
      if (trimmed) await client.exec(trimmed);
    }
  }
}

async function loadApp() {
  const [route, state, persistence, oxwal, deadEnd, session, legal] = await Promise.all([
    import('@/app/api/proposals/[id]/submit/route'),
    import('@/lib/queue/proposal-state'),
    import('@/lib/queue/proposal-persistence'),
    import('@/lib/agent/oxwal'),
    import('@/lib/queue/approval-dead-end'),
    import('@/lib/auth/customer-session'),
    import('@/content/legal'),
  ]);
  return {
    submit: route.POST,
    InMemoryProposalStore: state.InMemoryProposalStore,
    makeProposalWriter: persistence.makeProposalWriter,
    runOxwalAgent: oxwal.runOxwalAgent,
    resetOxwalFixtures: oxwal.resetOxwalFixtures,
    upsertOxwalCounterpartyFixture: oxwal.upsertOxwalCounterpartyFixture,
    approvalDeadEnd: deadEnd.approvalDeadEnd,
    CUSTOMER_SESSION_COOKIE: session.CUSTOMER_SESSION_COOKIE,
    createCustomerSessionFromIdentity: session.createCustomerSessionFromIdentity,
    createCustomerSessionToken: session.createCustomerSessionToken,
    TERMS_VERSION: legal.TERMS_VERSION,
  };
}

/** A verified business that has accepted the terms, and the people above. */
async function seed() {
  await client.exec(`
    INSERT INTO organizations (id, name, kyb_lifecycle, legal_name, registration_number, address_line1, address_city, address_country)
    VALUES ('${ORG}', 'Acme Manufacturing', 'ACTIVE', 'Acme Manufacturing Sdn Bhd', '202401012345', 'Level 12, Menara Splash', 'Kuala Lumpur', 'MY');
  `);
  for (const person of Object.values(PEOPLE)) {
    await client.query(`INSERT INTO users (id, email, name, email_verified_at) VALUES ($1, $2, $3, now())`, [
      person.id,
      person.email,
      person.email,
    ]);
    await client.query(`INSERT INTO memberships (id, user_id, org_id, role) VALUES ($1, $2, $3, $4)`, [
      `mem_${person.id}`,
      person.id,
      ORG,
      person.role,
    ]);
  }
  await client.query(`INSERT INTO terms_acceptances (id, user_id, org_id, version) VALUES ($1, $2, $3, $4)`, [
    `terms_${ORG}`,
    PEOPLE.requester.id,
    ORG,
    app.TERMS_VERSION,
  ]);
}

before(async () => {
  client = new PGlite();
  await applyMigrations();
  globalThis.splashDb = { pool: { end: async () => {} }, db: drizzle(client, { schema }) };
  app = await loadApp();
  await seed();
});

afterAll(async () => {
  delete globalThis.splashDb;
  await client?.close();
});

// ── Acting in it ────────────────────────────────────────────────────────────

function signIn(person) {
  const session = app.createCustomerSessionFromIdentity({ email: person.email, credentialVersion: 1 });
  scope.cookies = new Map([[app.CUSTOMER_SESSION_COOKIE, app.createCustomerSessionToken(session, process.env.CUSTOMER_SESSION_SECRET)]]);
}

/** Ask Zeke, as the requester, and return what it drafted. */
async function askZeke(message) {
  const events = [];
  for await (const event of app.runOxwalAgent({ message, orgId: ORG, actorId: PEOPLE.requester.id, forceLocal: true })) {
    events.push(event);
  }
  const drafted = events.find((event) => event.type === 'proposal');
  assert.ok(drafted, JSON.stringify(events.filter((event) => event.type === 'warning')));
  return drafted;
}

/** POST /api/proposals/[id]/submit as `person`, as the queue's buttons do. */
async function decide(person, proposalId, decision = 'APPROVE') {
  signIn(person);
  const response = await app.submit(
    new Request(`http://splash.test/api/proposals/${proposalId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signatureRef: `sig_queue_${proposalId}`, decision }),
    }),
    { params: Promise.resolve({ id: proposalId }) },
  );
  return { status: response.status, body: await response.json() };
}

async function row(proposalId) {
  const { rows } = await client.query(
    `SELECT status, execution_state, (SELECT count(*)::int FROM approvals WHERE proposal_id = $1) AS approvals
       FROM proposals WHERE id = $1`,
    [proposalId],
  );
  return rows[0];
}

// ── The refusal ─────────────────────────────────────────────────────────────

test('neither checker can approve a payment Zeke drafted, and nothing is recorded', async () => {
  const store = new app.InMemoryProposalStore(app.makeProposalWriter());
  globalThis.oxwalProposalStore = store;
  app.resetOxwalFixtures();
  app.upsertOxwalCounterpartyFixture({
    id: 'cp_manila_parts',
    orgId: ORG,
    name: 'Manila Parts Supply',
    country: 'PH',
    defaultCurrency: 'PHP',
    kybStatus: 'VERIFIED',
    bankRefHash: 'beneficiary:manila-parts:test',
  });

  const drafted = await askZeke('Pay 15,000 USD to Manila Parts Supply (counterparty cp_manila_parts) in PHP');
  const id = drafted.proposal.id;
  const expected = app.approvalDeadEnd(drafted.proposal, { custodyEnabled: false });
  assert.equal(expected.code, 'AGENT_DRAFT_NOT_SENDABLE');
  assert.deepEqual(drafted.deadEnd, expected, 'the chat was told as it drafted');

  await store.flush();
  assert.deepEqual(await row(id), { status: 'SIMULATED', execution_state: null, approvals: 0 }, 'written through as drafted');

  for (const checker of [PEOPLE.nadia, PEOPLE.priya]) {
    const answer = await decide(checker, id);
    assert.equal(answer.status, 409, JSON.stringify(answer.body));
    assert.equal(answer.body.code, 'AGENT_DRAFT_NOT_SENDABLE');
    assert.equal(answer.body.error, expected.detail);
  }

  // Refused before any transition: no approval to count, nothing carried out,
  // no claim spent, in the store and in Postgres.
  const held = store.get(id);
  assert.equal(held.status, 'SIMULATED');
  assert.deepEqual(held.approvals, []);
  assert.equal(held.execution, undefined);
  assert.equal(held.approvalConsumedBy, undefined);
  assert.deepEqual(await row(id), { status: 'SIMULATED', execution_state: null, approvals: 0 });
  const { rows: spent } = await client.query('SELECT count(*)::int AS n FROM consumed_approvals WHERE proposal_id = $1', [id]);
  assert.equal(spent[0].n, 0);
  assert.equal(scope.deferred.length, 0, 'no settlement was started');

  // A draft nobody can approve can still be cleared from the workspace.
  const rejected = await decide(PEOPLE.nadia, id, 'REJECT');
  assert.equal(rejected.status, 200, JSON.stringify(rejected.body));
  assert.equal(rejected.body.proposal.status, 'REJECTED');
});
