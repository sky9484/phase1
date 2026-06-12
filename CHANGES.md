# Phase 1 Upgrade Log

## P0-1

- Added the shared Phase 1 domain store, transfer audit history, delivery tiers,
  invoices, ledger entries, sweep jobs, rate holds, and demo seed model.
- Added the mock AES-GCM Seal adapter with access policies and a fail-closed live
  adapter placeholder.

## P0-2

- Rebuilt the Walrus adapter with ciphertext-only validation, mock round-trip
  storage, live publisher/aggregator support, and typed network failures.

## P0-3 / P0-4

- Added validated invoice APIs, Seal + Walrus document flow, a live invoice
  vault, secure pay-link creation, and issuer settlement confirmation.
- Added the public bank-transfer payment request and counterparty acquisition
  flow with payer recipient creation, KYB-invite stub, and analytics summary.

## P0-5 / P0-6

- Added the three-rung recipient delivery ladder to the send wizard and persisted
  the selected delivery tier through authorization.
- Added the PDAX adapter, settlement-completion sweep engine, stored-balance
  credits, paired ledger entries, and held-duration API fields.

## P0-7

- Added the five-panel 0xWal invoice-to-payment workspace, access checks,
  extraction recommendation route, invoice-prefilled transfer handoff, and chat link.

## P0-8

- Added linked audit-trail views with Walrus retrieval, Seal decryption, document
  hash verification, Seal allowlist and extraction evidence, Sui proof, sweep proof,
  and full status history.

## P0-9

- Added the compliance-copy CI guard, removed hardcoded visible treasury-rate
  defaults, removed the static nav yield badge, and made treasury execution fail
  closed in both the API and interface with the required projection disclosure.

## P0-10

- Completed the exact demo dataset across invoices, all three recipient tiers,
  completed swept transfer and audit chain, Cebu stored balance, and active PHP
  rate hold; wired recipients to the live store and applied DEMO badges.
