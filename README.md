# Mosaic

**Live frontend demo:** https://aryanagr.github.io/mosaic-hobby-learning/

**Live full-stack Vercel deployment:** https://mosaic-hobby-learning.vercel.app/

The GitHub Pages deployment demonstrates the seeded, local-first learning flow. Run the Express API locally or deploy it separately to enable server-backed plan generation and PostgreSQL features.

The repository also includes `vercel.json` and a catch-all Express function under `api/` for full-stack Vercel deployment. Without `DATABASE_URL`, the serverless API uses the deterministic in-memory planner; configure a hosted PostgreSQL URL to enable normalized catalog and progress endpoints.

Mosaic creates the smallest useful learning path for a real hobby outcome. A learner describes a moment they want to unlock, their current ability, available time, and content they dislike. The system returns six explainable, medium-aware techniques and lets the learner master or remove each one.

## Architecture summary

### Frontend

The frontend is a React, Redux Toolkit, and TypeScript single-page application organized by feature rather than by generic file type.

```text
App
├── Dashboard
│   ├── Goal hero
│   └── Progress summary
├── Learning path
│   ├── Technique cards
│   └── Progress calculations
├── Lesson sheet
└── Path Studio
    └── Plans API client
```

Responsibilities:

- `components/` contains reusable application-level presentation such as the shell and navigation.
- `features/` owns complete product capabilities: dashboard, path, lessons, and goal capture.
- `services/` isolates browser storage and HTTP calls from React components.
- `domain/` contains the built-in demonstration plan.
- `shared/` contains TypeScript contracts used by both frontend and backend.
- The Redux `learningPlan` slice owns the current plan and technique status changes.
- Typed React-Redux hooks prevent untyped dispatches or selectors.
- Memoized Redux selectors derive progress and the current active technique.
- Progress percentage, mastered count, visible techniques, and skipped count are derived from the plan rather than stored as duplicate state.
- The complete plan is persisted locally, so its title, promise, techniques, and progress remain consistent after reload.

Frontend request flow:

```text
PathStudio form
    → plans-api service
    → POST /api/plans
    → LearningPlan response
    → learningPlan Redux slice
    → local storage + rendered learning path
```

### Backend

The backend is a stateless Express and TypeScript API following a layered architecture.

```text
HTTP request
    → Express middleware
    → Route
    → Zod validation
    → PlanService
        → cache/repository lookup
        → Groq plan generator
        → deterministic fallback on failure
        → repository save
    → JSON response
```

Responsibilities:

- `app.ts` composes security, compression, logging, rate limiting, routes, and error handling.
- `routes/` translates HTTP requests into service calls. Routes contain no plan-generation logic.
- `domain/` defines validated inputs, generated-plan schemas, and provider interfaces.
- `services/` contains use-case orchestration, caching, idempotency, and concurrent-request coalescing.
- `providers/` integrates Groq and the deterministic fallback generator.
- `repositories/` defines the persistence interface and PostgreSQL/in-memory implementations.
- `database/` contains SQL migrations and the migration runner.

The backend depends on interfaces at important boundaries:

```ts
interface PlanGenerator {
  source: "groq" | "crafted-fallback";
  generate(input: ValidCreatePlanRequest): Promise<GeneratedPlan>;
}

interface PlanRepository {
  findByGoalHash(goalHash: string): Promise<LearningPlan | null>;
  save(goalHash: string, plan: LearningPlan): Promise<void>;
  close(): Promise<void>;
}
```

This makes the AI provider and database replaceable without changing routes or business logic.

### Database model

PostgreSQL uses a normalized learning domain. The generated-plan JSONB table remains only as a short-lived AI response cache; it is not the source of truth for learner progress.

The development catalog seeds two hobbies: Chess and Guitar. Each has three levels, eight techniques, prerequisite relationships, scoring metadata, and one original learning resource per technique.

```text
users
└── user_hobbies
    ├── hobbies
    │   ├── hobby_levels
    │   └── techniques
    │       ├── technique_levels
    │       ├── technique_prerequisites
    │       ├── learning_resources
    │       ├── practice_logs
    │       └── technique_feedback
    └── learning_paths
        └── learning_path_techniques
            └── user_technique_progress

users
└── user_resource_progress ── learning_resources
```

Database decisions:

- `user_hobbies` uniquely connects one learner to one hobby and stores current level, target level, weekly availability, and content preferences.
- Techniques and resources belong to the reusable catalog; user status never mutates catalog records.
- `learning_path_techniques` is the ordered join between a generated path and reusable techniques.
- `user_technique_progress` and `user_resource_progress` hold learner-specific state.
- Prerequisites use a self-referencing join table and are ordered with a topological sort.
- Practice logs are append-only events suitable for streak and weekly-minute aggregation.
- Partial and compound indexes match hobby browsing, ordered path loading, progress filtering, and date-based practice queries.
- The AI cache uses a unique SHA-256 goal hash and expires after 24 hours.
- SQL queries are parameterized.
- The PostgreSQL adapter uses a bounded connection pool with connection and idle timeouts.

### Recommendation algorithm

1. Query active techniques mapped between the learner's current and target level.
2. Score each technique using level relevance (35%), rating (25%), popularity (25%), and weekly-time fit (15%).
3. Walk the ranked list and include each technique's prerequisite closure.
4. Reject additions that would exceed eight techniques.
5. Require at least five techniques when the catalog contains five eligible options.
6. Topologically sort the result so every prerequisite appears first.
7. Create the path, ordered joins, and initial progress rows in one transaction.

Cycles in prerequisite data are detected and rejected rather than producing a corrupt path.

### Implemented domain endpoints

```text
GET   /api/hobbies
POST  /api/learning-paths/generate
PATCH /api/progress/techniques/:pathTechniqueId
```

### Technical-plan implementation matrix

| Capability                                       | Status                                  |
| ------------------------------------------------ | --------------------------------------- |
| Responsive learning dashboard and path           | Implemented                             |
| Redux Toolkit client state and persistence       | Implemented                             |
| Two seeded hobbies with levels and resources     | Implemented                             |
| Rule-based 5–8 technique recommendation          | Implemented                             |
| Prerequisite ordering and cycle detection        | Implemented                             |
| Weekly time and preferred-format ranking         | Implemented                             |
| Normalized PostgreSQL paths and progress         | Implemented                             |
| Hobby, level, technique, path, and progress APIs | Implemented                             |
| Registration, login, sessions, protected routes  | Not implemented—security phase required |
| Multi-page authenticated onboarding              | Blocked on authentication identity      |
| Path reordering and customization APIs           | Planned                                 |
| Practice log CRUD and weekly aggregation         | Planned                                 |
| Resource progress mutation API                   | Planned                                 |

Authentication routes are intentionally not stubbed: password hashing, refresh-token rotation, cookie policy, and session revocation need a dedicated security implementation.

## Architecture

The code uses a feature-oriented frontend and a layered backend. Dependencies point inward toward domain contracts; Express, PostgreSQL, Groq, and local storage remain replaceable adapters.

```text
React client
  components + feature views
            │
  useLearningPlan (client state)
            │
  plans-api / path-storage adapters
            │ HTTP
            ▼
Express routes → Zod validation → PlanService
                                      │
                     ┌────────────────┼────────────────┐
                     ▼                ▼                ▼
               Groq adapter    fallback engine   PlanRepository
                                                     │
                                             PostgreSQL / memory
```

### Frontend boundaries

```text
src/
├── components/             application shell and shared presentation
├── domain/                 seeded domain data
├── features/
│   ├── dashboard/          outcome and progress summary
│   ├── learning-path/      path view and pure progress metrics
│   ├── lesson/             technique interaction
│   └── path-studio/        goal capture and async UI state
├── services/               HTTP and browser-storage adapters
└── store/                  Redux slice, selectors, store, typed hooks
shared/                     API-safe domain contracts
```

The frontend stores one `LearningPlan` aggregate rather than disconnected title, technique, and progress state. Redux owns durable cross-feature domain state; temporary modal, form, and toast state stays local to the component that uses it. Progress is derived by a pure function and covered for skipped/all-skipped edge cases.

### Backend boundaries

```text
server/
├── app.ts                  middleware and route composition
├── config.ts               validated environment configuration
├── domain/                 schemas and provider contracts
├── routes/                 HTTP translation only
├── services/               use cases, caching, request coalescing
├── providers/              Groq and deterministic plan generators
├── repositories/           persistence ports and adapters
├── middleware/             stable error responses
└── database/               PostgreSQL migration and runner
```

`PlanService` depends on interfaces, not Express, PostgreSQL, or Groq. Twenty identical simultaneous requests share one promise. Completed plans are cached in memory and persisted by a goal hash, preventing repeated model calls for identical inputs.

## Database

PostgreSQL stores the normalized catalog, learner hobbies, generated paths, progress, resources, practice logs, and feedback. It also retains a separate expiring JSONB cache for AI-generated responses.

Start and migrate local PostgreSQL:

```bash
docker compose up -d postgres
cp .env.example .env
DATABASE_URL=postgresql://mosaic:mosaic@127.0.0.1:55432/mosaic npm run db:migrate
```

Without `DATABASE_URL`, the AI path demo uses its repository-compatible memory adapter. Normalized hobby, learning-path, and progress endpoints are enabled when PostgreSQL is configured.

## Capacity target: 1,000 requests/minute

1,000 requests/minute is approximately 17 requests/second. The application is designed to exceed that for cached plan reads:

- Stateless HTTP processes can scale horizontally.
- PostgreSQL uses a bounded connection pool (`DATABASE_POOL_MAX=10` by default).
- Per-instance cache holds at most 1,000 plans with a configurable TTL.
- Concurrent identical requests are coalesced before AI or database work.
- Per-client plan creation is limited to 120/minute.
- Request bodies are capped at 20 KB.
- AI calls have an eight-second timeout and deterministic fallback.
- Compression, security headers, structured logging, and graceful shutdown are enabled.

Local benchmark command:

```bash
npm run dev:api
npm run load:test
```

Latest result on the development machine: 1,000 completed, 0 failed, ~4,600 requests/second using the cached deterministic path at concurrency 50. This validates application overhead, caching, and coalescing—not Groq or remote PostgreSQL throughput. Before production, repeat against staging with PostgreSQL, realistic goal cardinality, network latency, and multiple service instances. A distributed Redis rate-limit/cache adapter is required when running more than one instance.

## Reliability and security

- Request and generated-AI payloads are validated with Zod.
- Provider output is not trusted merely because it is JSON.
- SQL uses parameterized queries.
- API errors have stable codes without leaking internals.
- Groq failure degrades to a domain fallback.
- PostgreSQL connections are closed during graceful shutdown.
- Helmet disables unsafe defaults and Express identification.

## Development

```bash
npm install
npm run dev
```

Optional live AI:

```bash
GROQ_API_KEY=your_key npm run dev
```

Quality gate:

```bash
npm run format:check
npm run typecheck
npm test
npm run lint
npm run build
```

## Tests

- API success and validation contract
- Primary-provider failure and fallback
- Concurrent-request coalescing
- Hobby-modality selection
- Progress calculation and zero-denominator edge case
- Weighted technique ranking and level filtering
- Prerequisite ordering and cycle rejection
- Redux plan replacement, restoration, and immutable status updates
- Transactional, repeatable migrations validated against PostgreSQL 17

## Engineering review scorecard

| Area                  | Current | Evidence / remaining work                                                             |
| --------------------- | ------: | ------------------------------------------------------------------------------------- |
| Correctness           |     93% | Strict types, twelve tests, validated inputs/outputs; browser E2E remains             |
| Architecture          |     92% | Feature frontend, layered backend, dependency inversion, repository/provider adapters |
| Code quality          |     94% | Prettier, Oxlint, small modules, descriptive contracts, no unchecked `any`            |
| Algorithms            |     91% | SHA-256 idempotency, bounded cache, promise coalescing, modality rules                |
| Performance           |     90% | 1,000/1,000 local benchmark; staging DB and distributed load test remain              |
| Production operations |     84% | Graceful shutdown and logging exist; metrics, Redis and deployment manifests remain   |

The combined implementation quality is above the requested 90% for this assignment-sized scope, but production operations are deliberately scored below 90 until distributed infrastructure is tested.

## Sources informing decisions

- React: minimal, derived state and one-way ownership
- Express: asynchronous work, caching, clustering, reverse proxies and correct error handling
- node-postgres: bounded connection pooling
- PostgreSQL: selective B-tree indexes and their write overhead
- Groq: current free-tier limits and rate-limit headers

The interface direction was informed by [Oboe](https://oboe.fyi/) and [Wondering](https://wondering.app/); the implementation and product flow are original to Mosaic.
