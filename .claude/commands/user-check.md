---
description: Evaluate a feature/change from user perspectives
argument-hint: <feature or change description>
---

You are running a user perspective check. Load and consult all three user perspective agents:

1. **Javier (Gym Owner)** — `.claude/agents/gym-owner.md`
   - Would this feature help him run his gym?
   - Is the UX simple enough for a non-technical user?
   - Would he find it in under 3 clicks?

2. **Marcus (Head Coach)** — `.claude/agents/coach-staff.md`
   - Is this faster than a clipboard?
   - Does it work on an iPad during class?
   - Does he need admin access to use it?

3. **Rita (Skeptic)** — `.claude/agents/saas-skeptic.md`
   - Would this convince her to stay past the trial?
   - Does it feel trustworthy?
   - Any dealbreakers?

Summarize each perspective in 2-3 sentences, then give a combined verdict: SHIP, ITERATE, or RETHINK.

Feature/change to evaluate: $ARGUMENTS
