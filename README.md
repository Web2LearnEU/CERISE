# CERISE

CERISE is a web platform focused on green skills recognition, academic profiles, course participation, and role-based access for students, course managers, and recruiters.

This repository contains the CERISE project codebase and is intended to evolve over time.

## Overview

The current implementation includes:

- homepage and about pages
- registration flow
- student wallet and profile/report views
- course manager control panel
- recruiter candidate search
- role-based navigation and access control

## Main Technologies

- `react`
- `react-router-dom`
- `@mui/material`
- `axios`
- `keycloak-js`
- `@react-keycloak/web`
- `html2canvas`
- `jspdf`
- Docker (`Dockerfile`, `docker-compose.yml`)

## Functionality

CERISE supports three main user roles:

- `student`: wallet, requests, profile/report
- `course-manager`: course management views
- `recruiter`: candidate discovery based on skills

Authentication and role handling are integrated with Keycloak.

## Local Development

1. Copy environment template:

```shell
cp .env.example .env
```

2. Install dependencies:

```shell
npm install
```

3. Start development server:

```shell
npm start
```

Alternatively, run with Docker:

```shell
docker compose up --build
```

## Configuration

Environment variables are documented in `.env.example`, including backend URL and Keycloak settings required at runtime.