export type SponsoredTransactionKind =
  | "business_account::submit_application"
  | "settlement::settle_batch"
  | "peg_monitor::update_peg"

export type SponsoredTransactionRequest = {
  kind: SponsoredTransactionKind
  sender: string
  payload: unknown
  userSignature?: string
}

export type SponsoredTransactionResult = {
  digest: string
  sponsored: boolean
  networkFee: "Sponsored"
  sponsor: "shinami" | "mock"
  latencyMs: number
  status: "success" | "queued"
}

export type ShinamiGasSponsor = {
  sponsorTransaction: (request: SponsoredTransactionRequest) => Promise<{
    sponsorSignature: string
    transactionBytes: string
  }>
  executeTransaction: (request: {
    transactionBytes: string
    userSignature: string
    sponsorSignature: string
  }) => Promise<{ digest: string }>
}

function createMockDigest(kind: SponsoredTransactionKind) {
  const seed = `${kind}:${Date.now()}:${Math.random()}`
  let hash = 0

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index)
    hash |= 0
  }

  return `0x${Math.abs(hash).toString(16).padStart(8, "0")}${Date.now().toString(16)}`
}

export async function executeSponsoredTransaction(
  request: SponsoredTransactionRequest,
  sponsor?: ShinamiGasSponsor
): Promise<SponsoredTransactionResult> {
  const startedAt = performance.now()

  if (!sponsor || !request.userSignature) {
    await new Promise((resolve) => setTimeout(resolve, 400))

    return {
      digest: createMockDigest(request.kind),
      sponsored: true,
      networkFee: "Sponsored",
      sponsor: "mock",
      latencyMs: Math.round(performance.now() - startedAt),
      status: "success",
    }
  }

  const sponsored = await sponsor.sponsorTransaction(request)
  const executed = await sponsor.executeTransaction({
    transactionBytes: sponsored.transactionBytes,
    userSignature: request.userSignature,
    sponsorSignature: sponsored.sponsorSignature,
  })

  return {
    digest: executed.digest,
    sponsored: true,
    networkFee: "Sponsored",
    sponsor: "shinami",
    latencyMs: Math.round(performance.now() - startedAt),
    status: "success",
  }
}
