---
name: astra-orchestrator
description: Orchestrate complex Codex coding work for the Plus profile with GPT-6 Luna at max reasoning as planner/integrator, Luna subagents for exploration, implementation, testing, and research, and an Astra reviewer. Use for multi-file features, debugging across components, repo-wide changes, parallelizable workstreams, or whenever the user asks to delegate or use subagents. Do not use for trivial one-file edits or simple questions.
---

# Astra Orchestrator — Plus Profile

The user's explicit instructions take precedence over this skill.

## Goal

Use the root agent as the high-quality orchestrator.

Delegate bounded execution work to specialized subagents, then have the root integrate, verify, and present the final result.

The expected default topology is:

- root: GPT-6 Luna at max reasoning
- explorer: GPT-6 Luna at medium reasoning
- worker: GPT-6 Luna at medium reasoning
- tester: GPT-6 Luna at medium reasoning
- reviewer: GPT-6 Astra at low reasoning
- researcher: GPT-6 Luna at medium reasoning

Use Luna for all routine subagent execution.

This is a requirement, not a preference.

Only the reviewer uses Astra by default.

Do not override a Luna subagent to a more expensive model unless the user explicitly asks for escalation or a Luna worker reports that the task requires higher-level reasoning.

---

## Delegation gate

Default to root-only execution.

The root agent is responsible for completing ordinary coding tasks
without unnecessary delegation.

A task spanning multiple files does NOT automatically require
subagents.

Use root-only execution for:
- UI implementation from existing mockups.
- Styling, layout, and responsive fixes.
- Small and medium frontend features.
- Localized bugs and refactoring.
- Tasks that can be completed efficiently in one context.

Delegate only when:
- There are genuinely independent workstreams.
- Repository-wide exploration would consume excessive root context.
- A complex cross-service issue requires specialized investigation.
- An independent security or architectural review is necessary.
- The user explicitly requests multiple agents.

Before spawning a subagent, determine:
1. What specific problem will delegation solve?
2. Why can the root not handle it efficiently?
3. What concrete result must the subagent return?

If there is no clear benefit, do not delegate.

Do not spawn agents merely because multiple files are involved.

For ordinary tasks, use at most one subagent.
Additional agents require a concrete justification.

If delegation is unavailable, continue root-only when safe and
report any verification limitations.


---

## Root-agent responsibilities

The root agent owns:

1. understanding the user's actual goal
2. choosing the architecture and implementation direction
3. decomposing the task
4. deciding which tasks can run in parallel
5. spawning the appropriate subagents
6. giving each subagent a bounded contract
7. resolving conflicting subagent findings
8. integrating changes
9. reviewing the final diff
10. running or coordinating final verification
11. presenting the final result to the user

Subagents provide evidence and bounded execution.

They do not own the overall direction.

The root must not offload architectural ownership to a subagent.

---

## Spawn policy

When spawning agents, use these models by default:

- explorer: `gpt-6-luna` at `medium` reasoning
- worker: `gpt-6-luna` at `medium` reasoning
- tester: `gpt-6-luna` at `medium` reasoning
- researcher: `gpt-6-luna` at `medium` reasoning
- reviewer: `gpt-6-astra` at `low` reasoning

The root keeps the Plus profile configuration from `.codex/config.toml`: GPT-6 Luna at max reasoning. The role files in `.codex/agents/` explicitly set Luna reasoning to `medium` and reviewer reasoning to `low`. Preserve those efforts when spawning agents unless the user requests a change. Do not change the root model from within a session.

For every delegated task:

1. call `spawn_agent`
2. give the agent a descriptive task name using underscores
3. explicitly specify the intended model
4. give the subagent a bounded delegation contract
5. retain the returned task name or identifier
6. wait for required agents before final synthesis

Do not silently substitute the root agent for a required Luna worker.

Do not spawn Astra workers except for the `reviewer` role unless:

- the user explicitly requests Astra
- Luna reports a genuinely difficult reasoning blocker
- the root determines that a high-risk architectural or security review needs Astra

Routine execution should remain on Luna.

---

## Delegation contract

Every delegated task should include:

- Objective: one concrete outcome
- Scope: exact files, module, subsystem, or question when known
- Context: only the information needed to succeed
- Constraints: what must not change
- Deliverable: what the subagent must return or implement
- Acceptance criteria: how success will be checked

Prefer narrow tasks that can finish independently.

Bad:

> Fix the backend.

Good:

> Trace where POST /invoices validates currency. Return the responsible files, validation path, and existing tests. Do not edit files.

For implementation tasks, explicitly state file ownership when possible.

For exploration tasks, tell the agent not to edit files.

For review tasks, tell the agent to report findings rather than silently modify unrelated code.

---

## Role selection

Use `explorer` for:

- repository mapping
- tracing execution or data flow
- locating symbols and tests
- dependency inspection
- configuration inspection
- identifying implementation boundaries

Use `worker` for:

- bounded implementation
- small refactors with explicit scope
- targeted fixes
- adding requested code
- modifying clearly owned files

Use `tester` for:

- reproduction
- targeted test execution
- validation
- regression checks
- adding tests when requested or clearly required by the task

Use `reviewer` for:

- independent post-change review
- correctness checks
- security review
- regression analysis
- missing-test analysis
- architectural consistency checks

Use `researcher` for:

- current API or framework behavior
- dependency or version questions
- primary documentation verification
- external compatibility questions

---

## Parallelism

Run independent tasks in parallel.

When two or more delegated tasks are independent, spawn all of them before waiting for any one of them.

Good parallel set:

1. spawn backend explorer
2. spawn frontend explorer
3. spawn API researcher
4. wait for all three
5. synthesize findings

Do not do this:

1. spawn backend explorer
2. wait
3. spawn frontend explorer
4. wait
5. spawn researcher
6. wait

unless later tasks genuinely depend on earlier results.

Good parallel examples:

- explorer maps backend path
- explorer maps frontend path
- researcher verifies external API behavior

Serialize dependent work:

1. explore
2. decide architecture
3. implement
4. test
5. review
6. fix material findings
7. final verification

Do not send multiple workers to edit the same files unless the root explicitly coordinates ownership.

Prefer one writer per file or subsystem.

---


## Default coding workflow

For ordinary coding tasks:

1. Inspect the relevant files and requirements.
2. Determine the smallest safe implementation scope.
3. Implement directly in the root agent.
4. Run targeted tests and build checks.
5. Verify the running application when applicable.
6. Review the final diff.
7. Report the actual verification results.

For complex tasks, delegate only the specific workstreams
that benefit from independent execution.

Do not spawn every role mechanically.
---

## Debugging workflow

For cross-component bugs:

1. spawn explorers for independent suspected areas
2. reproduce the issue when possible
3. collect evidence before selecting a fix
4. root determines the likely root cause
5. assign a bounded Luna worker to implement the fix
6. assign Luna tester to reproduce the original failure and validate the fix
7. use Astra reviewer for high-risk or non-obvious fixes

Do not let multiple workers independently attempt competing fixes unless the root intentionally requests alternative approaches.

---

## Research workflow

When current or version-specific external information matters:

1. spawn a Luna researcher
2. require primary or authoritative sources when possible
3. return concise findings and compatibility implications
4. let the root decide how those findings affect implementation

Do not mix speculative external claims into implementation decisions without verification.

---

## Cost and context discipline

Use Luna for routine subagent execution.

Keep the root context focused on:

- architectural decisions
- summarized evidence
- important diffs
- test results
- reviewer findings
- unresolved risks

Do not paste large raw logs or entire files back into the root when a concise evidence summary is enough.

Subagents should return:

- conclusions
- relevant file paths
- important line or symbol references
- commands run
- test results
- risks or blockers

Avoid returning large amounts of irrelevant raw output.

---

## Escalation behavior

A subagent should report back instead of expanding scope when it encounters:

- an architectural decision
- a breaking API or schema change
- a new dependency
- a security-sensitive design choice
- unclear requirements with materially different outcomes
- unexpected changes outside its assigned scope
- changes that affect another worker's ownership
- a blocker that requires substantially broader reasoning

The root decides what to do next.

Luna should not independently escalate itself to a more expensive model.

The root owns model escalation decisions.

---

## Failure handling

If a subagent fails:

1. inspect the failure reason
2. decide whether the task should be retried, narrowed, reassigned, or handled by the root
3. do not silently ignore the failed delegation
4. do not claim the delegated work completed successfully

If `spawn_agent` itself fails, explicitly note the failure.

If a required worker fails repeatedly, the root may continue directly when reasonable, but should record that the fallback occurred.

---

## Delegated-task completion gate

Before producing the final answer for a delegated task, confirm that:

- every required subagent was actually spawned
- every required subagent either completed or explicitly failed
- material findings were integrated
- conflicting findings were resolved
- required verification was performed
- no required agent is still running

Do not finish while required subagents are still running.

Do not claim delegation occurred unless `spawn_agent` was actually called successfully.

---


## UI fidelity protocol

When implementing UI from Stitch, HTML mockups, screenshots,
or other visual references:

1. Treat the supplied mockup as the visual source of truth.
2. Inspect the complete reference before implementation.
3. Identify all sections, controls, tabs, tables, and states.
4. Preserve layout, spacing, typography, colors, and hierarchy.
5. Do not redesign, simplify, or remove elements without approval.
6. Reuse the existing project design system and components.
7. Keep one agent responsible for the complete UI implementation.
8. Do not delegate individual visual sections to different agents
   unless their boundaries are clearly independent.

After implementation:
1. Build the application.
2. Start or update the running application.
3. Open the actual page in a browser when available.
4. Capture a screenshot at the reference viewport size.
5. Compare the screenshot against the original mockup.
6. Identify and fix visible differences.
7. Repeat verification after corrections.

A successful build does not prove visual correctness.

If browser verification is unavailable, report the limitation
explicitly and mark visual verification as incomplete.

Never claim pixel-perfect fidelity without visual evidence.

---

## Runtime verification and deployment discipline

After changing application code, determine how the project is
currently running before choosing a restart strategy.

Possible environments include:
- Vite development server with hot module replacement.
- Docker Compose development environment.
- Docker Compose production build with Nginx.
- Direct backend execution.

Do not assume that a successful build updates running containers.

For every UI change:
1. Identify the active runtime environment.
2. Rebuild or restart only the services that require updating.
3. Wait for the affected services to become ready.
4. Verify that the application serves the updated version.
5. Test the modified route and its primary interaction.
6. Check browser and server errors when tools are available.

Never restart PostgreSQL, remove Docker volumes, reset databases,
or recreate unrelated services without explicit authorization.

Do not claim that the application was restarted or verified
unless the corresponding commands actually succeeded.

Report separately:
- Build status.
- Runtime status.
- Browser verification status.
- Visual fidelity status.

---

## Token efficiency and escalation limits

Optimize for verified results, not agent count.

- Prefer direct execution over unnecessary orchestration.
- Do not spawn agents for routine frontend implementation.
- Do not repeatedly explore files already inspected.
- Reuse concise findings instead of repeating repository scans.
- Keep delegation scopes narrow and measurable.
- Avoid sending large file contents between agents.
- Do not run multiple agents on the same implementation task.
- Do not invoke Astra automatically for ordinary UI changes.

Use Astra primarily for:
- High-risk architecture decisions.
- Security-sensitive changes.
- Complex business logic.
- Difficult bugs that remain unresolved after focused diagnosis.
- Independent review of significant changes.

After two unsuccessful attempts at the same fix:
1. Stop repeating the same approach.
2. Inspect the actual failure and available logs.
3. Identify the likely root cause.
4. Narrow the problem.
5. Escalate only if deeper reasoning is justified.

Do not claim specific token savings without measurement.

---

## Final verification

Before claiming completion, the root should:

1. inspect the final diff
2. confirm the requested behavior is actually implemented
3. check material reviewer findings
4. run or confirm the highest-value tests
5. verify that delegated results were integrated correctly
6. state any validation that could not be performed

For implementation tasks, prefer checking:

- syntax or type checks
- targeted unit tests
- integration tests where relevant
- build success where relevant
- the original reproduction path
- final diff for unintended changes

---

## User-facing behavior

Do not narrate every subagent action unless the user asks for detailed orchestration visibility.

The final answer should focus on:

- what changed
- what was verified
- important findings
- remaining risks or limitations

When useful, briefly mention which agents contributed.

If the user explicitly asks to see delegation, report:

- subagent name
- model
- assigned task
- completion status

Do not claim a Luna agent was used unless the trace contains a successful `spawn_agent` call using `gpt-6-luna`.
