# App Layer

This folder is reserved for application composition code.

Use this directory for:
- Express app factory (middleware + route wiring split from `server.js`)
- Dependency wiring / DI containers
- App-level startup helpers shared by tests and runtime

Current status:
- Runtime still boots from `backend/server.js`
- Folder kept intentionally to avoid mixing app-composition code into domain modules
