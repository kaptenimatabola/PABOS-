"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SchoolSettings() {
  const supabase = createClient();
  const router = useRouter();
  const [schoolId,setSchoolId]=useState("");
  const [form,setForm]=useState({name:"",slug:"",contact_email:"",contact_phone:"",address:"",timezone:"Africa/Maseru",logo_url:""});
  const [msg,setMsg]=useState("");
  const [busy,setBusy]=useState(false);

  useEffect(()=>{(async()=>{
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){router.push("/login");return;}
    const {data:m}=await supabase.from("memberships").select("school_id").eq("user_id",user.id).eq("status","active").limit(1).single();
    if(!m)return;
    setSchoolId(m.school_id);
    const {data:s}=await supabase.from("schools").select("name,slug,contact_email,contact_phone,address,timezone,logo_url").eq("id",m.school_id).single();
    if(s)setForm(s);
  })()},[]);

  const save=async()=>{
    setBusy(true);setMsg("");
    const {error}=await supabase.rpc("admin_update_school_settings",{p_school_id:schoolId,...Object.fromEntries(Object.entries(form).map(([k,v])=>["p_"+k,v]))});
    setMsg(error?error.message:"School settings saved successfully.");
    setBusy(false);
  };

  return <main className="min-h-screen bg-slate-100 p-6"><div className="mx-auto max-w-4xl">
    <Link href="/dashboard">← Dashboard</Link>
    <div className="mt-5"><p className="text-sm font-semibold text-indigo-600">ADMINISTRATION</p><h1 className="text-3xl font-bold">School Settings</h1><p className="mt-1 text-slate-500">Manage the school identity and operational contact details.</p></div>
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
      <div className="grid gap-5 sm:grid-cols-2">
        {([["name","School name"],["slug","Slug"],["contact_email","Contact email"],["contact_phone","Contact phone"],["timezone","Timezone"],["logo_url","Logo URL"]] as const).map(([k,l])=><label key={k} className="grid gap-2 text-sm font-semibold">{l}<input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} className="rounded-xl border p-3 font-normal" /></label>)}
        <label className="grid gap-2 text-sm font-semibold sm:col-span-2">Address<textarea value={form.address} onChange={e=>setForm({...form,address:e.target.value})} className="rounded-xl border p-3 font-normal" rows={3}/></label>
      </div>
      <div className="mt-6 flex items-center gap-4"><button disabled={busy||!schoolId} onClick={save} className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy?"Saving...":"Save Settings"}</button>{msg&&<span className="text-sm">{msg}</span>}</div>
    </section>
  </div></main>;
}