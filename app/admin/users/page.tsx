"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Member = {
  membership_id:string; user_id:string; school_id:string; school_name:string;
  role:string; status:string; full_name:string|null; email:string|null; phone:string|null;
  teacher_id:string|null; guardian_id:string|null; staff_id:string|null;
};

const roles=["school_admin","teacher","staff","parent","student"];
const statuses=["active","suspended","invited"];

export default function AdminUsersPage(){
  const supabase=createClient();
  const [rows,setRows]=useState<Member[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState<string|null>(null);
  const [search,setSearch]=useState("");

  async function load(){
    setLoading(true); setError("");
    const {data,error}=await supabase.rpc("admin_user_directory");
    if(error) setError(error.message);
    else setRows((data||[]) as Member[]);
    setLoading(false);
  }
  useEffect(()=>{load()},[]);

  async function role(id:string, value:string){
    setBusy(id); setError("");
    const {error}=await supabase.rpc("admin_set_membership_role",{p_membership_id:id,p_role:value});
    if(error) setError(error.message); else await load();
    setBusy(null);
  }
  async function status(id:string, value:string){
    setBusy(id); setError("");
    const {error}=await supabase.rpc("admin_set_membership_status",{p_membership_id:id,p_status:value});
    if(error) setError(error.message); else await load();
    setBusy(null);
  }

  const filtered=rows.filter(r=>{
    const q=search.toLowerCase();
    return !q || [r.full_name,r.email,r.phone,r.school_name,r.role].some(v=>(v||"").toLowerCase().includes(q));
  });

  return <main className="min-h-screen bg-slate-50 p-4 md:p-8">
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-2xl bg-slate-950 p-6 text-white shadow">
        <p className="text-xs font-semibold uppercase tracking-[.2em] text-slate-300">PABOS EDUOS</p>
        <h1 className="mt-2 text-2xl font-bold">User & Roles Center</h1>
        <p className="mt-1 text-sm text-slate-300">Manage school memberships with database-enforced authorization.</p>
      </header>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">School users</h2>
            <p className="text-sm text-slate-500">{filtered.length} visible memberships</p>
          </div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, school, role…" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 md:w-80"/>
        </div>

        {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead><tr className="border-b text-xs uppercase tracking-wide text-slate-500">
              <th className="p-3">User</th><th className="p-3">School</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Linked records</th>
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading secure directory…</td></tr> :
              filtered.map(r=><tr key={r.membership_id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="p-3"><div className="font-medium">{r.full_name||"Unnamed user"}</div><div className="text-xs text-slate-500">{r.email||r.phone||r.user_id}</div></td>
                <td className="p-3">{r.school_name}</td>
                <td className="p-3">
                  <select disabled={busy===r.membership_id || r.role==="super_admin"} value={r.role} onChange={e=>role(r.membership_id,e.target.value)} className="rounded-lg border px-2 py-1.5 disabled:bg-slate-100">
                    {r.role==="super_admin" && <option value="super_admin">super_admin</option>}
                    {roles.map(x=><option key={x} value={x}>{x}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <select disabled={busy===r.membership_id} value={r.status} onChange={e=>status(r.membership_id,e.target.value)} className="rounded-lg border px-2 py-1.5">
                    {statuses.map(x=><option key={x} value={x}>{x}</option>)}
                  </select>
                </td>
                <td className="p-3"><div className="flex gap-1 text-xs">
                  {r.teacher_id&&<span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">teacher</span>}
                  {r.guardian_id&&<span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">guardian</span>}
                  {r.staff_id&&<span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">staff</span>}
                  {!r.teacher_id&&!r.guardian_id&&!r.staff_id&&<span className="text-slate-400">none</span>}
                </div></td>
              </tr>)}
              {!loading&&!filtered.length&&<tr><td colSpan={5} className="p-8 text-center text-slate-500">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Role changes","Only school admins/super admins can change memberships; school admins cannot grant super_admin."],
          ["School isolation","Every mutation is checked against the target school membership before execution."],
          ["Audit trail","Role and status changes write audit events for later review."]
        ].map(([title,body])=><div key={title} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200"><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-slate-500">{body}</p></div>)}
      </section>
    </div>
  </main>;
}
