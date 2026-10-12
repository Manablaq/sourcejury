const releaseCommit = process.env.SOURCEJURY_RELEASE_COMMIT ?? "";
const baseUrl = (process.env.SOURCEJURY_REVIEW_BASE_URL ?? "").replace(/\/+$/, "");

if (!/^[0-9a-f]{40}$/i.test(releaseCommit)) {
  throw new Error("SOURCEJURY_RELEASE_COMMIT must be an exact 40-character Git commit SHA.");
}

if (!/^https:\/\/[^/?#]+(?:\/.*)?$/i.test(baseUrl)) {
  throw new Error("SOURCEJURY_REVIEW_BASE_URL must be an HTTPS base URL.");
}

const rawBase =
  `https://raw.githubusercontent.com/Manablaq/sourcejury/${releaseCommit}`;

const plan = {
  schema: "sourcejury-reviewer-live-matrix-v1",
  network: {
    name: "GenLayer Studio Devnet",
    chainId: 61997,
    rpc: "https://studio-dev.genlayer.com/api"
  },
  releaseCommit,
  frontendBaseUrl: baseUrl,
  writeCount: 12,
  scenarios: [
    {
      id: "A",
      purpose: "SUPPORTED case plus rejected challenge",
      claim: "Reviewer fixture A reports status ENABLED.",
      primaryUrl: `${rawBase}/reviewer-fixtures/case-a-primary-support.txt`,
      policy: "DIRECT_SOURCE_V1",
      counterUrl: `${baseUrl}/reviewer-fixtures/case-a-counter-support.txt`,
      expected: {
        initialVerdict: "SUPPORTED",
        challengeOutcome: "REJECTED",
        counterAssessment: "SUPPORTS",
        effectiveVerdict: "SUPPORTED"
      }
    },
    {
      id: "B",
      purpose: "Conflicting evidence fails closed",
      claim: "Reviewer fixture B reports status ENABLED.",
      primaryUrl: `${rawBase}/reviewer-fixtures/case-b-primary-support.txt`,
      corroboratingUrl: `${baseUrl}/reviewer-fixtures/case-b-conflict-contradict.txt`,
      policy: "CORROBORATED_V1",
      expected: {
        primaryAssessment: "SUPPORTS",
        corroboratingAssessment: "CONTRADICTS",
        sourceConflict: true,
        effectiveVerdict: "INSUFFICIENT"
      }
    },
    {
      id: "C",
      purpose: "Unavailable evidence fails closed",
      claim: "Reviewer unavailable fixture C reports status ENABLED.",
      primaryUrl: "https://sourcejury-unavailable.invalid/evidence",
      policy: "DIRECT_SOURCE_V1",
      expected: {
        primaryAssessment: "UNAVAILABLE",
        primaryEvidenceStatus: "UNAVAILABLE",
        effectiveVerdict: "INSUFFICIENT",
        snapshotStored: false
      }
    },
    {
      id: "D",
      purpose: "SUPPORTED case plus upheld challenge",
      claim: "Reviewer fixture D reports status ENABLED.",
      primaryUrl: `${rawBase}/reviewer-fixtures/case-d-primary-support.txt`,
      policy: "DIRECT_SOURCE_V1",
      counterUrl: `${baseUrl}/reviewer-fixtures/case-d-counter-contradict.txt`,
      expected: {
        initialVerdict: "SUPPORTED",
        challengeOutcome: "UPHELD",
        counterAssessment: "CONTRADICTS",
        effectiveVerdict: "INSUFFICIENT"
      }
    }
  ],
  orderedWrites: [
    ["A", "create_case"],
    ["A", "evaluate_case"],
    ["A", "open_challenge"],
    ["A", "resolve_challenge"],
    ["B", "create_case"],
    ["B", "evaluate_case"],
    ["C", "create_case"],
    ["C", "evaluate_case"],
    ["D", "create_case"],
    ["D", "evaluate_case"],
    ["D", "open_challenge"],
    ["D", "resolve_challenge"]
  ]
};

process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
