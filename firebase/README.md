## Firebase track

This track targets FlutterFlow apps using Firebase (Auth + Firestore + Storage).

### What you get

- Firestore collections + baseline Security Rules
- Storage rules for private-by-default media
- Cloud Functions (TypeScript) skeleton:
  - HTTP endpoint to start an analysis job
  - Optional signed upload URL endpoint
  - Storage trigger to create jobs on upload
  - Job processor that calls an AI provider

### Prerequisites

- Node.js 18+
- Firebase CLI (`npm i -g firebase-tools`)

### Local workflow (emulators)

From `firebase/functions/`:

```bash
npm install
npm run build

# Start emulators (requires a Firebase project configured in your environment)
# firebase emulators:start
```

### Deploy (high level)

- Configure your Firebase project and enable:
  - Authentication providers
  - Firestore
  - Storage
  - Cloud Functions
- Deploy rules and functions (commands depend on your Firebase CLI setup).

### FlutterFlow integration

See: `docs/flutterflow/integration-guide.md`

- Use FlutterFlow Firebase Auth
- Use Firestore Collections for CRUD
- Call Functions via API Calls (HTTP) for privileged actions (jobs, signed URLs)
