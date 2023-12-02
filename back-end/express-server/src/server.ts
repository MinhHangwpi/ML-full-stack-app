// running application on port, or set up db connection
import app from "./app.js";
import { API_PORT, NODE_ENV } from "./config.js";

app.listen(API_PORT, () => {
  console.log(`Server running on port ${API_PORT} of the ${NODE_ENV} environment`);
});