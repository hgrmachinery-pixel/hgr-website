# Project
This repository contains the custom website and inventory management system for HGR Equipment Resources, a Malaysian used heavy machinery business focused primarily on used excavators.

The production domain is hgrmachinery.com.

# Model and Task Routing
Read and follow [MODEL-ROUTING.md](MODEL-ROUTING.md) for model/task routing, delegation and escalation. Existing safety, scope and owner-approval rules remain in force.

# User and Working Style
The project owner is nontechnical.
- Use plain English when reporting work.
- Do not assume the user understands programming, Git, servers, databases, or deployment.
- Prefer simple, maintainable solutions over clever or unnecessarily complex solutions.
- If an important requirement is unclear, ask before making a major architectural assumption.
- If there is a clearly safer, simpler, or more maintainable approach than the requested implementation, explain it before proceeding.
- Never make purchases, create paid resources, change DNS, modify production infrastructure, delete production data, or perform other irreversible actions without explicit approval.

## Owner Interaction
Batch owner interactions whenever practical.

Do not interrupt execution for:
- informational updates
- completed routine checkpoints
- successful implementation
- ordinary verification

Continue working until:
- a genuine owner decision is required;
- a production change is proposed;
- a paid or potentially chargeable resource is required;
- a destructive or irreversible action is proposed;
- a material architectural uncertainty appears; or
- a blocking error prevents further progress.

Where multiple owner decisions exist within the same phase, present them together in one discussion whenever practical.

# Approved Architecture
The current approved architecture is:
- Next.js frontend/application.
- Payload CMS for content and machine inventory administration.
- PostgreSQL database.
- External object storage for media, planned as Google Cloud Storage.
- GitHub as the source-code repository.
- Initial deployment target is the existing Exabytes hosting environment for testing.
- The application must remain portable so it can later move to Railway or another suitable Node.js host without a rebuild.
- Do not architect the application around Exabytes-specific features.
- Do not use the existing Exabytes MariaDB database for Payload.
- Secrets and environment-specific configuration must use environment variables and must never be committed to Git.

# Deployment Portability
Deployment portability is a core requirement.
The website code, database configuration, media storage, and deployment configuration should remain sufficiently decoupled that the application host can be changed without rebuilding the website.
Do not hard-code host-specific paths, credentials, domains, database addresses, or storage URLs when configuration can be supplied through environment variables.

# CMS Principle
The business owner must manage the website through Payload CMS and must not need VS Code, GitHub, a terminal, or code for routine operations.
Structured content should be editable in the CMS.
Do not expose page-layout or technical configuration unnecessarily to normal CMS users.

# Core Business
Primary business:
- Used excavator sales.

Secondary/future business:
- Other used heavy machinery sales.
- Opportunity-based excavator rental.
- Machinery servicing enquiries.
- Lubricant enquiries/listings.

The website is a lead-generation website, not an ecommerce website in V1.

Primary conversions:
- WhatsApp.
- Phone calls.
- Enquiry forms.
- Arrange machine viewing.

Machine viewing is at HGR's Klang, Selangor yard, preferably by appointment.

# Machine Inventory
Initial inventory is expected to be approximately 20 to 30 excavators, with new machines added regularly.

Machine statuses:
- Available
- Reserved
- Sold

Sold machine pages must remain accessible unless there is a specific reason to remove one.
A sold machine URL must never be reused for another physical machine.

Each physical machine must have its own stable unique identity and URL even if multiple machines have the same brand/model/year.

Typical machine fields include:
- Internal machine ID.
- Brand.
- Model.
- Year of Manufacture.
- Hours.
- Engine.
- Operating weight.
- Condition.
- Country of origin.
- Machine Origin / Registration Status.
- Registration Date where applicable.
- Price.
- Contact for Price option.
- Description.
- Status.
- Serial number with independent public/private visibility.
- Photos.
- Video URL.
- Documentation.

# Structured Machine Photography
Machine photography must use structured categories rather than one undifferentiated upload list.

Categories:
- General / Exterior: multiple.
- Side View 1: one or more.
- Side View 2: one or more.
- Front View: one or more.
- Rear View: one or more.
- Cabin / Interior: multiple.
- Hour Meter: one or more.
- Chassis / Serial Number: one or more.
- Engine: multiple.
- Undercarriage / Tracks: multiple.
- Boom / Arm / Bucket: multiple.
- Other / Details: multiple.

Not every category must be mandatory.
At least one suitable featured/general image should be required before a machine is publicly published.

Admin users should be able to:
- choose a featured image;
- upload images by category;
- reorder images;
- preview images;
- set focal point where supported.

The public machine page should present the photographs as an attractive unified gallery with useful category navigation rather than eleven cumbersome page sections.

Where useful, specification evidence may link to the relevant photograph, for example Hours to the Hour Meter image.

# Image Processing
Owners should upload good-quality originals without manually resizing every image.

The system should:
- preserve an appropriate master/original;
- automatically generate suitable responsive sizes;
- optimize delivery for web performance;
- use appropriate modern image formats where practical;
- avoid serving multi-megabyte originals to normal website visitors;
- maintain consistent machinery photography presentation.

Machine image filenames should be generated from the unique machine identity and photography category rather than trusting the uploader's original filename.

Example concept:
2018-komatsu-pc200-8-hgr028-engine-01.jpg

Alt text is separate from the filename and must not invent visual details.

# Machine Documentation and JPJ Documents
Machine documentation is separate from normal machine photography.

For sensitive documents such as a JPJ registration card:
- Store the private original separately.
- The private original must never be publicly accessible.
- A separate redacted/censored public derivative may be created.
- Never overwrite the private original with the censored version.
- Public display requires explicit approval.
- Do not rely solely on automatic AI redaction.
- Human review is required before a censored document becomes public.
- Registered owner/company name, personal/company identification numbers, addresses, and other sensitive identifiers must be considered for redaction.

Suggested document verification statuses:
- Not uploaded.
- Uploaded.
- Public copy pending review.
- Approved for website.

The public site may state that a JPJ registration document is available and may show an approved censored version.

Do not automatically infer claims such as "Recond" or "Local New" solely from a document. HGR must explicitly enter/verify the Machine Origin / Registration Status.

Year of Manufacture and Registration Date must remain separate fields.

# Media Storage
Media is planned to use Google Cloud Storage or another compatible external object-storage system.

The architecture must distinguish between:
- public machine photographs;
- generated/responsive image derivatives;
- approved public redacted documents;
- private original documents.

Private documents must not be placed at predictable public URLs.

# Public Website UX
The public site should be extremely simple to use even for less technical customers.

Primary journey:
Arrive -> understand HGR sells used excavators -> view available excavators -> select machine -> inspect details -> WhatsApp/call/enquire -> arrange viewing.

Animation is visual polish, never required for navigation or access to information.

Homepage should be product-led rather than a long corporate presentation.

Main navigation:
- Used Excavators
- Rental
- Machinery Services
- Lubricants
- About
- Contact

Do not include a Home navigation item. The HGR logo links to the homepage.

Homepage Available Excavators should normally show approximately 3 to 6 Available machines.

# Hero Experience
The planned signature homepage hero uses a real HGR excavator.

Concept:
- Excavator body/tracks remain visually anchored.
- Boom/arm movement responds to scroll.
- Motion reverses where practical.
- Hero transitions toward Available Excavators.

Requirements:
- performance takes priority over animation;
- provide a static or simplified fallback for mobile/weak devices;
- respect prefers-reduced-motion;
- animation must not block content, navigation, SEO, or conversion actions.

# Brand
Use centralized design tokens.

Current brand direction:
- HGR Orange: #F86C00
- Orange hover: #E85F00
- Accent orange: #F89800
- Primary text: #171717
- Secondary text: #5F6368
- Light background: #FFFFFF
- Secondary background: #F5F5F5
- Border: #E2E2E2
- Dark background: #151515
- Dark surface: #222222
- White text: #FFFFFF
- Secondary dark text: #D0D0D0
- Primary typeface: Inter

Visual direction:
- modern;
- clean;
- premium but practical;
- mostly light UI with selected dark feature sections;
- real machinery photography;
- avoid generic corporate-template appearance.

# SEO
SEO is inventory-first.

Important themes include:
- used excavator Malaysia;
- used excavator for sale Malaysia;
- excavator for sale Malaysia;
- relevant brand/model/year long-tail searches;
- genuine Klang/Selangor local relevance.

Requirements:
- stable unique machine URLs;
- proper metadata;
- canonical URLs;
- XML sitemap;
- redirects where necessary;
- robots controls;
- staging must not be indexed;
- sensible structured data only when it accurately matches visible content;
- optimized images;
- strong Core Web Vitals/performance;
- Google Search Console compatibility;
- GA4 / Google Tag Manager / Google Ads measurement architecture.

Do not invent keyword search volumes, rankings, reviews, machine specifications, business claims, or structured-data facts.

V1 is English.
Future BM and Chinese versions should use proper separate language URLs and hreflang rather than mixing languages on one URL.

Do not automatically create indexable filter/facet pages.

# Mudah
HGR will continue using Mudah separately.

Where permitted, Mudah listings may link to the corresponding HGR machine page.
The HGR website must not technically depend on Mudah.
Do not build automatic Mudah publishing or synchronization in V1.

Admin should eventually provide a simple Copy Machine Link action.

# Forms and Contact
General enquiry should support:
- Name.
- Company.
- Phone.
- Email optional.
- Machine interested in.
- Message.

Machine WhatsApp actions should prefill the relevant machine identity and page URL.

Use reasonable anti-spam measures without adding unnecessary friction.

# Security and Privacy
- Never commit passwords, API keys, database credentials, service-account credentials, private keys, or .env secrets.
- Keep .env files out of Git.
- Provide .env.example containing variable names only.
- Follow least-privilege principles.
- Treat original JPJ and ownership documents as private sensitive business information.
- Validate uploads and user input.
- Keep dependencies maintained.
- Do not expose internal machine data unintentionally.

# Engineering Principles
- KISS: choose the simplest solution that satisfies the requirement.
- DRY: avoid unnecessary duplication.
- Prefer maintainability and clarity over clever abstractions.
- Use TypeScript.
- Maintain accessibility.
- Build responsive/mobile-first interfaces.
- Avoid unnecessary dependencies.
- Keep components reasonably modular.
- Use meaningful names.
- Document non-obvious architecture decisions.
- Do not prematurely build future features.
- Do not implement ecommerce in V1.
- Do not implement a CRM in V1.
- Do not implement multilingual pages until requested.

# Quality Assurance
Before declaring meaningful development work complete:
- run relevant linting;
- run type checks;
- run relevant automated tests;
- verify production build where practical;
- inspect important responsive states;
- check accessibility for changed UI;
- test failure/empty/loading states where applicable;
- verify no secrets were accidentally added.

For important features, perform an adversarial QA pass:
- try invalid input;
- missing data;
- unusual content lengths;
- empty inventory;
- sold inventory;
- missing optional photos;
- mobile layouts;
- slow/error states.

Fix material issues before reporting completion.

# Git and Change Safety
- Keep commits focused and understandable.
- Do not force-push unless explicitly authorized.
- Do not rewrite shared history.
- Do not delete important files or data without approval.
- Do not modify production systems unless explicitly requested.
- Before major or destructive changes, explain what will happen.
- Never commit generated secrets or local environment files.

# Scope Control
Planning/specification documents may evolve.
Do not silently reinterpret unresolved business facts.
Use TODO / TO CONFIRM where business information is genuinely unknown.
Do not turn assumptions into public claims.

# Reporting Work
When completing a task, report in plain English:
1. What changed.
2. Which important files changed.
3. What was tested.
4. Whether tests passed.
5. Anything still requiring user input or approval.

Keep the report concise unless the user requests technical detail.
