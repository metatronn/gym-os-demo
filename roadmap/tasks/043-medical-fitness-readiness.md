# Task 043: Medical-Fitness / HIPAA / JCC Readiness

**Phase:** 11 — Platform Expansion & Vertical Readiness
**Priority:** Medium
**Depends on:** [030](./030-multi-location-architecture.md), [039](./039-knowledge-brand-memory.md), [024](./024-security-hardening.md)
**Blocks:** later medical-adjacent vertical expansion

---

## Objective

Cover the second-wave vertical requirements from the docs: medical-fitness, rehab-to-membership journeys, and broader community/JCC-style programming needs. This task is about readiness and foundation, not pretending those workflows are already trivial.

## Steps

### 1. Clinical / Medical-Adjacent Data Model

Add the shape for:

- SOAP or clinical-note references
- treatment/protocol metadata
- consent and waiver artifacts
- care-team / coach relationships
- rehab-to-membership conversion path markers

### 2. Compliance Boundary Review

Design the product boundary for PHI-sensitive workflows:

- access controls
- audit trail requirements
- storage and retention expectations
- encryption and disclosure rules

This task should explicitly call out what is and is not HIPAA-ready at each stage.

### 3. JCC / Community Programming Readiness

Extend planning for broader program operations such as:

- non-class programming
- multi-space scheduling (courts, pools, classrooms)
- volunteer/community program references where needed

### 4. Journey Design

Model how a person can move from:

- intake / clinical recommendation
- rehab or PT-aligned programming
- ongoing fitness membership

without forcing disconnected records or manual re-entry.

## Acceptance Criteria

- The roadmap has a concrete data and compliance foundation for medical-adjacent workflows
- Rehab-to-membership journeys are represented in the product model
- Community-program / JCC scheduling needs are accounted for in the design
- HIPAA-related boundaries are explicitly documented rather than hand-waved
- Future vertical expansion can build on real platform primitives
