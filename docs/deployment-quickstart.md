# Home Server Deployment Quickstart

Use this checklist after the first-time setup in
[Home Server Deployment](deployment-home-server.md) is complete.

## Release

1. Merge the approved revision into `main`.
2. Confirm GitHub CI is green.
3. Open **Actions -> Deploy Home Server Demo**.
4. Run the workflow from `main`.
5. Confirm simulated/demo-safe data only.
6. Wait for validation, Docker deployment, Caddy reload, and smoke tests.

## Verify

From outside the home LAN:

```bash
curl --fail --silent --show-error https://va.norvix.no/ >/dev/null
curl --fail --silent --show-error https://va.norvix.no/api/health
curl --fail --silent --show-error https://va.norvix.no/api/health/db
curl --fail --silent --show-error https://va.norvix.no/api/version
```

On the server:

```bash
cd /srv/projects/va-drift-insight
docker compose --env-file .env \
  -f infra/docker/docker-compose.home-server.yml ps
RESOLVE_IP=127.0.0.1 \
  DEMO_API_KEY="$(sed -n 's/^DEMO_API_KEY=//p' .env | tail -n 1)" \
  bash infra/scripts/smoke-home-server.sh https://va.norvix.no
```

## Stop conditions

- CI is not green.
- The selected ref is not `main`.
- The revision contains anything other than simulated/demo-safe data.
- `/srv/projects/va-drift-insight/.env` is missing.
- The `proxy` Docker network or shared Caddy stack is unhealthy.
- Migrations, container health, Caddy validation, or smoke tests fail.

Do not use `docker compose down -v`. Roll back by reverting the application
commit on `main`, validating it in CI, and running the deploy workflow again.
