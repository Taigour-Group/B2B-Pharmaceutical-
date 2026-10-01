# Janakpur PharmaDistro - Backend Architecture & Production Guide

This comprehensive guide details the complete backend architecture, database schema, API specifications, and deployment requirements to build and run the **Janakpur PharmaDistro** B2B Wholesale Distribution Platform in production.

---

## 1. System Architecture Overview

In production, the platform operates as a multi-tenant, role-governed B2B distribution system adhering to **Nepal Department of Drug Administration (DDA)** compliance and **Good Distribution Practice (GDP)** standards.

```
                              ┌──────────────────────────────────────────┐
                              │            Client Applications           │
                              │  - Retail Pharmacy Web Portal (React)   │
                              │  - Admin Operations & Logistics Portal  │
                              │  - Delivery Driver Mobile Web View       │
                              └────────────────────┬─────────────────────┘
                                                   │ HTTPS / WSS
                                                   ▼
                              ┌──────────────────────────────────────────┐
                              │       Reverse Proxy & Edge Gateway       │
                              │   - Nginx / Cloudflare (SSL Termination) │
                              │   - Rate Limiting (DDoS & API Throttling)│
                              │   - Static Asset Caching                 │
                              └────────────────────┬─────────────────────┘
                                                   │ Proxy Pass (:5000)
                                                   ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               Node.js / Express Server Cluster                          │
│                                                                                        │
│  ┌───────────────────────┐  ┌────────────────────────┐  ┌───────────────────────────┐  │
│  │   Auth & RBAC Guards  │  │   Input Validation &   │  │ Audit & Compliance Logger │  │
│  │  (JWT + Role Claims)  │  │      Sanitization      │  │     (DDA Regulatory Log)  │  │
│  └───────────┬───────────┘  └───────────┬────────────┘  └─────────────┬─────────────┘  │
│              │                          │                             │                │
│  ┌───────────┴──────────────────────────┴─────────────────────────────┴─────────────┐  │
│  │                               Business Domain Services                           │  │
│  │  - Customer KYC & DDA Verification Service                                        │  │
│  │  - FEFO Inventory & Cold-Chain Allocation Engine                                 │  │
│  │  - Order Lifecycle & Tamper-Evident Dispatch Workflow                            │  │
│  │  - Smart Reorder & Chronic Depletion Predictive Service                          │  │
│  │  - Bulk Order Fuzzy Repertoire Matcher                                           │  │
│  │  - Janakpur TSP Logistics Route Optimization Service                             │  │
│  │  - Returns, Defect Quarantine & Credit Note Service                              │  │
│  │  - Credit Ledger, VAT Invoicing & Fonepay Remittance                             │  │
│  │  - Regional Epidemiological Mesh Analytics Service                               │  │
│  └──────────────────────────────────────┬───────────────────────────────────────────┘  │
└─────────────────────────────────────────┼──────────────────────────────────────────────┘
                                          │
                  ┌───────────────────────┼───────────────────────┐
                  ▼                       ▼                       ▼
    ┌───────────────────────────┐ ┌───────────────┐ ┌───────────────────────────┐
    │  Primary Relational DB    │ │  Redis Cache  │ │      Object Storage       │
    │  PostgreSQL (Cloud SQL /  │ │  & Job Queue  │ │      (S3 / GCS Bucket)    │
    │  Neon / Self-hosted)      │ │  - Rate limits│ │  - DDA Pharmacy Licenses  │
    │  - ACID Transactions      │ │  - Route cache│ │  - PAN/VAT Scans          │
    │  - FEFO Batch Lock Tables │ │  - Expiry cron│ │  - Signed Tax Invoices    │
    └───────────────────────────┘ └───────────────┘ └───────────────────────────┘
```

---

## 2. Complete API Catalog (Total APIs Needed)

To support all portal workflows, the backend requires **38 REST API endpoints** categorized across 9 functional domains.

### 2.1 Authentication & KYC Verification (5 APIs)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register-pharmacy` | Public | Registers a new retail pharmacy with business name, PAN/VAT, DDA license, and pharmacist credentials. |
| `POST` | `/api/v1/auth/login` | Public | Authenticates pharmacist or distributor admin and returns JWT access + refresh token. |
| `GET` | `/api/v1/auth/me` | Authenticated | Fetches current session, business profile, credit limits, and verification status. |
| `POST` | `/api/v1/auth/refresh-token` | Public | Issues a new JWT access token using HTTP-only refresh cookie. |
| `POST` | `/api/v1/auth/logout` | Authenticated | Revokes refresh token and clears session cookies. |

### 2.2 Customer & Regulatory Verification (Admin) (4 APIs)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/customers` | Admin | Fetches paginated list of all pharmacies with filters (`PENDING`, `VERIFIED`, `EXPIRED_DDA`). |
| `GET` | `/api/v1/admin/customers/:id` | Admin | Returns customer dossier, verified DDA certificates, credit ledger, and order history. |
| `PATCH`| `/api/v1/admin/customers/:id/status` | Admin | Approves, rejects, or requests resubmission for pharmacy account with audit reason. |
| `PATCH`| `/api/v1/admin/customers/:id/credit` | Admin | Adjusts approved credit limit (e.g., NPR 250,000) and payment terms (`Net 15 Days`). |

### 2.3 Product Catalogue & FEFO Batch Inventory (5 APIs)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/products` | Pharmacy / Admin | Returns searchable catalogue with wholesale pricing, MOQs, and active batch availability. |
| `GET` | `/api/v1/products/:id` | Pharmacy / Admin | Returns product clinical monograph, storage conditions, and all active batches sorted by FEFO. |
| `POST` | `/api/v1/products` | Admin | Creates a new pharmaceutical SKU with DDA registration reference. |
| `POST` | `/api/v1/products/:id/batches`| Admin | Inwards a new manufacturing batch lot (Batch Number, Mfg Date, Expiry Date, Qty, Purchase Price). |
| `GET` | `/api/v1/inventory/expiry-tracker`| Pharmacy / Admin | Returns batches nearing expiry (&le; 90 days, &le; 180 days) for proactive returns or clearance. |

### 2.4 Cart & Wholesale Order Management (6 APIs)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/orders/validate-cart` | Pharmacy | Verifies product stock availability, MOQs, cold-chain handling, and customer available credit. |
| `POST` | `/api/v1/orders` | Pharmacy | Places order inside a PostgreSQL ACID transaction: locks earliest FEFO batch lots, reduces inventory, and updates ledger. |
| `GET` | `/api/v1/orders` | Pharmacy / Admin | Lists customer orders with status tags (`PLACED`, `CONFIRMED`, `PACKED`, `DISPATCHED`, `DELIVERED`). |
| `GET` | `/api/v1/orders/:id` | Pharmacy / Admin | Fetches order manifest with allocated lot numbers, crate seal IDs, and tracking timeline. |
| `PATCH`| `/api/v1/orders/:id/status` | Admin | Advances delivery stage (`PACKED` with crate seal &rarr; `DISPATCHED` with assigned driver &rarr; `DELIVERED`). |
| `POST` | `/api/v1/orders/:id/reorder` | Pharmacy | Clones past order line items into active cart with fresh FEFO batch allocations. |

### 2.5 Smart Reorder & Bulk Matching Engines (3 APIs)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/reorder/recommendations` | Pharmacy | Analyzes pharmacy purchase cadence and returns depletion forecasts for chronic staples (Diabetes, Hypertension, GERD). |
| `POST` | `/api/v1/reorder/bulk-match` | Pharmacy | Takes raw text or parsed CSV rows and performs fuzzy keyword matching against catalog with FEFO and MOQ auto-adjustments. |
| `POST` | `/api/v1/reorder/cadence` | Pharmacy | Saves standing replenishment delivery route schedule (Bi-Weekly, Weekly Sunday Van, Monthly). |

### 2.6 Janakpur Logistics & Route Optimization (4 APIs)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/logistics/routes/today` | Admin / Driver | Returns today's active route stops with coordinates across Ramanand, Pidari, Hospital Road, and Bhanu Chowk. |
| `POST` | `/api/v1/logistics/optimize-route` | Admin | Runs Travelling Salesperson Problem (TSP) algorithm to sequence waypoints, minimize mileage, and prioritize cold-chain packages. |
| `POST` | `/api/v1/logistics/dispatch-van` | Admin | Mass-dispatches all orders on a selected route van and assigns driver tracking credentials. |
| `GET` | `/api/v1/logistics/manifest/:vanId/pdf`| Admin / Driver | Streams printable driver delivery manifest PDF with signature checkpoints. |

### 2.7 Returns, Claims & Quarantine Management (4 APIs)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/returns` | Pharmacy | Submits a return claim for damaged packaging, near-expiry stock, or discrepancy with uploaded proof photos. |
| `GET` | `/api/v1/returns` | Pharmacy / Admin | Lists customer return claims with status (`PENDING`, `INSPECTION`, `APPROVED`, `CREDITED`, `REJECTED`). |
| `PATCH`| `/api/v1/returns/:id/review` | Admin | Approves return claim, places damaged units into quarantine inventory, and generates credit note voucher. |
| `GET` | `/api/v1/returns/:id/credit-note` | Pharmacy / Admin | Fetches credit note document (*e.g., CN-2026-0902*) applicable toward future orders. |

### 2.8 Credit Ledger, VAT Invoices & Settlements (4 APIs)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/billing/ledger` | Pharmacy / Admin | Fetches running credit ledger statements (Opening Balance, Invoices, Credit Notes, Payments, Net Due). |
| `GET` | `/api/v1/billing/invoices/:id` | Pharmacy / Admin | Retrieves official VAT invoice with DDA and IRD-compliant breakdowns. |
| `POST` | `/api/v1/billing/notify-payment` | Pharmacy | Submits remittance reference (Fonepay transaction code, bank deposit voucher) for admin clearance. |
| `GET` | `/api/v1/billing/monthly-summary/pdf`| Pharmacy / Admin | Generates downloadable PDF/CSV monthly reconciliation report for any selected month/year. |

### 2.9 Regional Epidemiological Mesh Trends (3 APIs)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/analytics/regional-trends` | Pharmacy / Admin | Returns anonymized, aggregated 12-month dispensing velocity curves across 84 Dhanusha/Siraha pharmacies. |
| `GET` | `/api/v1/analytics/seasonal-alerts` | Pharmacy / Admin | Returns active health alerts (e.g., Post-Monsoon Dengue surge, Winter Sheetlahar cold wave prep). |
| `POST` | `/api/v1/analytics/add-buffer-to-cart`| Pharmacy | Resolves recommended seasonal safety stock buffer into cart items with earliest FEFO batches. |

---

## 3. Database Schema (PostgreSQL DDL)

Below are the core relational tables required for PostgreSQL.

```sql
-- 1. Customers (Retail Pharmacies, Clinics, Sub-distributors)
CREATE TYPE customer_status AS ENUM ('UNDER_REVIEW', 'VERIFIED', 'SUSPENDED', 'RESUBMISSION_REQUIRED');

CREATE TABLE customers (
    id VARCHAR(36) PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    proprietor_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100) NOT NULL,
    phone VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    pan_vat_number VARCHAR(50) UNIQUE NOT NULL,
    business_reg_number VARCHAR(100) NOT NULL,
    dda_license_number VARCHAR(100) UNIQUE NOT NULL,
    pharmacist_name VARCHAR(255) NOT NULL,
    npc_registration_number VARCHAR(100) NOT NULL,
    license_expiry_date DATE NOT NULL,
    address_province VARCHAR(100) NOT NULL,
    address_district VARCHAR(100) NOT NULL,
    address_municipality VARCHAR(100) NOT NULL,
    address_ward VARCHAR(50) NOT NULL,
    address_street VARCHAR(255) NOT NULL,
    address_latitude NUMERIC(9,6),
    address_longitude NUMERIC(9,6),
    account_status customer_status DEFAULT 'UNDER_REVIEW',
    verification_notes TEXT,
    credit_limit NUMERIC(12,2) DEFAULT 0,
    used_credit NUMERIC(12,2) DEFAULT 0,
    payment_terms VARCHAR(100) DEFAULT 'Cash/Advance',
    tier VARCHAR(50) DEFAULT 'Standard Wholesale',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products & Formulations
CREATE TYPE product_classification AS ENUM ('NORMAL', 'PRESCRIPTION_REQUIRED', 'NARCOTIC_RESTRICTED');

CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    dosage_form VARCHAR(100) NOT NULL,
    strength VARCHAR(100) NOT NULL,
    pack_size VARCHAR(100) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    dda_reg_reference VARCHAR(100) NOT NULL,
    classification product_classification DEFAULT 'NORMAL',
    storage_condition TEXT NOT NULL,
    mrp NUMERIC(10,2) NOT NULL,
    wholesale_price NUMERIC(10,2) NOT NULL,
    moq INTEGER DEFAULT 1,
    is_cold_chain BOOLEAN DEFAULT FALSE,
    requires_prescription BOOLEAN DEFAULT FALSE,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Product Batches (FEFO Inventory Core)
CREATE TYPE batch_status AS ENUM ('ACTIVE', 'QUARANTINED', 'EXPIRED', 'DEPLETED');

CREATE TABLE product_batches (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) REFERENCES products(id) ON DELETE RESTRICTED,
    batch_number VARCHAR(100) NOT NULL,
    mfg_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    purchase_price NUMERIC(10,2) NOT NULL,
    wholesale_price NUMERIC(10,2) NOT NULL,
    status batch_status DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_product_batch UNIQUE (product_id, batch_number)
);

-- 4. Orders
CREATE TYPE order_status AS ENUM ('PLACED', 'CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED');

CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(36) REFERENCES customers(id) ON DELETE RESTRICTED,
    delivery_address TEXT NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    tax_amount NUMERIC(12,2) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status order_status DEFAULT 'PLACED',
    has_cold_chain BOOLEAN DEFAULT FALSE,
    crate_seal_number VARCHAR(100),
    assigned_van_id VARCHAR(50),
    driver_name VARCHAR(100),
    driver_phone VARCHAR(30),
    placed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Order Items with Allocated Batches
CREATE TABLE order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(36) REFERENCES products(id) ON DELETE RESTRICTED,
    batch_id VARCHAR(36) REFERENCES product_batches(id) ON DELETE RESTRICTED,
    batch_number VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    quantity_ordered INTEGER NOT NULL,
    quantity_fulfilled INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    line_total NUMERIC(12,2) NOT NULL
);

-- 6. Returns & Quality Claims
CREATE TYPE return_status AS ENUM ('PENDING', 'INSPECTION', 'APPROVED', 'CREDITED', 'REJECTED');

CREATE TABLE returns (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) REFERENCES orders(id),
    customer_id VARCHAR(36) REFERENCES customers(id),
    product_id VARCHAR(36) REFERENCES products(id),
    batch_number VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    status return_status DEFAULT 'PENDING',
    evidence_image_url VARCHAR(500),
    unit_price NUMERIC(10,2) NOT NULL,
    total_credit_value NUMERIC(12,2) NOT NULL,
    credit_note_number VARCHAR(50) UNIQUE,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 7. Invoices & Billing
CREATE TYPE payment_status AS ENUM ('PAID', 'PENDING', 'OVERDUE');

CREATE TABLE invoices (
    id VARCHAR(36) PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    order_id VARCHAR(36) REFERENCES orders(id),
    customer_id VARCHAR(36) REFERENCES customers(id),
    subtotal NUMERIC(12,2) NOT NULL,
    tax_amount NUMERIC(12,2) NOT NULL,
    grand_total NUMERIC(12,2) NOT NULL,
    date DATE NOT NULL,
    due_date DATE NOT NULL,
    payment_status payment_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Core Business Logic & Algorithmic Engines

### 4.1 First-Expiry, First-Out (FEFO) Engine
To comply with pharmaceutical regulations and avoid expired medicine write-offs, the database must never allocate inventory by LIFO or random selection.

* **Query Pattern**:
  ```sql
  SELECT id, batch_number, expiry_date, quantity, wholesale_price
  FROM product_batches
  WHERE product_id = $1 AND status = 'ACTIVE' AND quantity > 0
  ORDER BY expiry_date ASC
  FOR UPDATE; -- Locks batch rows during checkout transaction
  ```
* **Allocation Loop**:
  Iterates through earliest expiring batches until the order item quantity is fulfilled. If a batch contains 15 units and the customer orders 20, 15 units are allocated from Batch A, and the remaining 5 from Batch B.

### 4.2 Janakpur Logistics TSP Route Optimization
Computes the optimal delivery circuit starting from **Station Road Central Depot** across Janakpur's main medical nodes:
1. Ramanand Chowk (North-West)
2. Pidari Chowk (West Gateway)
3. Hospital Road / Janki Hospital (South-West)
4. Mujeliya Bypass Link (South Highway)
5. Bhanu Chowk (Center-East)
6. Central Depot Return

* **Algorithm**: Solves the Travelling Salesperson Problem using Euclidean / road matrix distance with a **Cold-Chain Priority Constraint** (temperature-sensitive deliveries are placed within the earliest 90-minute delivery window).

### 4.3 Smart Reorder Frequency Analyzer
Analyzes historical orders for each customer over 30/60/90 days:
* Calculates **Daily Consumption Velocity**: `Total Units Ordered in Past 60 Days / 60`
* Calculates **Estimated Shelf Days Remaining**: `(Last Order Qty * Estimated Remaining Ratio) / Daily Velocity`
* Flags **Depletion Imminent** when `Estimated Shelf Days <= 3` and auto-suggests replenishment quantity respecting the product's Minimum Order Quantity (MOQ).

---

## 5. What `server.js` Does & Its Architecture

In a production Node.js/Express environment, `server.js` (or `src/server.ts`) serves as the **application master entry point and orchestration layer**.

### Responsibilities of `server.js`:
1. **Environment Configuration**: Loads and validates environment variables (`PORT`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `CLIENT_URL`).
2. **Security & Performance Middlewares**:
   - `helmet()`: Sets secure HTTP response headers.
   - `cors()`: Enforces CORS policy (whitelisting only the frontend domain).
   - `express.json({ limit: '10mb' })`: Parses JSON request payloads.
   - `compression()`: Gzip-compresses API responses for low-bandwidth mobile connections.
   - `rateLimiter`: Protects against brute-force logins and endpoint flooding.
3. **Supabase Data API**: Connects to Supabase using the Project URL and a server-side service-role key.
4. **API Route Mounting**: Maps domain controllers to versioned routes (`/api/v1/auth`, `/api/v1/orders`, etc.).
5. **Static File Serving**: In production, serves bundled React assets (`dist/`) when deployed as a monolithic container.
6. **Global Error Boundary**: Catches unhandled promise rejections and standardizes API error JSON output.
7. **Graceful Shutdown**: Intercepts `SIGTERM` and `SIGINT` signals to finish pending SQL queries before closing connections.

---

## 6. Complete Production `server.js` Blueprint

You can directly build your backend using this battle-tested Express server template:

```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 1. Security & Core Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Set according to frontend CDN needs
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 2. Global Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', apiLimiter);

// 3. Healthcheck Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'Janakpur PharmaDistro Core API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 4. API Routes Mounting (Import from src/routes)
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/products', productRoutes);
// app.use('/api/v1/orders', orderRoutes);
// app.use('/api/v1/reorder', reorderRoutes);
// app.use('/api/v1/logistics', logisticsRoutes);
// app.use('/api/v1/returns', returnRoutes);
// app.use('/api/v1/billing', billingRoutes);
// app.use('/api/v1/analytics', analyticsRoutes);

// 5. Serve React Frontend in Production
if (NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 6. 404 Route Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Requested API endpoint not found.' });
});

// 7. Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err.stack || err.message);
  
  const statusCode = err.statusCode || 500;
  const message = NODE_ENV === 'production' && statusCode === 500
    ? 'Internal Server Error'
    : err.message || 'An unexpected error occurred.';

  res.status(statusCode).json({
    success: false,
    error: message,
    code: err.code || 'INTERNAL_ERROR',
  });
});

// 8. Server Boot & Graceful Shutdown
const server = app.listen(PORT, () => {
  console.log(`[PharmaDistro] Server running in ${NODE_ENV} mode on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('[PharmaDistro] SIGTERM received: closing HTTP server');
  server.close(() => {
    console.log('[PharmaDistro] HTTP server closed gracefully');
    process.exit(0);
  });
});
```

---

## 7. Recommended Backend Directory Structure

To keep the codebase maintainable as features expand, organize the backend repository using this layered architecture:

```
backend/
├── src/
│   ├── config/             # Database connection, env loader, JWT options
│   │   ├── db.js           # PostgreSQL Pool (pg or Prisma Client)
│   │   └── constants.js    # DDA license patterns, cold-chain temp thresholds
│   ├── controllers/        # Request parsing and response dispatching
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   ├── logisticsController.js
│   │   └── reorderController.js
│   ├── middlewares/        # Express request filters
│   │   ├── authGuard.js    # JWT verification & customer role check
│   │   ├── validate.js     # Joi / Zod request body validation
│   │   └── errorHandler.js # Centralized error formatter
│   ├── models/             # Database queries / ORM models
│   │   ├── Customer.js
│   │   ├── Product.js
│   │   ├── Batch.js
│   │   └── Order.js
│   ├── routes/             # Express Route definitions
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── logisticsRoutes.js
│   │   └── billingRoutes.js
│   ├── services/           # Reusable business logic & algorithms
│   │   ├── fefoService.js  # First-Expiry allocation algorithm
│   │   ├── tspRouter.js    # Janakpur route distance matrix & solver
│   │   ├── pdfGenerator.js # PDFKit / Puppeteer invoice & manifest renderer
│   │   └── fuzzyMatcher.js # Bulk requisition string distance matcher
│   ├── utils/              # Helper functions
│   │   ├── formatters.js   # NPR currency and Nepali date utilities
│   │   └── logger.js       # Winston / Morgan stream logger
│   └── server.js           # Express App Entry Point
├── migrations/             # SQL migration files
├── .env.example            # Environment template (NO SECRETS)
├── package.json
└── README.md
```

---

## 8. Step-by-Step Backend Build & Run Instructions

Follow these steps to initialize and run the backend locally or on a production cloud server:

### Step 1: Install Dependencies
```bash
npm install express cors helmet compression dotenv express-rate-limit @supabase/supabase-js jsonwebtoken bcryptjs
npm install -D nodemon @types/node @types/express
```

### Step 2: Configure Environment Variables (`.env`)
Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-side-service-role-key
JWT_SECRET=super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### Step 3: Run Database Migrations
Run the project migration SQL in the Supabase Dashboard SQL Editor. The Supabase
Data API does not execute arbitrary SQL migrations.

### Step 4: Start the Server
* **Development mode (auto-reload)**:
  ```bash
  npx nodemon src/server.js
  ```
* **Production mode**:
  ```bash
  node src/server.js
  ```

---

## 9. Security, DDA & GDP Regulatory Compliance

1. **Cold Chain Audit Logs**:
   Orders containing `PROD-007` (*Human Regular Insulin*) must record refrigerated van temperatures (*2°C to 8°C*) at dispatch and delivery confirmation timestamps.
2. **Immutable Batch Tracking**:
   Never allow physical deletion (`DELETE`) on the `product_batches` or `order_items` tables. All updates must use status transitions (`QUARANTINED`, `EXPIRED`, `DEPLETED`) to preserve audit trails for annual DDA drug inspections.
3. **Credit Lock Control**:
   The backend must reject orders at checkout if `customer.used_credit + order.total_amount > customer.credit_limit` unless the customer selects instant digital settlement (*Fonepay / Advance*).
