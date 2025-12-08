import BiasDetector from "./components/BiasDetector";
import { ResultCard } from "./components/ResultCard";
import { fetchDefinition } from "../lib/politicalTermService";
import AiCreatedPanel from "./components/AiCreatedPanel";

export default function Home() {
  return (
    <div className="">
      <AiCreatedPanel />
    </div>
  );
}
