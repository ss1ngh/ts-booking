# ts-booking

learning by over-engineering a booking system backend

This project is a high-performance, concurrent API designed to handle complex ticketing scenarios, race conditions, and automated background tasks.

---

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL/Prisma ORM
- **Caching & Message Broker:** Redis
- **Security:** express-rate-limit (Redis-backed)
- **Validation:** Zod
- **Authentication:** bcrypt
- **Infrastructure:** Docker

---

## Key Features & General Architecture

- **Repository Pattern:** Clean separation of data access logic from HTTP controllers.
- **Global Error Handling:** Centralized Express middleware utilizing custom `AppError` classes and Zod validation parsing.
- **Asynchronous Bootstrap:** Server strictly initializes database and cache connections before binding to the Express port to prevent zombie states.
- **Hybrid Rate Limiting Pipeline:** Tiered protection using sequential middleware to apply different pressure limits based on endpoint sensitivity.

---

## Redis Architecture & Concurrency

This system heavily leverages Redis to solve complex distributed systems problems, moving beyond simple data caching to implement active state management and event-driven background processing.

### 1. Distributed Seat Locking (Race Condition Prevention)

- **The Problem:** In a high-traffic environment, two users might click "Book" on the exact same seat at the exact same millisecond, leading to a database double-booking race condition.
- **The Solution:** The API utilizes a Redis Mutex pattern. Before touching the PostgreSQL database, the server attempts to acquire a lock on specific seat resources using the atomic `SET NX PX` (Set if Not eXists, with a millisecond Expiration) command.
- **The Result:** If User A acquires the lock, User B's request is immediately rejected with an HTTP 429 (Too Many Requests), ensuring mathematical certainty that a seat can only be booked by one thread at a time. The lock is safely released in a `finally` block to prevent deadlocks.

### 2. Distributed Rate Limiting (State Isolation)

- **The Problem:** Standard memory-based limiters fail in distributed environments and lose state upon server restarts. Additionally, mixing rate-limit data with application cache in a single DB risks eviction of security counters.
- **The Solution:** A dedicated Redis client connects to a separate logical database (DB 1) specifically for `rate-limit-redis`.
- **The Strategy:** The API implements a hybrid pipeline:
  - **Aggressive Throttling:** Applied to state-mutating endpoints (POST, PATCH, DELETE) to prevent brute-force and resource exhaustion.
  - **Normal Throttling:** A broader firewall applied to read-heavy endpoints (GET) to mitigate scraping and general DoS attempts.

### 3. Event-Driven Ghost Booking Cleanup (Background Worker)

- **The Problem:** Users often select seats, locking them into a `PENDING` state, but abandon the checkout process. If not managed, these "ghost bookings" exhaust seat availability permanently.
- **The Solution:** - **Shadow Keys:** When a booking is created, a `shadow_booking:{id}` key is written to Redis with a strict 3-minute Time-To-Live (TTL).
  - **Subscriber Mode:** A dedicated Redis client connection operates in Subscriber Mode, listening exclusively to the `__keyevent@0__:expired` channel via Redis Keyspace Notifications.
  - **Atomic Defusal:** If the user pays, the checkout endpoint deletes the shadow key, defusing the timer. If the user abandons the checkout, the TTL hits zero, Redis broadcasts the expiration event, and the background worker intercepts it, automatically querying the database to change the orphaned `PENDING` record to `CANCELLED`.

### 4. Availability Caching

- **Showtime States:** Read-heavy endpoints, such as checking seat availability for a specific showtime, are cached in Redis.
- **Cache Invalidation:** The cache is systematically invalidated and rebuilt only when a booking state changes (created, confirmed, or cancelled), significantly reducing the read load on the primary PostgreSQL database.

---

## Database Models

The PostgreSQL database maps the physical and transactional realities of a cinema:

- **User:** Tracks `email`, `password`, `name`, and `role` (USER, STAFF, ADMIN).
- **Booking:** Tracks transaction lifecycle `status` (PENDING, CONFIRMED, CANCELLED).
- **Movie:** Stores core metadata (`title`, `description`, `duration`, `releaseDate`).
- **Showtime:** Links a `Movie` to a specific `Screen` with a `startTime`.
- **Theater Hierarchy:** `Theater` → contains `Screen` → contains `Seat`.
- **Seat Types:** Categorized by pricing tiers (SILVER, GOLD, PLATINUM).

---

## API Endpoints

**Base URL:** `/api/v1`

- `/movies` - Full CRUD operations and nested showtime data.
- `/users` - Full CRUD operations and authentication.
- `/theaters` - Theater management.
- `/screens` - Screen mapping and layout.
- `/seats` - Seat availability and categorization.
- `/showtimes` - Scheduling and availability queries.
- `/bookings` - Transaction initiation, payment confirmation, and cancellation.

---

## Folder Structure

```text
src/
├── config/           # Redis, Prisma, and environment configurations
├── controllers/      # Route handlers (logic for processing requests)
├── repositories/     # Data access layer (Prisma queries)
├── routes/v1/        # Express route definitions & pipeline sequencing
├── services/         # Business logic (Seat locking, background workers)
├── types/            # TypeScript interfaces and shared types
├── utils/            # Shared internal utilities
│   ├── cache/        # Redis caching helpers & lock mechanisms
│   ├── errors/       # Custom AppError classes & Global handler
│   └── rateLimit/    # Distributed limiter helpers & Redis DB 1 setup
└── index.ts          # Asynchronous bootstrap and server entry point
prisma/
├── schema.prisma     # Relational database models
└── migrations/       # Version-controlled SQL schema changes
```
