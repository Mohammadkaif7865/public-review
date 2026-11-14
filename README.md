# Public Review

> Real people. Honest opinions. Better decisions.

Public Review is a proposed trust-first discovery and review platform for brands, organisations, individual business locations, products, product variants, menu items, services, and provider-specific service offerings. Its defining rule is simple: every review must belong to one exact entity, while any parent or related aggregate is calculated and displayed separately.

This repository currently contains product, architecture, technical, and UI/UX specifications. It does **not** yet contain the production application. The documents describe a proposed baseline that must be confirmed through an audit of the existing Public Review website, a data-source rights review, and product-owner approval.

## Framework status

An initial Next.js modular-monolith foundation is now available:

- `apps/web/app` — pages, layouts, and versioned API Route Handlers;
- `apps/web/domain` — framework-independent entity and review rules;
- `apps/web/db` — Drizzle ORM schema and PostgreSQL client foundation;
- `.env.example` — local and managed PostgreSQL configuration contract; and
- `docs` — product, technical, and UI/UX source documents.

The application currently provides a responsive foundation page, a Next.js health endpoint, validated review-submission primitives, and the first entity/relationship database schema. Search, authentication, persistent reviews, claims, moderation, ingestion, and rating calculations remain intentionally unimplemented until the existing-platform audit and product decisions are complete.

### Local development

Prerequisite: Node.js 20.9 or newer. Docker and Python are not required.

```bash
# PowerShell: copy the environment template
Copy-Item .env.example .env

# Install and run the complete application
npm install
npm run dev
```

Open the application at `http://localhost:3000` and its health endpoint at `http://localhost:3000/api/v1/health`. The current pages and health route run without a database. Configure `DATABASE_URL` when persistence-backed features are introduced.

After configuring a Supabase pooled `DATABASE_URL`, apply committed migrations with:

```powershell
npm.cmd run db:migrate --workspace=@public-review/web
```

The Next.js runtime uses Supabase transaction pooling on port `6543`. The migration runner automatically switches the same connection to session pooling on port `5432`, which provides the session semantics required by schema migrations.

## Contents

- [Business problem](#business-problem)
- [Product vision](#product-vision)
- [Core principles](#core-principles)
- [Reviewable entities](#reviewable-entities)
- [Primary user journeys](#primary-user-journeys)
- [Rating model](#rating-model)
- [System architecture](#system-architecture)
- [Discovery and data governance](#discovery-and-data-governance)
- [Recommended MVP](#recommended-mvp)
- [Delivery plan](#delivery-plan)
- [Definition of done](#definition-of-done)
- [Open decisions](#open-decisions)
- [Project documents](#project-documents)

## Business problem

Existing review platforms often mix together reviews for a brand, a particular branch, a product, a variant, a seller, or a menu item. This makes ratings difficult to interpret and can lead users to make decisions using feedback that does not apply to the exact thing they are considering.

Public Review is intended to solve this by:

- attaching every review to a stable, exact entity ID;
- separating direct ratings from parent or related aggregates;
- showing useful identity and location context in search results;
- recording where published facts came from and whether they may legally be used;
- giving businesses a controlled way to claim profiles, correct facts, and respond;
- applying the same moderation policy to positive and negative reviews; and
- making profile changes, merges, moderation actions, and claims auditable.

## Product vision

The platform should help consumers discover and evaluate real-world entities using authentic, first-hand experiences. It should provide accurate public profiles, support fair business participation without selling reputation, and operate as a reusable multi-city system rather than a one-time business-directory import.

The initial geographic focus is a controlled Mumbai pilot. Expansion to other cities should primarily require new configuration for boundaries, categories, approved sources, schedules, and publishing rules—not a separate codebase.

## Core principles

1. **Exact review target:** A review is stored against one exact entity and entity type.
2. **Separate metrics:** Direct ratings and related-entity aggregates are never silently blended.
3. **Evidence over invention:** Unknown data remains unknown; AI must not fabricate facts.
4. **Field-level provenance:** Published fields retain their source, retrieval date, rights status, and review state.
5. **Neutral moderation:** Businesses cannot pay for ratings or directly remove legitimate negative reviews.
6. **Privacy by design:** Public anonymity may be supported, but private verification data remains protected.
7. **Reversible operations:** Merges and material decisions must retain history and support correction or reversal.
8. **Configurable growth:** New cities and categories should be introduced through configuration where possible.

## Reviewable entities

| Entity | Example | Identity boundary |
| --- | --- | --- |
| Brand | Apple or Domino's | Brand-level identity, not a store |
| Business / organisation | Clinic group or operating company | Organisation-level identity |
| Business location | Domino's Borivali | One physical branch or address |
| Product | iPhone 17 Pro | Canonical product across sellers |
| Product variant | iPhone 17 Pro, 256 GB | A meaningful product configuration |
| Menu item | Margherita Pizza at one outlet | Normally tied to a specific outlet |
| Service | Home delivery or hair colouring | General service type |
| Service offering | A provider's delivery package | Provider- or location-specific offer |

The central `entities` registry should provide canonical identity. Type-specific tables should store specialised attributes, and explicit relationship records should connect brands, branches, products, variants, sellers, menu items, and service providers.

## Primary user journeys

- **Discover:** Search across mixed entity types with location, category, type, rating, and other relevant filters.
- **Inspect:** Open the correct profile and understand its brand, parent, branch, seller, or outlet context.
- **Review:** Confirm the exact target, provide a 1–5 rating, confirm first-hand experience, and optionally add evidence.
- **Use public anonymity:** Hide the reviewer's public identity where policy permits while retaining private verification separately.
- **Claim a profile:** Submit authority evidence and receive scoped permissions after approval.
- **Correct or report:** Submit factual corrections or policy reports for platform review.
- **Appeal:** Receive a reasoned moderation outcome and access an appeal path.

The supplied UI concepts cover a responsive homepage, mixed-entity search results, brand profile, business/outlet profile, product profile, and menu-item profile. They also illustrate mobile layouts, loading states, empty states, errors, filters, galleries, rating breakdowns, business claims, and prominent review actions. These mockups are directional rather than production screens.

## Rating model

The proposed version-one direct rating is the arithmetic mean of eligible published reviews attached directly to the exact entity:

```text
direct_rating_average = SUM(eligible review ratings) / COUNT(eligible reviews)
```

The system should retain the unrounded value and expose the review count, rating scale, calculation time, and formula version. Pending, rejected, removed, and unresolved appealed reviews are excluded according to the approved moderation policy.

If parent aggregation is enabled, it should be stored and labelled separately. The proposed aggregate is weighted by the number of eligible child reviews rather than by averaging branch averages:

```text
aggregate_rating = SUM(child eligible rating values) / SUM(child eligible review counts)
```

Examples:

- A review of Domino's Borivali changes that branch's direct rating only.
- A review of a Margherita Pizza changes that exact menu item's direct rating only.
- A review of a 256 GB product variant changes that variant's direct rating only.
- A parent profile may display a clearly labelled aggregate only when an approved aggregation policy exists.

## System architecture

The MVP implementation uses a Next.js modular monolith. Pages, server-rendered UI, Route Handlers, Server Actions, validation, and database access live in one TypeScript application with explicit module boundaries. This reduces local resource use and deployment complexity while preserving a path to extract high-volume discovery workers later.

### Proposed technology direction

| Area | Proposed option | Notes |
| --- | --- | --- |
| Web and API runtime | Next.js + TypeScript | App Router, Route Handlers, and Server Actions |
| Validation | Zod | Shared request and domain validation |
| Database access | Drizzle ORM | Typed schema and migrations |
| Primary database | PostgreSQL; add PostGIS when location queries require it | Local installation or managed service; Docker is optional |
| Background processing | Next.js jobs initially | Extract to a managed queue/worker only when pilot workload requires it |
| AI enrichment | Replaceable LLM provider | Structured validation required; evidence remains authoritative |
| Media storage | S3-compatible object storage | Store only media the platform has rights to host |
| Search | Evaluate existing search first | Add OpenSearch/Elasticsearch only if justified |
| Deployment | Managed Next.js runtime | Include monitoring, backup, rollback, and cost controls |

This is the selected MVP architecture. The existing website, database, identity model, APIs, search implementation, security posture, and migration constraints must still be audited before production migration.

### Ownership boundary

Modules inside the Next.js application should keep separate ownership boundaries for identity, entities, reviews, ratings, claims, moderation, discovery, source provenance, search, and administration. Discovery code may submit evidence-backed entity candidates and factual updates, but it must not create reviews, ratings, claims, permissions, or verified badges.

### Integration requirements

- Stable UUIDs or the existing platform-standard identifiers
- UTC storage for timestamps
- Database constraints and explicit relationships
- Versioned and authenticated APIs
- Idempotency for create and bulk operations
- Optimistic concurrency for updates
- Per-record outcomes for bulk requests
- Least-privilege service roles
- Complete audit history
- Checkpointed jobs with retry and dead-letter behaviour
- Additive, reversible migrations with a tested rollback path

## Discovery and data governance

The discovery system is expected to support business discovery and product/offering discovery through shared source, staging, taxonomy, matching, provenance, quality-gate, and publishing components.

Every enabled source needs a registry entry covering:

- source type and stable identifier;
- legal or contractual approval reference;
- permitted fields and prohibited uses;
- required attribution;
- quota and rate limits;
- raw and derived data retention rules;
- connector health; and
- an operational kill switch.

The project must not bulk-copy Google Maps data, ratings, reviews, or photos; use public Nominatim for systematic bulk point-of-interest extraction; or republish proprietary directory content without suitable rights. Technical accessibility is not permission to store or redistribute data.

Published facts should pass field-level evidence and rights checks. AI may help classify, normalise, or flag records, but it must not replace source evidence or claim perfect detection of fraudulent or AI-generated reviews.

## Recommended MVP

The safest first release is a controlled Mumbai pilot in a limited set of localities and one carefully selected category. The MVP should validate the exact-target review model, data quality, source rights, user demand, moderation operations, and business participation before expanding across all entity types.

Suggested MVP capabilities:

- responsive homepage and mixed-entity search;
- one primary category and a constrained set of entity types;
- canonical profiles with stable IDs and relationships;
- exact-target review submission and direct ratings;
- basic moderation and appeal history;
- profile correction and business-claim requests;
- approved-source ingestion with staging and manual review;
- admin tools for matching, duplicates, merges, evidence, and job monitoring;
- SEO-safe canonical URLs and redirects; and
- audit logs, monitoring, backups, and rollback procedures.

Advanced product variants, menu-item coverage, broad automatic publishing, complex rating weighting, and multi-city rollout should follow only after the pilot produces reliable measurements.

## Delivery plan

| Phase | Output | Indicative duration |
| --- | --- | --- |
| 0. Current-state audit | Stack, schema, APIs, search, security, migration, and cost assessment | 3–5 working days |
| 1. Product and data design | Approved entity model, ERD, taxonomy, rating rules, and API contracts | 1–2 weeks |
| 2. Source feasibility | Source-rights register and controlled Mumbai source pilot | 1–2 weeks |
| 3. Foundation and pipeline | Discovery service, database, queue, staging, matching, evidence, and monitoring | 4–6 weeks |
| 4. Integration and UX | API sync, migration, search, profiles, and review journeys | Estimate after audit |
| 5. QA and pilot launch | Quality gates, security review, rollback, launch, and handover | 1–3 weeks |

The source brief gives **8–12 weeks** as an indicative first-production-pilot assumption, but this must be re-estimated after Phase 0. Legacy complexity, source approvals, team capacity, UI scope, migration requirements, and data quality can materially change the schedule.

## Definition of done

The pilot is ready for sign-off when:

- supported entity types use stable IDs and valid relationships;
- reviews always map to the exact intended target;
- direct and aggregate ratings are stored and displayed separately;
- approved source records publish through secure, idempotent APIs;
- every published field satisfies provenance and rights requirements;
- ambiguous matches enter review and merges are auditable and reversible;
- interrupted jobs resume without creating duplicates;
- existing users, reviews, claims, media decisions, and URLs are preserved or correctly migrated;
- mixed-entity search and review journeys work on mobile and desktop;
- a second city can be configured without changing core discovery code; and
- security, privacy, source compliance, quality, monitoring, backup, rollback, cost, and ownership documentation are approved.

Quality reporting should include field completeness, duplicate rate, branch/parent errors, and measured matching precision and recall. Numerical service-level objectives should be agreed only after the pilot establishes a real workload baseline.

## Open decisions

The following items require product-owner approval before production implementation:

- final MVP category, localities, entity types, and launch boundaries;
- final direct and aggregate rating formulas;
- minimum review count before displaying a rating;
- product-variant review inheritance and aggregation behaviour;
- public anonymity and private verification policy;
- auto-publish and auto-merge thresholds based on labelled pilot data;
- acceptable evidence for business claims;
- moderation, appeal, conflict-of-interest, incentive, and unlawful-content policies;
- approved data sources, permitted fields, attribution, and retention rules;
- final architecture after the existing-platform audit;
- migration, redirect, and rollback strategy; and
- low, base, and high operating-cost scenarios with named maintenance owners.

## Immediate next steps

1. Meet the product owner and Abhishek to confirm the project brief, business priority, target category, audience, budget, timeline, and approval authority.
2. Audit the current Public Review website and document its stack, schema, APIs, identity model, review logic, search, SEO, security, hosting, and data quality.
3. Approve the MVP boundary, entity model, rating rules, moderation rules, and source-rights register.
4. Produce the implementation ERD, architecture decision record, API contract, migration plan, QA strategy, and cost model.
5. Build and measure the controlled Mumbai pilot before approving broader automation or geographic expansion.

## Project documents

- [Master Product & Architecture Specification v3](docs/Public_Review_Master_Product_Architecture_Specification_v3.docx)
- [Technical Implementation Specification v1](docs/Public_Review_Technical_Implementation_Specification_v1.docx)
- [UI/UX Mockups v1](docs/Public_Review_UI_UX_Mockups_v1.pptx)
- [Homepage mockup](docs/a_high_fidelity_ui_ux_design_sheet_for_public_rev.png)
- [Search results mockup](docs/a_high_fidelity_ui_ux_design_board_for_public_re.png)
- [Menu item mockup](docs/a_high_detail_ui_ux_mockup_composite_for_public.png)
- [Business/outlet mockup](docs/a_detailed_ui_ux_design_presentation_mockup_for_a.png)
- [Brand mockup](docs/a_detailed_ui_ux_design_presentation_board_for_the.png)
- [Product mockup](docs/a_detailed_high_fidelity_ui_ux_design_mockup_of_a.png)

## Important status note

Examples shown in the specifications and mockups are illustrative and must not be treated as live Public Review data. API paths, schemas, field names, ratings, review counts, product details, business details, and UI content remain proposals until the relevant audit and approvals are complete.
