# ClimateOS - Product & Implementation Guide

## 1) Vision

ClimateOS is a smart weather-and-forestry operations web app built on WeatherAI free endpoints.  
It helps a single platform owner (you) serve multiple farmers/users through one shared WeatherAI account and API key, while keeping usage safe and efficient.

Core workflow:

1. Observe weather and field conditions
2. Assess risk with rule-based intelligence
3. Recommend actions
4. Track outcomes over time

---

## 2) Plan Constraints and API Scope

## Free APIs Used

- Weather
  - `GET /v1/weather` (supports up to 7-day forecast on Free)
  - `GET /v1/forecast` (alias of `/v1/weather`)
  - `GET /v1/current`
  - `GET /v1/daily`
  - `GET /v1/hourly`
  - `GET /v1/weather-geo`
- Account
  - `GET /v1/usage`
- Trees & Forestry
  - `POST /v1/trees/analyze`
  - `GET /v1/trees/history`
  - `GET /v1/trees/quota`
  - `POST /v1/forestry/count-trees` (legacy alias; optional)

## APIs Excluded (Paid-only / out of scope for now)

- `GET /v1/forecast14`
- `GET /v1/insights`
- `GET /v1/ip-lookup`
- All Webhook APIs
- All SMS APIs

---

## 3) Product Goals

- Deliver a practical climate dashboard for daily decision-making.
- Provide useful smart insights without paid AI endpoints by using local scoring logic.
- Protect your single API key and quota while serving many app users.
- Provide visual forestry analytics using image analysis and trend history.

---

## 4) Why ClimateOS Needs a Backend

Even for a single-owner key, backend is strongly recommended.

- Key security: hide WeatherAI key from browser clients.
- Quota safety: apply rate limiting and caching.
- Shared access control: prevent one user from exhausting monthly requests.
- Data normalization: keep frontend clean and stable.
- Easy key rotation: update backend `.env` only.

Architecture:

- React frontend calls your backend only.
- Backend proxies approved WeatherAI endpoints.
- Backend injects `Authorization: Bearer wai_...`.

---

## 5) High-Level Architecture

## Frontend (React)

- Dashboard UI
- Location management
- Weather visualizations
- Tree analysis upload and history
- Quota and usage views

## Backend (Node.js + Express)

- API gateway to WeatherAI
- Request validation
- Caching layer (in-memory or Redis)
- Rate limiting (per user/IP/session)
- Logging and observability

## Storage (app-level)

- Small database for app users, locations, uploads metadata, preferences
- Optional object storage for retaining user-uploaded image references

---

## 6) Feature Set (Detailed)

## A. Location and Context

- Auto-detect location for first-time users via `weather-geo?ip=auto`.
- Add and manage multiple farm locations with `lat/lon`, custom name, crop type.
- Set preferred units (`metric`/`imperial`) and language for response text.

## B. Weather Intelligence (Free)

- Current weather cards from `/current`.
- Hourly trend chart from `/hourly`.
- Daily 7-day forecast board from `/daily` or `/weather?days=7`.
- Severe-condition highlights (heavy rain, high wind, heat/cold).

## C. Smart Rules (Frontend/Backend Logic)

Since paid AI insights are excluded, ClimateOS uses internal rule-based intelligence:

- Rain risk score
- Heat stress risk score
- Wind risk score
- Field work window suggestions (best times for field activity)
- Alert priority badges (Low/Medium/High)

## D. Forestry Analytics

- Image upload to `/trees/analyze`.
- Show returned metrics:
  - total tree count
  - density per acre (if land size provided)
  - canopy coverage
  - health distribution
  - confidence score
- Side-by-side image and overlay preview.
- Historical trend list/charts from `/trees/history`.
- Quota usage panel from `/trees/quota`.

## E. Usage Governance

- Monthly API usage from `/usage`.
- Remaining tree-analysis quota from `/trees/quota`.
- Smart throttling indicators in UI (for example, reduced refresh frequency when quota drops).

## F. Operational Quality

- Loading/error fallback states for each API card.
- Retry with exponential backoff for transient failures.
- Friendly error mapping (401/403/429/500/503).

---

## 7) Page-by-Page Information Architecture

## 1. Home / Overview Dashboard

Purpose: single-glance operational health.

Sections:

- Global weather summary for selected default location
- Risk summary cards (Rain/Heat/Wind)
- 7-day preview strip
- Usage meters (API + tree quota)
- Recent tree analyses snapshot

## 2. Locations Page

Purpose: manage all monitored places.

Features:

- Add/edit/delete locations
- Set default location
- Per-location quick weather card
- Location metadata (farm name, county, crop type)

## 3. Forecast Explorer

Purpose: deep weather analysis.

Features:

- Toggle between current/hourly/daily views
- 7-day trend chart
- Unit switch (`metric` / `imperial`)
- Optional compare mode between two locations

## 4. Smart Recommendations

Purpose: convert raw weather into action.

Features:

- Rule-based recommendations panel
- Time-window suggestions (best/avoid periods)
- Risk explanations ("why this score")
- Action checklist for next 24h and next 7 days

## 5. Tree Analysis Upload

Purpose: run new forestry analysis.

Features:

- Upload image (jpeg/png/webp, max 20MB)
- Optional context fields (farmerId, county, landAcres, location, notes)
- Structured output display
- Overlay visualization

## 6. Tree History & Trends

Purpose: track long-term vegetation health.

Features:

- Paginated list from `/trees/history`
- Filters by farmer/location/date
- Trend charts (count, canopy, healthy ratio)
- Highlight declines/regressions

## 7. Usage & Quota Page

Purpose: avoid exceeding limits.

Features:

- `/usage` data visualization
- `/trees/quota` visualization
- Remaining budget estimator
- Suggested request optimization tips

## 8. Settings

Purpose: platform-level configuration.

Features:

- Preferences: units, timezone, language
- Refresh strategy (normal/saving mode)
- Owner-only controls (key status indicator from backend health endpoint)

---

## 8) Smart Logic Blueprint

## Risk Scoring (example)

Define location/day risk score from normalized weather values:

- Rain contribution (precipitation probability + expected intensity)
- Wind contribution (peak gusts)
- Heat/cold contribution (temperature thresholds)

Output:

- score `0-100`
- level: `Low` (0-29), `Medium` (30-59), `High` (60-79), `Critical` (80-100)
- recommendation templates by level

## Recommendation Engine (rule-based)

Examples:

- If high rain risk in 24h, suggest drainage prep and input protection.
- If high wind risk, suggest support checks and postpone spray operations.
- If heat stress risk, suggest irrigation timing window and mid-day work avoidance.

## Tree-Weather Correlation Insight

For each location:

- Compare recent canopy/health changes against last 7-day weather profile.
- Flag likely stress periods with confidence labels ("possible", "likely").

---

## 9) Backend API Contract (Recommended)

Frontend should call these internal routes only:

- `GET /api/weather?lat=&lon=&days=7&units=&lang=&ai=false`
- `GET /api/current?lat=&lon=&units=&lang=&ai=false`
- `GET /api/hourly?lat=&lon=&units=&lang=&ai=false`
- `GET /api/daily?lat=&lon=&days=7&units=&lang=&ai=false`
- `GET /api/weather-geo?ip=auto&days=7&ai=false`
- `GET /api/usage`
- `POST /api/trees/analyze` (multipart)
- `GET /api/trees/history?limit=&cursor=`
- `GET /api/trees/quota`

Notes:

- Default `ai=false` to preserve AI quota.
- Enforce `days <= 7` on free plan.
- Validate lat/lon range before proxying.

---

## 10) Quota & Performance Strategy

## Cache Policy

- Current weather: 5-10 min
- Hourly/daily/7-day: 30-60 min
- Usage/quota: 2-5 min
- Tree history: 5-10 min per page cursor

## Refresh Policy

- Dashboard auto-refresh: every 10-15 min (not every few seconds)
- Manual refresh button with cooldown
- Background prefetch only for active locations

## Protection

- Rate limit by user/session/IP
- Request deduplication for same params within cache window
- 429 handling with UI notice + retry-after timer

---

## 11) Proposed Tech Stack

## Frontend

- React + TypeScript + Vite
- TanStack Query for server state
- Zustand (optional) for UI/local state
- React Router
- Recharts for charts
- Leaflet or Mapbox for maps
- React Hook Form + Zod for forms/validation

## Backend

- Node.js + Express + TypeScript
- Axios/fetch for upstream WeatherAI calls
- Multer for multipart upload relay
- express-rate-limit for abuse control
- Node cache or Redis
- Winston/Pino logging

---

## 12) Suggested Folder Structure

```text
climateos/
  frontend/
    src/
      app/
      pages/
      components/
      features/
        weather/
        trees/
        usage/
        locations/
      services/
      hooks/
      utils/
  backend/
    src/
      routes/
      controllers/
      services/
        weatherai/
      middleware/
      validators/
      cache/
      config/
      utils/
```

---

## 13) Implementation Plan (Step-by-Step)

## Phase 1 - Foundation

1. Initialize frontend and backend projects.
2. Add environment config and secure key storage in backend.
3. Implement backend health endpoint and WeatherAI proxy base service.
4. Build location management in frontend.

Deliverable: app boots, can query one weather endpoint through backend.

## Phase 2 - Core Weather Experience

1. Implement `/api/current`, `/api/hourly`, `/api/daily`, `/api/weather`.
2. Create dashboard cards and forecast charts.
3. Add unit toggle and 7-day forecast view.
4. Add caching and rate limit middleware.

Deliverable: complete weather dashboard with free-plan-safe behavior.

## Phase 3 - Smart Layer

1. Build risk scoring utility.
2. Build recommendations page using rule templates.
3. Add explanation tags for each recommendation.

Deliverable: actionable decision support without paid AI endpoint.

## Phase 4 - Tree Analytics

1. Implement multipart proxy for `/trees/analyze`.
2. Build upload UI and result visualization (metrics + overlay image).
3. Implement `/trees/history` and trend charts.
4. Implement `/trees/quota` card.

Deliverable: full forestry module with trends and quota awareness.

## Phase 5 - Usage Governance and Polish

1. Implement `/usage` page with meters.
2. Add global error handling and empty states.
3. Add optimization mode toggle (normal/saver).
4. Final QA and performance pass.

Deliverable: production-like experience with usage control.

---

## 14) Testing Guidance

## Unit Tests

- Risk scoring functions
- Recommendation rule mapping
- Request parameter validators

## Integration Tests

- Backend endpoint proxying and error mapping
- Multipart upload relay to `/trees/analyze`
- Cache behavior and rate limits

## E2E Tests

- Add location -> load weather -> view forecast
- Upload image -> view tree analysis result
- View usage/quota dashboards

---

## 15) Security and Reliability Checklist

- Keep API key only in backend environment variables.
- Never expose upstream Authorization header to client.
- Validate all user input before forwarding.
- Add CORS allowlist for your frontend origin.
- Implement request timeout and retry policy for upstream calls.
- Log upstream failures with correlation IDs.

---

## 16) MVP Success Criteria

- Users can manage multiple locations and view current/hourly/daily/7-day forecast.
- Users can upload field images and get tree analytics + overlay.
- Users can view tree history and quota.
- Users can monitor monthly API usage.
- App remains within free-plan limits under expected load.

---

## 17) Future Expansion (When Upgrading Plan)

When you move beyond free plan, ClimateOS can add:

- `/v1/insights` for native AI advisory
- Webhook automation builder
- SMS campaign and weather-triggered messaging
- 14-day+ forecasting and enterprise workflows

