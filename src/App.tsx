import { Analytics } from "@vercel/analytics/react";
import Landing from "@/pages/Landing";

export default function App() {
  return (
    <>
      <Landing />
      <Analytics />
    </>
  );
}
