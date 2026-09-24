# TalentSphere — OPERATIONS.md v6.0

## 1. Environments

```text
local → CI → preview → staging → production
```

Each environment has separate secrets/config.

## 2. Observability

Critical trace:

```text
request → user → tenant → feature → API → DB/queue → provider → result
```

Use structured logs, metrics, traces, audit events and business dashboards.

## 3. SLOs

Set per-service/per-capability SLOs after baseline measurement.

## 4. Alerts

Alert on:
- elevated error rate;
- latency/SLO breach;
- queue age/backlog;
- database saturation;
- auth failures;
- tenant isolation signal;
- payment/webhook failures;
- AI policy/cost anomalies;
- assessment integrity anomalies.

## 5. Backups/DR

Prove:
- restore;
- point-in-time recovery where supported;
- storage recovery;
- queue recovery;
- configuration restoration;
- rollback.

## 6. Incident lifecycle

```text
detect → contain → assess → recover → communicate → postmortem
```

## 7. Runbooks

At minimum:
- DB incident;
- auth;
- RLS/tenant isolation;
- storage;
- queue;
- provider outage;
- payments;
- AI provider/policy;
- assessment integrity;
- privacy request;
- rollback;
- DR.

## 8. Release

No release without:
- security gate;
- critical E2E;
- accessibility evidence;
- migration proof;
- rollback path;
- observability;
- business acceptance.
