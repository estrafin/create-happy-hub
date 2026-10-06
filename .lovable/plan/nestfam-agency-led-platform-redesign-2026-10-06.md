# NestFam agency-led platform redesign

## Goal
Apply the attached specification to turn the current surrogacy-focused site into Nigeria-first family-building infrastructure. Agencies keep their client relationships and trusted professionals; NestFam provides private coordination. Preserve existing accounts, documents and the security protections already added.

## 1. Public website
- Rebuild Home with the specified headline, supporting copy, Start a Journey / For Agencies actions, trust strip, journey diagram, role sections, safety information and FAQ.
- Add How It Works, For Agencies, For Intended Parents, For Carriers, For Professionals, Safety & Trust and Resources pages.
- Update About, Contact, Privacy and Terms to reflect agency-led coordination, consent, professional responsibilities and non-custodial financial tracking. Retain your phone and email.
- Add complete navigation and footer links, with a compact mobile menu.
- Preserve a calm, warm brand while improving whitespace, typography, accessibility and African family/professional imagery.
- Show the specified agency prices and staged ₦750,000 journey-management test price, separately from third-party costs. Clearly state no NestFam application fee for carriers and initially free professional registration.

## 2. Accounts and onboarding
- Support Intended Parent, Carrier, Agency Admin, Agency Staff, Professional, Clinic Staff and NestFam Admin experiences.
- Preserve legacy accounts and map their existing roles to the appropriate experience without granting administrative privileges through signup.
- Keep email confirmation required and retain resend/sign-in handling.
- Collect consent and only necessary initial information. Agency/team/case invitations are accepted by the intended signed-in recipient.

## 3. Agencies and private professional circles
- Allow agency creation, organization settings, membership and team invitations.
- Add a private circle of trusted professionals with credentials, verification scope, invitations, case assignment and access removal.
- Provide an agency dashboard showing active cases, next actions, appointments, outstanding documents, bottlenecks, incidents, team activity and subscription records.
- Display Enterprise white-label as a later capability, not a working V1 feature.

## 4. Secure case workspace and role-specific portals
- Add agency-owned case creation with readable case references and controlled participant invitations.
- Provide Overview, Participants, Timeline, Tasks, Documents, Appointments, Messages, Financial Plan, Incidents and Audit History views.
- Use the specified journey stages from onboarding through postpartum/close-out, with responsible people, due dates and next actions.
- Adapt the parent, carrier and professional dashboards to their assigned work and permitted case information.
- Replace carrier browsing and numerical rankings with an agency-controlled assessment/matching workflow. Record professional decisions; never calculate medical or psychological clearance.

## 5. Documents, verification and coordination
- Preserve controlled signatures and private, signed document access.
- Add document versions, expiry dates, consent records and permission-aware visibility.
- Track identity/professional verification scope and Pending, Verified, Suspended or Expired status, with credential expiry reminders.
- Add task ownership, completion, appointments and privacy-safe in-app reminders.
- Add incident severity, responder, actions, escalation and resolution with timestamped history.

## 6. Financial records and administration
- Replace visible deposit/release/custody controls with estimated budgets, categorized obligations, payment milestones and external payment-status records.
- Record agency subscription plans and staged NestFam journey fees; do not process recurring charges or hold client money.
- Extend administration to agencies, cases, professionals, verification, incidents, support, subscriptions and audit records with permission checks.
- Preserve historical escrow data without presenting it as an active custody service.

## Technical approach
- Use additive database migrations and keep existing records; do not delete or overwrite production accounts or documents.
- Store roles separately from profiles. Scope agency and case access through least-privilege database policies, including private professional and participant permissions.
- Use authenticated server actions for controlled operations and database audit records for sensitive changes. Do not send identity or medical information in ordinary notification text.
- Keep existing TanStack routing, shared design components and semantic color tokens. Give every content page its own metadata.
- Implement and verify in the document’s build sequence: public site → accounts → agencies → cases → portals → documents/coordination → verification → financial records/admin → permission and usability checks.

## Validation and launch boundaries
- Test agency creation, invitations, case creation, task completion and role-specific access, including cross-agency isolation and unauthorized requests.
- Check public pages, sign-in navigation, mobile layouts, document handling and current error logs.
- No public carrier marketplace, automated advice/clearance, native apps, public rankings, insurance marketplace, crypto or escrow custody.
- Email delivery depends on a verified sender domain; confirm its current status before promising delivery. External SMS/WhatsApp, live subscription collection and full white-label portals remain later scope.
- Nigerian legal, clinical and privacy review remains necessary before launch; site copy will not claim that review has happened.