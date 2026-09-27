import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function StudentPortal(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/login");
  const {data:student}=await supabase.from("students").select("id,first_name,last_name,admission_number,enrollment_status,class_id").eq("profile_id",user.id).maybeSingle();
  if(!student) return <main className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm"><p className="text-sm font-semibold text-indigo-600">PABOS EDUOS</p><h1 className="mt-2 text-3xl font-bold">Student Portal</h1><p className="mt-3 text-slate-500">Your student profile is not linked to this account yet.</p></div></main>;
  const {data:attendance}=await supabase.from("attendance").select("status,attendance_date").eq("student_id",student.id).order("attendance_date",{ascending:false}).limit(10);
  const {data:invoices}=await supabase.from("invoices").select("id,invoice_number,total_amount,amount_paid,status,due_date").eq("student_id",student.id).order("due_date",{ascending:true});
  const {data:scores}=await supabase.from("scores").select("id,score,remarks,assessment_id").eq("student_id",student.id).order("updated_at",{ascending:false}).limit(10);
  return <main className="min-h-screen bg-slate-50 p-4 sm:p-6"><div className="mx-auto max-w-6xl">
    <header className="rounded-3xl bg-slate-900 p-6 text-white"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold text-indigo-300">PABOS EDUOS</p><h1 className="mt-1 text-3xl font-bold">Student Portal</h1><p className="mt-1 text-slate-300">{student.first_name} {student.last_name} · {student.admission_number}</p></div><form action="/api/auth/signout" method="post"><button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold">Sign out</button></form></div></header>
    <section className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="text-sm text-slate-500">Attendance records</p><p className="mt-1 text-3xl font-bold">{attendance?.length||0}</p></div><div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="text-sm text-slate-500">Assessments</p><p className="mt-1 text-3xl font-bold">{scores?.length||0}</p></div><div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="text-sm text-slate-500">Outstanding fees</p><p className="mt-1 text-3xl font-bold">M{((invoices||[]).reduce((n,i)=>n+Number(i.total_amount||0)-Number(i.amount_paid||0),0)).toFixed(2)}</p></div></section>
    <section className="mt-6 grid gap-6 lg:grid-cols-2"><div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="text-xl font-bold">Recent attendance</h2><div className="mt-4 space-y-2">{(attendance||[]).map((a,i)=><div key={i} className="flex justify-between border-b py-2 text-sm"><span>{a.attendance_date}</span><span className="font-semibold capitalize">{a.status}</span></div>)}</div></div><div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="text-xl font-bold">Recent results</h2><div className="mt-4 space-y-2">{(scores||[]).map((s)=><div key={s.id} className="flex justify-between border-b py-2 text-sm"><span>Assessment</span><span className="font-semibold">{s.score}</span></div>)}</div></div></section>
  </div></main>;
}
