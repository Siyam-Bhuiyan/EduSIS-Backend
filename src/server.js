// src/server.js
import dotenv from "dotenv";
dotenv.config();

import { initDB } from "./config/db.js";
import app from "./app.js";

const port = process.env.PORT || 5000;

(async () => {
  await initDB();
  app.listen(port, () => {
    console.log(`EDUSIS running on http://localhost:${port}`);
  });
})();
