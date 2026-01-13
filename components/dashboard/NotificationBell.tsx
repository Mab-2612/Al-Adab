'use client'

import { Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function NotificationBell() {
  const router = useRouter()
  const supabase = createClient()
  const [hasUnread, setHasUnread] = useState(false)
  const [latestDate, setLatestDate] = useState<string | null>(null)

  useEffect(() => {
    async function checkNotices() {
      // 1. Fetch the most recent notice relevant to this user
      // (RLS policies automatically filter by role, so we just ask for the latest one)
      const { data, error } = await supabase
        .from('notices')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) return

      const serverLatest = data.created_at
      setLatestDate(serverLatest)

      // 2. Check Local Storage
      const lastSeen = localStorage.getItem('last_notice_check')

      // 3. If server has newer date than what we saved, show dot
      if (!lastSeen || new Date(serverLatest) > new Date(lastSeen)) {
        setHasUnread(true)
      }
    }

    checkNotices()
  }, [])

  const handleClick = () => {
    // 1. Navigate
    router.push('/communication')
    
    // 2. Clear Red Dot (Update local storage)
    if (latestDate) {
      localStorage.setItem('last_notice_check', latestDate)
      setHasUnread(false)
    }
  }

  return (
    <button 
      onClick={handleClick}
      className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors group"
      title="View Notices"
    >
      <Bell className={`w-5 h-5 transition-colors ${hasUnread ? 'text-slate-700' : 'text-slate-500'}`} />
      
      {hasUnread && (
        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
      )}
    </button>
  )
}