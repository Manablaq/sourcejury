"use client";

import { useQuery } from "@tanstack/react-query";
import { readCourtSnapshot } from "@/lib/genlayer";

export function useCourt() {
  return useQuery({
    queryKey: ["sourcejury", "court-snapshot"],
    queryFn: readCourtSnapshot,
    refetchInterval: 15_000
  });
}
