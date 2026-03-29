# Task 037: Command Center v2 & Specialized Agent Orchestration

**Phase:** 9 — AI Control Layer
**Priority:** Critical
**Depends on:** [030](./030-multi-location-architecture.md), [032](./032-workflow-engine-actions.md), [036](./036-ai-tooling-layer.md)
**Blocks:** [041](./041-member-facing-ai-voice.md), [044](./044-predictive-analytics.md), [045](./045-autonomous-agent-execution.md)

---

## Objective

Turn the current mock command panel into the real conversational control surface described in the docs. The system should parse commands, route them to specialized agents, resolve ambiguity, request confirmation when needed, and execute safe workflows.

## Steps

### 1. Command Parsing Pipeline

For every user command, the system should:

1. classify question vs action
2. identify entities, dates, and locations
3. fetch relevant policy/permission context
4. detect ambiguity
5. determine whether preview or confirmation is required
6. execute through approved tools/workflows
7. present results in plain language
8. log the action in audit history

### 2. Safety & UX Rules

Add support for:

- object disambiguation when duplicates exist
- preview screens for financial or legal changes
- confirmation for destructive actions
- approval thresholds for sensitive workflows
- clear reason strings when the system refuses to act

### 3. Specialized Agent Orchestration

Implement the first set of agent roles from the docs:

- Sales Agent
- Retention Agent
- Marketing Agent
- Membership Operations Agent
- Scheduling & Capacity Agent
- Staff & Task Management Agent
- Finance & BI Agent
- Community & Engagement Agent

Each agent should have bounded tools, clear responsibilities, and routeable intents.

### 4. Command Center UI

Upgrade the command center so it can:

- accept natural-language commands
- show agent attribution or routing details where helpful
- stream progress and tool-step updates
- display previews and confirmations inline
- show execution results and linked records

### 5. Audit & Traceability

Every command should create a trace tying together:

- actor
- tenant/location context
- parsed intent
- agent chosen
- tool/workflow calls
- final result

## Acceptance Criteria

- The command center is connected to real AI tooling, not static UI
- Commands can safely execute approved workflows
- Ambiguity and destructive-action confirmations are handled explicitly
- Specialized agents route to distinct toolsets and responsibilities
- Every command is traceable from user input to final outcome
