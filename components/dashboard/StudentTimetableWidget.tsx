'use client'

import { Calendar, Clock, MapPin } from 'lucide-react'
import { useState, useEffect } from 'react'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export default function StudentTimetableWidget({ timetable }: { timetable: any[] }) {
  // Default to today, or Monday if it's weekend
  const [activeDay, setActiveDay] = useState('Monday')

  useEffect(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    if (days.includes(today)) {
      setActiveDay(today)
    }
  }, [])

  const dailySchedule = timetable
    .filter((t) => t.day === activeDay)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-slate-900">Class Schedule</h3>
      </div>

      {/* Day Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
              activeDay === day
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Schedule List */}
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
        {dailySchedule.length > 0 ? (
          dailySchedule.map((period) => (
            <div key={period.id} className="flex gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:border-blue-200 transition-colors">
              <div className="flex flex-col items-center justify-center min-w-[60px] border-r border-slate-200 pr-3">
                <span className="text-xs font-bold text-slate-900">{period.start_time.slice(0, 5)}</span>
                <span className="text-[10px] text-slate-400 my-0.5">to</span>
                <span className="text-xs font-bold text-slate-500">{period.end_time.slice(0, 5)}</span>
              </div>
              <div>
                <h4 className="font-bold text-blue-900 text-sm">{period.subjects?.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {parseInt(period.end_time) - parseInt(period.start_time)}h
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-32 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30 rounded-lg border border-dashed border-slate-200">
            <p className="text-sm">No classes scheduled.</p>
          </div>
        )}
      </div>
    </div>
  )
}