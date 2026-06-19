import { Analytics } from "@vercel/analytics/react";
import Landing from "@/pages/Landing";
import Crm from "@/pages/Crm";

export default function App() {
  // Tiny path switch — the CRM lives at /crm. Everything else is the landing
  // page. Vercel rewrites all extension-less paths to index.html, so this SPA
  // serves /crm without a router dependency.
  const isCrm =
    typeof window !== "undefined" &&
    window.location.pathname.replace(/\/+$/, "") === "/crm";

  return (
    <>
      {isCrm ? <Crm /> : <Landing />}
      <Analytics />
    </>
  );
}
