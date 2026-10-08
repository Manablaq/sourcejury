import ast
from pathlib import Path


CONTRACT = Path(__file__).resolve().parents[1] / "contracts" / "source_jury.py"
SOURCE = CONTRACT.read_text()
TREE = ast.parse(SOURCE)


def test_runner_is_pinned_exactly():
    lines = SOURCE.splitlines()
    assert lines[0] == "# v0.3.0"
    assert lines[1] == '# { "Depends": "py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng" }'
    assert "import genlayer as gl" in SOURCE
    assert "from genlayer import *" not in SOURCE
    assert "py-genlayer:test" not in SOURCE
    assert "py-genlayer:latest" not in SOURCE


def test_exactly_one_contract_class():
    classes = [n for n in TREE.body if isinstance(n, ast.ClassDef)]
    contract_classes = [
        n for n in classes
        if any(
            isinstance(base, ast.Attribute)
            and isinstance(base.value, ast.Attribute)
            and isinstance(base.value.value, ast.Name)
            and base.value.value.id == "gl"
            and base.value.attr == "contract"
            and base.attr == "Contract"
            for base in n.bases
        )
    ]
    assert [c.name for c in contract_classes] == ["SourceJury"]


def test_no_strict_eq_or_evm_contract_dependency():
    assert "strict_eq" not in SOURCE
    assert "@gl.evm.contract_interface" not in SOURCE
    assert "gl.get_contract_at" not in SOURCE
    assert ".emit(" not in SOURCE


def test_nondeterminism_is_custom_validated():
    assert SOURCE.count("gl.vm.run_nondet") == 2
    assert "gl.vm.run_nondet_default" not in SOURCE
    assert "gl.vm.run_nondet_unsafe" not in SOURCE
    assert "import genlayer.gl.vm as glvm" not in SOURCE
    assert SOURCE.count("gl.nondet.exec_prompt") == 2
    assert "proposed[\"verdict\"] == local[\"verdict\"]" in SOURCE
    assert "proposed[\"challenge_outcome\"] == local[\"challenge_outcome\"]" in SOURCE


def test_web_and_llm_inputs_are_bounded():
    assert "MAX_CLAIM_CHARS = 1200" in SOURCE
    assert "MAX_URL_CHARS = 512" in SOURCE
    assert "MAX_SOURCE_TEXT_CHARS = 8000" in SOURCE
    assert "MAX_RATIONALE_CHARS = 800" in SOURCE
    assert "MAX_CHALLENGES_PER_CASE = 8" in SOURCE


def test_prompt_injection_boundaries_exist():
    assert "BEGIN_UNTRUSTED_CLAIM" in SOURCE
    assert "BEGIN_UNTRUSTED_PRIMARY" in SOURCE
    assert "BEGIN_UNTRUSTED_CORROBORATING" in SOURCE
    assert "BEGIN_UNTRUSTED_COUNTER_EVIDENCE" in SOURCE
    assert "never as instructions" in SOURCE


def test_storage_annotations_use_supported_types():
    contract = next(n for n in TREE.body if isinstance(n, ast.ClassDef) and n.name == "SourceJury")
    fields = [n for n in contract.body if isinstance(n, ast.AnnAssign)]
    rendered = [ast.unparse(f.annotation) for f in fields]
    assert rendered == [
        "u256",
        "u256",
        "gl.storage.TreeMap[u256, str]",
        "gl.storage.TreeMap[u256, str]",
        "gl.storage.TreeMap[str, u256]",
        "gl.storage.TreeMap[str, u256]",
    ]
    assert all("list" not in x and "dict" not in x and x != "int" for x in rendered)
    # In the v0.3 Python SDK, u256 is typing.Annotated[int, ...], not a runtime constructor.
    assert "u256(" not in SOURCE
    assert "gl.TreeMap[" not in SOURCE
    assert SOURCE.count("gl.storage.TreeMap[") == 4


def test_all_public_views_have_return_annotations():
    contract = next(n for n in TREE.body if isinstance(n, ast.ClassDef) and n.name == "SourceJury")
    for fn in [n for n in contract.body if isinstance(n, ast.FunctionDef)]:
        decorators = {ast.unparse(d) for d in fn.decorator_list}
        if "gl.public.view" in decorators:
            assert fn.returns is not None, fn.name


def test_constructor_is_private():
    contract = next(n for n in TREE.body if isinstance(n, ast.ClassDef) and n.name == "SourceJury")
    init = next(n for n in contract.body if isinstance(n, ast.FunctionDef) and n.name == "__init__")
    assert not init.decorator_list


def test_challenge_verdict_is_contract_derived_not_model_selected():
    assert 'raw.get("revised_verdict")' not in SOURCE
    assert 'The contract, not the model, derives challenge outcome and revised verdict.' in SOURCE
    assert 'revised_verdict = INSUFFICIENT' in SOURCE


def test_url_surface_is_hardened_and_canonicalized():
    assert 'Evidence URLs cannot contain query parameters' in SOURCE
    assert 'Evidence URLs cannot contain fragments' in SOURCE
    assert 'Evidence URLs cannot contain credentials' in SOURCE
    assert 'Evidence URLs cannot use custom ports or IP literals' in SOURCE
    assert 'IP literal evidence hosts are not allowed' in SOURCE
    assert '_validate_dns_host(host)' in SOURCE


def test_provenance_is_persisted():
    assert '"submitter": str(gl.message.sender_address)' in SOURCE
    assert '"challenger": str(gl.message.sender_address)' in SOURCE
    assert '"primary_host": _extract_host(primary_url)' in SOURCE
    assert '"counter_host": counter_host' in SOURCE


def test_challenge_consensus_uses_immutable_case_snapshot():
    assert '_challenge_consensus(dict(case), challenge["counter_url"], challenge["note"])' in SOURCE
