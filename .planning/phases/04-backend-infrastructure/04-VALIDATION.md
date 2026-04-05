---
phase: 4
slug: backend-infrastructure
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-05
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x |
| **Config file** | server/vitest.config.ts (Wave 0 installs) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose --coverage`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | INFRA-01 | — | N/A | integration | `curl http://localhost:3001/api/health` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 1 | INFRA-02 | — | N/A | integration | `npx vitest run --grep "sessions"` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 2 | INFRA-03 | — | N/A | integration | `npx vitest run --grep "upload"` | ❌ W0 | ⬜ pending |
| 04-04-01 | 04 | 2 | INFRA-04 | T-04-01 | API key only in server env, never in frontend bundle | integration | `npx vitest run --grep "analyze"` | ❌ W0 | ⬜ pending |
| 04-05-01 | 05 | 3 | INFRA-05 | — | N/A | integration | `npx vitest run --grep "ai_calls"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `server/vitest.config.ts` — vitest configuration for server tests
- [ ] `server/tests/` — test directory structure
- [ ] `vitest` dev dependency in server/package.json

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| DO App Platform deployment | INFRA-01 | Requires live infrastructure | Deploy via `doctl apps update`, verify health endpoint responds |
| DO Spaces upload | INFRA-03 | Requires S3-compatible bucket access | Upload test image, verify CDN URL resolves |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
