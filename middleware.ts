import { handleGenerateRequest } from "./lib/rewire-generate-handler";

export const config = {
  matcher: "/api/generate",
};

export default handleGenerateRequest;
