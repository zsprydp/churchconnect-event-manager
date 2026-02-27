# ChurchConnect Event Manager — Product Roadmap

## Phase 1: Foundation — Real data, real money, real users ✅ COMPLETE
| # | Feature | Status |
|---|---|---|
| 1 | Backend + Auth + Roles (Supabase) | ✅ Done |
| 2 | Household / Family Profiles | ✅ Done |
| 3 | Donation & Ticketing (Stripe) | ✅ Done |

## Phase 2: Operational value + pastoral care ✅ COMPLETE
| # | Feature | Status |
|---|---|---|
| 4 | Volunteer Scheduling with Role Sign-ups | ✅ Done |
| 5 | Automated Guest & Member Workflows | ✅ Done |
| 6 | Smart Attendance Analytics + Care List | ✅ Done |

## Phase 3: Scale without chaos ✅ COMPLETE
| # | Feature | Status |
|---|---|---|
| 7 | Small Group / Ministry Hubs | ✅ Done |
| 8 | Room & Resource Booking | ✅ Done |

## Phase 4: Daily engagement beyond Sundays ← NEXT
| # | Feature | Status |
|---|---|---|
| 9 | Prayer Requests & Praise Board | 🔲 Not started |
| 10 | Media Library on Past Events | 🔲 Not started |

---

## Phase 1 — Detailed Design

### Feature 1: Backend + Auth + Roles

**Tech:** Supabase (Postgres + Auth + Realtime + Row Level Security)

**Data abstraction:** The app works in two modes:
- **Demo mode** (no Supabase configured): uses localStorage, no auth required
- **Connected mode** (Supabase env vars set): real database, auth enforced

**Roles:** admin, coordinator, volunteer, member

**Database tables:**
- `profiles` — user profiles linked to Supabase auth, includes role
- `events` — migrated from localStorage schema
- `volunteers` — migrated
- `attendees` — migrated
- `communications` — migrated
- `payments` — migrated
- `donations` — migrated

### Feature 2: Household / Family Profiles

**Tables:**
- `households` — id, name, address, primary_contact_id
- `household_members` — household_id, profile_id, relationship (head, spouse, child, other)

**UI:**
- Household management page under a new "Families" tab or within Attendees
- Create household, add/remove members
- Family check-in: one scan checks in all household members
- Registration forms auto-fill from household data

### Feature 3: Donation & Ticketing (Stripe)

**Integration:** Stripe Checkout (server-side via Supabase Edge Functions) or Stripe.js (client-side for simple flows)

**Features:**
- One-time donations with campaign selection
- Recurring giving (weekly/monthly tithes)
- Event ticket purchase during registration
- Giving history per household
- Annual giving statement PDF export
- Refund workflows for admins

**Tables:**
- `donations` — enhanced with stripe_payment_id, recurring flag, household_id
- `payments` — enhanced with stripe_session_id
- `giving_statements` — annual rollups per household
