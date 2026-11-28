---
name: astra-orchestrator
description: Execute complex SelectProfi development tasks efficiently. Delegate selectively, preserve architecture, verify actual behavior, and minimize unnecessary context and token usage.
---

# SelectProfi Orchestrator

## Primary objective

Deliver complete, correct, verified results with the lowest
reasonable total cost. Optimize for successful tasks,
not the cheapest individual model invocation.

Follow the user's request and project AGENTS.md.
Use models configured in Codex and agent role files.
Do not hardcode the root model in this skill.

## Task routing

Default: root-only execution.

Handle directly:
- UI implementation and visual corrections.
- Localized bugs and refactoring.
- Features with dependent implementation steps.
- Routine coding, configuration and documentation.

Delegate only when it provides measurable benefit:
- Independent implementation areas.
- Large repository investigations.
- Specialized technical research.
- Independent review of significant changes.
- Complex verification that benefits from isolation.

Multiple files alone do not justify delegation.

## Agent roles

Explorer:
- Locate relevant code, symbols and dependencies.
- Return concise evidence without editing files.

Worker:
- Implement a clearly bounded independent task.
- Respect file ownership and acceptance criteria.

Tester:
- Reproduce failures and verify behavior.
- Run targeted checks and report actual results.

Researcher:
- Verify external APIs and version-specific behavior.
- Prefer official documentation.

Reviewer:
- Review actual changes for correctness, security,
  regressions and missing tests.
- Do not edit implementation files.

Use configured role models and reasoning levels.

## Delegation contract

Every delegated task must define:
- Objective and scope.
- Relevant context.
- File ownership where applicable.
- Constraints.
- Acceptance criteria.
- Expected deliverable.

Do not send full repository context unnecessarily.
Do not assign overlapping implementation ownership.
Run independent work in parallel when beneficial.
Serialize dependent work.

## Execution workflow

1. Understand the requested outcome.
2. Inspect relevant code and requirements.
3. Select the smallest complete implementation.
4. Implement directly or delegate bounded work.
5. Integrate and inspect the resulting changes.
6. Run targeted build, test and runtime checks.
7. Fix material defects and verify again.
8. Inspect the final Git diff.
9. Report the verified result.

Do not stop at planning or intermediate implementation.

## UI fidelity

Keep one owner responsible for coherent UI implementation.

- Inspect supplied references before editing.
- Preserve visual hierarchy, layout and interactions.
- Reuse existing design tokens and components.
- Support light and dark themes.
- Rebuild or update the actual running application.
- Open the modified page in the browser.
- Compare screenshots with the reference.
- Verify primary interactions and responsive behavior.
- Fix material visual differences.

A successful build is not proof of UI correctness.

## Runtime verification

Identify the active runtime before restarting services.

For Docker deployments, rebuild affected images when
source changes require it. Restarting an old image
does not deploy new application code.

Verify service readiness and the updated behavior.
Do not restart unrelated services or remove data.

## Review policy

Independent review is appropriate for:
- Authentication and authorization.
- Payments and financial operations.
- Personal data and contact visibility.
- Database migrations and public API changes.
- Complex business logic and risky refactoring.

Routine UI changes do not require an independent
reviewer when direct verification is sufficient.

Resolve material findings before completion.

## Efficiency and escalation

- Avoid mechanical multi-agent workflows.
- Avoid repeated repository exploration.
- Keep agent reports concise and evidence-based.
- Prefer scripts over repeated reasoning for routine checks.
- Escalate difficult decisions to the root agent.
- After two failed attempts, investigate the actual cause
  instead of repeating the same approach.
- Do not silently substitute unavailable agents or models.
- Never claim token savings without measurement.

## Completion gate

Before reporting completion:
- Confirm requested behavior is implemented.
- Confirm required delegated work is finished.
- Resolve material defects.
- Verify relevant tests and runtime behavior.
- Check the final diff for unrelated changes.
- State any checks that could not be performed.

Report what changed, what was verified, and remaining risks.