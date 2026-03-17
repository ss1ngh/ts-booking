# ts-booking

learning by over-engineering a booking system backend

# ts-booking

Learning by over-engineering a movie theater booking system backend.

This project is a high-performance, concurrent API designed to handle complex ticketing scenarios, race conditions, and automated background tasks.

---

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL/Prisma ORM
- **Caching & Message Broker:** Redis
- **Validation:** Zod
- **Authentication:** bcrypt
- **Infrastructure:** Docker

---

## Key Features & General Architecture

- **Repository Pattern:** Clean separation of data access logic from HTTP controllers.
- **Global Error Handling:** Centralized Express middleware utilizing custom `AppError` classes and Zod validation parsing.
- **Asynchronous Bootstrap:** Server strictly initializes database and cache connections before binding to the Express port to prevent zombie states.

---

## Redis Architecture & Concurrency

This system heavily leverages Redis to solve complex distributed systems problems, moving beyond simple data caching to implement active state management and event-driven background processing.

### 1. Distributed Seat Locking (Race Condition Prevention)

- **The Problem:** In a high-traffic environment, two users might click "Book" on the exact same seat at the exact same millisecond, leading to a database double-booking race condition.
- **The Solution:** The API utilizes a Redis Mutex pattern. Before touching the PostgreSQL database, the server attempts to acquire a lock on specific seat resources using the atomic `SET NX PX` (Set if Not eXists, with a millisecond Expiration) command.
- **The Result:** If User A acquires the lock, User B's request is immediately rejected with an HTTP 429 (Too Many Requests), ensuring mathematical certainty that a seat can only be booked by one thread at a time. The lock is safely released in a `finally` block to prevent deadlocks.

### 2. Event-Driven Ghost Booking Cleanup (Background Worker)

- **The Problem:** Users often select seats, locking them into a `PENDING` state, but abandon the checkout process. If not managed, these "ghost bookings" exhaust seat availability permanently.
- **The Solution:** \* **Shadow Keys:** When a booking is created, a `shadow_booking:{id}` key is written to Redis with a strict 3-minute Time-To-Live (TTL).
  - **Subscriber Mode:** A dedicated Redis client connection operates in Subscriber Mode, listening exclusively to the `__keyevent@0__:expired` channel via Redis Keyspace Notifications.
  - **Atomic Defusal:** If the user pays, the checkout endpoint deletes the shadow key, defusing the timer. If the user abandons the checkout, the TTL hits zero, Redis broadcasts the expiration event, and the background worker intercepts it, automatically querying the database to change the orphaned `PENDING` record to `CANCELLED`.

### 3. Availability Caching

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

    src/
    ├── config/
    ├── controllers/
    ├── repositories/
    ├── routes/v1/
    ├── services/
    ├── types/
    ├── utils/errors/
    └── index.ts
    prisma/
    ├── schema.prisma
    └── migrations/
