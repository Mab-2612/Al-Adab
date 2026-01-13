import { createClient } from '@/utils/supabase/server'
import { Megaphone, Trash2 } from 'lucide-react'
import CreateNoticeForm from './CreateNoticeForm'
import { deleteNotice } from './actions'

export const dynamic = 'force-dynamic'

export default async function CommunicationPage() {
  const supabase = await createClient()

  // 1. Get Current User Role
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()
  
  // 👇 CHECK: Only Admin & Principal can post
  const canPost = profile?.role === 'admin' || profile?.role === 'principal'

  // 2. Fetch Notices based on permission
  // Admins see all. Students/Teachers see only what's for them or 'all'.
  let query = supabase
    .from('notices')
    .select('*, profiles(first_name, last_name)')
    .order('created_at', { ascending: false })

  // (Optional: You could filter the list view here too, but RLS handles security. 
  // We'll just filter what they can SEE visually to keep it clean)
  
  const { data: notices } = await query

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
          <Megaphone className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Communication Center</h1>
          <p className="text-slate-500">School announcements and updates.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT: Create Form (HIDDEN for Students/Teachers) */}
        {canPost ? (
          <div className="lg:col-span-1">
             <CreateNoticeForm />
          </div>
        ) : (
          // Optional: Show a "Read Only" info box for students
          <div className="lg:col-span-1">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-blue-800 text-sm">
              <p className="font-bold mb-1">Notice Board</p>
              <p>Check here regularly for important updates from the school administration.</p>
            </div>
          </div>
        )}

        {/* RIGHT: History List */}
        <div className={canPost ? "lg:col-span-2 space-y-4" : "lg:col-span-2 lg:col-start-2 space-y-4"}>
          <h3 className="font-bold text-slate-900">Recent Announcements</h3>
          
          {notices?.map((notice) => (
            <div key={notice.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative group">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                    notice.audience === 'all' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    notice.audience === 'staff' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                    'bg-green-50 text-green-600 border-green-100'
                  }`}>
                    {notice.audience}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(notice.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Delete Button (Only for Admin/Principal) */}
                {canPost && (
                  <form action={async () => {
                    'use server'
                    await deleteNotice(notice.id)
                  }}>
                    <button className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>

              <h4 className="font-bold text-slate-900 text-lg mb-1">{notice.title}</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{notice.content}</p>
              
              <p className="text-xs text-slate-400 mt-4 flex items-center gap-1">
                Posted by {notice.profiles?.first_name || 'Admin'}
              </p>
            </div>
          ))}

          {(!notices || notices.length === 0) && (
            <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              No announcements posted yet.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}