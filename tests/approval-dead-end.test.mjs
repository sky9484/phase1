import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

/**
 * An approval that could only fail is refused before anyone gives it.
 *
 * On 2026-09-26 Zeke drafted "Pay 15,000 USD to Acme Manufacturing PH", two
 * checkers approved it in /queue, and the executor could only answer "The
 * payment details for this approval could not be found". The executor carries
 * a payment out by replaying the request it was filed with, and a Zeke draft
 * has none: it is built from a counterparty record, which holds a reference to
 * the account, not the account. lib/queue/approval-dead-end.ts names that case
 * once, and the gate, the executor, the chat and the queue all ask it.
 *
 * tests/approval-dead-end-route.test.mjs sends a real Zeke draft through the
 * real submit route.
 */

// Phase 0, no database: the in-process path.
delete process.env.DATABASE_URL;
delete process.env.SPLASH_CUSTODY_PACKAGE_ID;
// A data directory of its own. The approval gate reads the circuit breakers'
// file, and on Windows a read held open while another test process renames
// the shared data/circuit-breakers.json into place fails that rename (EPERM).
process.env.SPLASH_DATA_DIR = path.join(os.tmpdir(), 'splash-approval-dead-end-no-data');

const { ApprovalDeadEndError, approvalDeadEnd, replaysFiledRequest } = await import('../lib/queue/approval-dead-end.ts');
const { AGENT_ACTOR_ID } = await import('../lib/agent/identity.ts');

const ALL_KINDS = [
  'PAYMENT',
  'BATCH_PAYOUT',
  'X402_PAYMENT',
  'TREASURY_ALLOCATE',
  'TREASURY_REDEEM',
  'FX_CONVERT',
  'NETTING_SETTLE',
  'INTERNAL_TRANSFER',
];

/** What the approvers in these tests work to: two above 10,000 USD. */
const POLICY = {
  orgId: 'demo-business',
  tier1ThresholdUsd: 1_000_000_000n,
  dualApprovalThresholdUsd: 10_000_000_000n,
  whitelistedAutoKinds: ['TREASURY_ALLOCATE'],
  operatingMinimumByCorridor: { MY_PH: 5_000_000_000n },
  perCorridorState: { MY_PH: 'ARMED' },
  globalState: 'ARMED',
};

// ── The rule ────────────────────────────────────────────────────────────────

test('a payment Zeke drafts could not be sent by any approval, and the reason says where it can be', () => {
  const deadEnd = approvalDeadEnd({ kind: 'PAYMENT', createdBy: AGENT_ACTOR_ID }, { custodyEnabled: false });
  assert.equal(deadEnd.code, 'AGENT_DRAFT_NOT_SENDABLE');
  assert.match(deadEnd.detail, /^Zeke drafted this payment from a counterparty record/);
  assert.match(deadEnd.detail, /so an approval cannot send it/);
  assert.match(deadEnd.detail, /send the payment from Transfer\.$/);
  assert.deepEqual(deadEnd.sendFrom, { href: '/dashboard/transfer', label: 'Open Transfer' });

  const run = approvalDeadEnd({ kind: 'BATCH_PAYOUT', createdBy: AGENT_ACTOR_ID }, { custodyEnabled: false });
  assert.equal(run.code, 'AGENT_DRAFT_NOT_SENDABLE');
  assert.match(run.detail, /payout run/);
  assert.deepEqual(run.sendFrom, { href: '/dashboard/batch', label: 'Open Batch Payout' });
});

test('a payment a money route filed carries its request and passes; one that lost it keeps its own words', () => {
  const filed = { kind: 'PAYMENT', createdBy: 'usr_ben', executionPayload: { amount: { value: '15000', targetCurrency: 'PHP' } } };
  assert.equal(approvalDeadEnd(filed, { custodyEnabled: false }), null);

  // A row saved before the request was stored on proposals. The maker can file
  // it again, which is not something Zeke's draft can be told.
  const lost = approvalDeadEnd({ kind: 'PAYMENT', createdBy: 'usr_ben' }, { custodyEnabled: false });
  assert.equal(lost.code, 'REQUEST_NOT_ON_RECORD');
  assert.equal(
    lost.detail,
    'The payment details for this approval could not be found, so nothing was sent. Re-authorize the payment to try again.',
  );
  assert.equal(lost.sendFrom, undefined);
});

test('what replays nothing is never a dead end: x402, FX, netting, internal transfers, and treasury in Phase 0', () => {
  for (const kind of ['X402_PAYMENT', 'FX_CONVERT', 'NETTING_SETTLE', 'INTERNAL_TRANSFER', 'TREASURY_ALLOCATE', 'TREASURY_REDEEM']) {
    assert.equal(replaysFiledRequest(kind, false), false, kind);
    assert.equal(approvalDeadEnd({ kind, createdBy: AGENT_ACTOR_ID }, { custodyEnabled: false }), null, kind);
  }
  // With custody on, /api/treasury carries a move out from its request, and a
  // move Zeke drafted has none.
  for (const kind of ['TREASURY_ALLOCATE', 'TREASURY_REDEEM']) {
    const deadEnd = approvalDeadEnd({ kind, createdBy: AGENT_ACTOR_ID }, { custodyEnabled: true });
    assert.equal(deadEnd.code, 'AGENT_DRAFT_NOT_SENDABLE', kind);
    assert.deepEqual(deadEnd.sendFrom, { href: '/dashboard/treasury', label: 'Open Treasury' }, kind);
  }
});

// ── The executor, for anything approved before the gate refused it ────────────

test('the executor fails exactly what the gate refuses, in the same words, and skips the rest', async () => {
  const { InMemoryProposalStore } = await import('../lib/queue/proposal-state.ts');
  const { executeApprovedProposal } = await import('../lib/server/approval-execution.ts');
  const { custodyPhaseEnabled } = await import('../lib/server/custody-phase.ts');
  assert.equal(custodyPhaseEnabled(), false, 'this test runs in Phase 0');

  const store = new InMemoryProposalStore();
  globalThis.oxwalProposalStore = store;
  const approvedWithoutRequest = (kind, createdBy) => {
    const id = `prop_${kind.toLowerCase()}_${createdBy.toLowerCase()}`;
    const now = new Date().toISOString();
    store.create({
      id,
      idempotencyKey: `idem_${id}`,
      kind,
      status: 'SIMULATED',
      tier: 'TIER_0_PROPOSE',
      orgId: 'demo-business',
      corridor: 'MY_PH',
      unsignedTxBytes: 'deadbeef',
      createdBy,
      createdAt: now,
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
      approvals: [],
      explain: {
        recommendation: 'test',
        financialImpact: { amountIn: 15_000_000_000n, currencyIn: 'USD' },
        evidence: [],
        confidence: null,
        risk: 'MEDIUM',
        requiredApprovers: 1,
        reasoningTraceRef: 'test',
      },
      simulation: { ok: true, balanceChanges: [], gasSponsored: true, simulatedAt: now },
    });
    // Approved through the state machine directly: the walk would refuse the
    // dead ends, which is the point of it. These stand for ones approved first.
    store.transition(id, { type: 'POLICY_EVALUATED', requiredApprovers: 1 });
    store.transition(id, { type: 'QUEUE_FOR_APPROVAL' });
    store.transition(id, { type: 'APPROVE', approval: { userId: 'usr_nadia', role: 'APPROVER', signedAt: now } });
    store.transition(id, { type: 'SIGN', signatureRef: 'sig', signedBy: 'usr_nadia', policyAuthorized: true, signedAt: now });
    return store.transition(id, { type: 'SUBMIT' });
  };
  const context = { cookie: '', origin: 'http://splash.test' };

  for (const kind of ALL_KINDS) {
    const proposal = approvedWithoutRequest(kind, AGENT_ACTOR_ID);
    const outcome = await executeApprovedProposal(proposal, null, context);
    const deadEnd = approvalDeadEnd(proposal, { custodyEnabled: false });
    if (deadEnd) {
      assert.deepEqual(outcome, { state: 'FAILED', detail: deadEnd.detail }, kind);
    } else {
      // It used to fail every one of these as a payment whose details were lost.
      assert.equal(outcome.state, 'SKIPPED', `${kind}: ${outcome.detail}`);
      assert.doesNotMatch(outcome.detail, /payment details/, kind);
    }
    // One approval, one attempt, whatever came of it.
    assert.equal(store.get(proposal.id).approvalConsumedBy, 'execution', kind);
  }

  const lost = await executeApprovedProposal(approvedWithoutRequest('PAYMENT', 'usr_ben'), null, context);
  assert.equal(lost.state, 'FAILED');
  assert.match(lost.detail, /Re-authorize the payment to try again\.$/);
});

// ── Zeke, and the approval gate ─────────────────────────────────────────────

test('Zeke says so as it drafts the payment, and the gate takes nobody’s approval for it', async () => {
  const { getOxwalProposalStore, resetOxwalFixtures, resetOxwalProposalStore, runOxwalAgent } = await import('../lib/agent/oxwal.ts');
  const { evaluateAtApproval } = await import('../lib/queue/approval-walk.ts');
  const { resolveComplianceForProposal } = await import('../lib/compliance/proposal-screening.ts');
  resetOxwalFixtures();
  resetOxwalProposalStore();

  const events = [];
  for await (const event of runOxwalAgent({
    message: 'Pay 15,000 USD to Acme Manufacturing PH (counterparty cp_acme_ph) in PHP',
    orgId: 'demo-business',
    actorId: 'operator-1',
    forceLocal: true,
  })) {
    events.push(event);
  }

  const drafted = events.find((event) => event.type === 'proposal');
  assert.ok(drafted, JSON.stringify(events.filter((event) => event.type === 'warning')));
  assert.equal(drafted.proposal.kind, 'PAYMENT');
  assert.equal(drafted.proposal.createdBy, AGENT_ACTOR_ID);
  assert.equal(drafted.proposal.status, 'SIMULATED');
  assert.equal(drafted.proposal.executionPayload, undefined);
  assert.equal(drafted.deadEnd.code, 'AGENT_DRAFT_NOT_SENDABLE');
  assert.equal(drafted.deadEnd.sendFrom.href, '/dashboard/transfer');

  // The reply says it, not only the card.
  const said = events.filter((event) => event.type === 'delta').map((event) => event.text).join('');
  assert.ok(said.includes(drafted.deadEnd.detail), said);
  assert.doesNotMatch(said, /not executable until policy evaluation passes/);

  // The recipient is screened, so nothing but the dead end stands in the way:
  // compliance would clear it.
  const store = getOxwalProposalStore();
  assert.deepEqual(resolveComplianceForProposal(store.get(drafted.proposal.id)).flags, []);

  const approveAs = (userId, proposalId = drafted.proposal.id) =>
    evaluateAtApproval(store, {
      proposalId,
      actor: { userId, role: 'APPROVER' },
      policy: POLICY,
      compliance: resolveComplianceForProposal,
      custodyEnabled: false,
      signatureRef: `sig_queue_${proposalId}`,
      now: new Date(),
    });
  for (const approver of ['usr_nadia', 'usr_priya']) {
    assert.throws(
      () => approveAs(approver),
      (error) => error instanceof ApprovalDeadEndError && error.deadEnd.code === 'AGENT_DRAFT_NOT_SENDABLE',
      approver,
    );
  }
  const untouched = store.get(drafted.proposal.id);
  assert.equal(untouched.status, 'SIMULATED', 'refused before any transition');
  assert.deepEqual(untouched.approvals, []);
  assert.equal(untouched.execution, undefined);

  // The same payment filed by a money route, with its request, goes through
  // the gate to the approvers: the refusal is about the missing request only.
  store.create({
    ...drafted.proposal,
    id: 'prop_filed_by_transfer',
    idempotencyKey: 'idem_filed_by_transfer',
    createdBy: 'usr_ben',
    executionPayload: { amount: { value: '15000', targetCurrency: 'PHP' } },
  });
  const { proposal: queued, decision } = approveAs('usr_nadia', 'prop_filed_by_transfer');
  assert.deepEqual(decision, { outcome: 'REQUIRE_APPROVAL', approvers: 2 });
  assert.equal(queued.status, 'PENDING_APPROVAL');
});

test('the approval channel names the reason without doubling its full stop', async () => {
  const settle = await readFile(new URL('../lib/server/approval-settle.ts', import.meta.url), 'utf8');
  assert.match(settle, /custodyEnabled: deps\.custodyEnabled/);
  assert.match(settle, /custodyEnabled: custodyPhaseEnabled\(\)/);
  assert.match(settle, /error\.message\.replace\(\/\\\.\\s\*\$\/, ''\)/);
});

// ── The queue ──────────────────────────────────────────────────────────────

test('the queue closes a refused draft and says nothing was approved or sent', async () => {
  const { interpretSubmitResponse } = await import('../lib/queue/queue-decision.ts');
  const { detail } = approvalDeadEnd({ kind: 'PAYMENT', createdBy: AGENT_ACTOR_ID }, { custodyEnabled: false });
  const outcome = interpretSubmitResponse(409, { error: detail, code: 'AGENT_DRAFT_NOT_SENDABLE' }, 'APPROVE');
  assert.deepEqual(outcome, { kind: 'closed', message: `${detail} Nothing was approved or sent.` });

  const lost = interpretSubmitResponse(409, { error: 'The payment details were lost.', code: 'REQUEST_NOT_ON_RECORD' }, 'APPROVE');
  assert.equal(lost.kind, 'closed');
});

test('the queue page does not offer a draft no approval could send', async () => {
  const page = await readFile(new URL('../app/queue/page.tsx', import.meta.url), 'utf8');
  const live = page.slice(page.indexOf('const liveProposals'), page.indexOf('const readyItems'));
  assert.match(live, /\.filter\(\(item\) => !approvalDeadEnd\(item, \{ custodyEnabled \}\)\)/);
  assert.match(page, /const custodyEnabled = custodyPhaseEnabled\(\);/);
});
