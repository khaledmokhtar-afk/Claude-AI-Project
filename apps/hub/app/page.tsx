import { HubLanding } from "./components/HubLanding";

export default function Page() {
  const urls = {
    risk: "/suite/risk",
    scope: "/suite/scope",
    estimator: "/suite/estimator",
  };
  return <HubLanding urls={urls} />;
}
