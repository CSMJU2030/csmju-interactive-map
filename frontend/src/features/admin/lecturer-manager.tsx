'use client';
import { LoaderCircle, Pencil, Plus, Trash2, UserRoundCog } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import type { Lecturer, Place, CurrentUser } from '@/types/api';
type PersonOption = {personCode:string;nameTh:string;personnelType:string};
export function LecturerManager({places,userRole}:{places:Place[];userRole:CurrentUser['subsystemRole']}) {
  const [lecturers,setLecturers] = useState<Lecturer[]>([]);
  const [people,setPeople] = useState<PersonOption[]>([]);
  const [search,setSearch] = useState('');
  const [page,setPage] = useState(1);
  const [totalPages,setTotalPages] = useState(0);
  const [editingId,setEditingId] = useState<string|null>(null);
  const [draft,setDraft] = useState({personCode:'',placeId:''});
  const [showForm,setShowForm] = useState(false);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);setError('');
    try { const response = await apiRequest<Lecturer[]>('/api/v1/lecturers?limit=100'); setLecturers(response.data); }
    catch(caught) { setError(caught instanceof Error ? caught.message : 'โหลดข้อมูลไม่สำเร็จ'); }
    finally {setLoading(false);}
  },[]);
  useEffect(()=>{void load();},[load]);
  useEffect(()=>{
    if(!showForm) return;
    let active=true;
    const timer=setTimeout(()=>{void apiRequest<PersonOption[]>('/api/v1/lecturers/core-people?'+new URLSearchParams({limit:'20',page:String(page),...(search ? {q:search}: {})}).toString()).then(response=>{if(active){setPeople(response.data);setTotalPages(response.meta?.totalPages ?? 0);}}).catch((caught:unknown)=>{if(active) setError(caught instanceof Error ? caught.message : 'โหลดบุคลากรจาก Core Hub ไม่สำเร็จ');});},200);
    return ()=>{active=false;clearTimeout(timer);};
  },[search,page,showForm]);
  const edit=(person:Lecturer|null)=>{setEditingId(person?.id ?? null);setDraft({personCode:person?.personCode ?? '',placeId:person?.placeId ?? ''});setSearch('');setPage(1);setShowForm(true);setError('');};
  const submit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();setSaving(true);setError('');
    try { await apiRequest<Lecturer>(editingId ? '/api/v1/lecturers/'+editingId : '/api/v1/lecturers',{method:editingId ? 'PATCH':'POST',body:JSON.stringify({personCode:draft.personCode,placeId:draft.placeId || null})});setShowForm(false);await load(); }
    catch(caught){setError(caught instanceof Error ? caught.message : 'บันทึกไม่สำเร็จ');}
    finally{setSaving(false);}
  };
  const remove=async(person:Lecturer)=>{
    if(!window.confirm('ลบการกำหนดห้องของ '+person.nameTh+' หรือไม่?'))return;
    try{await apiRequest('/api/v1/lecturers/'+person.id,{method:'DELETE'});await load();}
    catch(caught){setError(caught instanceof Error ? caught.message : 'ลบไม่สำเร็จ');}
  };
  return <section id="manage-lecturers" className="card overflow-hidden">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
      <div><h2 className="flex items-center gap-2 text-lg font-bold"><UserRoundCog size={20}/>บุคลากรและห้องทำงาน</h2><p className="text-sm text-slate-500">เลือกบุคลากรจาก Core Hub แล้วกำหนดห้องบนแผนที่</p></div>
      <button type="button" className="button-secondary" onClick={()=>edit(null)}><Plus size={18}/>กำหนดห้องบุคลากร</button>
    </div>
    {error && <p role="alert" className="m-4 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
    {showForm && <form onSubmit={event=>void submit(event)} className="space-y-4 border-b border-slate-200 p-5">
      <label className="block">ค้นหาบุคลากรจาก Core Hub<input className="control mt-1 w-full" value={search} onChange={event=>{setSearch(event.target.value);setPage(1);}}/></label>
      <label className="block">บุคลากร<select required className="control mt-1 w-full" value={draft.personCode} onChange={event=>setDraft({...draft,personCode:event.target.value})}><option value="">เลือกบุคลากร</option>{draft.personCode && !people.some(person=>person.personCode===draft.personCode) && <option value={draft.personCode}>{draft.personCode}</option>}{people.map(person=><option key={person.personCode} value={person.personCode}>{person.nameTh} — {person.personCode}</option>)}</select></label>
      <div className="flex items-center gap-3"><button type="button" className="button-secondary" disabled={page<=1} onClick={()=>setPage(page-1)}>ก่อนหน้า</button><span>หน้า {page} / {Math.max(1,totalPages)}</span><button type="button" className="button-secondary" disabled={page>=totalPages} onClick={()=>setPage(page+1)}>ถัดไป</button></div>
      <label className="block">ห้องทำงาน<select className="control mt-1 w-full" value={draft.placeId} onChange={event=>setDraft({...draft,placeId:event.target.value})}><option value="">ยังไม่กำหนด</option>{places.filter(place=>place.roomCode).map(place=><option key={place.id} value={place.id}>{place.roomCode} — {place.nameTh}</option>)}</select></label>
      <div className="flex gap-3"><button type="submit" className="button-primary" disabled={saving || !draft.personCode}>{saving && <LoaderCircle size={18} className="animate-spin"/>}บันทึกการกำหนดห้อง</button><button type="button" className="button-secondary" onClick={()=>setShowForm(false)}>ยกเลิก</button></div>
    </form>}
    {loading ? <p role="status" className="p-5">กำลังโหลดบุคลากร…</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-4">บุคลากร</th><th className="p-4">ห้องทำงาน</th><th className="p-4">จัดการ</th></tr></thead><tbody>{lecturers.map(person=><tr key={person.id} className="border-t border-slate-100"><td className="p-4">{person.nameTh}<span className="block text-xs text-slate-500">{person.personCode}</span></td><td className="p-4">{person.place?.nameTh ?? 'ยังไม่กำหนด'}</td><td className="p-4"><div className="flex gap-2"><button type="button" className="button-secondary" onClick={()=>edit(person)} aria-label={'แก้ไขห้องของ '+person.nameTh}><Pencil size={18}/></button>{userRole==='ADMIN' && <button type="button" className="button-secondary" onClick={()=>void remove(person)} aria-label={'ลบการกำหนดห้องของ '+person.nameTh}><Trash2 size={18}/></button>}</div></td></tr>)}{!lecturers.length && <tr><td colSpan={3} className="p-6 text-center text-slate-500">ยังไม่มีการกำหนดห้องบุคลากร</td></tr>}</tbody></table></div>}
  </section>;
}
