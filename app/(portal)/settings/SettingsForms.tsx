'use client'

import { useState } from 'react'
import { updateProfile, changePassword, updateSystemConfig, createSession } from './actions'
import { Save, Loader2, User, Lock, Settings as Cog, Plus, Calendar, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsForms({ profile, sessions, isAdmin }: { profile: any, sessions: any[], isAdmin: boolean }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)

  // Determine if inputs should be locked
  const isProfileLocked = !isAdmin; 

  const handleAction = async (formData: FormData, action: Function) => {
    setIsSaving(true)
    const res = await action(formData)
    setIsSaving(false)

    if (res?.success) {
      toast.success(res.message)
    } else {
      toast.error(res?.error)
    }
  }

  return (
    <div className="grid md:grid-cols-4 gap-8">
      
      {/* Sidebar Navigation */}
      <div className="md:col-span-1 space-y-2">
        <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
          <User className="w-4 h-4" /> Profile
        </button>
        <button onClick={() => setActiveTab('security')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
          <Lock className="w-4 h-4" /> Security
        </button>
        {isAdmin && (
          <button onClick={() => setActiveTab('system')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'system' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Cog className="w-4 h-4" /> System Config
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="md:col-span-3">
        
        {/* --- PROFILE TAB --- */}
        {activeTab === 'profile' && (
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Personal Information</h2>
            
            {isProfileLocked && (
              <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 rounded-lg flex items-start gap-3 text-sm">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p>Profile editing is restricted. Please contact the administrator to update your name or phone number.</p>
              </div>
            )}

            <form action={(fd) => handleAction(fd, updateProfile)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">First Name</label>
                  <input name="firstName" defaultValue={profile.first_name} disabled={isProfileLocked} className="w-full p-2.5 border rounded-lg disabled:bg-slate-100 disabled:text-slate-500" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Other Names</label>
                  <input name="lastName" defaultValue={profile.last_name} disabled={isProfileLocked} className="w-full p-2.5 border rounded-lg disabled:bg-slate-100 disabled:text-slate-500" required />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Email</label>
                <input defaultValue={profile.email} disabled className="w-full p-2.5 border rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Phone Number</label>
                <input name="phone" defaultValue={profile.phone_number} type="tel" disabled={isProfileLocked} className="w-full p-2.5 border rounded-lg disabled:bg-slate-100 disabled:text-slate-500" />
              </div>

              {!isProfileLocked && (
                <div className="pt-4">
                  <button disabled={isSaving} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* --- SECURITY TAB --- */}
        {activeTab === 'security' && (
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Change Password</h2>
            <form action={(fd) => handleAction(fd, changePassword)} className="space-y-6 max-w-md">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">New Password</label>
                <input name="password" type="password" className="w-full p-2.5 border rounded-lg" required minLength={6} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Confirm Password</label>
                <input name="confirmPassword" type="password" className="w-full p-2.5 border rounded-lg" required minLength={6} />
              </div>

              <div className="pt-4">
                <button disabled={isSaving} className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- SYSTEM CONFIG TAB (Admin Only) --- */}
        {activeTab === 'system' && isAdmin && (
          <div className="space-y-8">
            
            {/* Active Session & Term Card */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" /> Current Academic Period
              </h2>
              <form action={(fd) => handleAction(fd, updateSystemConfig)} className="grid md:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Active Session</label>
                  <select name="sessionId" defaultValue={sessions.find(s => s.is_current)?.id} className="w-full p-2.5 border rounded-lg bg-white">
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Current Term</label>
                  <select name="currentTerm" defaultValue={sessions.find(s => s.is_current)?.current_term} className="w-full p-2.5 border rounded-lg bg-white">
                    <option value="1st Term">1st Term</option>
                    <option value="2nd Term">2nd Term</option>
                    <option value="3rd Term">3rd Term</option>
                  </select>
                </div>
                <div className="md:col-span-2 mt-2">
                   <button disabled={isSaving} className="w-full md:w-auto bg-purple-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update System Config'}
                  </button>
                </div>
              </form>
              <p className="text-xs text-slate-500 mt-4 bg-yellow-50 p-3 rounded border border-yellow-200">
                ⚠️ Changing this affects fees, result uploads, and attendance records globally.
              </p>
            </div>

            {/* Create Session Card */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Create New Session
              </h2>
              <form action={(fd) => handleAction(fd, createSession)} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Session Name</label>
                  <input name="name" placeholder="e.g. 2026/2027" className="w-full p-2.5 border rounded-lg" required />
                </div>
                <button disabled={isSaving} className="w-full py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 disabled:opacity-50 mt-2">
                  Create Session
                </button>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}