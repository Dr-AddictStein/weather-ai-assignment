# WeatherAI API — Complete Documentation

## Overview

- **Base URL:** `https://api.weather-ai.co`
- **API Version:** v1
- **AI Engine:** Gemini AI (summaries & insights)
- **CV Engine:** OpenCV (tree analysis)
- **Payments:** Paystack
- **SMS Gateway:** Africa's Talking (with fallback)
- **Storage:** Firebase Storage

---

## Authentication

Every request must include your API key as a Bearer token. Keys are prefixed `wai_`.

```
Authorization: Bearer wai_<your_api_key>
```

- Keys are **SHA-256 hashed** before storage — plaintext is shown only once on creation.
- Generate keys from **Dashboard → API Keys**.

### Example (cURL)

```bash
curl https://api.weather-ai.co/v1/weather?lat=-1.2921&lon=36.8219 \
  -H "Authorization: Bearer wai_your_key_here"
```

### Example (JavaScript)

```javascript
const res = await fetch(
  'https://api.weather-ai.co/v1/weather?lat=-1.2921&lon=36.8219',
  { headers: { Authorization: 'Bearer wai_your_key_here' } }
);
const data = await res.json();
```

---

## Plans & Rate Limits

> Limits reset on a **30-day rolling period** from subscription date — not calendar month.

| Plan  | Requests/mo | AI Requests/mo | Forecast Days | Webhooks      | SMS/USSD           | Team Seats |
|-------|-------------|----------------|---------------|---------------|--------------------|------------|
| Free  | 1,000       | 200            | 7             | ✕             | ✕                  | 1          |
| Pro   | 50,000      | 10,000         | 14            | ✓ up to 10    | ✕                  | 5          |
| Scale | 500,000     | 100,000        | 16            | ✓ up to 50    | ✓ (approval req.)  | 20         |

> **Tip:** Add `?ai=false` to any request to skip Gemini AI summaries and preserve your AI quota.

### Rate Limit Response Headers

| Header                  | Description               |
|-------------------------|---------------------------|
| `X-RateLimit-Limit`     | Monthly cap               |
| `X-RateLimit-Remaining` | Requests remaining        |
| `X-RateLimit-Reset`     | Unix epoch reset time     |

---

## Error Codes

| Status | Meaning             | Common Cause                                            |
|--------|---------------------|---------------------------------------------------------|
| 400    | Bad Request         | Missing required parameters                             |
| 401    | Unauthorized        | Missing, malformed, or revoked API key                  |
| 403    | Forbidden           | Plan doesn't include this feature; SMS not yet enabled  |
| 429    | Too Many Requests   | Monthly quota exceeded — check `X-RateLimit-Reset`      |
| 500    | Internal Error      | Server-side issue — retry with exponential backoff      |
| 503    | Service Unavailable | Database unreachable — fail-closed for SMS gates        |

---

## Weather Endpoints

All weather endpoints accept these common parameters unless stated otherwise:

| Param   | Type    | Required | Description                                                      |
|---------|---------|----------|------------------------------------------------------------------|
| `lat`   | float   | Yes      | Latitude (e.g. `-1.2921`)                                        |
| `lon`   | float   | Yes      | Longitude (e.g. `36.8219`)                                       |
| `days`  | integer | No       | Forecast days (1–7 Free, 1–14 Pro, 1–16 Scale). Default: 7      |
| `ai`    | boolean | No       | Include Gemini AI summary. Default: `true`                       |
| `units` | string  | No       | `metric` (°C) or `imperial` (°F). Default: `metric`             |
| `lang`  | string  | No       | Language code for AI summary (e.g. `en`, `sw`). Default: `en`   |

---

### GET /v1/weather — All Plans

Current conditions + forecast.

```bash
curl "https://api.weather-ai.co/v1/weather?lat=-1.2921&lon=36.8219&days=7" \
  -H "Authorization: Bearer wai_your_key"
```

---

### GET /v1/forecast — All Plans

Convenience alias for `/v1/weather`. Accepts identical parameters, returns the same response shape.

---

### GET /v1/current — All Plans

Returns present-moment weather conditions only. Accepts same parameters as `/v1/weather` (minus `days`).

| Param   | Type    | Required | Description                             |
|---------|---------|----------|-----------------------------------------|
| `lat`   | float   | Yes      | Latitude                                |
| `lon`   | float   | Yes      | Longitude                               |
| `ai`    | boolean | No       | Include AI summary. Default: `true`     |
| `units` | string  | No       | `metric` or `imperial`. Default: metric |
| `lang`  | string  | No       | Language code. Default: `en`            |

---

### GET /v1/daily — All Plans

Day-by-day forecast breakdown. Delegates to the same handler as `/v1/weather`.

---

### GET /v1/hourly — All Plans

Hour-by-hour forecast breakdown. Delegates to the same handler as `/v1/weather`.

---

### GET /v1/forecast14 — Pro+ Only

Extended 14-day forecast (up to 16 days on Scale). Free-plan keys receive `403`.

| Param   | Type    | Required | Description                                              |
|---------|---------|----------|----------------------------------------------------------|
| `lat`   | float   | Yes      | Latitude                                                 |
| `lon`   | float   | Yes      | Longitude                                                |
| `days`  | integer | No       | Up to 14 (Pro) or 16 (Scale). Default: 14                |
| `ai`    | boolean | No       | Include AI summary. Default: `true`                      |
| `units` | string  | No       | `metric` or `imperial`. Default: `metric`                |
| `lang`  | string  | No       | Language code. Default: `en`                             |

---

### GET /v1/insights — Pro+ Only

AI-powered weather insights. Returns weather data with enhanced Gemini AI analysis including agronomic context, risk flags, and actionable recommendations. AI is always enabled on this endpoint.

| Param   | Type    | Required | Description                              |
|---------|---------|----------|------------------------------------------|
| `lat`   | float   | Yes      | Latitude                                 |
| `lon`   | float   | Yes      | Longitude                                |
| `days`  | integer | No       | Forecast days (plan-limited). Default: 7 |
| `units` | string  | No       | `metric` or `imperial`. Default: metric  |
| `lang`  | string  | No       | Language code. Default: `en`             |

---

### GET /v1/weather-geo — All Plans

Weather + IP geo-detection. Auto-detects caller location from IP when `?ip=auto`.

| Param   | Type    | Required | Description                                                 |
|---------|---------|----------|-------------------------------------------------------------|
| `ip`    | string  | No       | Pass `auto` to detect from request IP, or an explicit IP    |
| `lat`   | float   | No       | Override detected latitude                                  |
| `lon`   | float   | No       | Override detected longitude                                 |
| `days`  | integer | No       | Forecast days (plan-limited)                                |
| `ai`    | boolean | No       | Include AI summary. Default: `true`                         |

#### Response Headers

```
X-Country: KE
X-Region:  Nairobi County
X-City:    Nairobi
```

---

### GET /v1/ip-lookup — Pro+ Only

Resolves an IP address to latitude, longitude, city, region, country, and timezone.

| Param | Type   | Required | Description                                                           |
|-------|--------|----------|-----------------------------------------------------------------------|
| `ip`  | string | No       | IP to resolve. Pass `auto` (default) to detect from request, or explicit IPv4/IPv6 |

#### Example Response

```json
{
  "ip":         "41.90.64.1",
  "ip_hash":    "a3f1...",
  "ip_version": "v4",
  "geo": {
    "lat":      -1.2921,
    "lon":      36.8219,
    "city":     "Nairobi",
    "region":   "Nairobi County",
    "country":  "KE",
    "timezone": "Africa/Nairobi"
  }
}
```

---

## Account

### GET /v1/usage — All Plans

Returns request counts, AI request counts, plan limits, and billing period start/end. No query parameters required.

---

## Webhooks — Pro+ Only

Subscribe to weather trigger events. WeatherAI POSTs to your URL when conditions are met.

- **Pro:** up to 10 webhooks
- **Scale:** up to 50 webhooks

---

### POST /v1/webhooks — Create a Subscription

| Field      | Type     | Required | Description                              |
|------------|----------|----------|------------------------------------------|
| `url`      | string   | Yes      | HTTPS endpoint to receive POST payloads  |
| `lat`      | float    | Yes      | Latitude of location to monitor          |
| `lon`      | float    | Yes      | Longitude of location to monitor         |
| `triggers` | string[] | Yes      | e.g. `["rain","extreme_wind","frost"]`   |
| `timezone` | string   | No       | IANA timezone. Default: UTC              |

#### Example

```bash
curl -X POST https://api.weather-ai.co/v1/webhooks \
  -H "Authorization: Bearer wai_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "url":      "https://yourapp.com/weather-hook",
    "lat":      -1.2921,
    "lon":      36.8219,
    "triggers": ["rain", "extreme_wind"],
    "timezone": "Africa/Nairobi"
  }'
```

---

### GET /v1/webhooks — List Subscriptions

Returns all active webhook subscriptions for your account.

#### Example Response

```json
{
  "webhooks": [
    {
      "id":        "abc123",
      "url":       "https://yourapp.com/hook",
      "lat":       -1.2921,
      "lon":       36.8219,
      "triggers":  ["rain"],
      "timezone":  "Africa/Nairobi",
      "active":    true,
      "createdAt": "2024-11-01T10:00:00Z"
    }
  ]
}
```

---

### DELETE /v1/webhooks/:id — Delete a Webhook

Permanently deletes a webhook. Returns `404` if not found or owned by another account.

```bash
curl -X DELETE https://api.weather-ai.co/v1/webhooks/abc123 \
  -H "Authorization: Bearer wai_your_key"
```

---

## SMS / USSD API — Scale Only

Programmatic SMS delivery and farmer registration.

> **Requirements:** Scale plan + `smsEnabled = true` on your account (set by admin after compliance review). Submit documents via Billing panel → Request SMS Access. Until approved, calls return `403 SMS_NOT_ENABLED`.

---

### POST /v1/sms/send — Send an SMS

| Field      | Type   | Required | Description                                          |
|------------|--------|----------|------------------------------------------------------|
| `to`       | string | Yes      | Recipient phone in E.164 format (e.g. `+254712345678`) |
| `message`  | string | Yes      | SMS body text (max 160 chars per segment)            |
| `type`     | string | No       | Type tag for analytics. Default: `general`           |
| `pilotTag` | string | No       | Pilot programme identifier for grouping in SMS stats |

#### Example

```bash
curl -X POST https://api.weather-ai.co/v1/sms/send \
  -H "Authorization: Bearer wai_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "to":      "+254712345678",
    "message": "Heavy rain expected tomorrow. Plan ahead.",
    "type":    "weather_alert"
  }'
```

---

### POST /v1/sms/alert — Send a Structured Alert

Sends a formatted weather alert using a predefined template.

| Field       | Type   | Required | Description                                                     |
|-------------|--------|----------|-----------------------------------------------------------------|
| `to`        | string | Yes      | Recipient phone in E.164                                        |
| `alertType` | string | Yes      | `rain` · `frost` · `extreme_wind` · `drought`                   |
| `data`      | object | No       | Context merged into template (e.g. `{"mm":45,"day":"tomorrow"}`) |

---

### POST /v1/sms/bomet/register — Register a Bomet Farmer

Registers a farmer in the Bomet Agricultural Alert System. Creates a profile and schedules daily weather SMS alerts.

| Field      | Type   | Required | Description                        |
|------------|--------|----------|------------------------------------|
| `phone`    | string | Yes      | Farmer's phone (E.164)             |
| `name`     | string | Yes      | Full name                          |
| `location` | string | No       | Village/ward (e.g. `Bomet Central`) |
| `cropType` | string | No       | Primary crop (e.g. `maize`, `tea`) |

---

### GET /v1/sms/stats — SMS Usage Statistics

Returns delivery stats, message counts by type, gateway usage, and opt-out rates. No parameters.

---

### GET /v1/sms/health — SMS Gateway Health Check

Connectivity status for the SMS gateway and Africa's Talking fallback.

#### Example Response

```json
{
  "gateway":   "ok",
  "fallback":  "ok",
  "lastCheck": "2025-05-20T07:58:00Z",
  "latencyMs": 142
}
```

---

## Trees & Forestry API — All Plans

Upload drone, aerial, or satellite images to count tree crowns, assess canopy health, and get agronomic recommendations — powered by OpenCV + Gemini AI.

| Plan  | Analyses/Month |
|-------|----------------|
| Free  | 5              |
| Pro   | 100            |
| Scale | Unlimited      |

All plans include: CV engine, overlay image, and Gemini context.

---

### POST /v1/trees/analyze — Analyze Image

Upload a farm image as `multipart/form-data`.

| Field       | Type   | Required | Description                                                     |
|-------------|--------|----------|-----------------------------------------------------------------|
| `image`     | file   | Yes      | JPEG, PNG, or WEBP — max 20 MB                                  |
| `farmerId`  | string | No       | Your farmer/plot identifier — echoed in response                |
| `county`    | string | No       | County or region — provides context for Gemini                  |
| `landAcres` | float  | No       | Plot size in acres — enables `tree_density_per_acre`            |
| `location`  | string | No       | Human-readable farm name or GPS description                     |
| `notes`     | string | No       | Extra context for Gemini (e.g. "Tea plantation, recently pruned") |

#### Example

```bash
curl -X POST https://api.weather-ai.co/v1/trees/analyze \
  -H "Authorization: Bearer wai_your_key" \
  -F "image=@/path/to/farm.jpg" \
  -F "farmerId=F-001" \
  -F "county=Bomet" \
  -F "landAcres=2.5" \
  -F "notes=Tea plantation"
```

#### Example Response

```json
{
  "analysis_id":           "Kx8mP2qRvTnZ",
  "timestamp":             "2026-06-01T09:15:00.000Z",
  "farmer_id":             "F-001",
  "county":                "Bomet",
  "location":              "Kapkimolwa Farm, Block C",
  "land_acres":            2.5,
  "total_tree_count":      84,
  "tree_density_per_acre": 33.6,
  "confidence_score":      0.87,
  "canopy_coverage_pct":   41.2,
  "tree_health": {
    "healthy":          68,
    "needs_care":       12,
    "needs_replacement": 4
  },
  "low_confidence":        false,
  "tree_species_guess":    "Tea (Camellia sinensis)",
  "observations": [
    "Dense canopy in northern quadrant — possible over-crowding",
    "3 trees near water source show yellowing — likely waterlogging"
  ],
  "recommendations": [
    "Consider thinning northern section to improve light penetration",
    "Improve drainage around water source trees"
  ],
  "original_image_url":    "https://storage.googleapis.com/.../original.jpg",
  "overlay_image_url":     "https://storage.googleapis.com/.../overlay.jpg",
  "cv_debug": {
    "orig_resolution":   "4000x3000",
    "work_resolution":   "1500x1125",
    "canopy_px":         412500,
    "peaks_detected":    91,
    "after_area_filter": 84
  }
}
```

---

### GET /v1/trees/history — List Past Analyses

Returns a paginated list of past tree analyses, ordered newest first.

| Param    | Type    | Required | Description                                            |
|----------|---------|----------|--------------------------------------------------------|
| `limit`  | integer | No       | Results per page (default 20, max 100)                 |
| `cursor` | string  | No       | Pagination cursor from previous response `next_cursor` |

---

### GET /v1/trees/quota — Remaining Quota

Returns how many tree analyses you have used and remaining for the current calendar month.

#### Example Response

```json
{
  "plan":      "pro",
  "used":      12,
  "limit":     100,
  "remaining": 88,
  "unlimited": false,
  "resets_at": "2026-07-01T00:00:00.000Z"
}
```

---

### POST /v1/forestry/count-trees — Legacy Alias

Convenience alias for `/v1/trees/analyze`. Accepts the same multipart fields and returns the identical response shape.

---

## Billing — Firebase Callable Functions

> These are Firebase HTTPS callable functions, **not plain REST**. Call via Firebase JS SDK: `httpsCallable(functions, 'functionName')(payload)`. They enforce Firebase Auth internally — no API key needed, but the user must be signed in (except `contactSales`).

---

### FN: cancelSubscription — Pro / Scale

Cancels the caller's Paystack subscription at period end (non-immediate). Verifies subscription ownership before disabling. No payload required.

#### Response

| Field       | Type           | Description                   |
|-------------|----------------|-------------------------------|
| `success`   | boolean        | Always `true` on success      |
| `message`   | string         | Human-readable confirmation   |
| `periodEnd` | string \| null | ISO date when access expires  |

#### Error Codes

| Code                  | Cause                                                  |
|-----------------------|--------------------------------------------------------|
| `unauthenticated`     | User not signed in                                     |
| `failed-precondition` | No active subscription (already free)                  |
| `permission-denied`   | Subscription doesn't match authenticated user's email  |
| `internal`            | Paystack API error — retry                             |

#### Example (Firebase SDK)

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const cancel = httpsCallable(functions, 'cancelSubscription');

const result = await cancel();
// result.data = { success: true, message: "...", periodEnd: "2025-06-15" }
```

---

### FN: requestSmsAccess — Scale Only

Submits an SMS/USSD access request for admin compliance review. One pending request per user. Upload documents to Firebase Storage **before** calling.

| Field                  | Type   | Required | Description                                               |
|------------------------|--------|----------|-----------------------------------------------------------|
| `businessName`         | string | Yes      | Legal/trading name of the business                        |
| `contactName`          | string | Yes      | Contact person full name                                  |
| `contactEmail`         | string | Yes      | Contact email address                                     |
| `contactPhone`         | string | No       | Kenyan phone number for follow-up                         |
| `useCase`              | string | Yes      | Description of SMS/USSD usage                             |
| `estimatedVolume`      | string | No       | Estimated monthly SMS volume                              |
| `docBusinessReg`       | string | Yes      | Firebase Storage URL — business registration certificate  |
| `docKraPinCert`        | string | Yes      | Firebase Storage URL — KRA PIN certificate                |
| `docDirectorId`        | string | Yes      | Firebase Storage URL — director's national ID/passport    |
| `optInFlowDescription` | string | Yes      | Written description of end-user opt-in mechanism          |

#### Response Statuses

| Status            | Meaning                                        |
|-------------------|------------------------------------------------|
| `submitted`       | Request created, team notified via email       |
| `already_pending` | Existing pending request found — deduplicated  |
| `already_enabled` | SMS is already active on the account           |

---

### FN: contactSales — All Plans

Sends a sales/enterprise enquiry to `support@weather-ai.co` via Resend. Unauthenticated calls permitted.

| Field         | Type   | Required | Description                                                               |
|---------------|--------|----------|---------------------------------------------------------------------------|
| `name`        | string | Yes      | Contact person name                                                       |
| `email`       | string | Yes      | Contact email                                                             |
| `company`     | string | No       | Company name                                                              |
| `message`     | string | No       | Free-form message                                                         |
| `type`        | string | No       | `sales` (pricing page) or `custom` (billing panel upgrade). Default: `sales` |
| `currentPlan` | string | No       | Caller's current plan. Default: `free`                                    |

---

### FN: getPaystackConfig — All Plans

Returns the Paystack public key and plan pricing for frontend widget initialization. The secret key is **never** returned.

#### Response

```json
{
  "public_key": "pk_live_...",
  "plans": {
    "pro":   { "kes": 2500, "usd": 19, "name": "Pro" },
    "scale": { "kes": 9500, "usd": 79, "name": "Scale" }
  }
}
```

---

## Pricing Summary

| Plan  | USD/mo | KES/mo  |
|-------|--------|---------|
| Free  | $0     | KES 0   |
| Pro   | $19    | KES 2,500 |
| Scale | $79    | KES 9,500 |
