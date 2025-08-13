import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

const AVAILABILITY_KEY = ["availability"] as const;

export function useMyAvailability(userId?: string) {
  return useQuery({
    queryKey: [...AVAILABILITY_KEY, userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availability")
        .select("id, start_at, end_at, is_on, shareable, created_at, updated_at")
        .eq("user_id", userId!)
        .order("start_at", { ascending: true, nullsFirst: true });
      if (error) throw error;
      return data as Tables<"availability">[];
    },
  });
}

export function useCreateAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TablesInsert<"availability">) => {
      const { data, error } = await supabase.from("availability").insert(payload).select("*").single();
      if (error) throw error;
      return data as Tables<"availability">;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [...AVAILABILITY_KEY, variables.user_id] });
    },
  });
}

export function useUpdateAvailability(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TablesUpdate<"availability"> }) => {
      const { data, error } = await supabase.from("availability").update(patch).eq("id", id).select("*").single();
      if (error) throw error;
      return data as Tables<"availability">;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...AVAILABILITY_KEY, userId] });
    },
  });
}

export function useDeleteAvailability(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("availability").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...AVAILABILITY_KEY, userId] });
    },
  });
}
