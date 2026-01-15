'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Clipboard } from 'lucide-react'

type StudentRow = {
  id: number
  surname: string
  firstName: string
  otherNames: string
  gender: string
  dob: string
  phone: string
  department: string
}

export default function SpreadsheetInput({ isSenior, onDataChange }: { isSenior: boolean, onDataChange: (data: any[]) => void }) {
  const [rows, setRows] = useState<StudentRow[]>([
    { id: 1, surname: '', firstName: '', otherNames: '', gender: 'Male', dob: '', phone: '', department: '' }
  ])

  // Update parent whenever rows change
  useEffect(() => {
    onDataChange(rows)
  }, [rows, onDataChange])

  const addRow = () => {
    setRows([...rows, { 
      id: Date.now(), surname: '', firstName: '', otherNames: '', gender: 'Male', dob: '', phone: '', department: '' 
    }])
  }

  const removeRow = (id: number) => {
    if (rows.length > 1) {
      setRows(rows.filter(r => r.id !== id))
    }
  }

  const updateRow = (id: number, field: keyof StudentRow, value: string) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  // 📋 MAGIC: Paste from Excel
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData('text')
    const lines = pasteData.split(/\r\n|\n|\r/).filter(line => line.trim() !== '')
    
    if (lines.length === 0) return

    const newRows = lines.map((line, index) => {
      // Split by Tab (Excel default) or Comma
      const cols = line.split(/\t|,\s*/).map(s => s.trim())
      return {
        id: Date.now() + index,
        surname: cols[0] || '',
        firstName: cols[1] || '',
        otherNames: cols[2] || '',
        gender: cols[3] || 'Male',
        dob: cols[4] || '',
        phone: cols[5] || '',
        department: cols[6] || ''
      }
    })

    // If only 1 row pasted, maybe user just wanted to fill one field? 
    // We assume if it has tabs/commas, it's a row paste.
    setRows((prev) => {
        // If current table is empty/clean, replace. Else append.
        const isClean = prev.length === 1 && !prev[0].surname
        return isClean ? newRows : [...prev, ...newRows]
    })
  }

  return (
    <div className="space-y-4">
      
      {/* TOOLBAR */}
      <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-700 font-bold flex items-center gap-2">
          <Clipboard className="w-4 h-4" />
          Tip: You can copy data from Excel and paste it anywhere below.
        </p>
        <button 
          type="button" 
          onClick={addRow}
          className="text-xs bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors font-bold"
        >
          + Add Row
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold">
            <tr>
              <th className="p-3 border-r border-slate-200 w-8">#</th>
              <th className="p-3 border-r border-slate-200 min-w-[120px]">Surname*</th>
              <th className="p-3 border-r border-slate-200 min-w-[120px]">First Name*</th>
              <th className="p-3 border-r border-slate-200">Other Names</th>
              <th className="p-3 border-r border-slate-200 w-24">Gender</th>
              <th className="p-3 border-r border-slate-200 w-32">DOB</th>
              <th className="p-3 border-r border-slate-200 w-32">Phone</th>
              {isSenior && <th className="p-3 border-r border-slate-200 w-32">Dept*</th>}
              <th className="p-3 w-10 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100" onPaste={handlePaste}>
            {rows.map((row, index) => (
              <tr key={row.id} className="group hover:bg-slate-50">
                <td className="p-3 text-xs text-slate-400 font-mono border-r border-slate-100 text-center">{index + 1}</td>
                
                <td className="p-0 border-r border-slate-100">
                  <input className="w-full h-full p-3 bg-transparent outline-none text-sm" placeholder="Musa" value={row.surname} onChange={e => updateRow(row.id, 'surname', e.target.value)} required />
                </td>
                <td className="p-0 border-r border-slate-100">
                  <input className="w-full h-full p-3 bg-transparent outline-none text-sm" placeholder="Ibrahim" value={row.firstName} onChange={e => updateRow(row.id, 'firstName', e.target.value)} required />
                </td>
                <td className="p-0 border-r border-slate-100">
                  <input className="w-full h-full p-3 bg-transparent outline-none text-sm" value={row.otherNames} onChange={e => updateRow(row.id, 'otherNames', e.target.value)} />
                </td>
                
                <td className="p-0 border-r border-slate-100">
                  <select className="w-full h-full p-3 bg-transparent outline-none text-sm" value={row.gender} onChange={e => updateRow(row.id, 'gender', e.target.value)}>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </td>
                
                <td className="p-0 border-r border-slate-100">
                   <input type="date" className="w-full h-full p-3 bg-transparent outline-none text-sm text-slate-500" value={row.dob} onChange={e => updateRow(row.id, 'dob', e.target.value)} />
                </td>

                <td className="p-0 border-r border-slate-100">
                   <input type="tel" placeholder="080..." className="w-full h-full p-3 bg-transparent outline-none text-sm" value={row.phone} onChange={e => updateRow(row.id, 'phone', e.target.value)} />
                </td>

                {isSenior && (
                  <td className="p-0 border-r border-slate-100 bg-purple-50/20">
                    <select className="w-full h-full p-3 bg-transparent outline-none text-sm font-medium text-purple-700" value={row.department} onChange={e => updateRow(row.id, 'department', e.target.value)} required>
                      <option value="">- Select -</option>
                      <option value="Science">Science</option>
                      <option value="Arts">Arts</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </td>
                )}

                <td className="p-1 text-center">
                  <button type="button" onClick={() => removeRow(row.id)} className="p-2 text-slate-300 hover:text-red-500 rounded transition-colors" title="Remove Row">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-center pt-2">
         <button type="button" onClick={addRow} className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-2 px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Add Another Row
         </button>
      </div>

    </div>
  )
}