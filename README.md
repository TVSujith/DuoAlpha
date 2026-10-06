# DuoAlpha — Institutional Trading Team Platform

> *"Trade Together. Grow Together."*

**DuoAlpha** is a full-featured, private web application designed specifically for a two-person trading team (**Sujith & Bhuvana**). It combines real-time capital management, profit/loss tracking, quant analytics, risk controls, exportable reports, and a real-time trading floor chat system (**Alpha Room**).

---

## ⚡ Highlights & Brand Identity

- **Theme**: Luxury Hedge Fund Trading Terminal
- **Background**: Deep Black (`#07080A`)
- **Primary Accent**: Neon Green (`#00E676`)
- **Secondary Accent**: Cyan (`#00E5FF`)
- **Currency**: Indian Rupee (`₹` INR)
- **Team**: Sujith & Bhuvana

---

## 🔒 Security & Authentication

- **Single Master Account Only** (No public sign-up):
  - **Username**: `BhuvSusz`
  - **Password**: `Krishna@0204`
- Validated via secure backend bcrypt hashing and session JWT tokens.
- Persistent session until explicit logout.

---

## 📈 Key Modules

### 1. DuoAlpha Peak Transition
- Cinematic canvas and SVG startup sequence upon successful login.
- Market-style peaks surge upward resembling an explosive bull rally.
- Peaks converge and morph into the illuminated typography **DUOALPHA** followed by *"Trade Together. Grow Together."* before transitioning into the dashboard.

### 2. Master Dashboard
- **Current Capital**: Real-time balance computed as `(Deposits - Withdrawals) + Net Trading P&L`.
- **Performance Cards**:
  - Net Overall P&L
  - Today's P&L
  - Monthly P&L
  - Gross Profit & Gross Loss
- **Monthly Profit Goal Widget**: Visual progress bar with completion percentage.
- **Risk Control Monitor**: Active alert system tracking daily drawdown vs. Maximum Daily Loss Limit.

### 3. Capital Management
- Support for **Deposit Funds** and **Withdraw Funds** with transaction memos and dates.
- Instant automatic synchronization of deployable equity.
- Complete chronological funding ledger.

### 4. Trading Entries & History
- Quick trade entry form: `Date`, `Amount (+ profit / - loss)`, and `Notes`.
- Positive values increase profit, negative values increase loss.
- Search, filter by profit/loss, sort by date/amount, inline edit, and delete.

### 5. Analytics & Performance
- **Daily Profit/Loss Graph**: Interactive vertical bar chart.
- **Monthly Profit/Loss Graph**: Period aggregates.
- **Capital Growth Curve**: Glowing cyan equity trajectory curve.
- **Quant Metrics**: Best Day, Worst Day, Winning Days, Losing Days, Win Rate %.

### 6. Reports & Data Exports
- Monthly Performance Summary table.
- **CSV Export**: Direct download of trade ledger.
- **Excel Export (`.xlsx`)**: Multi-sheet workbook with Trades and Capital Ledger.
- **Institutional PDF Export (`.pdf`)**: Auditor-ready formatted report via jsPDF.

### 7. Alpha Room (Real-Time Team Chat)
- Real-time instant messaging powered by WebSockets (`Socket.io`).
- Switchable active chat persona between **Sujith** and **Bhuvana**.
- Unread message count badge, timestamps, typing indicators, auto-scroll, and synthesized audio chimes.
- Persistent message storage in SQLite database.

### 8. Risk Management & Goals
- **Maximum Daily Loss Limit**: Triggers critical warning *"Daily Loss Limit Reached"* if intraday drawdown exceeds threshold.
- **Monthly Profit Goal**: Triggers celebratory confetti upon reaching milestone.

### 9. Database Backup & Disaster Recovery
- Download binary SQLite `.db` snapshot.
- Portable JSON backup export and restore.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- npm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/TVSujith/DuoAlpha.git
   cd DuoAlpha
   ```

2. **Install dependencies**:
   ```bash
   npm run install:all
   ```

3. **Build Frontend**:
   ```bash
   npm run build:client
   ```

4. **Launch Server**:
   ```bash
   npm start
   ```
   Open **http://localhost:5000** in your browser.

### Windows One-Click Launch
Double-click `run_duoalpha.bat` in the project root to automatically start backend and frontend services.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, SQLite (`sqlite3`), `Socket.io`, `bcryptjs`, `jsonwebtoken`, `xlsx`, `multer`
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, `canvas-confetti`, `jspdf`, `jspdf-autotable`, `socket.io-client`

---

## 📜 License
Private proprietary trading terminal for DuoAlpha team.
