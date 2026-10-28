---
layout: maatha
title: Architecture
permalink: /architecture/
---
# System architecture

MaathaCare uses a three-tier application structure: role-specific user interfaces, a Spring Boot REST API, and a PostgreSQL database hosted via Supabase. The backend is hosted using Railway as described in the project setup.

<div class="soft-section">
  <h2>High-level data flow</h2>
  <div class="flow"><span>React Native / Web Portal</span><b>→</b><span>Spring Boot REST API</span><b>↔</b><span>PostgreSQL (Supabase)</span></div>
  <p>Authentication uses JWT-based access control. Notification workflows can involve Firebase Cloud Messaging and an SMS provider where configured.</p>
</div>

## Architecture diagram

<div class="placeholder">Replace this section with your verified architecture diagram. Suggested image: <code>docs/images/architecture.png</code></div>

## Main components

| Layer | Technology | Responsibility |
|---|---|---|
| Mobile | React Native | Mother/PHM mobile experiences (depending on released role features) |
| Web | Web portal | Administrative and healthcare-facing workflows |
| API | Java, Spring Boot | Business logic, data access and authorization |
| Data | PostgreSQL / Supabase | Persist application records |
| Deployment | Railway | Host application backend |
| Notifications | Firebase Cloud Messaging / SMS integration | Deliver configured notifications |

## Example request flow

1. An authenticated user starts an action in an application screen.
2. The frontend sends a request to an API endpoint over HTTPS.
3. The backend validates the request and applies authorization rules.
4. The backend reads or writes data according to the business operation.
5. A response is returned and the frontend updates its interface.

## Further technical documentation

See the [developer guide]({{ '/developer/' | relative_url }}) for development and deployment notes. Add your actual ER diagram and sequence diagrams here after reviewing them against the current codebase.
