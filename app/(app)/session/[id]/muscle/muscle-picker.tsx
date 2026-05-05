"use client";

import { useRouter } from "next/navigation";
import { MuscleGrid } from "@/components/peak/muscle-grid";
import type { MuscleGroup } from "@/lib/constants";

export function MusclePicker({
  sessionId,
  setsByMuscleThisWeek,
}: {
  sessionId: string;
  setsByMuscleThisWeek: Record<string, number>;
}) {
  const router = useRouter();
  const onSelect = (m: MuscleGroup) => {
    router.push(`/session/${sessionId}/exercise?muscle=${encodeURIComponent(m)}`);
  };
  return <MuscleGrid onSelect={onSelect} setsByMuscleThisWeek={setsByMuscleThisWeek} />;
}
