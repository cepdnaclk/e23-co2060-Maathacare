
---
layout: maatha
title: Architecture
permalink: /architecture/
---

# System Architecture

MaathaCare follows a three-tier architecture consisting of role-specific frontend applications, a Spring Boot REST API, and a PostgreSQL database hosted through Supabase.

The backend is deployed on Railway and provides centralized services for the Mother application, PHM application, and administrative web portal.

---

## High-Level Data Flow

The different applications communicate with the backend through REST API requests.

**React Native / Web Portal → Spring Boot REST API ↔ PostgreSQL (Supabase)**

Authentication uses JWT-based access control. Notification workflows can involve Firebase Cloud Messaging (FCM) and SMS services where configured.

---

## Architecture Diagram

The diagram below illustrates the main components of MaathaCare and how they communicate with each other.

![MaathaCare System Architecture]({{ '/images/architecture.png' | relative_url }})

---

## Main Components

| Layer | Technology | Responsibility |
|---|---|---|
| Mobile | React Native | Mother and PHM mobile applications |
| Web | React.js | Administrative web portal |
| API | Java, Spring Boot | Business logic, data access, and authorization |
| Database | PostgreSQL / Supabase | Store application records |
| Backend Hosting | Railway | Host backend services |
| Web Hosting | Vercel | Host administrative web portal |
| Authentication | JWT | Authenticate and authorize API requests |
| Notifications | Firebase Cloud Messaging / SMS | Deliver configured notifications |

---

## Example Request Flow

The following example illustrates how an application interacts with the backend.

1. An authenticated user performs an action in the application.
2. The frontend sends a request to a REST API endpoint over HTTPS.
3. The backend validates the request and checks authorization.
4. The backend processes the request and reads or updates the database.
5. The backend sends a response to the frontend.
6. The frontend updates the user interface.

---

## Database Architecture

MaathaCare uses PostgreSQL hosted on Supabase to manage application data.

The database supports the different application features, including maternal information, appointments, symptom records, and other healthcare-related information.

An Entity Relationship (ER) diagram can be used to illustrate relationships between the database tables.

---

## Authentication and Security

MaathaCare uses JWT-based authentication for protected API interactions.

The authentication system is designed to control access to application resources according to the authenticated user's permissions.

Key security mechanisms include:

- User authentication
- JWT-based API access
- Authorization checks
- Role-specific access restrictions

---

## Notification Architecture

MaathaCare supports notification workflows for maternal healthcare activities.

Notification mechanisms include:

- Firebase Cloud Messaging for push notifications
- SMS integration for supported reminders
- Appointment-related notifications
- Configured symptom and supplement reminders

---

## Deployment Architecture

The system uses cloud-hosted services for its main components.

| Component | Deployment Platform |
|---|---|
| Mother Application | Android |
| PHM Application | Android |
| Administrative Web Portal | Vercel |
| Backend REST API | Railway |
| PostgreSQL Database | Supabase |
| Project Website | GitHub Pages |

---

## Further Technical Documentation

For additional implementation details, explore:

- [Developer Guide]({{ '/developer/' | relative_url }})
- [Platform Features]({{ '/features/' | relative_url }})
- [Testing and Results]({{ '/testing/' | relative_url }})

---

**MaathaCare — Smart Digital Pregnancy Support System**
