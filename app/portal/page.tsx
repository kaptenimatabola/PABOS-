import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function PortalRouter(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/login");
  const {data:membership}=await supabase.from("memberships").select("role").eq("user_id",user.id).eq("status","active").maybeSingle();
  if(membership?.role==="parent") redirect("/portal/parent");
  if(membership?.role==="student") redirect("/portal/student");
  redirect("/dashboard");
}
