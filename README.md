# ExamOrch

ExamOrch is an API service for managing and coordinating examinations, offering features such as session and participant management. It is powered by Node.js.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Design Decisions and Assumptions](#design-decisions-and-assumptions)
- [Known Limitations](#known-limitations)
- [Testing](#testing)
- [Time Spent](#time-spent)

## Overview

ExamOrch is a RESTful API for managing exam sessions with automatic seat allocation and proctoring rules. The system handles complex business logic for exam session management, candidate enrollment, and proctor assignment while ensuring data integrity and preventing scheduling conflicts.

## Features

- Create and manage exam sessions with title, duration, capacity, and start time
- Automatic seat allocation and waitlist management
- Candidate enrollment with overlap detection
- Proctor assignment with scheduling conflict prevention
- Comprehensive API endpoints for all business operations
- Custom error handling with appropriate HTTP status codes
- Rate limiting and security middleware
- Comprehensive logging system
- API documentation via Swagger

## Prerequisites

- Node.js v18 or higher
- npm or yarn package manager

## Installation

### Run Locally (without Docker)

1. Clone the repository:
```bash
git clone https://github.com/blackeffigyeel/exam-orch
cd exam-orch
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`

5. Run the application:
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

The application will be available at `http://localhost:4013`

### Run Locally (with Docker)

1. Clone the repository:
```bash
git clone https://github.com/blackeffigyeel/exam-orch
cd exam-orch
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`

4. Build and run with Docker Compose:
```bash
docker compose up --build
```

The application will be available at `http://localhost:4013`

## Configuration

The application uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

```env
PORT=4013
NODE_ENV=development
```

**Note:** When using Docker, make sure the `PORT` in your `.env` file matches the port mapping in your `compose.yml`  file.

## Running the Application

### Development

```bash
npm run dev
```

### Production

1. Build the application:
```bash
npm run build
```

2. Start the application:
```bash
npm start
```

## API Documentation

API documentation is available at:
- http://localhost:4013/api-docs (when running locally)
- https://exam-orch.onrender.com/api-docs (My cloud hosted instance)

## Design Decisions and Assumptions

### Design Decisions

- Used custom `Error` subclasses and return statements in services to seamlessly propagate error or success HTTP status codes to controllers.
- Configured Winston to use the local file system as the transport, since database use is not allowed for the the technical test.
- Created subfolders in every directory where necessary to separate concerns. In services, `utils` folders were added for easier access, clarity, organisation, and maintaining relationships.
- Placed `docs` and `tests` folders outside `src` to prevent unnecessary bloat during the build process.
- Implemented a global error handler (`globalErrorMaster`) to handle edge cases where errors might escape standard handling.
- Used Docker to ensure reproducible builds and portability.
- During Docker image builds, added an `app` user with limited privileges to prevent container compromises from affecting the host system.
- Adjusted file permissions: `/app/dist` and `/app/package.json` remain readable only by root, while `/app/logs` is owned by the `app` user with write access to allow logging without permission errors.
- Implemented a modular architecture with clear separation of concerns: controllers handle HTTP requests, services contain business logic, and models manage data persistence.
- Used TypeScript for type safety and improved developer experience.
- Enforced comprehensive validation with Joi to ensure data integrity.

### Assumptions

- Assumed that the student ID should follow a specific format.
- Assumed that to determine whether an exam session overlaps for assignment to a proctor, the start and end times are considered. If any segment of the proctor's current session falls within the start-to-end range of the new session, it is considered a clash.

## Known Limitations

- In-memory storage means data is lost when the server restarts
- No persistent storage mechanism implemented
- Rate limiting is based on IP address only
- No caching mechanism implemented for frequently accessed data
- No automated backup system for the in-memory data

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm test -- --coverage
```

## Time Spent

Total development time: Approximately 8 hours

Breakdown:
- Planning and architecture: 1 hour
- Core implementation: 5 hours
- Testing setup: 1 hour
- Documentation: 1 hour