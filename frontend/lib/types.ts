export type Verdict =
  | "SUPPORTED"
  | "CONTRADICTED"
  | "INSUFFICIENT"
  | "UNRESOLVED"
  | string;

export type CourtCase = {
  id: number;
  claim: string;
  primary_url: string;
  corroborating_url: string;
  policy: string;
  submitter: string;
  state: string;
  primary_assessment: string;
  corroborating_assessment: string;
  initial_verdict: Verdict;
  effective_verdict: Verdict;
  rationale: string;
  source_availability: string;
  source_conflict: boolean;
  revision: number;
  challenge_count: number;
  latest_challenge_id: number;
  pending_challenge_id: number;
  protocol_version?: string;
  primary_host?: string;
  corroborating_host?: string;
  evidence_commitment_scheme?: string;
  primary_evidence_status?: string;
  primary_snapshot_id?: string;
  primary_content_sha256?: string;
  primary_content_length?: number;
  corroborating_evidence_status?: string;
  corroborating_snapshot_id?: string;
  corroborating_content_sha256?: string;
  corroborating_content_length?: number;
};

export type Challenge = {
  id: number;
  case_id: number;
  challenger: string;
  counter_url: string;
  note: string;
  state: string;
  challenge_outcome: string;
  counter_assessment: string;
  counter_host: string;
  prior_effective_verdict: string;
  revised_verdict: string;
  rationale: string;
  challenge_mechanism?: string;
  original_primary_snapshot_id?: string;
  original_corroborating_snapshot_id?: string;
  authenticated_basis_verdict?: string;
  original_snapshot_consistent?: boolean;
  primary_live_status?: string;
  corroborating_live_status?: string;
  original_source_drift?: boolean;
  counter_evidence_status?: string;
  counter_snapshot_id?: string;
  counter_content_sha256?: string;
  counter_content_length?: number;
};

export type EvidenceSnapshot = {
  snapshot_version: string;
  commitment_scheme: string;
  snapshot_id: string;
  url: string;
  host: string;
  content_sha256: string;
  content_length: number;
  content: string;
};

export type EvidenceVerification = {
  snapshot: EvidenceSnapshot;
  contractVerified: boolean;
  locallyVerified: boolean;
};

export type CourtSnapshot = {
  protocolInfo: unknown;
  caseCount: number;
  challengeCount: number;
  cases: CourtCase[];
  challenges: Challenge[];
  refreshedAt: number;
};

export type WriteMethod =
  | "create_case"
  | "evaluate_case"
  | "open_challenge"
  | "resolve_challenge";

export type WriteStage =
  | "idle"
  | "network"
  | "estimating"
  | "awaiting-signature"
  | "submitted"
  | "finalizing"
  | "finalized"
  | "failed";

export type PreparedWrite = {
  method: WriteMethod;
  args: Array<string | number | boolean | bigint>;
  title: string;
  description: string;
};
