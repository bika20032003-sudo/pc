# AGENTS.md

Canonical instruction and policy file for **منظومة مديرية أمن أوباري - وزارة الداخلية**.
Shared by all coding agents and assistants.

---

## 🏛️ Project Overview & Architecture

* **System Name**: منظومة مديرية أمن أوباري | قاعدة البيانات المركزية المعتمدة
* **Authority**: وزارة الداخلية - دولة ليبيا (Ministry of Interior - Libya)
* **Frontend**: React (Vite, SPA, Single-Page Architecture), Lucide React, Leaflet maps.
* **Backend**: Node.js, Express, bcrypt password hashing, CORS protection.
* **Database**: Local JSON storage (`force_data.json`, `vehicles_data.json`) with persistent API controllers and MySQL/PostgreSQL migration hooks.
* **Official Branding**:
  * Navy Blue: `#1e3a8a` / `#0a192f`
  * Official Gold: `#d4af37`
  * Official Ministry Banner Ribbon: 4-color Libyan flag ribbon on all cards & tables.
  * Font: Cairo (`font-family: 'Cairo', sans-serif`).

---

## ⚙️ Core Operational Commands

* **Client Dev**: `cd client && npm run dev` (Port: `http://localhost:5173`)
* **Client Build**: `cd client && npm run build` (Outputs to `client/dist`)
* **Server Dev**: `cd server && node src/index.js` (Port: `http://localhost:5050`)
* **Health Check**: `GET http://localhost:5050/api/health`
* **Live Deployment**: `client/dist` is pushed to branch `gh-pages` at `https://bika20032003-sudo.github.io/pc/`.

---

## 🛠️ Adopted Skills Framework (35 Skills)

All 35 skills in `skills/` are fully active and enforced:

1. **Architecture & Anti-Koshary**:
   * No layer collapse. Keep views, controllers, and components modular.
   * Do not inline multi-thousand line components inside `App.jsx`.
   * Keep `ForceSection.jsx` and other `*Section.jsx` components strictly modular.

2. **Arabic Text Normalization**:
   * Always import and use `normalizeArabicText` from `utils/arabicUtils.js` on both client and server when performing searches, comparisons, or filtering.

3. **Security Standards**:
   * Never introduce plaintext password comparison or backdoor bypasses.
   * All passwords must be verified via bcrypt hashes.
   * Keep CORS restricted to legitimate production & local domains.

4. **Incremental Implementation**:
   * Deliver changes in thin, verifiable slices.
   * Verify every code change with `npm run build` in `client` before committing.

5. **Data Preservation**:
   * The central dataset comprises 2,211+ personnel records (قوة 2222) and 92+ vehicles.
   * Never destroy or truncate the central dataset during imports or updates.

