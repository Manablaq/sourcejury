"""Live Studio Next certification tests.

These tests perform blockchain writes on the hosted Studio development preview.
They are deliberately gated and must never run by default.
"""

import os

import pytest

pytestmark = pytest.mark.studio_next

if os.getenv("SOURCEJURY_AUTHORIZE_STUDIO_WRITE") != "YES":
    pytest.skip(
        "Studio Next writes are locked. Set SOURCEJURY_AUTHORIZE_STUDIO_WRITE=YES only after explicit authorization.",
        allow_module_level=True,
    )

from gltest import get_contract_factory, get_default_account
from gltest.assertions import tx_execution_succeeded


PRIMARY = "https://docs.genlayer.com/developers/networks"
CORROBORATING = "https://github.com/genlayerlabs/genlayer-studio/releases/tag/v0.123.0-rc.7"
COUNTER_SUPPORTING = "https://raw.githubusercontent.com/genlayerlabs/genlayer-docs/1cd8e2d11f743141b441be91ed65f321139814cc/pages/developers/networks.mdx"


def _factory():
    return get_contract_factory(contract_file_path="contracts/source_jury.py")


def _transact(method, args):
    receipt = method(args=args).transact(
        account=get_default_account(),
        consensus_max_rotations=3,
        wait_until="finalized",
        wait_interval=3000,
        wait_retries=240,
    )
    assert tx_execution_succeeded(receipt), receipt
    return receipt


def test_studio_next_end_to_end_three_verdicts_and_challenge():
    contract = _factory().deploy(
        account=get_default_account(),
        consensus_max_rotations=3,
        wait_until="finalized",
        wait_interval=3000,
        wait_retries=240,
    )

    info = contract.get_protocol_info().call()
    assert info["protocol_version"] == "sourcejury-v1"

    # Case A — expected SUPPORTED.
    receipt_a = _transact(
        contract.create_case,
        [
            "The GenLayer Studio development preview uses chain ID 61997.",
            PRIMARY,
            CORROBORATING,
            "CORROBORATED_V1",
        ],
    )
    assert receipt_a is not None
    _transact(contract.evaluate_case, [1])
    case_a = contract.get_case(args=[1]).call()
    assert case_a["state"] == "RESOLVED"
    assert case_a["effective_verdict"] == "SUPPORTED"

    # Case B — expected CONTRADICTED from the authoritative network page.
    _transact(
        contract.create_case,
        [
            "The GenLayer Studio development preview uses chain ID 61999.",
            PRIMARY,
            "",
            "DIRECT_SOURCE_V1",
        ],
    )
    _transact(contract.evaluate_case, [2])
    case_b = contract.get_case(args=[2]).call()
    assert case_b["effective_verdict"] == "CONTRADICTED"

    # Case C — same source does not establish an unrelated claim, expected INSUFFICIENT.
    _transact(
        contract.create_case,
        [
            "The Eiffel Tower is 330 meters tall.",
            PRIMARY,
            "",
            "DIRECT_SOURCE_V1",
        ],
    )
    _transact(contract.evaluate_case, [3])
    case_c = contract.get_case(args=[3]).call()
    assert case_c["effective_verdict"] == "INSUFFICIENT"

    # Challenge flow — a distinct-host counter-source that supports Case A should
    # be rejected deterministically and must not change the effective verdict.
    _transact(
        contract.open_challenge,
        [1, COUNTER_SUPPORTING, "Versioned GenLayer network documentation corroborates the original verdict."],
    )
    _transact(contract.resolve_challenge, [1])
    challenge = contract.get_challenge(args=[1]).call()
    case_a_after_challenge = contract.get_case(args=[1]).call()
    assert challenge["challenge_outcome"] == "REJECTED"
    assert challenge["revised_verdict"] == "SUPPORTED"
    assert case_a_after_challenge["effective_verdict"] == "SUPPORTED"
    assert case_a_after_challenge["pending_challenge_id"] == 0
