# MediTrac — Barangay Health Center Medicine Inventory & Dispensing System (DBMS & SIA)

A web system for managing medicine inventory and patient dispensing across municipal health units and barangay satellite stations. A dispensing is only accepted if the medicine batch has sufficient stock, has not passed its expiration date, and is recorded under atomic transaction integrity.

**Major feature:** Automated First-Expired, First-Out (FEFO) batch prioritization across satellite stations with real-time stock deductions, safety-stock reorder thresholds, and automated expired-batch quarantine alerts.

**Stack:** Node.js + Express (MVC REST API), MySQL (`mysql2/promise`), plain HTML5/CSS3/Vanilla JS

---

## Group roster and ownership matrix

| Member | GitHub username | Tables | Endpoints / screens | Join report and join type | Feature role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Raul A. Generoso III** | `Kuze-kun12` | `users`, `roles`, `announcements` | `POST /login`, `GET/POST/DELETE /api/announcements`; `index.html`, `dashboard.html` | announcements + users: **INNER** | Core Authentication & Announcements |
| **Fea Ann Villarba** | `feaann` | `dispensing_records`, `dispensing_items` | `GET /api/dispensing-options`, `GET/POST /api/dispensing-records`, `GET /api/barangay-summary`; `pharmacist.html` | dispensing details: **INNER** | Dispensing Transactions |
| **TinZ** | `TinZ` | `medicines`, `medicine_batches`, `stock_movements` | `GET/POST/PUT/DELETE /api/data`, `GET /api/reports/full-outer-medicines`; `dashboard.html` | medicines + batches: **FULL OUTER (UNION)** | Medicine Inventory & Batch Management |
| **Xian Xavier** | `xianxavier` | `patients`, `health_stations` | `GET/POST/PUT/DELETE /api/patients`, `GET /api/health-stations`, `GET /api/reports/right-join`; `pharmacist.html`, `dashboard.html` | health stations + batches: **RIGHT** | Patient Records & Health Station Directory |
| **Jero Erwin Lombrio** | `zezktokam69` | `stations`, `station_inventory` | `GET/POST/PUT/DELETE /api/stations`, `GET /api/station-summary`; `healthworker.html` | station inventory details: **INNER** | Station Management |

**Total:** 5 assigned feature slices.  
**Core responsibility:** Raul owns the overall system core, authentication, and announcement endpoints with frontend support. 
**Ownership per module:**
- `authModel.js` + authentication flow + announcements = Raul
- `dispensingController.js` + `dispensingModel.js` + routes = Fea
- `medicineController.js` + `medicineModel.js` + routes = TinZ
- `patientController.js` + `patientModel.js` + routes = Xian Xavier
- `stationController.js` + `stationModel.js` + routes = Jero

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
| `POST` | `/login` | A | User authentication & role-based redirect (`index.html`) |
| `GET` | `/api/announcements` | A | **INNER JOIN**: Announcements with Users (`posted_by`) |
| `POST` | `/api/announcements` | A | Create announcement with validation (`title`, `body`) |
| `DELETE` | `/api/announcements/:id` | A | Delete announcement by ID (with 404 check) |
| `GET` | `/api/data` | B | Retrieve all active medicines with batch details |
| `GET` | `/api/data/:id` | B | Retrieve single medicine by ID |
| `POST` | `/api/data` | B | Create new generic medicine and initial batch |
| `PUT` | `/api/data/:id` | B | Update medicine specifications |
| `DELETE` | `/api/data/:id` | B | Cascading transactional deletion of medicine |
| `GET` | `/api/reports/full-outer-medicines` | B | **FULL OUTER JOIN (UNION)**: Medicines & Batches |
| `GET` | `/api/dispensing-options` | C | Dropdown options (stations, batches, patients) |
| `GET` | `/api/dispensing-records` | C | Retrieve recent dispensing audit log |
| `POST` | `/api/dispensing-records` | C | Dispense medicine; returns `400`/`409` on insufficient stock |
| `GET` | `/api/barangay-summary` | C | **INNER JOIN**: Total medicine disbursements per station |
| `GET` | `/api/patients` | D | Retrieve all registered patients |
| `GET` | `/api/patients/:id` | D | Retrieve single patient record |
| `POST` | `/api/patients` | D | Register new patient demographic record |
| `PUT` | `/api/patients/:id` | D | Update patient demographic record |
| `DELETE` | `/api/patients/:id` | D | Delete patient record |
| `GET` | `/api/health-stations` | D | Directory of satellite health stations |
| `GET` | `/api/reports/right-join` | D | **RIGHT JOIN**: All health stations & stationed batches |
| `GET` | `/api/alerts` | E | Active Low-Stock and Expiry alerts |
| `POST` | `/api/alerts` | E | Create manual inventory alert |
| `PUT` | `/api/alerts/:id/resolve` | E | Mark alert as resolved |
| `DELETE` | `/api/alerts/:id` | E | Delete alert record |
| `GET` | `/api/fefo` | E | **FEFO Prioritization**: Batches ordered by expiry ASC |
| `GET` | `/api/joined-medicines` | E | **INNER JOIN**: Medicines with Categories & Suppliers |
| `GET` | `/api/reports/missing-batches` | E | **LEFT JOIN**: Medicines with missing/zero batches |
