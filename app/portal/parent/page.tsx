import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ParentPortal(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/login");

  const {data:guardian}=await supabase.from("guardians").select("id,full_name").eq("profile_id",user.id).maybeSingle();
  if(!guardian) return <main className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-sm"><p className="text-sm font-semibold text-indigo-600">PABOS EDUOS</p><h1 className="mt-2 text-3xl font-bold">Parent Portal</h1><p className="mt-3 text-slate-500">Your guardian profile has not been linked to a student yet. Please contact the school administrator.</p></div></main>;

  const {data:links}=await supabase.from("student_guardians").select("student_id,relationship,is_primary_contact").eq("guardian_id",guardian.id);
  const ids=(links||[]).map(x=>x.student_id);
  const {data:students}=ids.length?await supabase.from("students").select("id,first_name,last_name,admission_number,class_id,enrollment_status").in("id",ids):{data:[]};
  const {data:invoices}=ids.length?await supabase.from("invoices").select("id,student_id,invoice_number,total_amount,amount_paid,status,due_date").in("student_id",ids).order("due_date",{ascending:true}):{data:[]};
  const {data:notifications}=await supabase.from("notifications").select("id,announcement_id,read_at,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(8);
  return <main className="min-h-screen bg-slate-50 p-4 sm:p-6"><div className="mx-auto max-w-6xl">
    <header className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-semibold text-indigo-300">PABOS EDUOS</p><h1 className="mt-1 text-3xl font-bold">Parent Portal</h1><p className="mt-1 text-slate-300">Welcome, {guardian.full_name||user.email}</p></div><form action="/api/auth/signout" method="post"><button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20">Sign out</button></form></div></header>
    <section className="mt-6 grid gap-4 md:grid-cols-3"><Link href="/portal/parent/children" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="text-sm text-slate-500">Children</p><p className="mt-1 text-3xl font-bold">{students?.length||0}</p></Link><div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="text-sm text-slate-500">Outstanding fees</p><p className="mt-1 text-3xl font-bold">M{((invoices||[]).reduce((n,i)=>n+Number(i.total_amount||0)-Number(i.amount_paid||0),0)).toFixed(2)}</p></div><div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="text-sm text-slate-500">Notifications</p><p className="mt-1 text-3xl font-bold">{notifications?.length||0}</p></div></section>
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="text-xl font-bold">Your children</h2><div className="mt-4 grid gap-3">{(students||[]).map(s=><div key={s.id} className="rounded-xl border p-4"><div className="flex items-center justify-between"><div><p className="font-semibold">{s.first_name} {s.last_name}</p><p className="text-sm text-slate-500">{s.admission_number} · {s.enrollment_status}</p></div><Link href={`/portal/parent/children/${s.id}`} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">Open</Link></div></div>)}</div></section>
  </div></main>;
}
