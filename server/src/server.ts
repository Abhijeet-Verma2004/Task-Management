import { app } from "./app";
import { env } from "./utils/env";

app.listen(env.PORT, () => {
  console.log(`API running on port ${env.PORT}`);
});
