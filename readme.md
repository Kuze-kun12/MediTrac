# MediTrac — Barangay Health Center Medicine Inventory & Dispensing System (DBMS & SIA)

A web system for managing medicine inventory and patient dispensing across municipal health units and barangay satellite stations. A dispensing is only accepted if the medicine batch has sufficient stock, has not passed its expiration date, and is recorded under atomic transaction integrity.

**Major feature:** Automated First-Expired, First-Out (FEFO) batch prioritization across satellite stations with real-time stock deductions, safety-stock reorder thresholds, and automated expired-batch quarantine alerts.

**Stack:** Node.js + Express (MVC REST API), MySQL (`mysql2/promise`), plain HTML5/CSS3/Vanilla JS

---

## Group roster and ownership matrix

| Member | GitHub username | Tables | Endpoints | Feature role |
| :--- | :--- | :--- | :--- | :--- |
| **Raul A. Generoso III** | `Kuze-kun12` | `users`, `roles`, `announcements` | `POST /login`, `GET/POST/DELETE /api/announcements` | Core Authentication + Announcements; shared frontend owner |
| **Fea Ann Villarba** | `feaann` | `dispensing_records`, `dispensing_items` | `GET /api/dispensing-options`, `GET /api/dispensing-records`, `POST /api/dispensing-records`, `GET /api/barangay-summary` | Dispensing Transactions |
| **Tinio** | `TinZ` | `medicines`, `medicine_batches`, `stock_movements` | `GET /api/data`, `POST /api/data`, `PUT /api/data/:id`, `DELETE /api/data/:id`, `GET /api/alerts`, `GET /api/fefo`, `GET /api/joined-medicines`, `GET /api/reports/missing-batches`, `GET /api/reports/full-outer-medicines` | Medicine Inventory & Batch Management |
| **Bulata** | `bulata` | `patients`, `health_stations` | `GET /api/patients`, `GET /api/patients/:id`, `POST /api/patients`, `PUT /api/patients/:id`, `DELETE /api/patients/:id`, `GET /api/health-stations`, `GET /api/reports/right-join` | Patient Records & Health Station Directory |
| **Jero** | `zezktokam69` | `stations` | `GET /api/health-stations` | Station Management |
| **Remollo** | `ermico-remollo` | `database schema`, `ERD design`, `entity relationships` | `schema`, `query.sql`, `insert_table.sql`, `meditrac.drawio` | Database Design & ER Diagram |
| **Janio** | `lea-janio` | `database schema`, `ERD design`, `entity relationships` | `schema`, `query.sql`, `insert_table.sql`, `meditrac.drawio` | Database Design & ER Diagram |

**Total:** 7 assigned feature slices.  
**Core responsibility:** Raul owns the system core, authentication, announcement endpoints, and the shared frontend across the project.  
**Ownership per module:**
- `authModel.js` + authentication flow + `announcementRoutes.js` = Raul
- `dispensingController.js` + `dispensingModel.js` + `dispensingRoutes.js` = Fea
- `medicineController.js` + `medicineModel.js` + `medicineRoutes.js` = TinZ
- `patientController.js` + `patientModel.js` + `patientRoutes.js` = Bulata
- `stationController.js` + `stationModel.js` + `stationRoutes.js` = Jero
- `query.sql` + `insert_table.sql` + ER diagram design = Ermico Remollo + Lea Janio

**Frontend note:** All UI pages are created and maintained by Raul, while backend modules remain assigned to their respective team members.

---

## ER diagram & Architecture Diagrams

- **Interactive Multi-Page Draw.io Files:**
  - [`system_architecture.drawio`](system_architecture.drawio) — Contains 5 tabs:
    1. *Master Overview (Donkey-Simple System Explanation)*
    2. *MVC Architecture Explained (The Restaurant Analogy vs MediTrac)*
    3. *8-Step Request Flow (Dispensing Medicine end-to-end)*
    4. *FEFO & Safety Alert Engine (Business Rules & Edge Cases)*
    5. *16-Table Relational ER Diagram*
  - [`meditrac.drawio`](meditrac.drawio) — Complete course workbook file with all diagrams and database ERD.
- **ER Diagram Visual:** [`meditrac.png`](meditrac.png)

---

## Setup (every member)

1. Install **Node.js** (v18 or newer; v22/24 LTS recommended), **MySQL Server**, and **MySQL Workbench**.
2. Run `npm install` in the project root.
3. Copy `.env.example` to `.env` and set `DB_PASSWORD` to your own local MySQL root password. Never commit `.env`.
   ```bash
   cp .env.example .env        # Windows: copy .env.example .env
   ```
4. Build the database from `query.sql` and `insert_table.sql`:
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS Meditrac;"
   mysql -u root -p Meditrac < query.sql
   mysql -u root -p Meditrac < insert_table.sql
   ```
5. `npm start`, then open `http://localhost:3000` in your browser.
6. Demo logins:
   - **Administrator:** `admin_jane` / `pass123`
   - **Pharmacist:** `pharma_john` / `pass123`
   - **Health Worker:** `worker_sarah` / `pass123`

---

## Rules

- Work on your own branch (for example `feature/member-c-dispensing`) and open a pull request into `main`.
- Only edit your own slice's files. Consult the group lead (`Kuze-kun12`) before touching `backend/config/db.js`, `query.sql`, `insert_table.sql`, or `backend/server.js`.
- Models must use `async/await` with parameterized queries (`db.query('SELECT ... WHERE id = ?', [id])` via `mysql2/promise`). Never use raw string interpolation to prevent SQL injection.
- After anyone changes `query.sql` or `insert_table.sql`, everyone pulls and re-runs the database import scripts.

---

## How to run

Requires **Node.js 18.0 or newer** (Node 22 LTS recommended).

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env          # Windows CMD: copy .env.example .env

# 3. Import schema and seed data into MySQL
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS Meditrac;"
mysql -u root -p Meditrac < query.sql
mysql -u root -p Meditrac < insert_table.sql

# 4. Start the application
npm start                     # Runs Express on http://localhost:3000
```

**Demo logins:**
- `admin_jane` / `pass123` (Admin Portal: `dashboard.html`)
- `pharma_john` / `pass123` (Pharmacist Portal: `pharmacist.html`)
- `worker_sarah` / `pass123` (Health Worker Portal: `healthworker.html`)

---

## Folder structure

```
MediTrac/
├─ README.md
├─ .gitignore
├─ .env.example
├─ system_architecture.drawio   # Complete architecture, MVC & FEFO diagrams (5 tabs)
├─ meditrac.drawio              # 16-table ER diagram & system diagrams
├─ meditrac.png                 # Exported ER diagram preview
├─ query.sql                    # 16-table DDL schema & constraints
├─ insert_table.sql             # Seed data for demo accounts, inventory, and clinics
├─ package.json
├─ backend/
│  ├─ server.js                 # Starts Express server & serves frontend pages
│  ├─ config/
│  │  └─ db.js                 # MySQL connection pool (mysql2/promise)
│  ├─ controllers/             # *.controller.js: request/response + status codes
│  │  ├─ authController.js
│  │  ├─ dispensingController.js
│  │  ├─ medicineController.js
│  │  ├─ patientController.js
│  │  └─ stationController.js
│  ├─ models/                  # *.model.js: SQL queries + transactions
│  │  ├─ authModel.js
│  │  ├─ dispensingModel.js
│  │  ├─ medicineModel.js
│  │  ├─ patientModel.js
│  │  └─ stationModel.js
│  ├─ routes/                  # *.routes.js: URL → Controller handlers
│  │  ├─ authRoutes.js
│  │  ├─ dispensingRoutes.js
│  │  ├─ medicineRoutes.js
│  │  ├─ patientRoutes.js
│  │  ├─ stationRoutes.js
│  │  └─ announcementRoutes.js
│  └─ utils/
│     └─ response.js           # Standard response helpers: ok() and bad()
├─ frontend/
│  ├─ index.html               # Login gateway & role-based routing
│  ├─ dashboard.html           # Admin: inventory CRUD, alert monitoring
│  ├─ pharmacist.html          # Pharmacist: dispensing interface & distribution log
│  ├─ healthworker.html        # Health Worker: read-only satellite stock viewer
│  └─ css/
│     └─ style.css             # Shared responsive CSS styling
└─ utilities/
   ├─ git-semantic-push.sh     # Commit helper script
   └─ usefull_utility.md       # Git guidelines & cheat sheet
```

---

## API response format

```json
// Success response (200 OK / 201 Created)
{
  "success": true,
  "message": "Dispensed successfully.",
  "item": {
    "record_id": 42,
    "batch_id": 5,
    "qty": 10
  }
}

// Error response (400 / 401 / 404 / 409 / 500)
{
  "success": false,
  "message": "Station, medicine batch, and quantity are required."
}
```

**Status codes:**
- `200 OK`: Request succeeded.
- `201 Created`: Resource created (e.g. medicine added, dispensing logged).
- `400 Bad Request`: Validation failure or missing required fields.
- `401 Unauthorized`: Invalid credentials or unauthenticated session.
- `404 Not Found`: Target ID or medicine does not exist.
- `409 Conflict`: Insufficient inventory stock or expired batch requested.
- `500 Server Error`: Database query or connection exception.

---

## Endpoints

| Method | URL | Owner | Notes |
| :--- | :--- | :--- | :--- |
| `POST` | `/login` | Raul | User authentication & role-based redirect (`index.html`) |
| `GET` | `/api/announcements` | Raul | **INNER JOIN**: Announcements with Users (`posted_by`) |
| `POST` | `/api/announcements` | Raul | Create announcement with validation (`title`, `body`) |
| `DELETE` | `/api/announcements/:id` | Raul | Delete announcement by ID (with 404 check) |
| `GET` | `/api/data` | TinZ | Retrieve all active medicines with batch details |
| `GET` | `/api/data/:id` | TinZ | Retrieve single medicine by ID |
| `POST` | `/api/data` | TinZ | Create new generic medicine and initial batch |
| `PUT` | `/api/data/:id` | TinZ | Update medicine specifications |
| `DELETE` | `/api/data/:id` | TinZ | Cascading transactional deletion of medicine |
| `GET` | `/api/reports/full-outer-medicines` | TinZ | **FULL OUTER JOIN (UNION)**: Medicines & Batches |
| `GET` | `/api/dispensing-options` | Fea | Dropdown options (stations, batches, patients) |
| `GET` | `/api/dispensing-records` | Fea | Retrieve recent dispensing audit log |
| `POST` | `/api/dispensing-records` | Fea | Dispense medicine; returns `400`/`409` on insufficient stock |
| `GET` | `/api/barangay-summary` | Fea | **INNER JOIN**: Total medicine disbursements per station |
| `GET` | `/api/patients` | Bulata | Retrieve all registered patients |
| `GET` | `/api/patients/:id` | Bulata | Retrieve single patient record |
| `POST` | `/api/patients` | Bulata | Register new patient demographic record |
| `PUT` | `/api/patients/:id` | Bulata | Update patient demographic record |
| `DELETE` | `/api/patients/:id` | Bulata | Delete patient record |
| `GET` | `/api/health-stations` | Jero | Directory of satellite health stations |
| `GET` | `/api/reports/right-join` | Bulata | **RIGHT JOIN**: All health stations & stationed batches |
| `GET` | `/api/alerts` | TinZ | Active Low-Stock and Expiry alerts |
| `POST` | `/api/alerts` | TinZ | Create manual inventory alert |
| `PUT` | `/api/alerts/:id/resolve` | TinZ | Mark alert as resolved |
| `DELETE` | `/api/alerts/:id` | TinZ | Delete alert record |
| `GET` | `/api/fefo` | TinZ | **FEFO Prioritization**: Batches ordered by expiry ASC |
| `GET` | `/api/joined-medicines` | TinZ | **INNER JOIN**: Medicines with Categories & Suppliers |
| `GET` | `/api/reports/missing-batches` | TinZ | **LEFT JOIN**: Medicines with missing/zero batches |
