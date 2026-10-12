import { redirect } from "next/navigation";
import OshiApp from "@/components/OshiApp";
import { normalize } from "@/lib/oshi";
import { createClient } from "@/lib/supabase/server";
import type { Oshi } from "@/lib/types";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase.from("oshis").select("id, data").order("created_at", { ascending: true });
  const oshis: Oshi[] = (data ?? []).map((r) => normalize({ ...(r.data as Partial<Oshi>), id: r.id }));

  return <OshiApp initialOshis={oshis} email={user.email ?? ""} loadError={error?.message ?? null} />;
}
