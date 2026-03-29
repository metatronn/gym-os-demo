# Task 001: GitHub Branch Protection & Repository Hygiene

**Phase:** 0 — Infrastructure & CI/CD
**Priority:** Critical
**Depends on:** Nothing
**Blocks:** [002](./002-vercel-project-setup.md), [003](./003-environment-secrets.md)

---

## Objective

Lock down the `main` branch so nothing lands without a passing CI check and a PR. Set up the repo for professional team development.

## Steps

### 1. Branch Protection Rules

In GitHub → `metatronn/gym-os-demo` → Settings → Branches → Add rule for `main`:

- [x] **Require a pull request before merging**
  - Require 1 approval (can be relaxed for solo dev, but enforce the PR workflow)
  - Dismiss stale reviews when new commits are pushed
- [x] **Require status checks to pass before merging**
  - Add the CI check name (from Task 004) once it exists
- [x] **Require branches to be up to date before merging**
- [x] **Do not allow bypassing the above settings** (even for admins)
- [ ] **Require signed commits** (optional, enable if you use GPG)

### 2. Default Branch Naming

Ensure `main` is the default branch (it already is).

### 3. Repository Settings

- Enable **Automatically delete head branches** after merge
- Enable **Always suggest updating pull request branches**
- Disable **Allow merge commits** — use **Squash and merge** only for clean history

### 4. Labels

Create these labels for PR/issue triage:

| Label | Color | Description |
|-------|-------|-------------|
| `infra` | `#0E8A16` | Infrastructure & CI/CD |
| `feature` | `#1D76DB` | New feature |
| `bugfix` | `#D93F0B` | Bug fix |
| `db` | `#FBCA04` | Database / migration |
| `billing` | `#B60205` | Stripe / payments |
| `auth` | `#5319E7` | Authentication / Clerk |
| `email` | `#F9D0C4` | Resend / transactional email |

### 5. CODEOWNERS (Optional)

Create `.github/CODEOWNERS`:
```
* @metatronn
```

## Acceptance Criteria

- Direct pushes to `main` are blocked
- PRs require status checks (once CI exists)
- Head branches auto-delete after merge
- Squash merge is the default strategy
