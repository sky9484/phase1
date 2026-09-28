-- The business wallet and the salts that sign for it (v15 §3-4).
--
-- org_wallets: one Sui multisig per organization. `members` is the wallet's
-- definition (kind/role/publicKey/weight per member, validated in
-- lib/wallet/org-wallet-rules.ts); `address` is derived from it and stored
-- because every money path filters by address. A membership change is a new
-- row — changing members changes a multisig address — so `status` carries the
-- lifecycle (active → migrating → retired) and the partial unique index keeps
-- exactly one CURRENT wallet (active or migrating) per org while history
-- remains — no parallel wallet can be minted during a recovery notice.
CREATE TABLE "org_wallets" (
  "id" text PRIMARY KEY NOT NULL,
  "org_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "address" text NOT NULL,
  "members" jsonb NOT NULL,
  "threshold" integer NOT NULL,
  "version" integer NOT NULL DEFAULT 1,
  "status" text NOT NULL DEFAULT 'active',
  "recovery" jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "org_wallets_one_current" ON "org_wallets" ("org_id") WHERE "status" IN ('active', 'migrating');
--> statement-breakpoint
CREATE INDEX "org_wallets_address_idx" ON "org_wallets" ("address");
--> statement-breakpoint
-- user_salts: Splash's encrypted copy of each zkLogin salt (Enoki is the
-- authority). Ciphertext only — the plaintext links an OAuth identity to an
-- address, and losing it loses the wallet member, which is why the copy
-- exists at all. Keyed by the JWT identity triple, not the user id.
CREATE TABLE "user_salts" (
  "id" text PRIMARY KEY NOT NULL,
  "issuer" text NOT NULL,
  "audience" text NOT NULL,
  "subject" text NOT NULL,
  "salt_ciphertext" text NOT NULL,
  "address" text NOT NULL,
  "authority" text NOT NULL DEFAULT 'enoki',
  "user_id" text REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "user_salts_identity_unique" ON "user_salts" ("issuer", "audience", "subject");
--> statement-breakpoint
CREATE INDEX "user_salts_user_idx" ON "user_salts" ("user_id");
