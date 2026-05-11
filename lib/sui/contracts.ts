import { Transaction } from "@mysten/sui/transactions"

import { SPLASH_PACKAGE_ID } from "@/lib/sui"
import { executeSponsoredTransaction } from "@/lib/sui/gas"

export type KybApplicationInput = {
  ssmNumber: string
  kybCid?: string
  owner?: string
}

export type BatchPayment = {
  employeeName: string
  wallet: string
  amountMyr: number
  status: "Ready" | "Queued" | "Executed"
}

export async function submitBusinessApplication(input: KybApplicationInput) {
  return executeSponsoredTransaction({
    kind: "business_account::submit_application",
    sender: input.owner ?? "0xmerchant",
    payload: {
      module: "splash_protocol::business_account",
      function: "submit_application",
      arguments: [input.ssmNumber, input.kybCid ?? "ipfs://pending"],
    },
  })
}

export function buildSubmitBusinessApplicationTx(input: Required<Pick<KybApplicationInput, "ssmNumber" | "kybCid">>) {
  const tx = new Transaction()

  tx.moveCall({
    target: `${SPLASH_PACKAGE_ID}::business_account::submit_application`,
    arguments: [tx.pure.string(input.ssmNumber), tx.pure.string(input.kybCid)],
  })

  return tx
}

export async function executeBatchSettlement(payments: BatchPayment[]) {
  return executeSponsoredTransaction({
    kind: "settlement::settle_batch",
    sender: "0xmerchant",
    payload: {
      module: "splash_protocol::settlement",
      function: "settle_batch",
      businessAccount: "0xbusiness_account",
      payments: payments.map((payment) => ({
        recipient: payment.wallet,
        amountMist: Math.round(payment.amountMyr * 1_000_000),
      })),
    },
  })
}
