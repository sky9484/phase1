# Phase 1 Upgrade Log

## P0-1

- Added the shared Phase 1 domain store, transfer audit history, delivery tiers,
  invoices, ledger entries, sweep jobs, rate holds, and demo seed model.
- Added the mock AES-GCM Seal adapter with access policies and a fail-closed live
  adapter placeholder.

## P0-2

- Rebuilt the Walrus adapter with ciphertext-only validation, mock round-trip
  storage, live publisher/aggregator support, and typed network failures.
