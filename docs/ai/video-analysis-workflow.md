## Video analysis workflow

Repo: https://github.com/toniilic/flutterflow-sports-performance-backend-starter

This starter uses an **asynchronous job model** so AI processing doesn’t block the UI.

### Workflow

1) **Upload**
- Client uploads a video to Storage (private-by-default).
- Client (or trigger) creates a `media_assets` record.

2) **Job creation**
- A Storage trigger or an HTTP endpoint creates an `analysis_jobs` record:
  - `status = queued`
  - references `media_asset_id`
  - includes `team_id`, `requested_by_user_id`

3) **Processing**
- A processor claims queued jobs and sets `status = processing`.
- It calls an AI provider to extract metadata/insights.

4) **Result write**
- Store structured output in `analysis_results`.
- Update job to `status = succeeded` (or `failed`) with timestamps.

### Idempotency

Avoid duplicate processing by using an idempotency key:

- Example: `idempotency_key = sha256(media_asset_id + analysis_version)`
- When creating a job, **upsert** by `idempotency_key`.

### Retries + long-running jobs

- Use `attempt_count`, `last_error`, and exponential backoff.
- Prefer small, bounded work units (e.g., sample frames, short clips).
- If processing exceeds limits:
  - split into sub-jobs (segments)
  - or offload to a dedicated queue/worker service

### Cost controls

- Enforce limits: max video size/duration, max jobs per day per user/team.
- Use sampling: 1 frame/sec or keyframes for rough analysis.
- Track `estimated_cost_usd` and log per job.

### Data retention

- Deleting a `media_asset` should delete associated:
  - storage object
  - `analysis_jobs`
  - `analysis_results`
  - time-based annotations
