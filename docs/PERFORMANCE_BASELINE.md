# Browser performance evidence for #328

This measurement workflow is **manual and opt-in**. It runs against real prerendered Pages output and does **not** assert that source code changes alone improved Web Vitals.

## Reproduce on a local generated site

```bash
npm ci
npm run generate:site
npx playwright install chromium
node tests/browser/serve.mjs   # separate terminal, serves .output/public at 127.0.0.1:3000
npm run perf:measure
```

The report is written to `reports/client-performance-observed.json`. Default idle sampling is **300,000 ms (5 minutes) on the home route only**. To smoke-test quickly, set `PERF_IDLE_MS=5000`. `PERF_BASE_URL` can point to a controlled origin for staging/production comparisons. Run the same browser, viewport, network profile, and warm/cold cache conditions before comparing.

The report includes observed LCP, CLS, long-task counts/duration, DOMContentLoaded, resource bytes, unexpected search-index requests and runtime errors across four representative routes. **Do not interpret long-task duration as a CPU or battery benchmark**. INP requires real input interactions and should be measured separately; this script intentionally does not invent it.

## Closure evidence still required

- Capture before/after on the same release conditions (desktop and 320–430px mobile, warm/cold).
- Use DevTools/Lighthouse field-style traces for INP, parsed JavaScript, memory and idle CPU/battery; include actual methods, device and results.
- Verify no search index fetch before search intent and preserve actual search behavior after a user opens it.
- Run Playwright smoke/audio controls and actual iOS/Safari playback as applicable, without claiming simulated audio is audible.
- Keep production SEO, main/staging route behavior and local privacy unchanged.

Do not close #328 just because this script exists. Attach the measured output and comparison to the issue, then decide whether each acceptance criterion is met.
