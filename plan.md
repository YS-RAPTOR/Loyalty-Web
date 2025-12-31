# Loyalty Web App Plan

## Overview

Build a Next.js (App Router) application using **shadcn/ui** and **Tailwind CSS** with two “sides”:

- **Public user-facing**: phone-based registration (with OTP) + QR page.
- **Admin portal**: Clerk invite-only access (Restricted Mode + invitations) with RBAC, offers management, customer lookup/edit, order logging, QR scanning.

**Finalized stack**

- Framework: **Next.js App Router**
- UI: **Tailwind CSS + shadcn/ui**
- Backend/data: **Convex**
- Admin auth: **Clerk**
- Admin access policy: **invite-only via Clerk Restricted Mode + email invitations**
- Admin RBAC: **Clerk `publicMetadata.role` (basic RBAC)**
- SMS: **Twilio**
- Deployment: **Vercel**
- Primary region: **Australia only**

---

## Goals and Requirements

### User-facing

1. **Registration page**
   - Required: **phone number**, **first name**
   - Optional: **last name**, **email**
   - Must accept **Terms and Conditions** via checkbox with link to `/(public)/terms`
   - Requires **OTP verification** of phone before completing registration.
   - Duplicate behavior:
     - If phone already exists, show **"Already registered"** and do **not** offer a QR link on-screen.
   - On success:
     - Persist the customer
     - Send an SMS confirming enrollment + link to the website
     - Redirect to the QR page

2. **QR page**
   - Converts the user’s **raw customer ID** into a QR image
   - User can download the QR image
   - Supports search params (e.g. `?id=...`) so the QR can be generated via a link
   - Shared links should unfurl with **correct metadata** (OpenGraph/Twitter image should reflect the specific QR)

**Customer authentication**

- No customer login (no Clerk account for customers). Customers access QR via the `?id=` link.

### Admin portal (invite-only auth)

All admin pages are protected behind invite-only authentication.

**Roles**

- `admin`: offers + invites + everything
- `staff`: search, view customers, log qualifying orders
- `trusted_staff`: `staff` abilities + can edit customer fields + can resend qr link sms

Admin access is granted by having a Clerk account created via an **invitation** (Clerk Restricted Mode). Access to `/admin/*` routes is then gated by `publicMetadata.role`.

Admin pages:

1. **Admin page (admin role only)**
   - Create/edit offers
   - Discontinue offers
   - Manage invites and remove (uninvite) members
   - Access to restart discontinued offers

2. **Offer events page (admin role only)**
   - Shows a table of all offer events (audit log)
   - Table should “join”/denormalize related entities so it reads nicely:
     - customer (name, phone, email)
     - offer (name, rule/effect, color)
     - staff member who logged it (Clerk user)
   - Allows admin to delete an event when staff made a mistake
     - Deletion requires a confirmation modal where admin must re-type the **event id**

3. **Search page (staff)**
   - Search customer by first name, last name, email, or mobile phone

4. **Customer page (staff; editing requires trusted role)**
   - View customer profile
   - Edit customer profile only if staff role is `trusted_staff`
   - For every active offer:
     - Button to log that an order met offer conditions
     - After logging, redirect staff to a success page showing the created event id + updated progress
   - Utility actions:
     - **Resend customer QR link via SMS** (staff action; sends `/qr?id=<customerId>`; only for `trusted_staff`)

5. **QR scan page (staff)**
   - Opens camera
   - Scans customer QR
   - Navigates directly to customer page

---

## Offer Model and Behavior

### Offer types (business)

1. **Frequency**: every N qualifying purchases → percent off reward
   - Example: every 5 coffees → 50% off next coffee (100% == free coffee)
2. **Raffle**: each qualifying purchase adds one raffle entry
   - One-click logging (no order value entry in v1)

### Unified Offer configuration (Option 1)

Use a single Convex `offers` document shape with explicit **rule** and **effect**.

- `rule`
  - `{ kind: "frequency", requiredCount: number }` for frequency offers
  - `{ kind: "raffle" }` for raffle offers
- `effect`
  - `{ kind: "percent_off", percent: number }` for frequency rewards
  - `{ kind: "raffle_entry" }` for raffle offers

Notes:

- Frequency “free item” is modeled as `percent: 100`.
- Frequency logging is **always +1** per click.
- Raffle in v1 is **log-only** (no winner selection/export UI yet).

---

## Recommended Technical Architecture

### Routing

- Route groups for separation:
  - `app/(public)/...`
  - `app/(admin)/...`

### Convex

- Convex is the system of record for:
  - customers
  - offers
  - offer events (audit log)
- Use Convex queries/mutations for all data operations.

### Clerk (admin)

- Use **Clerk Restricted Mode** so sign-up is invite-only.
- Admin invites are sent via **Clerk email invitations**.
- Roles are managed using **Clerk `publicMetadata.role`** per Clerk’s basic RBAC guide.
- Configure session token claims to include user `publicMetadata` (so role checks don’t require extra network calls).

### Twilio

- Send SMS to AU phone numbers for:
  - OTP verification via **Twilio Verify**
  - post-registration “welcome” message
  - staff-initiated “resend QR link” from the customer page

---

## Routes / Pages

### Public user-facing

- `/(public)/register`
- `/(public)/qr?id=<customerId>`
- `/(public)/terms` (Terms and Conditions page)

### Admin portal
- `/(admin)/admin` (offers + invites; admin-only)
- `/(admin)/admin/offers/discontinued` (restart discontinued offers)
- `/(admin)/admin/events` (offer events audit log; admin-only)
- `/(admin)/admin/search` (staff)
- `/(admin)/admin/customers/[customerId]` (staff; edit gated by role)
- `/(admin)/admin/customers/[customerId]/offers/[offerId]/success?eventId=...` (post-log success)
- `/(admin)/admin/scan` (staff)


### Programmatic endpoints

- `GET /api/qr?id=...` → returns QR PNG
- `GET /api/og/qr?id=...` → returns OpenGraph image (QR image) for link unfurls

---

## Metadata / Link Unfurl Plan (QR must match the ID)

### Requirement

When someone shares `https://site.com/qr?id=<id>`, the preview image should be the QR for that customer.

### Approach

- In `app/(public)/qr/page.tsx`, implement `generateMetadata({ searchParams })`.
- Set:
  - `openGraph.images = [ { url: "/api/og/qr?id=..." } ]`
  - `twitter.card = "summary_large_image"`
- Serve QR images from the server:
  - UI renders `<img src="/api/qr?id=..." />`
  - Download uses same URL

This ensures crawlers can fetch the per-customer QR image.

---

## Convex Data Model (MVP)

### Customers

- `customers`
  - `_id` (Convex ID)
  - `phoneE164` (unique)
  - `firstName`
  - `lastName?`
  - `email?`
  - `createdAt`
  - `updatedAt`

### Offers

- `offers`
  - `_id`
  - `name`
  - `color` (used for UI button styling)
  - `status`: `active | discontinued`
  - `rule`: `{ kind: "frequency", requiredCount } | { kind: "raffle" }`
  - `effect`: `{ kind: "percent_off", percent } | { kind: "raffle_entry" }`
  - `createdAt`
  - `updatedAt`
  - `discontinuedAt?`

### Offer event log (source of truth)

- `offerEvents`
  - `_id`
  - `customerId`
  - `offerId`
  - `type`: `QUALIFY`
  - `createdByClerkUserId`
  - `createdAt`

Derivations:
- Frequency progress = count of `QUALIFY` events for offer/customer
- Frequency requirement met when `progress % requiredCount == 0` (and progress > 0)
- Raffle entries = count of `QUALIFY` events for offer/customer

### Staff metadata

Staff roles live in Clerk user `publicMetadata.role` (source of truth).

Convex stores only app-domain data (customers/offers/events). If needed, optionally maintain a `staffProfiles` table in Convex for display preferences or denormalized fields, but not for authorization.

---

## Page Details (MVP)

### Public Registration

- Step 1: enter phone + name info
  - Must check "I accept the Terms and Conditions" checkbox (links to `/terms`)
  - Duplicate phone:
    - Show "Already registered" and end flow
- Step 2: OTP verification via **Twilio Verify** (send code → user enters code)
- On success:
  - Create customer record in Convex
  - Send welcome SMS via Twilio containing `/qr?id=<customerId>`
  - Redirect user to `/qr?id=<customerId>`

### Terms and Conditions Page

- Static page at `/(public)/terms`
- Contains the terms and conditions text
- Linked from registration checkbox

### QR Page

- Reads `searchParams.id`
- Renders server-generated QR image
- Download button downloads PNG

### Admin: Offers + Invites (admin only)

- Offers table:
  - Create offer (choose rule + effect + color)
  - Edit offer (including color)
  - Discontinue offer
- Discontinued offers page:
  - List discontinued offers
  - Restart offer (status back to active)
- Invites:
  - Use **Clerk Restricted Mode** + **Clerk email invitations** (invite-only staff onboarding)
  - Admin UI triggers invite creation; invited user completes Clerk sign-up via invite link
  - Admin assigns role by updating invited user’s `publicMetadata.role`

### Admin: Search (staff)

- Search input
- Query by:
  - firstName, lastName, email, phone
- Results list links to customer page

### Admin: Offer Events (admin only)
- Table of all offer events (audit log)
- Display joined/denormalized info:
  - timestamp
  - customer name + phone (+ email if present)
  - offer name + rule/effect + color
  - staff member (Clerk user) who logged it
- Admin can delete an event if logged by mistake
  - Confirm deletion via modal requiring admin to re-type the **event id**

### Admin: Customer Page

- Customer detail + editable fields:
  - Disabled unless role is `trusted_staff`
- Active offers list:
  - Frequency offers → “Log qualifying purchase” (always +1)
  - Raffle offers → “Log qualifying order” (one click)
  - After any log action, redirect to a success page showing:
    - the created offer event id
    - updated progress for that offer/customer
    - whether the customer’s requirement was met (e.g. frequency threshold reached)
- Actions:
  - “Resend QR link via SMS” (Twilio; only for `trusted_staff`)

### Admin: Scan Page (staff)

- Camera scanner client component
- On scan:
  - QR encodes customer ID → go to `/admin/customers/<id>`

---

## Security / Compliance Checklist

- Admin routes require Clerk auth + invite-only access (Restricted Mode)
- Authorization checks by role (`publicMetadata.role`):
  - `admin`: offers + invites
  - `trusted_staff`: can edit customers
  - `staff`: can search/view/log
- Rate limiting on:
  - registration OTP send/verify
  - registration customer creation
  - admin mutations
- Always validate server-side

---

## Phased Delivery Plan

### Phase 0 — Foundations

- Set up Convex
- Set up Clerk:
  - Enable **Restricted Mode** (invite-only)
  - Set up **email invitations** for staff onboarding
  - Configure **basic RBAC** with `publicMetadata.role` and add `publicMetadata` to session claims
- Set up Twilio (AU) and **Twilio Verify** OTP flow
- Deploy baseline to Vercel

### Phase 1 — User MVP

- Registration page with OTP flow
- Welcome SMS with QR link
- QR page with `?id=` support
- QR PNG endpoint + OG image endpoint

### Phase 2 — Admin MVP
- Admin offers create/edit/discontinue/restart (includes offer `color` field)
- Clerk Restricted Mode invitations workflow
- Staff search page
- Customer page + offer logging
- Post-log success page
- Offer events audit-log page + delete-with-id-confirmation
- “Resend QR link” action


### Phase 3 — Scan + Hardening

- QR scan page
- Improve mobile UX
- Monitoring/logging
- Tighten rate limits

### Phase 4 — Enhancements

- Raffle winner selection/export (if needed)
- Reward redemption flows (if needed)
- Bulk import customers (if needed)
