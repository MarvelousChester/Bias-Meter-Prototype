"use client";
import BiasDetector from "./components/BiasDetector";
import { ResultCard } from "./components/ResultCard";
import { fetchDefinition } from "../lib/politicalTermService";

export default function Home() {
  return (
    <div className="">
      <BiasDetector />
    </div>
  );
}
