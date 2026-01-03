import { createClient } from '@/utils/supabase/server'
import { Sparkles } from 'lucide-react'
import ApplicationForm from './ApplicationForm'

export default async function ApplicationPage() {
  const supabase = await createClient()
  const { data: classes } = await supabase.from('classes').select('id, name').order('name')

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10"></div>

      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide mb-4">
            <Sparkles className="w-3 h-3" />
            2024/2025 Session
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Begin Your Journey at Al-Adab
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Complete the form below to apply for admission. Please ensure all details are accurate as they will be used for your official record.
          </p>
        </div>

        {/* The Client Form Component */}
        <ApplicationForm classes={classes || []} />

      </div>
    </div>
  )
}