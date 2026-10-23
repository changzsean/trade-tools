import { setupCloudDatabase } from "./cloud-setup.ts";
import { recordStartupFailure } from "./cloud-errors.ts";

// Uploaded originals must never fall back to a container's temporary filesystem.
process.env.UPLOAD_STORE_REQUIRED = "true";
try {
  await setupCloudDatabase();
  await import("../apps/api/src/main.ts");
} catch (error) {
  await recordStartupFailure(error, "API");
  process.exit(1);
}
