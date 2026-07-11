import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.PORT, () => {
  console.log(`JSS API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});
