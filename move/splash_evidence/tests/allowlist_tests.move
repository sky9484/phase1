#[test_only]
module splash_evidence::allowlist_tests;

use splash_evidence::allowlist::{Self, Allowlist, Cap};
use std::string;
use sui::clock;
use sui::test_scenario as ts;

const ISSUER: address = @0xA11CE;
const PAYER: address = @0xB0B;
const RECIPIENT: address = @0xCA7;
const PARTNER: address = @0xD00D;
const AUDITOR: address = @0xA0D17;
const STRANGER: address = @0x5714;

const NOW: u64 = 1_760_000_000_000;

fun identity(allowlist: &Allowlist, nonce: vector<u8>): vector<u8> {
    let mut id = allowlist::namespace(allowlist);
    id.append(nonce);
    id
}

fun create_list(scenario: &mut ts::Scenario): Cap {
    scenario.next_tx(ISSUER);
    let cap = allowlist::create(string::utf8(b"INV-2026-000417"), scenario.ctx());
    cap
}

#[test]
fun the_creator_is_the_first_member_and_can_read() {
    let mut scenario = ts::begin(ISSUER);
    let cap = create_list(&mut scenario);
    scenario.next_tx(ISSUER);
    let list = scenario.take_shared<Allowlist>();
    assert!(allowlist::members(&list).length() == 1);
    assert!(allowlist::can_read(&list, ISSUER, identity(&list, b"0001"), NOW));
    assert!(!allowlist::can_read(&list, PAYER, identity(&list, b"0001"), NOW));
    ts::return_shared(list);
    transfer::public_transfer(cap, ISSUER);
    scenario.end();
}

#[test]
fun the_four_parties_can_read_and_a_stranger_cannot() {
    let mut scenario = ts::begin(ISSUER);
    let cap = create_list(&mut scenario);
    scenario.next_tx(ISSUER);
    let mut list = scenario.take_shared<Allowlist>();
    allowlist::add(&mut list, &cap, PAYER);
    allowlist::add(&mut list, &cap, RECIPIENT);
    allowlist::add(&mut list, &cap, PARTNER);
    let id = identity(&list, b"receipt");
    assert!(allowlist::can_read(&list, ISSUER, id, NOW));
    assert!(allowlist::can_read(&list, PAYER, id, NOW));
    assert!(allowlist::can_read(&list, RECIPIENT, id, NOW));
    assert!(allowlist::can_read(&list, PARTNER, id, NOW));
    assert!(!allowlist::can_read(&list, STRANGER, id, NOW));
    assert!(allowlist::generation(&list) == 3);
    ts::return_shared(list);
    transfer::public_transfer(cap, ISSUER);
    scenario.end();
}

#[test]
fun seal_approve_passes_for_a_member() {
    let mut scenario = ts::begin(ISSUER);
    let cap = create_list(&mut scenario);
    scenario.next_tx(ISSUER);
    let mut list = scenario.take_shared<Allowlist>();
    allowlist::add(&mut list, &cap, PAYER);
    ts::return_shared(list);
    transfer::public_transfer(cap, ISSUER);

    scenario.next_tx(PAYER);
    let list = scenario.take_shared<Allowlist>();
    let mut clock = clock::create_for_testing(scenario.ctx());
    clock.set_for_testing(NOW);
    allowlist::seal_approve(identity(&list, b"receipt"), &list, &clock, scenario.ctx());
    clock.destroy_for_testing();
    ts::return_shared(list);
    scenario.end();
}

#[test]
#[expected_failure(abort_code = allowlist::E_NO_ACCESS)]
fun seal_approve_aborts_for_a_stranger() {
    let mut scenario = ts::begin(ISSUER);
    let cap = create_list(&mut scenario);
    transfer::public_transfer(cap, ISSUER);
    scenario.next_tx(STRANGER);
    let list = scenario.take_shared<Allowlist>();
    let mut clock = clock::create_for_testing(scenario.ctx());
    clock.set_for_testing(NOW);
    allowlist::seal_approve(identity(&list, b"receipt"), &list, &clock, scenario.ctx());
    abort 0
}

#[test]
fun another_lists_namespace_does_not_open_this_one() {
    let mut scenario = ts::begin(ISSUER);
    let cap_a = create_list(&mut scenario);
    let cap_b = create_list(&mut scenario);
    scenario.next_tx(ISSUER);
    let list_a = scenario.take_shared_by_id<Allowlist>(allowlist::cap_allowlist_id(&cap_a));
    let list_b = scenario.take_shared_by_id<Allowlist>(allowlist::cap_allowlist_id(&cap_b));
    // The issuer is a member of both, but an identity minted under A must not
    // be approved by presenting B.
    let id_a = identity(&list_a, b"receipt");
    assert!(allowlist::can_read(&list_a, ISSUER, id_a, NOW));
    assert!(!allowlist::can_read(&list_b, ISSUER, id_a, NOW));
    ts::return_shared(list_a);
    ts::return_shared(list_b);
    transfer::public_transfer(cap_a, ISSUER);
    transfer::public_transfer(cap_b, ISSUER);
    scenario.end();
}

#[test]
fun a_short_identity_is_not_a_prefix_match() {
    let mut scenario = ts::begin(ISSUER);
    let cap = create_list(&mut scenario);
    scenario.next_tx(ISSUER);
    let list = scenario.take_shared<Allowlist>();
    let mut truncated = allowlist::namespace(&list);
    truncated.pop_back();
    assert!(!allowlist::can_read(&list, ISSUER, truncated, NOW));
    assert!(allowlist::is_prefix_for_testing(b"ab", b"abc"));
    assert!(!allowlist::is_prefix_for_testing(b"abc", b"ab"));
    assert!(!allowlist::is_prefix_for_testing(b"ax", b"abc"));
    ts::return_shared(list);
    transfer::public_transfer(cap, ISSUER);
    scenario.end();
}

#[test]
fun a_grant_reads_until_it_expires() {
    let mut scenario = ts::begin(ISSUER);
    let cap = create_list(&mut scenario);
    scenario.next_tx(ISSUER);
    let mut list = scenario.take_shared<Allowlist>();
    let mut clock = clock::create_for_testing(scenario.ctx());
    clock.set_for_testing(NOW);
    allowlist::grant(&mut list, &cap, AUDITOR, NOW + 1_000, &clock);
    let id = identity(&list, b"receipt");
    assert!(allowlist::can_read(&list, AUDITOR, id, NOW));
    assert!(allowlist::can_read(&list, AUDITOR, id, NOW + 999));
    assert!(!allowlist::can_read(&list, AUDITOR, id, NOW + 1_000));
    assert!(!allowlist::can_read(&list, AUDITOR, id, NOW + 5_000));
    // Re-granting replaces, it does not stack.
    allowlist::grant(&mut list, &cap, AUDITOR, NOW + 9_000, &clock);
    assert!(allowlist::grant_count(&list) == 1);
    assert!(allowlist::can_read(&list, AUDITOR, id, NOW + 5_000));
    clock.destroy_for_testing();
    ts::return_shared(list);
    transfer::public_transfer(cap, ISSUER);
    scenario.end();
}

#[test]
fun removing_any_member_revokes_every_grant() {
    let mut scenario = ts::begin(ISSUER);
    let cap = create_list(&mut scenario);
    scenario.next_tx(ISSUER);
    let mut list = scenario.take_shared<Allowlist>();
    let mut clock = clock::create_for_testing(scenario.ctx());
    clock.set_for_testing(NOW);
    allowlist::add(&mut list, &cap, PAYER);
    allowlist::add(&mut list, &cap, PARTNER);
    allowlist::grant(&mut list, &cap, AUDITOR, NOW + 100_000, &clock);
    let id = identity(&list, b"receipt");
    assert!(allowlist::can_read(&list, AUDITOR, id, NOW));
    // The corridor partner leaves the payment. The auditor's standing access
    // was issued under a different set of parties; it does not survive.
    allowlist::remove(&mut list, &cap, PARTNER);
    assert!(allowlist::grant_count(&list) == 0);
    assert!(!allowlist::can_read(&list, AUDITOR, id, NOW));
    assert!(!allowlist::can_read(&list, PARTNER, id, NOW));
    assert!(allowlist::can_read(&list, PAYER, id, NOW));
    clock.destroy_for_testing();
    ts::return_shared(list);
    transfer::public_transfer(cap, ISSUER);
    scenario.end();
}

#[test]
fun revoke_ends_one_grant_early() {
    let mut scenario = ts::begin(ISSUER);
    let cap = create_list(&mut scenario);
    scenario.next_tx(ISSUER);
    let mut list = scenario.take_shared<Allowlist>();
    let mut clock = clock::create_for_testing(scenario.ctx());
    clock.set_for_testing(NOW);
    allowlist::grant(&mut list, &cap, AUDITOR, NOW + 100_000, &clock);
    allowlist::revoke(&mut list, &cap, AUDITOR);
    assert!(!allowlist::can_read(&list, AUDITOR, identity(&list, b"receipt"), NOW));
    clock.destroy_for_testing();
    ts::return_shared(list);
    transfer::public_transfer(cap, ISSUER);
    scenario.end();
}

#[test]
#[expected_failure(abort_code = allowlist::E_WRONG_CAP)]
fun the_cap_of_another_list_is_refused() {
    let mut scenario = ts::begin(ISSUER);
    let cap_a = create_list(&mut scenario);
    let cap_b = create_list(&mut scenario);
    scenario.next_tx(ISSUER);
    let mut list_a = scenario.take_shared_by_id<Allowlist>(allowlist::cap_allowlist_id(&cap_a));
    allowlist::add(&mut list_a, &cap_b, PAYER);
    abort 0
}

#[test]
#[expected_failure(abort_code = allowlist::E_DUPLICATE)]
fun a_member_cannot_be_added_twice() {
    let mut scenario = ts::begin(ISSUER);
    let cap = create_list(&mut scenario);
    scenario.next_tx(ISSUER);
    let mut list = scenario.take_shared<Allowlist>();
    allowlist::add(&mut list, &cap, PAYER);
    allowlist::add(&mut list, &cap, PAYER);
    abort 0
}

#[test]
#[expected_failure(abort_code = allowlist::E_EXPIRY_IN_THE_PAST)]
fun a_grant_must_expire_in_the_future() {
    let mut scenario = ts::begin(ISSUER);
    let cap = create_list(&mut scenario);
    scenario.next_tx(ISSUER);
    let mut list = scenario.take_shared<Allowlist>();
    let mut clock = clock::create_for_testing(scenario.ctx());
    clock.set_for_testing(NOW);
    allowlist::grant(&mut list, &cap, AUDITOR, NOW, &clock);
    abort 0
}

#[test]
#[expected_failure(abort_code = allowlist::E_TOO_MANY)]
fun a_list_is_bounded() {
    let mut scenario = ts::begin(ISSUER);
    let cap = create_list(&mut scenario);
    scenario.next_tx(ISSUER);
    let mut list = scenario.take_shared<Allowlist>();
    let mut i = 1u64;
    // The creator is member 1; fifteen more reach the bound; the sixteenth
    // addition (member 17) must abort.
    while (i <= 16) {
        allowlist::add(&mut list, &cap, sui::address::from_u256((0x1000 + i) as u256));
        i = i + 1;
    };
    abort 0
}
