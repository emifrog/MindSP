import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Export routes pour /api/uploadthing
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
