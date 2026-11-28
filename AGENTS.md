# SelectProfi — Project Instructions

## Core behavior

- Complete the user's task end-to-end.
- Do not stop after intermediate implementation steps.
- Prefer working solutions over explanations and plans.
- Follow existing architecture and project conventions.
- Do not invent business requirements.
- Ask questions only for material ambiguity or genuine blockers.
- Preserve existing functionality and unrelated user changes.

## Project architecture

- Backend: .NET, C#, Clean Architecture, CQRS, EF Core.
- Frontend: React 18, TypeScript, Vite, Redux Toolkit,
  RTK Query, Tailwind CSS, Radix UI.
- Verify dependency versions against actual project files.
- Preserve existing API contracts and architectural boundaries.
- Reuse existing components and design tokens.
- Support light and dark themes and responsive layouts.

## Project context

Read only documentation relevant to the current task:

- CLAUDE.md — architectural conventions.
- docs/system-design-ui-ux.md — UI and UX standards.
- docs/frontend-api-contracts.md — API contracts.
- docs/testing/ — verification scenarios.
- layouts-executor/ — executor UI references when applicable.

Current code and approved requirements take precedence over
outdated documentation. Report material conflicts.

## Execution workflow

1. Inspect relevant requirements and existing code.
2. Identify the smallest complete implementation scope.
3. Implement the requested behavior.
4. Run relevant build and test commands.
5. Verify the running application when applicable.
6. Fix material defects introduced by the changes.
7. Review the final Git diff.
8. Report the result and verification limitations.

## Agent orchestration

- Default to direct execution by the root agent.
- Use astra-orchestrator for genuinely complex tasks.
- Delegate only when there is a concrete benefit.
- Do not spawn agents merely because multiple files are involved.
- Keep one owner per implementation area.
- The root agent owns integration and final verification.

## UI implementation

- Treat supplied mockups as visual references.
- Preserve layout, spacing, typography and functionality.
- Do not redesign or simplify without authorization.
- Rebuild the affected application when required.
- Verify the actual running page using browser tools.
- Compare screenshots against supplied references.
- Test modified interactions and relevant responsive states.
- Build success alone does not prove UI correctness.

## Verification

Frontend commands from frontend/:

- npm run build
- npm run lint
- npm run test:run

Backend:

- Use dotnetdevmcp or appropriate dotnet commands.
- Run relevant build and test checks.

Use Docker Compose when the application runs in containers.
Verify that the running application contains the new build.
Report build, tests and runtime verification separately.

## Efficiency

- Inspect only relevant files and documentation.
- Avoid repeated repository scans.
- Avoid unnecessary subagents and lengthy reports.
- Prefer deterministic scripts for repetitive verification.
- After two failed attempts, investigate the root cause
  instead of repeating the same approach.

## Safety and scope

- Never delete files merely because they appear unused.
- Never overwrite unrelated or uncommitted user changes.
- Do not modify unrelated projects or system settings.
- Do not expose credentials or authentication tokens.
- Do not reset databases or remove Docker volumes.
- Do not perform destructive Git operations.
- Do not commit, push or deploy without authorization.
- Do not access production data without explicit authorization.
- Destructive operations require explicit user approval,
  even when unrestricted tool access is available.

## YouGile and Night Shift

Normal mode: complete only the requested task.

Do not automatically take additional tasks from YouGile.

Night Shift is activated only by an explicit user request.
During Night Shift, process only the authorized task scope,
verify each task, record progress and create authorized commits.

## Final response

Report concisely:

- What changed.
- What was verified.
- Whether the running application was updated.
- Remaining risks or blockers.

Never claim verification that was not actually performed.

## Docker verification scripts

When the local application runs in Docker Compose
and its dependencies are already running:

- Frontend changes: run scripts/restart-frontend.ps1
- Backend changes: run scripts/rebuild-backend.ps1
- Fullstack changes: rebuild backend first, then frontend.
- Do not rebuild unaffected services.
- Do not restart databases or remove Docker volumes.
- Do not run these scripts against production.
- Inspect service logs if startup fails.
- Avoid duplicate builds when Docker already builds the code.

After successful startup:

- Open the actual modified page using browser tools.
- Verify the requested behavior.
- Check browser console and relevant network errors.
- Compare against the supplied mockup when applicable.
- Run relevant lint and test checks separately.

Successful startup alone does not prove functional
or visual correctness.