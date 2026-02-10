# 2OpenClaw: The War Stories 🦞

*A chronicle of bugs, breakthroughs, and beautiful disasters*

---

## The Mission

Build a managed hosting platform for OpenClaw — let anyone deploy their own AI assistant in 60 seconds with minimal technical setup. Think "Heroku for AI assistants" but with India pricing.

**Stack:** Next.js (Vercel) + GCP VM + Docker + Caddy + OpenClaw

---

## Chapter 1: The Architecture That Almost Worked

### What We Built

```
┌─────────────────┐     ┌──────────────────────────────────┐
│  Vercel (Free)  │────▶│     GCP VM (e2-medium, $25/mo)   │
│  - Landing page │     │  ┌──────────────────────────────┐ │
│  - Onboarding   │     │  │  Provisioning API (Node.js)  │ │
│  - Dashboard    │     │  └──────────────────────────────┘ │
└─────────────────┘     │  ┌──────────────────────────────┐ │
                        │  │  Caddy (Reverse Proxy + TLS) │ │
                        │  └──────────────────────────────┘ │
                        │  ┌─────┐ ┌─────┐ ┌─────┐         │
                        │  │User1│ │User2│ │UserN│ Docker  │
                        │  └─────┘ └─────┘ └─────┘         │
                        └──────────────────────────────────┘
```

**The idea:** User signs up → Creates Telegram bot → We provision a Docker container → They're live in 60 seconds.

**The reality:** 3 hours of debugging config formats.

---

## Chapter 2: The Seven Circles of Config Hell

### Bug #1: Caddy Won't Reload (The Admin Endpoint Saga)

**What happened:** Fresh container deployments worked. But when we tried to add a new user's subdomain to Caddy, `systemctl reload caddy` failed with "connection refused".

**The clue:**
```
Error: sending configuration to instance: Post "http://localhost:2019/load": dial tcp 127.0.0.1:2019: connect: connection refused
```

**Root cause:** Our setup script had `admin off` in the Caddyfile. This disables Caddy's admin API on port 2019. Without it, `systemctl reload caddy` has no way to hot-reload config.

**The fix:** Remove `admin off`. Caddy's admin endpoint only listens on localhost anyway — it's safe.

```diff
- {
-     admin off
- }
```

**Lesson:** Security theater can break functionality. Understand what you're disabling before you disable it.

---

### Bug #2: The Mysterious Auth Token Loop

**What happened:** Container starts, immediately crashes. Logs show:
```
Gateway auth is set to token, but no token is configured.
```

Every 8 seconds, restart, same error. Over and over.

**The investigation:**
1. We set `gateway.auth: "none"` in config → Still crashed
2. We set env var `OPENCLAW_GATEWAY_AUTH=none` → Still crashed  
3. We set env var `OPENCLAW_GATEWAY_TOKEN=xyz123` → IT WORKED!

**Root cause:** OpenClaw's config expects `gateway.auth` as an **object**, not a string:

```json
// ❌ WRONG
"gateway": {
  "auth": "none"
}

// ✅ CORRECT
"gateway": {
  "auth": {
    "mode": "token",
    "token": "your-secret-here"
  }
}
```

**Lesson:** When config fails, check the actual schema. "I think it's a string" is not the same as "the docs say it's a string."

---

### Bug #3: Config File? What Config File?

**What happened:** We mount a config file into the container. Gateway starts. But it uses default settings (Anthropic model) instead of our config (Groq model).

**The investigation:**
```bash
# Our config was at:
/home/node/.openclaw/config/openclaw.json

# OpenClaw was looking at:
/home/node/.openclaw/openclaw.json  # ROOT level, no subfolder!
```

We were putting the config one directory too deep.

**The fix:** Mount directly to the expected location:
```bash
-v /host/path/openclaw.json:/home/node/.openclaw/openclaw.json
```

**Lesson:** "Works on my machine" often means "my machine has different paths." Always verify where software actually looks for config.

---

### Bug #4: The Provider That Wasn't

**What happened:** Config finally loads! But OpenClaw says:
```
Invalid config: Unrecognized key: "providers"
```

**The investigation:** We had:
```json
{
  "providers": {
    "groq": {
      "apiKey": "gsk_..."
    }
  }
}
```

But OpenClaw expects:
```json
{
  "env": {
    "vars": {
      "GROQ_API_KEY": "gsk_..."
    }
  }
}
```

**Root cause:** OpenClaw uses environment variables for API keys, not a `providers` block. The schema changed (or was never what we assumed).

**Lesson:** Read. The. Actual. Documentation. Don't cargo-cult from Stack Overflow snippets.

---

### Bug #5: The Telegram Token Identity Crisis

**What happened:**
```
Invalid config: Unrecognized key: "token" in channels.telegram
```

**The fix:**
```json
// ❌ WRONG
"channels": {
  "telegram": {
    "token": "bot123:ABC..."
  }
}

// ✅ CORRECT  
"channels": {
  "telegram": {
    "botToken": "bot123:ABC..."
  }
}
```

**Lesson:** `token` vs `botToken` — one character difference, hours of debugging. Naming matters.

---

### Bug #6: Enabled But Not Really

**What happened:** Telegram config looks perfect. Gateway starts. No Telegram connection in logs.

**The investigation:** We had `channels.telegram.enabled: true`. But OpenClaw has TWO places to enable Telegram:

1. `channels.telegram.enabled: true` — Channel config
2. `plugins.entries.telegram.enabled: true` — Plugin loader

Both must be `true`. We only had the first one.

**Root cause:** OpenClaw separates "channel configuration" from "plugin loading." Think of it like: you can configure a printer, but if the print spooler service isn't running, nothing prints.

**The fix:**
```json
{
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "..."
    }
  },
  "plugins": {
    "entries": {
      "telegram": {
        "enabled": true  // DON'T FORGET THIS!
      }
    }
  }
}
```

**Lesson:** "Enabled" can mean different things at different layers. Check all of them.

---

### Bug #7: The Groq Free Tier Wall

**What happened:** Everything finally works! Telegram connects! User sends message! And then...
```
413 Request too large for model llama-3.3-70b-versatile
Limit 12000, Requested 12641 TPM
```

**Root cause:** Groq's free tier has a 12,000 tokens-per-minute limit. OpenClaw's default system prompt is ~12,500 tokens. We were over budget before the user even typed "hello."

**The attempted fixes:**
1. Switch to `llama-3.1-8b-instant` → Even lower limit (6,000 TPM)!
2. Switch to `gemma2-9b-it` → Better (15,000 TPM) but still tight

**The real fix:** For free tier, either:
- Use BYOK (bring your own key) for Claude/OpenAI
- Use OpenRouter with free model rotation
- Dramatically reduce the system prompt
- Upgrade Groq to Dev tier ($0.10/M tokens)

**Lesson:** "Free" has hidden limits. Always check rate limits AND token limits before building on a free API.

---

## Chapter 3: The Permission Gauntlet

### Bug #8: EACCES: permission denied

**What happened:**
```
[canvas] host failed to start: Error: EACCES: permission denied, mkdir '/home/node/.openclaw/canvas'
[cron] failed to start: Error: EACCES: permission denied, mkdir '/home/node/.openclaw/cron'
```

**Root cause:** Docker named volumes are created by root. The OpenClaw container runs as user `node` (uid 1000). User node can't write to root-owned directories.

**The fix:** Use bind mounts instead of named volumes, and set ownership:
```bash
mkdir -p /opt/data/user123
chown -R 1000:1000 /opt/data/user123
chmod 700 /opt/data/user123

docker run -v /opt/data/user123:/home/node/.openclaw ...
```

**Lesson:** Container permissions are a minefield. Always know what user your container runs as, and make sure volumes match.

---

## Chapter 4: The Complete Config (The Holy Grail)

After all the debugging, here's the config format that actually works:

```json
{
  "env": {
    "vars": {
      "ANTHROPIC_API_KEY": "sk-ant-..."
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-5"
      }
    }
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "123456:ABC-DEF...",
      "allowFrom": ["123456789"],
      "dmPolicy": "allowlist"
    }
  },
  "gateway": {
    "mode": "local",
    "port": 18789,
    "auth": {
      "mode": "token",
      "token": "random-secret-here"
    }
  },
  "plugins": {
    "entries": {
      "telegram": {
        "enabled": true
      }
    }
  }
}
```

**Key points:**
- `env.vars.ANTHROPIC_API_KEY` — NOT `providers.anthropic.apiKey`
- `channels.telegram.botToken` — NOT `token`
- `agents.defaults.model.primary` — Object with `primary` key, NOT string
- `gateway.mode: "local"` — Required!
- `gateway.auth` — Object with `mode` and `token`
- `plugins.entries.telegram.enabled: true` — In addition to `channels.telegram.enabled`

---

## Chapter 5: Docker Lessons

### Memory Matters

OpenClaw needs memory. The default Node.js heap is ~256MB. OpenClaw at rest uses ~300-400MB. You need:

```bash
docker run \
  --memory="1g" \
  -e NODE_OPTIONS="--max-old-space-size=768" \
  ...
```

Without `NODE_OPTIONS`, you get:
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

### Restart Policies

Use `--restart unless-stopped`. Not `always` (respects manual stops), not `on-failure` (doesn't survive reboots).

### Container Naming

We use `openclaw-{userId}` pattern. Makes it easy to:
- List all instances: `docker ps --filter "name=openclaw-"`
- Find specific user: `docker logs openclaw-abc123`

---

## Chapter 6: What Good Engineers Do

### 1. Read Error Messages Carefully

```
Invalid config: Unrecognized key: "token" in channels.telegram
```

This tells you EXACTLY what's wrong. The key `token` is unrecognized. Check what the correct key name is.

### 2. Isolate Variables

When something fails:
1. Is the config file being read at all?
2. Is the config format correct?
3. Is the config location correct?
4. Are permissions correct?

Test each independently.

### 3. Check Assumptions

We assumed:
- Config goes in `config/` subfolder → Wrong
- API keys go in `providers` block → Wrong
- `enabled: true` in one place is enough → Wrong

Assumptions kill debugging time.

### 4. Use the Actual Docs

OpenClaw has docs at docs.openclaw.ai. We should have read them first. Instead, we guessed the config format and spent hours fixing it.

### 5. Minimal Reproduction

When debugging, strip everything down to the minimum:
- Single config key at a time
- Smallest possible test case
- One change per attempt

---

## Chapter 7: The Technologies

### Why Caddy (Not Nginx)?

- **Automatic HTTPS:** Caddy gets Let's Encrypt certs automatically
- **Simple config:** No 50-line nginx.conf files
- **Hot reload:** Change config, reload without downtime
- **nip.io integration:** `user.1.2.3.4.nip.io` just works

### Why Vercel + GCP Split?

- **Vercel:** Free hosting for static/serverless frontend
- **GCP:** Docker container hosting (Vercel can't do this)
- **Cost:** Frontend = $0, Backend = $25-50/mo for many users

### Why Multi-tenant (Shared VM)?

- **Efficiency:** 1 VM serves many users ($0.50-1/user vs $5-6/user)
- **Simplicity:** One server to manage
- **Scaling:** Easy to add VMs later if needed

### Why nip.io for Domains?

- **Free:** No domain purchase needed for MVP
- **Instant:** No DNS propagation delay
- **Format:** `userid.34.131.95.162.nip.io` → Routes to IP

---

## Chapter 8: If I Did This Again

### 1. Read the docs FIRST

Before writing any config code, I would:
```bash
curl https://docs.openclaw.ai/gateway/configuration > config-docs.md
# Read the whole thing
```

### 2. Start with `openclaw doctor`

OpenClaw has a built-in doctor command:
```bash
npx openclaw doctor --fix
```

This validates config and fixes common issues. Use it.

### 3. Test config in isolation

Before containerizing:
```bash
# Test config locally first
OPENCLAW_CONFIG_PATH=/tmp/test.json npx openclaw gateway
```

### 4. Check rate limits before committing to a provider

Groq free tier's 12K TPM limit wasn't visible until we hit it. Check limits BEFORE building on any API.

### 5. Use bind mounts, not named volumes

Named volumes are convenient but opaque. Bind mounts let you:
- See files on the host
- Edit config without exec-ing into container
- Debug permissions easily

---

## The Final Architecture

```
Internet
    │
    ▼
┌────────────────────────────────────────────────┐
│  Vercel (vercel.app)                           │
│  - Landing page (Next.js)                      │
│  - Onboarding wizard                           │
│  - Dashboard                                   │
│  - API routes → proxy to GCP                   │
└────────────────────────────────────────────────┘
    │
    ▼ HTTPS
┌────────────────────────────────────────────────┐
│  GCP VM (34.131.95.162)                        │
│  ┌──────────────────────────────────────────┐  │
│  │  Caddy (port 80/443)                     │  │
│  │  - TLS termination                       │  │
│  │  - Route: user123.IP.nip.io → :18001     │  │
│  │  - Route: user456.IP.nip.io → :18002     │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │  Provisioning API (port 3000)            │  │
│  │  - /provision → create container         │  │
│  │  - /instances/:id → status/logs/control  │  │
│  └──────────────────────────────────────────┘  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │OpenClaw │ │OpenClaw │ │OpenClaw │          │
│  │:18001   │ │:18002   │ │:18003   │          │
│  │user123  │ │user456  │ │user789  │          │
│  └─────────┘ └─────────┘ └─────────┘          │
└────────────────────────────────────────────────┘
```

---

## TL;DR Checklist

Before deploying any OpenClaw instance:

- [ ] Config at `/home/node/.openclaw/openclaw.json` (root, not subfolder)
- [ ] API keys in `env.vars`, not `providers`
- [ ] `channels.telegram.botToken` (not `token`)
- [ ] `channels.telegram.enabled: true`
- [ ] `plugins.entries.telegram.enabled: true`
- [ ] `gateway.mode: "local"`
- [ ] `gateway.auth: { mode: "token", token: "..." }`
- [ ] Directory owned by uid 1000
- [ ] Directory chmod 700
- [ ] Container memory ≥ 1GB
- [ ] NODE_OPTIONS="--max-old-space-size=768"
- [ ] Model has sufficient rate limits for your plan

---

## Epilogue

**Time spent debugging:** ~3 hours

**Bugs found:** 8 major issues

**Lines of config that actually matter:** ~30

**Lessons learned:** Priceless

The best code is code you don't have to debug. The second best is code where you understand WHY it broke.

---

*"In theory, theory and practice are the same. In practice, they are not." — Every config file ever*
