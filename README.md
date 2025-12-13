# FlutterFlow Sports Performance Backend Starter

Repo: https://github.com/toniilic/flutterflow-sports-performance-backend-starter

A public, reusable backend starter that shows **production-grade patterns** FlutterFlow apps typically need for sports/performance tracking: authentication, multi-tenant data modeling (athletes/coaches/teams), secure media uploads (video), asynchronous AI analysis, and clear integration points for FlutterFlow API Calls / Custom Actions.

## What’s included

- **Shared domain model**: users, profiles, teams, training sessions, drills, metrics, media assets, analysis jobs/results, annotations
- **Two backend tracks** (same concepts, different stack):
  - **Firebase-first**: Firestore + Storage + Cloud Functions + Security Rules
  - **Supabase alternative**: Postgres + Storage + Edge Functions + Row Level Security (RLS)
- **Secure media upload patterns**: direct upload with auth, optional signed URLs, private-by-default media
- **AI/video analysis pipeline**: upload → job creation → processing worker → results
- **API contract + examples**: HTTP request examples + FlutterFlow payload examples
- **Ops guidance**: pagination/indexing, rate limiting, idempotency, retries, observability

## Quickstart

Pick one track:

### Firebase track (recommended for FlutterFlow + Firebase)

- Install prerequisites: Node.js 18+, Firebase CLI
- Read: `firebase/README.md`
- Key files:
  - `firebase/firestore.rules`
  - `firebase/storage.rules`
  - `firebase/functions/src/index.ts`

### Supabase track

- Install prerequisites: Supabase CLI, Docker
- Read: `supabase/README.md`
- Key files:
  - `supabase/schema/schema.sql`
  - `supabase/schema/rls-policies.sql`
  - `supabase/functions/start-analysis-job/index.ts`

## Architecture (high-level)

```mermaid
graph TD
  FF[FlutterFlow App] -->|ID token| AUTH[Auth]
  FF -->|CRUD| DB[(DB: Firestore or Postgres)]
  FF -->|Upload video| ST[(Storage)]

  ST -->|upload finalize| TRIG[Upload Trigger]
  TRIG --> JOBS[(analysis_jobs)]

  FF -->|Start analysis (HTTP)| API[HTTP Functions]
  API --> JOBS

  JOBS --> WORKER[Job Processor]
  WORKER --> AI[AI Provider]
  AI --> WORKER
  WORKER --> RES[(analysis_results)]
  RES --> DB

  FF -->|Read results| DB
```

## FlutterFlow integration

Start here: `docs/flutterflow/integration-guide.md`

- Auth setup (Firebase/Supabase)
- Mapping collections/tables to FlutterFlow
- Pagination and query patterns
- Calling Functions via REST (API Calls) or Custom Actions
- Secure upload flows (direct upload vs signed URLs)

## Use cases

- Team training logs and attendance
- Rehab tracking and progress notes
- Drill libraries and performance metrics
- Video breakdown + coach annotations
- Automated “insights” generated from uploaded clips

## Roadmap (optional extensions)

- Notifications (push/email), scheduled digests
- Wearables integrations (Garmin/Apple Health/Whoop)
- Subscriptions (Stripe) and role-based feature gates
- Webhooks and third-party integrations

## Docs index

- Architecture overview: `docs/architecture/overview.md`
- Data model + ERD: `docs/architecture/data-model.md`
- Secure-by-default patterns: `docs/security/secure-by-default.md`
- AI workflow: `docs/ai/video-analysis-workflow.md`
- Performance & scalability: `docs/ops/performance-and-scalability.md`

## License

MIT — see `LICENSE`.
