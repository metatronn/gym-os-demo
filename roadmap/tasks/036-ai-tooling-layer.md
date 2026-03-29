# Task 036: AI Tooling Layer, Model Routing & Prompt Management

**Phase:** 9 — AI Control Layer
**Priority:** Critical
**Depends on:** [031](./031-twilio-sms-inbox.md), [032](./032-workflow-engine-actions.md), [034](./034-marketing-automation.md), [035](./035-retention-engine.md)
**Blocks:** [037](./037-command-center-agents.md), [038](./038-internal-workspace.md), [039](./039-knowledge-brand-memory.md)

---

## Objective

Build the provider-agnostic AI platform layer that all agentic features will sit on. This task is about model abstraction, tool-calling, prompt/version management, tracing, and guardrails, not the end-user command UI itself.

## Steps

### 1. Model Abstraction

Create a single internal AI interface that can route to multiple providers/models:

- default fast model for routine actions
- stronger reasoning model for higher-complexity tasks
- provider swap without rewriting product logic

### 2. Tool Invocation Layer

Represent approved workflows and read-model queries as tools:

- read tools for members, leads, billing, schedule, reports
- action tools that wrap the workflow engine from Task 032
- consistent schemas for tool inputs/outputs

### 3. Prompt & Version Management

Store and version:

- system prompts
- agent prompts
- task-specific prompt templates
- evaluation fixtures and known-good examples

Prompt changes should be reviewable like code, not hidden in scattered strings.

### 4. Observability

Instrument every AI interaction with:

- request metadata
- selected model/provider
- tokens, latency, and cost
- tool calls
- final outcome status
- trace link to user action or workflow run

### 5. Safety Guardrails

- never allow arbitrary write access outside approved tools
- redact or avoid unsafe context where necessary
- enforce tenant and role context in every AI call
- require explicit confirmation paths for sensitive actions

## Acceptance Criteria

- The app has a provider-agnostic AI client layer
- Read and write tools are defined with structured schemas
- Prompt templates are versioned and traceable
- AI requests are observable for cost, latency, and tool usage
- Guardrails prevent AI from bypassing approved workflows
