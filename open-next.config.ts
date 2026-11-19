import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/* `pnpm run build` is the Cloudflare build command and runs
   `opennextjs-cloudflare build`, which in turn needs the plain Next build:
   named here so it does not call `pnpm run build` again. */
export default {
  ...defineCloudflareConfig({}),
  buildCommand: "npx next build",
};
