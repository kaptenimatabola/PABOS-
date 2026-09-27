"use client";

import {useEffect,useState} from "react";
import {createClient} from "@/lib/supabase/client";

type Overview={school_id:string;school_name:string;students_count:number;guardians_count:number;teachers_count:number;staff_count:number;linked_students:number;linked_guardians:number};

export default function PeoplePage(){
 const supabase=createClient();
 const [data,setData]=useState<Overview[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
 useEffect(()=>{(async()=>{const {data,error}=await supabase.rpc("get_admin_people_overview");if(error)setError(error.message);else setData((data||[]) as Overview[]);setLoading(false)})()},[]);
 const totals=data.reduce((a,r)=>({students:a.students+r.students_count,guardians:a.guardians+r.guardians_count,teachers:a.teachers+r.teachers_count,staff:a.staff+r.staff_count,linkedStudents:a.linkedStudents+r.linked_students,linkedGuardians:a.linkedGuardians+r.linked_guardians}),{students:0,guardians:0,teachers:0,staff:0,linkedStudents:0,linkedGuardians:0});
 return <main className="min-h-screen bg-slate-50 p-4 md:p-8"><div className="mx-auto max-w-7xl space-y-6">
 <header className="rounded-2xl bg-slate-950 p-6 text-white"><p className="text-xs font-semibold uppercase tracking-[.2em] text-slate-400">PABOS EDUOS</p><h1 className="mt-2 text-2xl font-bold">People & Relationships Center</h1><p className="mt-1 text-sm text-slate-300">School-scoped people, relationships and account readiness.</p></header>
 {error&&<div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
 <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">{[["Students",totals.students],["Guardians",totals.guardians],["Teachers",totals.teachers],["Staff",totals.staff],["Linked students",totals.linkedStudents],["Linked guardians",totals.linkedGuardians]].map(([x,n])=><div key={x as string} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200"><p className="text-sm text-slate-500">{x}</p><p className="mt-2 text-2xl font-bold">{n}</p></div>)}</section>
 <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200"><h2 className="font-semibold">School readiness</h2>{loading?<p className="mt-4 text-sm text-slate-500">Loading…</p>:<div className="mt-4 overflow-x-auto"><table className="min-w-[800px] w-full text-left text-sm"><thead><tr className="border-b text-xs uppercase text-slate-500"><th className="p-3">School</th><th className="p-3">Students</th><th className="p-3">Guardians</th><th className="p-3">Teachers</th><th className="p-3">Staff</th><th className="p-3">Student links</th></tr></thead><tbody>{data.map(r=><tr key={r.school_id} className="border-b last:border-0"><td className="p-3 font-medium">{r.school_name}</td><td className="p-3">{r.students_count}</td><td className="p-3">{r.guardians_count}</td><td className="p-3">{r.teachers_count}</td><td className="p-3">{r.staff_count}</td><td className="p-3">{r.linked_students}/{r.students_count}</td></tr>)}</tbody></table></div>}</section>
 <section className="grid gap-4 md:grid-cols-3">{[["Identity","Users are represented through memberships and profiles; roles remain database-authorized."],["Relationships","Guardian/student relationships are constrained to the same school."],["Auditability","Administrative relationship mutations are recorded in audit logs."]].map(([t,b])=><div key={t} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200"><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm text-slate-500">{b}</p></div>)}</section>
 </div></main>
}