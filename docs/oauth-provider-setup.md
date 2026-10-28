# CareerTwin Linear and Notion OAuth setup

CareerTwin must use its own provider OAuth applications. Arena connector credentials must never be copied into the website.

## Production callback URLs

- Linear: `https://careertwin-three.vercel.app/api/integrations/linear/callback`
- Notion: `https://careertwin-three.vercel.app/api/integrations/notion/callback`

For local development, register matching callbacks at `http://localhost:3000/api/integrations/{provider}/callback` if each provider permits multiple redirect URLs; otherwise create separate development OAuth apps.

## Vercel environment variables

Create these as encrypted/sensitive values for Production, Preview, and Development as appropriate:

- `LINEAR_CLIENT_ID`
- `LINEAR_CLIENT_SECRET`
- `NOTION_CLIENT_ID`
- `NOTION_CLIENT_SECRET`
- `INTEGRATION_TOKEN_ENCRYPTION_KEY` — a randomly generated 32-byte key, never exposed to browser code
- `NEXT_PUBLIC_APP_URL=https://careertwin-three.vercel.app`

Do not paste secrets into source control, documentation, chat, screenshots, or any `NEXT_PUBLIC_*` variable.

## Required implementation safeguards

1. Start OAuth only for an authenticated Clerk user.
2. Generate server-side state, bind it to the Clerk subject, set a short expiry, and verify it at callback.
3. Exchange authorization codes only in server routes.
4. Encrypt access and refresh tokens before storage.
5. Store provider connections under the Clerk subject with Supabase RLS ownership checks.
6. Request minimum scopes and show them before authorization.
7. Refresh tokens server-side and handle revoked authorization without fake success states.
8. Provide connection status, last successful sync time, reconnect, and disconnect controls.
9. Revoke provider access during disconnect when the provider supports revocation, then remove encrypted tokens.
10. Keep webhook signing secrets server-side and verify signatures before processing events.

## Data model plan

Use a version-controlled Supabase migration for a private `integration_connections` table containing owner subject, provider, encrypted token material, provider account/workspace identifiers, scopes, expiry, status, and timestamps. Add a unique constraint on `(owner_subject, provider, provider_workspace_id)` and owner-only RLS policies. Do not deploy the migration until it has been reviewed and a rollback/data-safety plan is approved.

## Provider configuration checklist

### Linear

- Create a Linear OAuth application for CareerTwin.
- Register the exact production callback URL.
- Choose the minimum scopes needed for the first user-visible workflow.
- Place the generated client ID and secret in Vercel's protected environment variables.

### Notion

- Create a public Notion integration if arbitrary CareerTwin users will connect their own workspaces.
- Register the exact production callback URL and company/support/privacy details required by Notion.
- Request only the capabilities required by the first workflow.
- Place the generated client ID and secret in Vercel's protected environment variables.

## Product decision still required

Before implementation, define the first real user workflow—for example, exporting an approved career task to Linear or publishing a user-selected roadmap to a Notion page. OAuth connection alone is not useful app functionality and must not be presented as a completed integration.
