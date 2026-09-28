/**
 * The business wallet's shape — one Sui multisig per organization (v15 §4).
 *
 * Membership and arithmetic live here, import-free of the database, so the
 * security properties are testable as pure functions:
 *
 *   | member            | kind      | weight | can sign alone? |
 *   | main admin        | zklogin   |   2    | yes             |
 *   | backup passkey    | passkey   |   2    | yes             |
 *   | recovery contact  | zklogin   |   1    | no              |
 *   | Splash cold key   | cold      |   1    | no              |
 *
 * Threshold is ALWAYS 2. Splash's cold key (weight 1 < 2) can move nothing on
 * its own, and Splash+Splash is impossible by construction: the only other
 * weight-1 member is the recovery contact, who must never be Splash staff
 * (mirrors `business_account.move`'s E_RECOVERY_IS_INSIDER). Recovery is the
 * recovery contact + the cold key (1+1 = 2) signing ONE migration transaction
 * to a fresh wallet; changing members changes the address, so the wallet is
 * built for migration from day one.
 *
 * A member's public key is stored in the flag-prefixed Sui form
 * (`PublicKey.toSuiPublicKey()`, base64), so any scheme — zkLogin public
 * identifier, passkey secp256r1, ed25519 — round-trips through one
 * reconstruction call.
 */
import { MultiSigPublicKey, parsePartialSignatures } from '@mysten/sui/multisig';
import { parseSerializedSignature, type PublicKey } from '@mysten/sui/cryptography';
import { fromBase64 } from '@mysten/sui/utils';
import { publicKeyFromSuiBytes } from '@mysten/sui/verify';

/** What the member is to the business, which fixes its weight. */
export type OrgWalletRole = 'admin' | 'backup' | 'recovery' | 'splash-cold';

/** The signature scheme the member's key uses. */
export type OrgWalletMemberKind = 'zklogin' | 'passkey' | 'cold';

export type OrgWalletMember = {
  kind: OrgWalletMemberKind;
  role: OrgWalletRole;
  /** Flag-prefixed Sui public key, base64 (`toSuiPublicKey()`). */
  publicKey: string;
  weight: number;
  /** The Splash user this key belongs to; absent for the cold key. */
  userId?: string;
  label: string;
};

export type OrgWalletStatus = 'active' | 'migrating' | 'retired';

/** Threshold 2, always: it is what makes weight-1 members powerless alone. */
export const ORG_WALLET_THRESHOLD = 2;

/** Sui caps a multisig at ten members. */
export const MAX_MEMBERS = 10;

export const ROLE_WEIGHT: Record<OrgWalletRole, number> = {
  admin: 2,
  backup: 2,
  recovery: 1,
  'splash-cold': 1,
};

const ROLE_KIND: Record<OrgWalletRole, OrgWalletMemberKind[]> = {
  admin: ['zklogin', 'passkey'],
  backup: ['passkey'],
  recovery: ['zklogin'],
  'splash-cold': ['cold'],
};

export class OrgWalletRuleError extends Error {}

function refuse(message: string): never {
  throw new OrgWalletRuleError(message);
}

/** Reconstruct the SDK public key for any member scheme. */
export function memberPublicKey(member: Pick<OrgWalletMember, 'publicKey'>): PublicKey {
  return publicKeyFromSuiBytes(fromBase64(member.publicKey));
}

/**
 * The rules a member set must satisfy before it may become a wallet. Returns
 * the set unchanged so creation sites can validate-and-use in one expression.
 */
export function validateMembers(members: OrgWalletMember[]): OrgWalletMember[] {
  if (members.length === 0) refuse('A wallet needs at least one member.');
  if (members.length > MAX_MEMBERS) refuse(`A Sui multisig holds at most ${MAX_MEMBERS} members.`);

  const admins = members.filter((m) => m.role === 'admin');
  if (admins.length !== 1) refuse('A wallet has exactly one main admin key.');

  for (const role of ['backup', 'recovery', 'splash-cold'] as const) {
    if (members.filter((m) => m.role === role).length > 1) {
      refuse(`A wallet holds at most one ${role} member.`);
    }
  }

  const seen = new Set<string>();
  for (const member of members) {
    if (member.weight !== ROLE_WEIGHT[member.role]) {
      refuse(`A ${member.role} member weighs ${ROLE_WEIGHT[member.role]}, not ${member.weight}.`);
    }
    if (!ROLE_KIND[member.role].includes(member.kind)) {
      refuse(`A ${member.role} member cannot be a ${member.kind} key.`);
    }
    if (member.role === 'splash-cold' && member.userId) {
      refuse("The Splash cold key belongs to no user account.");
    }
    if (member.role !== 'splash-cold' && !member.userId) {
      refuse(`A ${member.role} member names the user who holds it.`);
    }
    if (seen.has(member.publicKey)) refuse('Two members share one public key.');
    seen.add(member.publicKey);
    // Reconstruction throws on malformed bytes, so a corrupt row is caught
    // here rather than at signing time.
    memberPublicKey(member);
  }

  // The business must be able to act alone: at least one weight-2 member.
  if (!members.some((m) => m.weight >= ORG_WALLET_THRESHOLD)) {
    refuse('The business needs a key that can sign alone (the admin or the backup passkey).');
  }

  // Splash must NOT be able to act with itself: every reachable combination
  // that meets the threshold includes a member the business holds.
  const splashWeight = members
    .filter((m) => m.role === 'splash-cold')
    .reduce((sum, m) => sum + m.weight, 0);
  if (splashWeight >= ORG_WALLET_THRESHOLD) {
    refuse("Splash's keys must stay below the threshold on their own.");
  }

  return members;
}

/** The SDK multisig for a member set. Validation included, always. */
export function orgWalletPublicKey(members: OrgWalletMember[]): MultiSigPublicKey {
  return MultiSigPublicKey.fromPublicKeys({
    threshold: ORG_WALLET_THRESHOLD,
    publicKeys: validateMembers(members).map((member) => ({
      publicKey: memberPublicKey(member),
      weight: member.weight,
    })),
  });
}

/** The wallet's address. Deterministic in the members and threshold. */
export function deriveOrgWalletAddress(members: OrgWalletMember[]): string {
  return orgWalletPublicKey(members).toSuiAddress();
}

/** Whether a subset of roles can move money. Pure threshold arithmetic. */
export function rolesMeetThreshold(roles: OrgWalletRole[]): boolean {
  const weight = roles.reduce((sum, role) => sum + ROLE_WEIGHT[role], 0);
  return weight >= ORG_WALLET_THRESHOLD;
}

/** The member a given passkey credential is, if it is one (matched by key). */
export function passkeyMemberOf(
  members: OrgWalletMember[],
  passkeySuiPublicKey: string,
): OrgWalletMember | null {
  return members.find((m) => m.kind === 'passkey' && m.publicKey === passkeySuiPublicKey) ?? null;
}

/** The zkLogin member a user holds in this wallet, if any. */
export function zkLoginMemberOf(members: OrgWalletMember[], userId: string): OrgWalletMember | null {
  return members.find((m) => m.kind === 'zklogin' && m.userId === userId) ?? null;
}

/** Whether a member can move money by itself — weight at or above the threshold. */
export function signsAlone(member: OrgWalletMember | null | undefined): boolean {
  return Boolean(member && member.weight >= ORG_WALLET_THRESHOLD);
}

/**
 * Combine partials AND weigh them. The weight comes from the combined
 * multisig itself (each partial is matched to its public key inside the
 * multisig, with the weight the multisig assigns it), so no caller can
 * misattribute a key. A set below the threshold is a transaction the network
 * will refuse — callers refuse it FIRST, before anything is spent on it.
 */
export function combineAndWeigh(
  members: OrgWalletMember[],
  partialSignatures: string[],
): { signature: string; weight: number; meetsThreshold: boolean } {
  const signature = combineSignatures(members, partialSignatures);
  const parsed = parseSerializedSignature(signature);
  if (parsed.signatureScheme !== 'MultiSig') refuse('The combined signature is not a multisig.');
  const weight = parsePartialSignatures(parsed.multisig).reduce((sum, p) => sum + p.weight, 0);
  return { signature, weight, meetsThreshold: weight >= ORG_WALLET_THRESHOLD };
}

/**
 * Combine partial signatures into the multisig signature the network accepts.
 * `combinePartialSignatures` does not enforce the threshold (measured,
 * 2026-09-28) — the network and `verify*` do — so callers treat a combined
 * signature as a claim, not a proof, until the dry run passes.
 */
export function combineSignatures(members: OrgWalletMember[], partialSignatures: string[]): string {
  if (partialSignatures.length === 0) refuse('No signature to combine.');
  return orgWalletPublicKey(members).combinePartialSignatures(partialSignatures);
}
