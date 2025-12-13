## Contributing

Thanks for wanting to improve this starter.

### Principles

- Keep the **domain model consistent** across Firebase and Supabase tracks.
- Default to **secure-by-default** access (least privilege).
- Prefer **small, composable modules** and clear interfaces.
- Avoid adding vendor lock-in without documenting an alternative.

### Local development

#### Firebase track

- Install Node.js 18+ and Firebase CLI.
- See `firebase/README.md` for emulator + Functions workflow.

#### Supabase track

- Install Docker and Supabase CLI.
- See `supabase/README.md` for running locally and applying schema.

### Making changes

- Keep docs up to date when you change entity names, access rules, or API payloads.
- Add request examples under `api/requests/` when adding endpoints.
- Prefer backward-compatible additions to the API contract.

### Proposing changes

- Open a PR that includes:
  - Problem statement and motivation
  - Proposed solution
  - Security considerations (authz, data exposure)
  - Test plan (manual steps are fine for a starter)
