

This contains everything you need to run your app locally.


## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Cloudflare Pages

1. Build with published CMS content and deploy to production:
   `npm run deploy:cf`

The app uses a Cloudflare Pages fallback rewrite so client-side routes like `/practice/corporate-litigation` continue to load correctly after deployment.

## GitHub Actions Deploy

This repo is also set up to deploy from GitHub Actions on pushes to `main`.

Required GitHub repository secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_D1_DATABASE_ID`
- `CLOUDFLARE_PRODUCTION_URL`
- `CMS_DEPLOY_CALLBACK_TOKEN`
- `GITHUB_DEPLOY_OWNER`
- `GITHUB_DEPLOY_REPO`
- `GITHUB_DEPLOY_TOKEN`

The CMS deploy button dispatches the workflow by repository + workflow name, so the GitHub deployment secrets also need to be configured in the admin environment:

- `GITHUB_DEPLOY_WORKFLOW` defaults to `deploy.yml`
- `GITHUB_DEPLOY_REF` defaults to `main`

The workflow writes a temporary `.env` file for Wrangler and then runs the same CMS-aware deploy command used locally.

## CMS Deploys

The admin CMS stores draft and published snapshots in Cloudflare D1. Use these commands when the public build should read the published CMS snapshot:

1. Build with published D1 content:
   `npm run build:cf:cms`
2. Build and upload to Cloudflare Pages:
   `npm run deploy:cf:prod:cms`
3. Build and upload a preview deployment:
   `npm run deploy:cf:preview:cms`
4. Build from checked-in `site-content.json` instead of D1:
   `npm run deploy:cf:prod:seed`

The deploy scripts pass `--env-file .env` to Wrangler so local deploys use your local Cloudflare account/token. This does not upload or overwrite Cloudflare Pages environment variables. Cloudflare dashboard secrets are only changed by commands like `wrangler pages secret put`.

## Admin User CLI

Use this for D1-backed admin user management:

1. List users:
   `npm run admin:users -- list`
2. Add user:
   `npm run admin:users -- add --email user@example.com --password "secret"`
3. Change password:
   `npm run admin:users -- set-password --email user@example.com --password "secret"`
4. Delete user:
   `npm run admin:users -- delete --email user@example.com`

Required environment variables for CMS builds:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_D1_DATABASE_ID`

Required environment variables for `/admin`:

- `CMS_ADMIN_EMAIL`
- `CMS_ADMIN_PASSWORD`
- `CLOUDFLARE_PRODUCTION_URL`
- `CLOUDFLARE_PREVIEW_URL`
- `GITHUB_DEPLOY_OWNER`
- `GITHUB_DEPLOY_REPO`
- `GITHUB_DEPLOY_TOKEN`
- `CMS_DEPLOY_CALLBACK_TOKEN`
- `GITHUB_DEPLOY_WORKFLOW` if you rename the workflow file from `deploy.yml`
- `GITHUB_DEPLOY_REF` if you want to deploy from a branch other than `main`

`CLOUDFLARE_DEPLOY_HOOK_URL` and `CLOUDFLARE_PREVIEW_DEPLOY_HOOK_URL` are only needed if you keep the legacy preview hook flow enabled.
