# Home Server Deployment

This runbook deploys the simulated VA portfolio demo to
`https://va.norvix.no` on the existing Norvix home server.

The deployment is a public portfolio sandbox, not a production municipal VA
system. It must contain simulated operational data only. Do not import real
pipe networks, SCADA data, incidents, addresses, credentials, or other
sensitive infrastructure data.

## Deployment decision

The selected public hostname is:

```text
https://va.norvix.no
```

`va` is short, directly describes the product domain, and is easier to present
in a portfolio than the repository name. The DNS `A` record was created before
the first deployment and currently resolves directly to the home public IPv4
address. Verify that the address is still correct before deployment.

The application follows the established Norvix home-server pattern:

```text
Internet
  -> Cloudflare authoritative DNS (DNS only)
  -> router TCP 80/443 (and optional UDP 443)
  -> shared Caddy container
       /api/* -> va-drift-api:3001
       /*     -> va-drift-web:3000
  -> internal Docker network
       api -> PostGIS
```

Only shared Caddy publishes host ports. Web, API, PostGIS, and the Caddy admin
API must not be published directly.

## Known Norvix server conventions

- Ubuntu 24.04 LTS home server.
- Docker Engine and the Docker Compose plugin.
- Shared proxy stack in `/srv/proxy`.
- Shared external Docker network named `proxy`.
- Caddy site fragments in `/srv/proxy/sites`.
- Applications below `/srv/projects`.
- SSH is key-only and restricted to the trusted home LAN.
- A repository-specific self-hosted GitHub Actions runner performs deployment.

The repository intentionally does not contain the private LAN address, router
credentials, Cloudflare credentials, or server secrets.

## Runtime services

The stack is defined in
`infra/docker/docker-compose.home-server.yml`.

| Service | Purpose | Public host port |
| --- | --- | --- |
| `web` | Standalone Next.js server | None |
| `api` | Compiled NestJS API and PDF generation | None |
| `migrate` | One-shot Prisma migrations and optional demo reset | None |
| `postgres` | PostgreSQL 16 with PostGIS | None |

The API image includes Debian Chromium because Puppeteer generates the VA PDF
report. Generated reports use a named Docker volume. PostgreSQL uses a separate
persistent named volume.

## Repository deployment files

```text
.github/workflows/ci.yml
.github/workflows/deploy-home-server.yml
infra/caddy/va.norvix.no.caddy
infra/docker/Dockerfile.api
infra/docker/Dockerfile.web
infra/docker/docker-compose.home-server.yml
infra/docker/.env.home-server.example
infra/scripts/smoke-home-server.sh
```

## Public-origin API design

Browser requests use the same public origin:

```text
https://va.norvix.no/api/...
```

Server-side rendering uses the private Docker URL:

```text
http://api:3001
```

This is why the web container has `INTERNAL_API_URL=http://api:3001`, while
`NEXT_PUBLIC_API_URL` is built as an empty string. Never put `api:3001` in a
`NEXT_PUBLIC_*` variable: it would leak an unusable Docker hostname into the
browser bundle.

## DNS and router prerequisites

In Cloudflare, keep the initial record as DNS only:

```text
Type: A
Name: va
Target: current home public IPv4 address
Proxy status: DNS only
```

Do not add an `AAAA` record unless IPv6 ingress and firewall rules are verified.
Forward only TCP 80 and TCP 443 to the home server. UDP 443 is optional for
HTTP/3. Do not expose SSH, PostgreSQL, port 3000, port 3001, Docker, or the Caddy
admin endpoint to the internet.

Useful checks from a trusted workstation:

```bash
dig +short va.norvix.no A
curl -I http://va.norvix.no
```

The HTTP check will succeed only after the Caddy route is installed.

## Host prerequisites

The deployment account needs these commands:

```bash
git --version
docker --version
docker compose version
rsync --version
curl --version
```

Verify the shared proxy without changing it:

```bash
docker network inspect proxy >/dev/null
test -f /srv/proxy/compose.yml
test -d /srv/proxy/sites
docker compose -f /srv/proxy/compose.yml ps
```

Never start a second Caddy instance on this server. Ports 80/443 are already
owned by the shared proxy.

## First-time server preparation

Create the application directory and restrict it to the deployment account:

```bash
sudo mkdir -p /srv/projects/va-drift-insight
sudo chown -R DEPLOY_USER:DEPLOY_USER /srv/projects/va-drift-insight
```

The deploy user must also be allowed to install the tracked site fragment in
`/srv/proxy/sites` and use Docker. Prefer group permissions over broad sudo.

Create the private environment file on the server:

```bash
cd /srv/projects/va-drift-insight
cp /path/to/checkout/infra/docker/.env.home-server.example .env
chmod 600 .env
nano .env
```

Generate independent random values:

```bash
openssl rand -base64 48
openssl rand -base64 48
```

Use one value for `POSTGRES_PASSWORD` and a different value for
`DEMO_API_KEY`. Never print the completed `.env` in CI logs.

The expected server file is:

```dotenv
APP_DOMAIN=va.norvix.no
POSTGRES_DB=va_drift_insight
POSTGRES_USER=va_drift
POSTGRES_PASSWORD=<long random value>
DEMO_API_KEY=<different long random value>
RESET_DEMO_DATA_ON_DEPLOY=true
FROST_CLIENT_ID=
DEFAULT_MUNICIPALITY_CODE=3905
DEFAULT_MUNICIPALITY_NAME=Tonsberg
```

`FROST_CLIENT_ID` is optional. Seeded rainfall fallback data keeps the demo
operational when it is empty.

### Demo write-key boundary

The browser needs the demo key for interactive status changes, imports, and PDF
generation. Therefore this key is compiled into the public browser bundle and
must not be treated as authentication or a secret security boundary. It only
prevents accidental unauthenticated writes. The public application accepts
simulated data only, and the database must be considered disposable demo state.

## Dedicated GitHub Actions runner

Use a repository-level runner dedicated to this repository. Do not reuse the
runner label of another Norvix application.

In GitHub:

1. Open repository **Settings -> Actions -> Runners**.
2. Select **New self-hosted runner** and Linux x64.
3. Run GitHub's displayed download and verification commands on the server.
4. Configure the runner with these labels:

```bash
./config.sh \
  --url https://github.com/IoanGogozan/VA-Drift-Insight \
  --token ONE_TIME_TOKEN_FROM_GITHUB \
  --name va-drift-insight-home \
  --labels home-server,va-drift-insight \
  --unattended
```

5. Install and start it using the generated service command:

```bash
sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```

The workflow requires all three labels:

```yaml
runs-on: [self-hosted, home-server, va-drift-insight]
```

Self-hosted runners execute repository code on the server. Keep repository
write access restricted, do not run pull-request code on this runner, and do
not add the runner label to general CI jobs. The deploy workflow is manual,
main-only, and runs normal validation on GitHub-hosted runners before it reaches
the home server.

## GitHub environment gate

Create a GitHub environment named `home-demo`:

1. Open **Settings -> Environments -> New environment**.
2. Name it `home-demo`.
3. Restrict deployment branches to `main`.
4. Optionally add a required reviewer.

Application secrets remain in `/srv/projects/va-drift-insight/.env`; they are
not required as GitHub Actions secrets.

## CI workflow

`.github/workflows/ci.yml` runs on pushes and pull requests to `main`, and can
also be called by the deployment workflow. It:

1. starts disposable PostGIS;
2. installs the locked npm dependency graph;
3. generates Prisma Client;
4. applies all committed migrations;
5. seeds simulated data;
6. runs type checks and tests;
7. builds API, shared package, and frontend;
8. validates the home-server Compose configuration.

## Deployment workflow

`.github/workflows/deploy-home-server.yml` is manual-only. To deploy:

1. Merge the intended revision into `main`.
2. Confirm the CI run passed.
3. Open **Actions -> Deploy Home Server Demo -> Run workflow**.
4. Select `main`.
5. Confirm that the revision contains simulated/demo-safe data only.
6. Add an optional deployment note and start the workflow.

The workflow:

1. enforces `main` and the simulated-data confirmation;
2. calls the complete CI workflow;
3. selects the dedicated server runner;
4. verifies Docker, rsync, the `proxy` network, server `.env`, and Caddy layout;
5. synchronizes the approved checkout while preserving `.env`;
6. validates Compose;
7. builds and recreates the stack;
8. runs Prisma migrations and optionally reseeds demo data;
9. waits for API and web health;
10. installs and validates the Caddy route;
11. reloads Caddy without restarting the shared proxy;
12. runs smoke tests through local Caddy with valid TLS/SNI.

## Demo reset behavior

The seed script deletes and recreates the simulated dataset. With:

```dotenv
RESET_DEMO_DATA_ON_DEPLOY=true
```

every deployment resets status changes, import runs, and other demo activity.
This is the recommended public portfolio setting. Set it to `false` only after
the first successful seed if state should survive application deployments.
Migrations still run on every deployment.

## Manual first-deploy validation

Before using GitHub Actions, or for diagnosis, validate from the server:

```bash
cd /srv/projects/va-drift-insight
docker compose \
  --env-file .env \
  -f infra/docker/docker-compose.home-server.yml \
  config --quiet

docker compose \
  --env-file .env \
  -f infra/docker/docker-compose.home-server.yml \
  up -d --build --remove-orphans

docker compose \
  --env-file .env \
  -f infra/docker/docker-compose.home-server.yml \
  ps
```

Install the route and reload shared Caddy:

```bash
install -m 0644 \
  infra/caddy/va.norvix.no.caddy \
  /srv/proxy/sites/va.norvix.no.caddy

docker compose -f /srv/proxy/compose.yml exec -T caddy \
  caddy validate --config /etc/caddy/Caddyfile
docker compose -f /srv/proxy/compose.yml exec -T caddy \
  caddy reload --config /etc/caddy/Caddyfile
```

## Acceptance checks

Run on the server through the local Caddy listener:

```bash
cd /srv/projects/va-drift-insight
RESOLVE_IP=127.0.0.1 \
  DEMO_API_KEY="$(sed -n 's/^DEMO_API_KEY=//p' .env | tail -n 1)" \
  bash infra/scripts/smoke-home-server.sh https://va.norvix.no
```

With `DEMO_API_KEY` set, the smoke test also generates and downloads a PDF and
verifies its file signature. Without it, the script still verifies that the
write endpoint rejects an unauthenticated request.

Run from a network outside the home LAN:

```bash
curl --fail --silent --show-error https://va.norvix.no/ >/dev/null
curl --fail --silent --show-error https://va.norvix.no/api/health
curl --fail --silent --show-error https://va.norvix.no/api/health/db
curl --fail --silent --show-error https://va.norvix.no/api/version
```

Also verify in a browser:

- overview and all navigation sections render;
- Kartverket tiles and municipality context load;
- zone and pump-station selection works;
- a simulated status update succeeds;
- PDF generation opens a downloadable report;
- the browser console contains no unexpected errors;
- the UI clearly identifies simulated VA data.

## Operational commands

```bash
cd /srv/projects/va-drift-insight
COMPOSE='docker compose --env-file .env -f infra/docker/docker-compose.home-server.yml'

$COMPOSE ps
$COMPOSE logs --tail=200 api web
$COMPOSE restart api web
$COMPOSE exec -T api node -e \
  "fetch('http://127.0.0.1:3001/api/health/db').then(async r=>console.log(r.status,await r.text()))"
```

Do not run `docker compose down -v`. The `-v` option deletes PostGIS and report
volumes.

## Backup boundary

The public dataset is simulated and normally reset on deployment, but a manual
database backup can preserve a useful demo state:

```bash
stamp="$(date -u +%Y-%m-%dT%H%M%SZ)"
mkdir -p /srv/backups/va-drift-insight
docker compose \
  --env-file .env \
  -f infra/docker/docker-compose.home-server.yml \
  exec -T postgres \
  pg_dump -U va_drift -d va_drift_insight -Fc \
  > "/srv/backups/va-drift-insight/database-$stamp.dump"
```

Generated PDFs are disposable demo artifacts. If they need temporary retention,
archive the `va-drift-insight_reports_data` volume separately. Backups stored on
the same server do not protect against disk loss.

## Rollback

The normal rollback is an auditable Git rollback:

1. Revert the failing application commit on `main`.
2. Let CI validate the reverted revision.
3. Run the manual deployment workflow again.

Named volumes remain attached and must not be deleted. Prisma migrations are
forward-only; review schema compatibility before reverting application code.
Database restoration is a separate destructive operation and must be explicitly
approved. Do not automate it from a deployment error handler.

## Troubleshooting

### Caddy returns 502

```bash
docker network inspect proxy
docker compose --env-file .env \
  -f infra/docker/docker-compose.home-server.yml ps
docker compose --env-file .env \
  -f infra/docker/docker-compose.home-server.yml logs --tail=200 web api
```

Confirm aliases `va-drift-web` and `va-drift-api` exist on the `proxy` network.

### API fails after migration

Inspect the one-shot job and PostgreSQL:

```bash
docker compose --env-file .env \
  -f infra/docker/docker-compose.home-server.yml logs migrate postgres
```

Do not repeatedly reseed until the reported migration or database error is
understood.

### PDF generation fails

```bash
docker compose --env-file .env \
  -f infra/docker/docker-compose.home-server.yml exec -T api \
  /usr/bin/chromium --version
docker compose --env-file .env \
  -f infra/docker/docker-compose.home-server.yml logs --tail=200 api
```

Confirm the report volume is writable by the unprivileged `node` user.

### TLS certificate is not issued

- confirm `va.norvix.no` resolves to the current public IPv4 address;
- confirm Cloudflare is DNS only during initial issuance;
- confirm router and firewall allow inbound TCP 80/443;
- inspect shared Caddy logs;
- do not start a second proxy stack.

### GitHub job waits for a runner

Confirm the dedicated runner is online and has the exact labels
`self-hosted`, `home-server`, and `va-drift-insight`.

## Security and privacy limits

- Synthetic/demo data only.
- No real municipal infrastructure or SCADA data.
- No public database, API, or application ports.
- No public SSH requirement.
- No secrets committed to Git.
- Server `.env` mode is `0600`.
- Caddy access logs rotate and are retained for at most seven days.
- The demo write key is public by design and is not authentication.
- This deployment is not designed for confidential or durable user data.
