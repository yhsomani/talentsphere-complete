# TalentSphere — BRAIN.md v6.0

## 1. How to Think About the System

TalentSphere is not primarily a job board, learning site, social network or AI wrapper. It is a **career evidence system**.

## 2. Core mental model

```text
GOAL
→ CAPABILITY GAP
→ ACTIVITY
→ EVIDENCE
→ VERIFICATION
→ OPPORTUNITY
→ OUTCOME
→ NEW EVIDENCE
```

## 3. Claim vs Evidence

A profile claim says what a user says.

Evidence says what supports the claim.

Verification says who/what validated the evidence.

Reputation is context around trust and behavior.

## 4. Graph Model

Talent Graph:
- skills;
- competencies;
- capabilities;
- prerequisites;
- relationships.

Evidence Graph:
- evidence;
- provenance;
- verification;
- credentials;
- recency;
- conflicts;
- outcomes.

Career Graph:
- goals;
- transitions;
- experiences;
- learning;
- applications;
- interviews;
- outcomes.

## 5. Decision Systems

### Matching
Hard constraints first. Then capability/evidence/experience/preferences/recency/uncertainty.

### Recommendations
Always explain why.

### Career intelligence
Scenario/decision support, not prophecy.

### Trust
Anomaly is a signal for review, not automatic guilt.

## 6. AI

AI can draft, explain, summarize, classify and recommend within policy.

AI does not own truth.

AI memory does not equal profile truth.

AI-generated evidence is always provenance-labeled.

## 7. Assessment

The assessment session is a trust boundary. AI policy follows the session.

## 8. Privacy

The same data can have different visibility based on purpose. Never collapse privacy into a single public/private boolean.

## 9. Architecture Heuristic

Prefer:
```text
clear module
+ explicit contract
+ boring infrastructure
+ strong tests
```
over:
```text
generic abstraction
+ distributed complexity
+ hidden coupling
```

## 10. Common mistakes

- building AI before domain data is trustworthy;
- turning every feature into a shared platform;
- using a score when dimensions are needed;
- treating realtime as truth;
- treating queues as exactly-once business side effects;
- hard-coding policy values;
- confusing implementation existence with correctness.
