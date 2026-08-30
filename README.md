# clocess
## Web Distributed Authoring and Versioning
so, the idea is that I have a server and while I run  
some web projects. They are small and don't require  
any storage. In the end, I have some space to waste on  
my server. Yeah, u can use `scp` but I also want to  
access those files from phone. Maybe sharing  
functionality will also be done.  

## Setup

Copy the example env and compose override files, then fill in your values:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
cp compose.override.example.yaml compose.override.yaml
```

- `.env`
- `compose.override.yaml` — sets the host/container port mapping and restart policy for local dev.

Then start the stack:

```bash
docker compose up -d --build
```

Install [goose](https://github.com/pressly/goose) (used by the `Makefile` to run migrations against the host-mapped DB port — not bundled as a Go dependency):

```bash
go install github.com/pressly/goose/v3/cmd/goose@latest
```

Apply migrations:

```bash
make migrate-up
```

### DB

apply all pending migrations
```
make migrate-up
```

roll back the last migration
```
make migrate-down
```

check migration status
```
make migrate-status
```

create a new migration
```
make migrate-create name=add_users_table
```

### Monitoring

**Beszel** (host/container metrics) — `beszel` has no TOKEN/KEY of its own to generate; they come from the hub after it's running:

```bash
docker compose up -d beszel
```

Open the hub UI (`BESZEL_URL` in `.env`, e.g. `http://localhost:8090`), create an admin account, then **Add System**. For the unix-socket setup used here, set **Host / IP** to `/beszel_socket/beszel.sock`. Copy the generated **Public Key** and **Token** into `.env`:

```
BESZEL_KEY="ssh-ed25519 AAAA..."
BESZEL_TOKEN=...
```

(quote `BESZEL_KEY` if your shell/tool needs it — it contains a space)

Then start the agent:

```bash
docker compose up -d beszel-agent
```

**Dozzle** (container log viewer) — generate a bcrypt password hash for `dozzle_data/users.yaml` (see `dozzle_data/users.example.yaml` for the file shape):

```bash
docker run --rm amir20/dozzle generate -p yourpassword yourusername --name "Your Name"
```

Copy the printed `password:` hash into `dozzle_data/users.yaml`.
