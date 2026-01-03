import { createClient } from '@/utils/supabase/server'
import { Bell } from 'lucide-react'

export default async function NoticeBoard({ role }: { role: string }) {
  const supabase = await createClient()

  // Logic: "Show me notices for 'all', OR notices for my specific role"
  let query = supabase.from('notices').select('*').order('created_at', { ascending: false }).limit(3)

  if (role === 'student' || role === 'parent') {
    query = query.in('audience', ['all', 'student'])
  } else if (role === 'teacher') {
    query = query.in('audience', ['all', 'staff'])
  }
  // Admins see everything by default

  const { data: notices } = await query

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-5 h-5 text-orange-500" />
        <h3 className="font-bold text-slate-900">Notice Board</h3>
      </div>

      <div className="space-y-4">
        {notices?.map((notice) => (
          <div key={notice.id} className="pb-4 border-b border-slate-50 last:border-0 last:pb-0">
            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
              notice.audience === 'all' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
            }`}>
              {notice.audience}
            </span>
            <h4 className="font-bold text-slate-800 text-sm mt-1">{notice.title}</h4>
            <p className="text-slate-500 text-xs mt-1 line-clamp-2">{notice.content}</p>
            <p className="text-[10px] text-slate-400 mt-2">{new Date(notice.created_at).toDateString()}</p>
          </div>
        ))}

        {(!notices || notices.length === 0) && (
          <p className="text-sm text-slate-400 text-center py-4">No new announcements.</p>
        )}
      </div>
    </div>
  )
}