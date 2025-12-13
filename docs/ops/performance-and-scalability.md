## Performance and scalability

Repo: https://github.com/toniilic/flutterflow-sports-performance-backend-starter

### Pagination

- Use cursor pagination and stable ordering.
- Keep list endpoints/filter queries indexed.

### Indexing

- Add composite indexes for common access patterns (team + createdAt).
- Avoid unbounded queries that scan entire collections/tables.

### Rate limiting

- Apply per-user and per-team limits to:
  - job creation
  - signed URL requests
  - expensive search endpoints

### Cold starts (Functions)

- Keep function dependencies small.
- Reuse clients (admin SDK, AI client) across invocations.

### Observability

- Log structured JSON events:
  - `job.created`, `job.claimed`, `job.succeeded`, `job.failed`
- Include correlation IDs:
  - `job_id`, `media_asset_id`, `team_id`, `request_id`
- Capture errors:
  - Sentry (optional) or platform-native error reporting

### Caching

- Cache derived summaries (weekly metrics, trends) to avoid recompute.
- Consider a denormalized “team dashboard” document/row.

### Data modeling tips

- Prefer append-only metrics/events, aggregate into summaries.
- Keep AI outputs versioned so you can re-run analysis safely.
