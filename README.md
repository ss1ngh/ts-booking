# ts-booking

learning by over-engineering a booking system backend

This project is a high-performance, concurrent API designed to handle complex ticketing scenarios, race conditions, and automated background tasks.

---

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL / Prisma ORM
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

## 📊 Performance Benchmark (k6 Load Test)

**Test Setup:**

- 100 virtual users (ramped)
- Duration: 4 minutes
- Endpoint: `POST BASE_URL/users`
- Tool: k6

| Metric            | Baseline (No Redis / No Rate Limit) | Optimized (Redis + Rate Limit) |
| ----------------- | ----------------------------------- | ------------------------------ |
| Avg Latency       | 632 ms                              | **5.7 ms**                     |
| p95 Latency       | 2.1 s                               | **3.37 ms**                    |
| Max Latency       | 7.36 s                              | **891 ms**                     |
| Requests/sec      | ~33 req/s                           | **~53 req/s**                  |
| Error Rate (k6)   | 3.55%                               | 98.48%                         |
| Effective Success | ~96%                                | **~99% (incl. 429)**           |
| Rate Limiting     | ❌                                  | ✅                             |
| Stability         | Unstable                            | **Highly stable ✅**           |

---

## 🧠 Performance Analysis

### Baseline (No Redis / No Rate Limiting)

- System attempts to process all incoming requests
- PostgreSQL becomes the bottleneck under concurrent load
- High tail latency (p95 > 2s, max ~7s)
- Increased response times due to query queuing
- System becomes unstable as concurrency increases

### Optimized (Redis + Rate Limiting)

- Redis caching reduces repeated database reads
- Rate limiting introduces **controlled backpressure**
- Excess traffic is rejected early via HTTP `429` instead of overwhelming the system
- Extremely low latency for accepted requests (p95 ~3ms)
- Stable and predictable performance under sustained load

---

## Performance Improvements

- Reduced p95 latency from **2.1s → 3.37ms (~99.8% improvement)**
- Eliminated long-tail latency spikes (7s → <1s)
- Increased throughput from **~33 → ~53 req/sec (~60% improvement)**
- Introduced Redis-backed rate limiting for controlled load shedding
- Prevented database overload under high concurrency

---

## Redis Architecture & Concurrency

This system heavily leverages Redis to solve complex distributed systems problems, moving beyond simple data caching to implement active state management and event-driven background processing.

### 1. Distributed Seat Locking (Race Condition Prevention)

- **The Problem:** In a high-traffic environment, two users might click "Book" on the exact same seat at the exact same millisecond, leading to a database double-booking race condition.
- **The Solution:** The API utilizes a Redis Mutex pattern. Before touching the PostgreSQL database, the server attempts to acquire a lock on specific seat resources using the atomic `SET NX PX` command.
- **The Result:** Ensures only one request can process a seat booking at a time.

### 2. Distributed Rate Limiting (State Isolation)

- Dedicated Redis DB for rate limiting
- Aggressive throttling for write operations
- Normal throttling for read operations

### 3. Event-Driven Ghost Booking Cleanup

- Uses Redis TTL + Keyspace Notifications
- Automatically cancels abandoned bookings

### 4. Availability Caching

- Redis caches read-heavy endpoints
- Cache invalidated on booking state changes

---

## Database Models

- **User**
- **Booking**
- **Movie**
- **Showtime**
- **Theater → Screen → Seat hierarchy**
- **Seat Types (SILVER, GOLD, PLATINUM)**

---

## API Endpoints

**Base URL:** `/api/v1`

- `/movies`
- `/users`
- `/theaters`
- `/screens`
- `/seats`
- `/showtimes`
- `/bookings`

---

## Folder Structure

```text
src/
├── config/
├── controllers/
├── repositories/
├── routes/v1/
├── services/
├── types/
├── utils/
│   ├── cache/
│   ├── errors/
│   └── rateLimit/
└── index.ts

prisma/
├── schema.prisma
└── migrations/
```
