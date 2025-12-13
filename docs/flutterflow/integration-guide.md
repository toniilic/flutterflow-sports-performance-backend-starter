## FlutterFlow integration guide

Repo: https://github.com/toniilic/flutterflow-sports-performance-backend-starter

This guide explains how to wire FlutterFlow to either the Firebase or Supabase track.

### Auth configuration

- **Firebase track**:
  - Use FlutterFlow’s Firebase integration.
  - Ensure users sign in and you can read the current user UID.
- **Supabase track**:
  - Use Supabase Auth (email/password, OAuth, etc.).
  - Ensure you can access the user’s JWT for API calls.

### Collections/tables mapping

Use these canonical names:

- `profiles`
- `teams`, `team_members`
- `training_sessions`, `drills`, `session_drills`
- `performance_metrics`
- `media_assets`
- `analysis_jobs`, `analysis_results`
- `notes`

Firebase: collections with the same names. Supabase: tables with the same names.

### Query patterns (pagination + streams)

- **Paginated lists** (sessions, media, jobs): order by `createdAt/created_at` descending and use cursor pagination.
- **Real-time status**:
  - Firebase: stream the `analysis_jobs/{jobId}` document.
  - Supabase: subscribe to `analysis_jobs` row changes (optional) or poll a lightweight endpoint.

### Calling Functions from FlutterFlow

Two common patterns:

- **API Calls** (recommended): call HTTP endpoints and include the auth token.
- **Custom Actions**: if you need to compute headers or do a multi-step workflow.

See payload examples in:

- `api/requests/start_analysis_job.http`
- `examples/flutterflow/api-calls.json`
- `examples/flutterflow/custom-action-snippets.md`

### Secure storage uploads

You have two safe approaches:

1) **Direct upload with platform SDK** (simple)
- Firebase: upload to Storage using Firebase SDK; rules enforce ownership.
- Supabase: upload using Storage API; bucket policy enforces ownership.

2) **Signed URL upload** (advanced)
- App requests a signed URL from your Function.
- App uploads bytes directly to Storage using the signed URL.
- A trigger/function validates and creates `media_assets` + `analysis_jobs`.

See: `api/requests/upload_flow.md`

### Recommended client flow

- Create/select a `team`.
- Create a `training_session`.
- Upload a video to `media_assets` (private-by-default).
- Start analysis (either auto-triggered or via HTTP).
- Stream/poll `analysis_jobs.status` and render `analysis_results` when ready.
