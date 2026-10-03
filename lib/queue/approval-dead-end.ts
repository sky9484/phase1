import type { ProposalKind, UnsignedProposal } from '../agent/types.ts';
import { AGENT_ACTOR_ID, AGENT_DISPLAY_NAME } from '../agent/identity.ts';

/**
 * An approval that could only fail, found before anyone gives it.
 *
 * The approval executor (lib/server/approval-execution.ts) carries out a
 * payment, a payout run and, with custody on, a treasury move by replaying the
 * request each was filed with through the real money route, so every guard runs
 * again. That request is `executionPayload`, and the money routes attach it to
 * the proposals they file.
 *
 * Zeke's drafts carry none, and cannot yet. A payment draft is built from a
 * counterparty record, which holds a verified reference to the recipient's
 * account (a hash), not the account. The transfer route pays a named account
 * with its travel-rule record and the operator's choice of funding, so building
 * its request here would mean inventing bank details. Two people used to
 * approve such a draft in full, and the executor could only report that the
 * payment did not go.
 *
 * So this is checked where the approval would be given: the gate refuses it
 * (lib/queue/approval-walk.ts), the queue does not offer it, and the chat says
 * so when the draft is made. For one approved before this existed, the
 * executor names the same reason.
 */
export type ApprovalDeadEnd = {
  code: 'AGENT_DRAFT_NOT_SENDABLE' | 'REQUEST_NOT_ON_RECORD';
  /** In the approver's words: why an approval cannot carry it out. */
  detail: string;
  /** For an agent's draft, where the same payment can be made instead. */
  sendFrom?: { href: string; label: string };
};

/**
 * The kinds the executor carries out by replaying the request they were filed
 * with. Every other kind replays nothing and never needed one: an x402 request
 * is recorded, not paid, and FX, netting and internal transfers settle through
 * their own path. Phase 0 records an approved treasury move without carrying it
 * out; with custody on, `/api/treasury` carries it out from its request.
 */
export function replaysFiledRequest(kind: ProposalKind, custodyEnabled: boolean): boolean {
  if (kind === 'PAYMENT' || kind === 'BATCH_PAYOUT') return true;
  return custodyEnabled && (kind === 'TREASURY_ALLOCATE' || kind === 'TREASURY_REDEEM');
}

const TREASURY_DRAFT = {
  detail:
    `${AGENT_DISPLAY_NAME} drafted this treasury move in chat, and Treasury carries out only the moves ` +
    'requested on the Treasury screen, so an approval cannot make it. Make the move from Treasury.',
  sendFrom: { href: '/dashboard/treasury', label: 'Open Treasury' },
};

const AGENT_DRAFTS: Partial<Record<ProposalKind, { detail: string; sendFrom: { href: string; label: string } }>> = {
  PAYMENT: {
    detail:
      `${AGENT_DISPLAY_NAME} drafted this payment from a counterparty record, which holds a verified ` +
      'reference to the recipient’s account but not the account itself, so an approval cannot send it. ' +
      'To pay them, send the payment from Transfer.',
    sendFrom: { href: '/dashboard/transfer', label: 'Open Transfer' },
  },
  BATCH_PAYOUT: {
    detail:
      `${AGENT_DISPLAY_NAME} drafted this payout run from counterparty records, which hold verified ` +
      'references to the recipients’ accounts but not the accounts themselves, so an approval cannot send ' +
      'it. To pay them, run the payout from Batch Payout.',
    sendFrom: { href: '/dashboard/batch', label: 'Open Batch Payout' },
  },
  TREASURY_ALLOCATE: TREASURY_DRAFT,
  TREASURY_REDEEM: TREASURY_DRAFT,
};

/** A proposal filed by a money route whose request was lost, as a row saved
 *  before the request was stored on it. The maker can file it again. */
const REQUEST_NOT_ON_RECORD =
  'The payment details for this approval could not be found, so nothing was sent. ' +
  'Re-authorize the payment to try again.';

/**
 * What to say for a proposal of a kind that replays its request, when it has
 * none. An agent's draft never had one; anything else lost it.
 */
export function nothingToReplay(proposal: Pick<UnsignedProposal, 'kind' | 'createdBy'>): ApprovalDeadEnd {
  const draft = proposal.createdBy === AGENT_ACTOR_ID ? AGENT_DRAFTS[proposal.kind] : undefined;
  return draft
    ? { code: 'AGENT_DRAFT_NOT_SENDABLE', detail: draft.detail, sendFrom: draft.sendFrom }
    : { code: 'REQUEST_NOT_ON_RECORD', detail: REQUEST_NOT_ON_RECORD };
}

/** Why an approval of this proposal could not be carried out, or null when it could. */
export function approvalDeadEnd(
  proposal: Pick<UnsignedProposal, 'kind' | 'createdBy' | 'executionPayload'>,
  options: { custodyEnabled: boolean },
): ApprovalDeadEnd | null {
  if (proposal.executionPayload) return null;
  if (!replaysFiledRequest(proposal.kind, options.custodyEnabled)) return null;
  return nothingToReplay(proposal);
}

/** Thrown by the approval gate. The submit route answers it with a 409 that
 *  carries the code, and nothing has been recorded when it is thrown. */
export class ApprovalDeadEndError extends Error {
  readonly deadEnd: ApprovalDeadEnd;

  constructor(deadEnd: ApprovalDeadEnd) {
    super(deadEnd.detail);
    this.name = 'ApprovalDeadEndError';
    this.deadEnd = deadEnd;
  }
}
