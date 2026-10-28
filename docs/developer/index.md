---
layout: maatha
title: Developer Guide
permalink: /developer/
---
# Developer guide

This page documents the known high-level technology choices. Refer to the actual repository for the definitive commands, environment variable names, dependency versions and API endpoints.

## Technology stack

| Area | Technology |
|---|---|
| Mobile frontend | React Native |
| Backend | Java / Spring Boot |
| Database | PostgreSQL via Supabase |
| API authentication | JWT |
| Push notifications | Firebase Cloud Messaging |
| Backend hosting | Railway |

## Local development checklist

1. Clone the [MaathaCare repository](https://github.com/cepdnaclk/e23-co2060-Maathacare).
2. Check the actual frontend and backend directory names.
3. Install the dependency versions specified by each application's project files.
4. Set required secrets using environment variables or excluded local configuration files.
5. Configure the backend database connection and required notification credentials.
6. Start the backend and frontend with the commands documented by their respective build files.
7. Verify that login and API requests work in your local environment.

## Security note

Never commit Supabase passwords, JWT signing keys, Firebase service-account files, or SMS credentials to this public website or repository. Rotate any credentials that were previously exposed.

## Items to document after code verification

- Complete backend startup commands and required Java version
- Frontend startup/build commands
- API endpoints with request and response examples
- ER diagram and database migrations
- Deployment environment variables without secret values
- Automated testing and troubleshooting instructions
