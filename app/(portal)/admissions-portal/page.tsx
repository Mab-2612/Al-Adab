import { createClient } from '@/utils/supabase/server'
import { CheckCircle, XCircle, Clock, FileText, User, AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import ReviewButton from './ReviewButton'

// Force fresh data every time
export const dynamic = 'force-dynamic'

export default async function AdmissionsPortal() {
  const supabase = await createClient()

  // 1. Try fetching with Class Name (The Ideal Query)
  let { data: applications, error } = await supabase
    .from('admissions')
    .select('*, classes(name)')
    .order('created_at', { ascending: false })

  // 2. Fallback: If relation fails, fetch raw data (The Backup Query)
  if (error) {
    console.error("Join failed, fetching raw data:", error.message)
    const { data: rawApps, error: rawError } = await supabase
      .from('admissions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!rawError) {
      applications = rawApps
    }
  }

  const pendingApps = applications?.filter(a => a.status === 'pending') || []
  const historyApps = applications?.filter(a => a.status !== 'pending') || []

  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admissions Portal</h1>
          <p className="text-slate-500">Review and process incoming student applications.</p>
        </div>
      </div>

      {/* Debug Banner: Only shows if there's an error fetching */}
      {error && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl mb-8 flex gap-3 items-center">
          <AlertTriangle className="w-5 h-5" />
          <div>
            <p className="font-bold">System Warning</p>
            <p className="text-xs">Could not fetch class names. Showing raw data. (Error: {error.message})</p>
          </div>
        </div>
      )}

      {/* PENDING SECTION */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" /> 
          Pending Reviews ({pendingApps.length})
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingApps.map((app) => (
            <div key={app.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              
              <div className="p-4 border-b border-slate-100 flex items-start gap-4">
                {/* Passport */}
                <div className="w-16 h-16 rounded-lg bg-slate-100 relative overflow-hidden flex-shrink-0 border border-slate-200">
                  {app.passport_url ? (
                    <Image src={app.passport_url} alt="Passport" fill className="object-cover" unoptimized />
                  ) : (
                    <User className="w-8 h-8 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
                
                {/* Info */}
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">
                    {app.first_name} {app.last_name}
                  </h3>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    {/* Handle case where classes join failed */}
                    {app.classes?.name || 'Class ID: ' + app.class_id?.slice(0,4)}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">{new Date(app.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="p-4 space-y-2 flex-1 text-sm bg-slate-50/50">
                 <div className="flex justify-between">
                   <span className="text-slate-500">Gender:</span>
                   <span className="font-medium text-slate-700 capitalize">{app.gender}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-slate-500">Phone:</span>
                   <span className="font-medium text-slate-700">{app.phone}</span>
                 </div>
              </div>

              <div className="p-4 border-t border-slate-100">
                 <ReviewButton application={app} />
              </div>
            </div>
          ))}

          {pendingApps.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500">No pending applications found.</p>
            </div>
          )}
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100">
          <h3 className="font-bold text-slate-700">Processed History</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100">
            <tr>
              <th className="p-4">Applicant</th>
              <th className="p-4">Class</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {historyApps.map((app) => (
              <tr key={app.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-900">
                  {app.first_name} {app.last_name}
                </td>
                <td className="p-4 text-slate-600">
                  {app.classes?.name || 'ID: ' + app.class_id?.slice(0,4)}
                </td>
                <td className="p-4 text-slate-500">{new Date(app.created_at).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    app.status === 'approved' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {app.status === 'approved' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {app.status}
                  </span>
                </td>
              </tr>
            ))}
            {historyApps.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400">No history found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}