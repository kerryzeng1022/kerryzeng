"use client";

import type { DimensionScore } from "@/lib/types";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer
} from "recharts";

export function RadarChart({ scores }: { scores: DimensionScore[] }) {
  const data = scores.map((item) => ({
    dimension: item.dimensionName,
    score: item.score
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <RechartsRadarChart data={data}>
          <PolarGrid stroke="#ffd4dc" />
          <PolarAngleAxis dataKey="dimension" tick={{ fill: "#171717", fontSize: 11 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar dataKey="score" stroke="#f43f72" fill="#ff6b7a" fillOpacity={0.35} />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
