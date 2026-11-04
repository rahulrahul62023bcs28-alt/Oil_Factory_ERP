# 🛢️ Oil Factory Management System (SmartOil ERP)

An enterprise-grade, full-stack Oil Factory ERP and Real-Time Management System powered by **React**, **Node.js/Express**, **MongoDB**, **Socket.io**, and **Python Scikit-Learn Machine Learning**.

---

## 🌟 Overview

The **Oil Factory Management System** streamlines end-to-end operations of edible oil extraction and refining plants. From procurement of raw seeds (Groundnut, Sunflower, Mustard, Sesame, Coconut) to real-time silo/tank monitoring, production batch tracking, automated oil yield forecasting, sales order dispatching, and employee workforce management.

---

## 🚀 Key Modules & Capabilities

1. **📊 Executive Dashboard & Live Telemetry**
   - Real-time inventory tank fill gauges with visual danger thresholds.
   - Live revenue, gross sales, active batches, and monthly production KPIs.
   - Real-time socket events for multi-user instant synchronization.

2. **📦 Inventory & Storage Tank Management**
   - Multi-tank tracking (Raw Seeds & Finished Extracted Oils).
   - Capacity safeguards, re-order level alerts, and real-time level updates.

3. **⚙️ Production & Extraction Batch Tracking**
   - Batch lifecycle management (`In Progress`, `Completed`, `Quality Check`).
   - Automated conversion calculations (Raw Seed Input Kg ➔ Oil Liters Extracted).
   - Extraction efficiency tracking against benchmark yields.

4. **🤖 Python Scikit-Learn Machine Learning Engine**
   - **Algorithm**: Ordinary Least Squares (OLS) Linear Regression (`y = m*x + c`).
   - Trained on historical batch extraction records (`ml/dataset.csv`).
   - Predicts expected oil output in Liters from raw seed input in Kilograms.
   - Evaluated with $R^2$ Score and Mean Absolute Error (MAE).
   - Seamlessly integrated with the Node.js backend via child process execution and Node.js fallback statistical engine.

5. **🌾 Supplier Intake & Procurement Ledger**
   - Vendor intake records, vehicle numbers, moisture percentages, and settlement balances.
   - Instant automated stock increment into seed silos upon delivery confirmation.

6. **🛒 Sales Orders & Invoicing**
   - Customer order management, payment statuses (`Paid`, `Pending`, `Partial`).
   - Automated inventory deduction upon order dispatch with stock validation.

7. **👥 Workforce & Employee Management**
   - Shift scheduling (Morning, Evening, Night), attendance records, and salary tracking.

8. **🔐 Security & Role-Based Access Control (RBAC)**
   - JWT-based authentication with bcrypt password encryption.
   - Roles: `Admin`, `Factory Manager`, `Operator`, `Staff`.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide React, Axios, Socket.io-client |
| **Backend** | Node.js, Express.js, MongoDB / Mongoose, Socket.io, JSON Web Tokens (JWT), Bcrypt |
| **Machine Learning** | Python 3, Scikit-Learn, Pandas, NumPy, Ordinary Least Squares (OLS) |
| **Development** | Concurrently, Oxlint |

---

## 📁 Repository Structure

```text
OilFactory/
├── backend/                  # Node.js & Express API
│   ├── src/
│   │   ├── config/           # Database connection (MongoDB)
│   │   ├── controllers/      # Route controllers (Auth, Inventory, Production, etc.)
│   │   ├── middlewares/      # JWT Auth & Role guards
│   │   ├── ml/               # Python ML integration runner
│   │   ├── models/           # Mongoose Data Models (User, Inventory, Batch, etc.)
│   │   ├── routes/           # Express REST API routes
│   │   ├── seed/             # Database initialization seed script
│   │   ├── services/         # Socket.io & AI statistics engines
│   │   └── server.js         # HTTP server entrypoint
│   └── package.json
├── frontend/                 # React 19 + Vite Application
│   ├── public/               # Static assets & SVG icons
│   ├── src/
│   │   ├── components/       # UI Modules (Dashboard, Inventory, Production, ML, etc.)
│   │   ├── context/          # React Contexts (AuthContext, DataContext, ThemeContext)
│   │   ├── services/         # API client & WebSocket listeners
│   │   ├── App.jsx           # Main application view & router
│   │   └── main.jsx          # React DOM root
│   └── package.json
├── ml/                       # Machine Learning Datasets & Scripts
│   ├── dataset.csv           # Historical seed weight vs. oil yield records
│   └── train_model.py        # Scikit-learn regression training & inference script
├── oil_yield_model.py        # Standalone ML regression CLI runner
├── package.json              # Root workspace orchestrator
└── README.md
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Node.js** (v18.x or later)
- **MongoDB** (Local instance on port 27017 or MongoDB Atlas URI)
- **Python** (v3.9+ with `scikit-learn`, `pandas`, `numpy` installed)

---

### 1. Clone the Repository
```bash
git clone https://github.com/Raghul173/Oil_Factory_Management.git
cd Oil_Factory_Management
```

### 2. Install Dependencies

You can install all root, backend, and frontend dependencies:
```bash
# Install root orchestrator dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

cd ..
```

### 3. Setup Python ML Environment
```bash
pip install scikit-learn pandas numpy
```

---

### 4. Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/oilfactory
JWT_SECRET=smartoil_enterprise_jwt_super_secret_key_2026
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
NODE_ENV=development
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

### 5. Seed Database (Optional)
Populate default inventory tanks, sample suppliers, and an admin user:
```bash
cd backend
npm run seed
cd ..
```

---

### 6. Run the Application

**Run both Frontend & Backend concurrently from the root directory:**
```bash
npm run dev
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Socket.io**: Connected live on port 5000

---

## 🧪 Machine Learning CLI Testing

You can directly run the Python regression model CLI:
```bash
# Predict Groundnut Oil yield for 1,500 Kg of raw seeds
python ml/train_model.py --oil "Groundnut Oil" --seeds 1500

# Or run the root model script
python oil_yield_model.py --oil "Sunflower Oil" --seeds 2000
```

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
