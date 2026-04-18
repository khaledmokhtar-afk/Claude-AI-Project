import { HubLanding } from "./components/HubLanding";

export default function Page() {
  const urls = {
    risk:
      process.env.NEXT_PUBLIC_RISKLENS_URL ??
      "http://localhost:3001",
    scope:
      process.env.NEXT_PUBLIC_SCOPESMITH_URL ??
      "http://localhost:3002",
    estimator:
      process.env.NEXT_PUBLIC_ESTIMATOR_URL ??
      "http://localhost:3003",
  };
  return <HubLanding urls={urls} />;
}
