#[test_only]
module splash_evidence::anchor_tests;

use splash_evidence::allowlist::{Self, Allowlist};
use splash_evidence::anchor::{Self, Anchor};
use std::string;
use sui::clock;
use sui::event;
use sui::test_scenario as ts;

const ISSUER: address = @0xA11CE;
const PAYER: address = @0xB0B;
const STRANGER: address = @0x5714;
const NOW: u64 = 1_760_000_000_000;

fun digest32(fill: u8): vector<u8> {
    let mut d = vector[];
    let mut i = 0u64;
    while (i < 32) {
        d.push_back(fill);
        i = i + 1;
    };
    d
}

#[test]
fun an_anchor_is_frozen_and_carries_only_the_digest() {
    let mut scenario = ts::begin(ISSUER);
    let mut clock = clock::create_for_testing(scenario.ctx());
    clock.set_for_testing(NOW);
    let id = anchor::anchor(anchor::kind_usdc_transfer(), digest32(7), &clock, scenario.ctx());
    assert!(event::num_events() == 1);

    scenario.next_tx(STRANGER);
    // Frozen: anyone can take it immutably, nobody can take it mutably.
    let frozen = scenario.take_immutable_by_id<Anchor>(id);
    assert!(anchor::kind(&frozen) == anchor::kind_usdc_transfer());
    assert!(anchor::matches(&frozen, digest32(7)));
    assert!(!anchor::matches(&frozen, digest32(8)));
    assert!(anchor::bundle(&frozen).is_none());
    assert!(anchor::anchored_by(&frozen) == ISSUER);
    assert!(anchor::anchored_at_ms(&frozen) == NOW);
    ts::return_immutable(frozen);
    clock.destroy_for_testing();
    scenario.end();
}

#[test]
fun a_party_to_the_bundle_can_anchor_for_it() {
    let mut scenario = ts::begin(ISSUER);
    let cap = allowlist::create(string::utf8(b"INV-1"), scenario.ctx());
    scenario.next_tx(ISSUER);
    let mut list = scenario.take_shared<Allowlist>();
    allowlist::add(&mut list, &cap, PAYER);
    ts::return_shared(list);
    transfer::public_transfer(cap, ISSUER);

    scenario.next_tx(PAYER);
    let list = scenario.take_shared<Allowlist>();
    let mut clock = clock::create_for_testing(scenario.ctx());
    clock.set_for_testing(NOW);
    let id = anchor::anchor_for(anchor::kind_invoice(), digest32(1), &list, &clock, scenario.ctx());
    ts::return_shared(list);

    scenario.next_tx(PAYER);
    let frozen = scenario.take_immutable_by_id<Anchor>(id);
    assert!(anchor::bundle(&frozen).is_some());
    assert!(anchor::anchored_by(&frozen) == PAYER);
    ts::return_immutable(frozen);
    clock.destroy_for_testing();
    scenario.end();
}

#[test]
#[expected_failure(abort_code = anchor::E_NOT_A_PARTY)]
fun a_stranger_cannot_anchor_for_someone_elses_bundle() {
    let mut scenario = ts::begin(ISSUER);
    let cap = allowlist::create(string::utf8(b"INV-1"), scenario.ctx());
    transfer::public_transfer(cap, ISSUER);
    scenario.next_tx(STRANGER);
    let list = scenario.take_shared<Allowlist>();
    let mut clock = clock::create_for_testing(scenario.ctx());
    clock.set_for_testing(NOW);
    anchor::anchor_for(anchor::kind_invoice(), digest32(1), &list, &clock, scenario.ctx());
    abort 0
}

#[test]
#[expected_failure(abort_code = anchor::E_NOT_A_PARTY)]
fun a_grant_may_read_but_not_anchor() {
    let mut scenario = ts::begin(ISSUER);
    let cap = allowlist::create(string::utf8(b"INV-1"), scenario.ctx());
    scenario.next_tx(ISSUER);
    let mut list = scenario.take_shared<Allowlist>();
    let mut clock = clock::create_for_testing(scenario.ctx());
    clock.set_for_testing(NOW);
    allowlist::grant(&mut list, &cap, STRANGER, NOW + 100_000, &clock);
    ts::return_shared(list);
    transfer::public_transfer(cap, ISSUER);

    scenario.next_tx(STRANGER);
    let list = scenario.take_shared<Allowlist>();
    anchor::anchor_for(anchor::kind_invoice(), digest32(1), &list, &clock, scenario.ctx());
    abort 0
}

#[test]
#[expected_failure(abort_code = anchor::E_BAD_DIGEST)]
fun a_31_byte_digest_is_refused() {
    let mut scenario = ts::begin(ISSUER);
    let mut clock = clock::create_for_testing(scenario.ctx());
    clock.set_for_testing(NOW);
    let mut short = digest32(1);
    short.pop_back();
    anchor::anchor(anchor::kind_usdc_transfer(), short, &clock, scenario.ctx());
    abort 0
}

#[test]
#[expected_failure(abort_code = anchor::E_BAD_DIGEST)]
fun a_33_byte_digest_is_refused() {
    let mut scenario = ts::begin(ISSUER);
    let mut clock = clock::create_for_testing(scenario.ctx());
    clock.set_for_testing(NOW);
    let mut long = digest32(1);
    long.push_back(1);
    anchor::anchor(anchor::kind_usdc_transfer(), long, &clock, scenario.ctx());
    abort 0
}

#[test]
#[expected_failure(abort_code = anchor::E_UNKNOWN_KIND)]
fun an_unknown_kind_is_refused() {
    let mut scenario = ts::begin(ISSUER);
    let mut clock = clock::create_for_testing(scenario.ctx());
    clock.set_for_testing(NOW);
    anchor::anchor(9, digest32(1), &clock, scenario.ctx());
    abort 0
}

#[test]
#[expected_failure(abort_code = anchor::E_UNKNOWN_KIND)]
fun kind_zero_is_refused() {
    let mut scenario = ts::begin(ISSUER);
    let mut clock = clock::create_for_testing(scenario.ctx());
    clock.set_for_testing(NOW);
    anchor::anchor(0, digest32(1), &clock, scenario.ctx());
    abort 0
}
