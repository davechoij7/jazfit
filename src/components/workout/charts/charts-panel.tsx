"use client";

import { useState } from "react";
import { ProgressChart } from "./progress-chart";
import { VolumeChart } from "./volume-chart";
import { FrequencyChart } from "./frequency-chart";
import { PRList } from "./pr-list";
import type { ChartsData } from "@/actions/charts";

type Tab = "Progress" | "Volume" | "Frequency" | "PRs";
const TABS: Tab[] = ["Progress", "Volume", "Frequency", "PRs"];

interface Props {
  chartsData: ChartsData;
}

export function ChartsPanel({ chartsData }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Progress");

  const lastSessionDate =
    chartsData.prData.length > 0
      ? chartsData.prData.reduce((latest, pr) =>
          pr.date > latest ? pr.date : latest,
          ""
        )
      : null;

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "rgba(240, 196, 206, 0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.25)",
      }}
    >
      {/* Tab bar */}
      <div className="flex border-b border-border mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-medium transition-colors touch-manipulation ${
              activeTab === tab
                ? "text-accent border-b-2 border-accent -mb-px"
                : "text-text-dim"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Chart content */}
      {activeTab === "Progress" && (
        <ProgressChart
          strengthData={chartsData.strengthData}
          exerciseNames={chartsData.exerciseNames}
        />
      )}
      {activeTab === "Volume" && <VolumeChart volumeData={chartsData.volumeData} />}
      {activeTab === "Frequency" && (
        <FrequencyChart frequencyData={chartsData.frequencyData} />
      )}
      {activeTab === "PRs" && (
        <PRList prData={chartsData.prData} lastSessionDate={lastSessionDate} />
      )}
    </div>
  );
}
