# Security notes (LM19)

Quick reference for the LM19 security session.

## What's safe

- **All data in this repo is synthetic.** Project names, risk descriptions, and historical outcomes are illustrative. No real IESL customer data is committed.
- **API key is server-side only.** Each app proxies Claude calls through Next.js API routes under `app/api/*`. The key lives in `.env.local` and is never imported into a client component.
- **No third-party analytics.** No telemetry, no cookies beyond the mode toggle in localStorage.

## Quick checks you can demonstrate live

```bash
# 1. Confirm no API key leaked into the client bundle
grep -r "sk-ant" .next/static/ || echo "Clean"

# 2. Confirm no real-sounding PII or customer data
grep -riE "passport|dob|\\bssn\\b|\\bnin\\b|account.*number" packages/ apps/ || echo "Clean"

# 3. Confirm prompts include cache_control for determinism on demo loops
grep -n "cache_control" packages/ai/src/client.ts
```

## PII posture for the live workshop

If an attendee pastes their real scope into AI Mode, that scope is sent to the Anthropic API for processing. **Avoid pasting anything classified, export-controlled, or containing customer PII** during the hands-on labs. The take-home HTML export is fully self-contained — no network calls.
