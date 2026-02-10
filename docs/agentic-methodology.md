# Methodology

26 Nov 2025

Reads

1. [https://developers.openai.com/codex/guides/build-ai-native-engineering-team/?utm_source=tldrai](https://developers.openai.com/codex/guides/build-ai-native-engineering-team/?utm_source=tldrai)
2. [https://x.com/DataChaz/status/2004159627563507920?s=20](https://x.com/DataChaz/status/2004159627563507920?s=20)
3. [https://danielmiessler.com/blog/keep-the-robots-out-of-the-gym](https://danielmiessler.com/blog/keep-the-robots-out-of-the-gym)
4.

[**Plan \[R\] 2**](#plan-[r])

[Delegate to AI 2](#delegate-to-ai)

[Engineer Reviews 3](#engineer-reviews)

[Engineer Owns 3](#engineer-owns)

[**Design \[R\] 4**](#design-[r])

[Delegate to AI 4](#delegate-to-ai-1)

[Engineer Reviews 5](#engineer-reviews-1)

[Engineer Owns 5](#engineer-owns-1)

[**Build & Deploy \[V\] 7**](#build-&-deploy-[v])

[Delegate to AI 7](#delegate-to-ai-2)

[Engineer Reviews 8](#engineer-reviews-2)

[Engineer Owns 9](#engineer-owns-2)

[**Test \[V\] 10**](#test-[v])

[Delegate to AI 10](#delegate-to-ai-3)

[Engineer Reviews 11](#engineer-reviews-3)

[Engineer Owns 12](#engineer-owns-3)

[**Review \[V\] 12**](#review-[v])

[Delegate to AI 12](#delegate-to-ai-4)

[Engineer Reviews 13](#engineer-reviews-4)

[Engineer Owns 14](#engineer-owns-4)

[**Document \[R\] 15**](#document-[r])

[Delegate to AI 15](#delegate-to-ai-5)

[Engineer Reviews 15](#engineer-reviews-5)

[Engineer Owns 16](#engineer-owns-5)

[**Deploy and maintain \[V\] 16**](#deploy-and-maintain-[v])

[Delegate to AI 17](#delegate-to-ai-6)

[Engineer Reviews 18](#engineer-reviews-6)

[Engineer Owns 18](#engineer-owns-6)

# Plan \[R\] {#plan-[r]}

---

Planning the development of software has gotten more viable and efficient using AI. Developers and PM’s can now synchronously and collaboratively work on planning without unnecessary meetings and handoffs.

In this section, we’ll discuss the various ways AI IDE’s (predominantly Claude Code, but to a lesser extent also Codex and Claude Code) can help drive this efficiency, divided into our framework: delegate, review, own. Here, we will discuss general planning, large changes and smaller changes (one-off issues).

## Delegate to AI {#delegate-to-ai}

**Large changes (PRD / roadmap)**

- Ingest PRD/roadmap and draft a PLAN.md: goals, non‑goals, risks, dependencies, milestones.
- Build a dependency map across code \+ infra (services, DBs, queues) using repo scan \+ Kubernetes (MKP), Cloud Run, and AWS MCP servers.
- Propose epics and sub‑epics, with suggested story slices and sequencing.

**Smaller changes (single‑issue tasks)**

- From a one‑liner ticket, generate acceptance criteria, edge cases, and a 3–5 step mini‑plan.
- Use slash commands or Raycast `make-plan` to drop that mini‑plan straight into Linear/Jira.

**Bug fixes / Linear**

- Via Linear MCP: pull in logs / stack traces / screenshots and suggest reproduction steps plus likely root‑cause files.
- Suggest a small fix plan (patch idea \+ tests \+ rollout) and link it back into the Linear issue.

## Engineer Reviews {#engineer-reviews}

- Sanity-check `PLAN.md`: scope, dependencies, and estimates vs real-world constraints (people, budgets, client expectations).
- Validate that all relevant systems are considered (data residency, security, 3rd‑party APIs).
- Tweak the breakdown of work (epics → stories → tasks) to match the team’s structure and workshop format.
- Remove speculative tasks the AI added that don’t align with product strategy; add missing risk-mitigation tasks.
- Ensure planning outputs are formatted to plug directly into Linear/Jira (labels, owners, deadlines).

## Engineer Owns {#engineer-owns}

- Overall product vision, prioritization, and trade‑offs the AI is _not_ allowed to decide.
- The canonical templates: what must every plan include (assumptions, risks, rollout, telemetry, test plan).
- Guardrails for AI access: which MCP servers / data sources are allowed for a given client.
- Planning cadence: when to run AI planning (every epic? only large changes? post‑incident?)
- Final sign‑off that a plan is good enough to unleash build agents and to present to a corporate client.

#

# Design \[R\] {#design-[r]}

---

Taste still remains the moat of UX and UI designers, unlikely when AI will truly catch up here.

Design is a highly personal component of software, and taste varies by person. The general convergence of AI-design has produced more slop than the internet can handle, and most tech-savvy humans can see right through the purple-gradient dirt. To combat this, using libraries and MCP’s of design elements you find beautiful goes a long way. Below, we instruct how we use the various libraries and mcp’s to generate something worth building and interacting with.

## Delegate to AI {#delegate-to-ai-1}

**Libraries / ShadCN**

- Given a design or description, suggest the right ShadCN (or other) components and generate skeleton React/Next code. The general taste of design seems to be converging towards an Apple-esque design framework with simple colours, squarish buttons and react-libraries (ShadCn). Below you’ll find free directories that offer this style and code.
  - [https://ui.shadcn.com/docs/directory](https://ui.shadcn.com/docs/directory)
  - [https://x.com/rexan_wong/status/1993616311596023998?s=20](https://x.com/rexan_wong/status/1993616311596023998?s=20)
- Propose component compositions for common patterns (forms, modals, tables, navbars) using the existing design system.
- Scan the repo and identify custom components that could be replaced or simplified by library primitives, then sketch a refactor plan.

[https://www.cta.gallery/](https://www.cta.gallery/)

**Figma MCP**

- Pull tokens (colors, spacing, typography) and component variants from Figma and map them to the existing component library.
- Generate code stubs from selected Figma frames, including layout, basic states, and placeholder data.
- Detect design–implementation drift and propose concrete “bring code back in line with Figma” tasks.

**Claude Code Browser div‑selector**

- Capture DOM snippets from a live app and send them to Claude Code to identify the underlying components/files. This speeds up the progress drastically, but more so for junior developers or engineers with a stronger tendency towards backend.
- Suggest CSS/layout tweaks to make the live UI match Figma (spacing, font sizes, breakpoints).
- Generate robust test selectors and Playwright test steps from selected DOM nodes and flows.

## Engineer Reviews {#engineer-reviews-1}

- Approve or adjust library / ShadCN choices so they align with the client’s design system and technical constraints.
- Evaluate AI‑generated layout and component code for performance, responsiveness, and accessibility (not just pixels).
- Validate Figma→code mappings and DOM→component mappings; fix mis‑matches and define new patterns where the design system is thin.
- Decide which suggested refactors (consolidating components, replacing custom UI with library components) are worth doing now vs later.
- Ensure Browser‑driven tweaks are applied in the source components, not as fragile DOM hacks.

## Engineer Owns {#engineer-owns-1}

- The design system itself: tokens, component taxonomy, interaction patterns, accessibility bar.
- Which UI libraries are “blessed” (ShadCN vs others), and how they should be used (preferred compositions, anti‑patterns).
- The official design‑to‑code pipeline per client: when to use Figma MCP, when to use Browser tools, when to code by hand.
- Cross‑platform and cross‑team consistency decisions that AI can’t see (how internal tools vs public UIs should differ, localisation rules, etc.).

→ Teaching workshop participants _how to brief agents_ in design terms (constraints, goals, tradeoffs) rather than just “make it pretty”.

#

# Build & Deploy \[V\] {#build-&-deploy-[v]}

---

Reliability remains the moat of DevOps; unlike design, you cannot "vibe check" a security vulnerability or a race condition.

While AI can scaffold infrastructure code in seconds, it lacks the context of production reality—often hallucinating configurations that work in isolation but fail under load. The convergence of AI-ops has led to a flood of "works on my machine" containers. To combat this, we use verified MCPs to bridge local development with cloud truth. Below, we instruct how we use specific MCPs to orchestrate builds that survive beyond the demo.

##

## Delegate to AI {#delegate-to-ai-2}

**Libraries / Docker & SST**

Given a stack, generate the Infrastructure from Code (IfC) rather than clicking through AWS/Vercel consoles. The standard for 2025 is defining infrastructure alongside application code.

- Generate sst.config.ts or Dockerfile optimized for caching, specifically asking Claude Code to "structure for multi-stage builds" to keep images light.
- Scan the package.json to auto-generate the correct build scripts and exclude dev-dependencies from production artifacts.

[https://sst.dev/](https://sst.dev/)  
[https://docs.docker.com/compose/](https://docs.docker.com/compose/)

**GitHub & Cloud MCPs**

Use the official MCP servers to interact with your repo and cloud provider directly from the editor, avoiding context-switching fatigue.

- GitHub MCP: Search PRs and Actions logs directly in Claude Code to diagnose CI failures without leaving the IDE. Ask the agent to "fix the workflow file based on this error log."
- AWS / Vercel MCP: Check live deployment status and tail logs. Use this to verify that the environment variables in your code match what is actually set in the cloud.
- Postgres MCP: safely generate migration SQL by comparing your local schema against the production database state (read-only connection recommended).

**Claude Code Terminal**

Treat the terminal as a read-write interface for the agent.

- Pipe build errors directly into the chat (cmd+shift+L on selection) to get immediate fixes for obscure webpack or turbo repository errors.
- Generate curl commands to smoke-test endpoints immediately after local deployment.

[https://github.com/modelcontextprotocol/servers/tree/main/src/github](https://github.com/modelcontextprotocol/servers/tree/main/src/github)  
[https://github.com/awslabs/aws-mcp-server](https://github.com/awslabs/aws-mcp-server)

## Engineer Reviews {#engineer-reviews-2}

- Secrets Audit: Aggressively check that no .env values or API keys were hallucinated into Dockerfiles or public commits.
- IAM & Permissions: AI defaults to "Admin" access to make things work. Dial permissions back to least-privilege immediately.
- Cost Sanity: Verify that the generated infrastructure code isn't provisioning expensive, always-on instances when serverless scale-to-zero would suffice.
- Drift Detection: Ensure Browser/MCP-driven tweaks are applied to the source IaC files, not just hot-fixed in the cloud console.

## Engineer Owns {#engineer-owns-2}

- The Architecture: Monolith vs. Microservices vs. Serverless. AI cannot decide the trade-off between latency, complexity, and bill.
- Production Gating: The decision of _when_ to ship. Green tests do not equal a ready product.
- Security Policy: Who has access to the prod database and how encryption keys are managed.
- The Bill: Setting up billing alerts and cost ceilings. AI does not care about your credits.
- Teaching workshop participants that "deployed" isn't the finish line—observability is.

#

# Test \[V\] {#test-[v]}

Correctness remains the moat of Senior Engineers; AI is excellent at writing tests that pass, but terrible at writing tests that matter.

Testing is where the illusion of AI competence breaks down most frequently. LLMs have a tendency to mock the entire universe to make a unit test go green, resulting in "100% coverage" that catches 0% of bugs. To combat this, we force AI to write Integration and E2E tests that interact with the actual DOM and database. Below, we instruct how to use libraries and MCPs to build a safety net, not just a participation trophy.

## Delegate to AI {#delegate-to-ai-3}

**Libraries / Playwright & Vitest**

Given a user flow description, generate Playwright scripts that mimic actual user behavior, not implementation details. The standard for 2025 is Vitest for logic and Playwright for everything else.

- Feed the page.tsx or component code to the AI and ask for "resilient locators" (using getByRole or data-testid) rather than fragile XPaths.
- "Scan this file and generate 3 edge-case tests: invalid input, network failure, and empty states."
- Use AI to auto-generate the global-setup for authentication states so you don't log in for every single test file.

[https://playwright.dev/docs/intro](https://playwright.dev/docs/intro)  
[https://vitest.dev/guide/](https://vitest.dev/guide/)

**Postgres & Puppeteer MCPs**

Stop mocking the database. Use MCPs to verify the actual state of data and the UI during test runs.

- **Postgres MCP:** Use this to inspect the database state _before_ and _after_ a test run. Ask the agent: "Check the Users table to confirm the is_active flag was actually flipped by the test I just ran."
- **Puppeteer MCP:** Allow the agent to "see" your localhost. If a test fails, let the agent visit the page via Puppeteer, scrape the current DOM, and compare it against what Playwright expected.

[https://github.com/modelcontextprotocol/servers/tree/main/src/postgres](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres)  
[https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer](https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer)

**Claude Code Terminal & Self-Correction**

The iteration loop for testing is 10x faster when you keep the context in the terminal.

- Run tests via command line. When they fail, highlight the stack trace and hit Cmd+K: "Fix the test code to match the actual API response."
- Instruct the AI to "Refactor this test to use a fixture instead of a global variable" to prevent state leakage between tests.

## Engineer Reviews {#engineer-reviews-3}

- Mock Verification: Reject tests that mock too much. If the AI mocks the database, the API, and the browser, it is testing nothing.
- Flake Detection: AI writes race conditions. Look for hardcoded waitForTimeout(5000)—delete them and demand waitForSelector or expect.toPass.
- Happy Path Bias: AI loves the "success" state. Review to ensure negative test cases (404s, 500s, permission denied) exist.
- Selector Durability: Ensure AI uses accessibility-based selectors (Buttons, Labels) rather than class names (.div-flex-col-2), which will break on the next design update.

## Engineer Owns {#engineer-owns-3}

- The Strategy: The "Testing Pyramid" (Unit vs. Integration vs. E2E). AI doesn't know your risk tolerance.
- Data Seeding: Defining the "Golden Data" set for the test environment.
- Visual Regression: Deciding what "looks wrong" vs what is just a pixel shift. AI is too literal for visual diffing without human override.
- CI/CD Integration: How and when these tests run (blocking PRs vs. nightly builds).
- Teaching the agent that a test suite is a living document, not a one-off script to satisfy a checklist.

# Review \[V\] {#review-[v]}

Context remains the moat of Senior Engineers; AI can spot a syntax error in milliseconds but cannot understand _why_ you built the feature in the first place.

In the Claude Code era, "Code Review" has split into two streams: the Auto-Review (handled by the Composer Agent enforcing your rules) and the Strategic Review (handled by humans verifying intent). If you are commenting on variable names in 2025, you are wasting your time. Below, we instruct how to configure Claude Code to handle the pedantic work so you can focus on the architecture.

##

## Delegate to AI {#delegate-to-ai-4}

**Feature / Claude Code Rules (.claude)**

- This is the single most important file in your repository. It acts as the "Constitution" for the AI. Instead of repeating "use strict typescript" in every prompt, define it once.
- Action: Create a .claude file in the root.\[[1](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEgx4mBRPCHZcHZTESCa3Oc1ZFDL75xS7bKjW_ynTn-h-b63q-8iXW6cef4-kas6BiMg82qGdSEWQvzKoQOwUrbNY1fLcQsHhOzdTsNNLJJ-fOZctq39Gw-7-JqWKch5MuSiE3uYWS-RQ==)\] Hardcode your team’s "Must Haves" (e.g., "Always use Zod for validation," "Never use any," "Prefer functional components").
- Workflow: Before you even open a PR, the Claude Code Tab (autofill) and Composer will aggressively align generated code with these rules, effectively "pre-reviewing" code as it is written.
- \+ AGENTS.md

**Feature / Composer Agent (Cmd+I)**

The standard for 2025 is using the **Composer** agent as a first-pass reviewer. It processes the entire multi-file context, not just the open tab.

- Workflow: Open Composer and type: _"Review the @Diff for security vulnerabilities, performance bottlenecks, and adherence to .claude. Fix the simple stuff, list the complex risks."_
- Outcome: The Agent will likely apply fixes directly (which you can accept/reject inline) rather than just leaving comments.

**MCP / GitHub**

Use the official **GitHub MCP** to bridge the gap between local changes and the wider team context.

- Action: Connect the GitHub MCP to pull context from related Issues or old PRs.
- Prompt: _"Check @PR \#402 and ensure my current @Diff doesn't regress the bug fixed in that PR."_ This catches "regression loops" that human reviewers often miss.

## Engineer Reviews {#engineer-reviews-4}

- Intent Verification: The AI confirms _how_ the code works; you must confirm _if_ it solves the user's problem.
- Rule Auditing: If you find yourself leaving the same comment twice (e.g., "Use const here"), do not fix the code—fix the .claude. The AI should never make the same mistake three times.
- Agent Drift: Watch for "Lazy Agent" syndrome, where Composer mocks complex logic instead of implementing it. Verify that "Simulated" tests actually touch the database.

## Engineer Owns {#engineer-owns-4}

- The .claude (+ [AGENTS.md](http://AGENTS.md)): This is now as important as the codebase itself. The Senior Engineer owns the maintenance of these rules.
- Risk Acceptance: The Agent will flag "Potential Issue". You own the decision to ship it anyway.
- Architectural Fit: AI is bad at knowing if a new component duplicates functionality hidden in a folder it didn't scan. You own the "Don't Repeat Yourself" (DRY) check at the module level.
- Teaching the team that a "LGTM" on GitHub means you validated the logic, not just the syntax.

# Document \[R\] {#document-[r]}

---

## Delegate to AI {#delegate-to-ai-5}

- Generate an initial **AGENTS.md** by scanning the repo: frameworks, folder structure, naming conventions, testing strategy, deployment model.
- Propose AGENTS.md sections for each team/client: “How to use Linear”, “How to use MCP servers”, “What to avoid”, “How to run tests”.
- After each significant change or refactor, draft an entry in **refactor.md** describing: what changed, why, key files, migrations, and follow‑up tasks.
- Use merged PRs and commit messages to auto‑populate refactor.md, then surface it as a running changelog agents can read in new sessions.
- At the start of a new chat, summarise AGENTS.md \+ refactor.md back to the human so the _agent regains context it lost_ across sessions and different tools.
  - Opus → Codex workflow

## Engineer Reviews {#engineer-reviews-5}

- Curate AGENTS.md so it reflects how the team actually wants AI to behave: clear rules, examples, and “never do this” sections (not random internal history).
- Check that refactor.md entries are accurate, understandable, and linked to tickets/PRs so other humans (and agents) can trace decisions.
- Decide which changes _must_ be recorded (API breaking changes, library swaps, new MCPs) and which are just noise.
- Periodically clean up AGENTS.md and refactor.md: remove obsolete instructions, consolidate repeated patterns, fix contradictions.
- Make sure these docs stay lightweight enough that people and agents actually read them.

##

## Engineer Owns {#engineer-owns-5}

- The structure, location, and “contract” for these docs:
  - AGENTS.md \= **how to work in this repo as an AI+human pair**
  - refactor.md \= **running changelog for cross‑agent compatibility \+ human understanding**
- Policy for when updates are mandatory (e.g. after adding/removing MCPs, changing libraries, changing deploy pipeline).
- The mechanisms agents will use to read these files (custom slash commands, MCP servers, pre‑prompt snippets) in client environments.
- Ensuring these docs are version‑controlled, code‑reviewed, and part of your standard definition of done.
- Using AGENTS.md \+ refactor.md as artifacts in your workshops and sales material (showing clients how you keep AI work explainable and maintainable).

# Deploy and maintain \[V\] {#deploy-and-maintain-[v]}

Uptime remains the moat of SREs; AI can deploy a container in seconds, but it cannot negotiate with a saturated database connection pool.

Deployment is no longer an event; it is a continuous state. While AI can obliterate the friction of "Infrastructure as Code," it lacks the instinct for "Day 2" operations—cost spirals, race conditions, and incident response. To combat this, we use Claude Code and MCPs to bring the production environment _into_ the editor, treating the cloud as a read-write file system. Below, we instruct how to ship and keep the lights on.

##

## Delegate to AI {#delegate-to-ai-6}

**Libraries / SST & Docker**

Stop clicking in the AWS console. The standard for 2025 is defining infrastructure strictly in TypeScript (Infrastructure from Code).

- Composer Action: "Scan @package.json and generate an sst.config.ts that deploys this Next.js app to AWS Lambda with a Redis cache."
- Optimization: Ask the agent to "Refactor the Dockerfile for multi-stage builds to reduce image size below 100MB."

[https://sst.dev/](https://sst.dev/)  
[https://docs.docker.com/compose/](https://docs.docker.com/compose/)

**MCP / Cloud & Observability**

Use Model Context Protocol to manage production without leaving Claude Code. Context switching is the enemy of uptime.

- AWS MCP: If a deploy fails, do not check the console. Ask Claude Code: "Tail the CloudWatch logs for the last deployment of stack my-app-prod and analyze the crash."
- Sentry MCP: proactively maintain code. "Query Sentry for the top 3 recurring errors in the last 24 hours and propose fixes in the code."

[https://github.com/awslabs/aws-mcp-server](https://github.com/awslabs/aws-mcp-server)  
[https://github.com/modelcontextprotocol/servers/tree/main/src/sentry](https://github.com/modelcontextprotocol/servers/tree/main/src/sentry)

**Docs & Runbooks**

AI is the best scribe you have.

- Auto-Docs: After a successful deploy, instruct Composer: "Update the README.md and /docs folder to reflect the new API endpoints and environment variables introduced in this release."
- Incident Logs: If a fix is hot-patched, force the AI to write the "Post-Mortem" draft based on the git diff and terminal logs.

## Engineer Reviews {#engineer-reviews-6}

- Secrets Audit: AI loves hardcoding credentials. Aggressively verify that process.env is used and no .pem keys made it into the git history.
- IAM Policy: AI defaults to AdministratorAccess to make the error messages go away. Reject this. Enforce "Least Privilege" (e.g., S3 Read-Only).
- Billing Sanity: Verify the instanceType and scaling limits. AI will happily provision a cluster that costs $5,000/month for a hobby project.
- Destructive Acts: Manually verify any script that runs DROP, DELETE, or FLUSH against a production database connection.

## Engineer Owns {#engineer-owns-6}

- The Pager: AI doesn't wake up at 3 AM. You do. You define the alerting thresholds.
- Feature Flags: The decision to toggle a feature on for 10% of users vs 100%.
- Data Sovereignty: Where user data lives (GDPR/Compliance). AI doesn't know deployment regions unless told.
- The "Stop" Button: The authority to freeze deployments when stability degrades.
- Teaching the team that "Deployed" is not the finish line. A feature is only done when it is observable and stable.

#

#
