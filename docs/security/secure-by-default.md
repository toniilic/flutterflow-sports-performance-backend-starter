## Secure-by-default

Repo: https://github.com/toniilic/flutterflow-sports-performance-backend-starter

Security goals:

- **Least privilege**: users can only access what they own or what their team membership permits.
- **Private-by-default media**: uploads start private; sharing is explicit.
- **Multi-tenant boundaries**: `team_id` is the primary isolation key.
- **Server-side checks for privileged actions**: signed URLs, job creation, role changes.

### Roles

- **Profile role**: `athlete | coach | admin`
- **Team member role**: `member | coach | admin`

### Firebase model (Security Rules)

Recommended approach:

- Store team membership in `team_members/{teamId}_{userId}` (or similar) so rules can check it.
- Restrict reads/writes by:
  - `resource.data.userId == request.auth.uid` (ownership)
  - OR `isTeamCoachOrAdmin(resource.data.teamId, request.auth.uid)`

Media:

- Storage object metadata should include `ownerUid`, `teamId`, `visibility`.
- Default `visibility = private`.
- Only coaches/admins can read team-shared media.

### Supabase model (RLS)

Recommended approach:

- Enable RLS on all tables.
- Use policies that enforce:
  - ownership (`auth.uid() = user_id`)
  - team membership (join `team_members`)
  - coach/admin privileges for team-wide reads

Media:

- Storage bucket is private.
- Objects contain a `team_id` prefix and/or metadata.
- Policies allow reads if:
  - owner OR team coach/admin OR explicitly shared.

### Common edge cases

- **Role escalation**: only server/admin can change `profile.role` or `team_members.role`.
- **Cross-team access**: every query must filter by `team_id` where applicable.
- **Deletion**: data retention should delete media + derived analysis results.
- **Signed URLs**: short TTL and single-purpose (upload only), validate object path.
