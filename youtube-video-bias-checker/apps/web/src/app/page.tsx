"use client";
import BiasDetector from "./components/BiasDetector";
import { ResultCard } from "./components/ResultCard";
import { fetchDefinition } from "./politicalTermService";

export default function Home() {
  fetchDefinition("Collectivism")
    .then((definition) => {
      console.log("Definition:", definition);
    })
    .catch((error) => {
      console.error("Error fetching definition:", error);
    });

  return (
    <div className="">
      <ResultCard />
    </div>
  );
}
