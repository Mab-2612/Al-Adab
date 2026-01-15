'use client'

import { deleteSubject } from '../actions'
import { Trash2, Loader2, Pencil, User, Layers, Tag, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import EditSubjectModal from './EditSubjectModal'

export default function SubjectList({ subjects, teachers, isAdmin }: { subjects: any[], teachers: any[], isAdmin: boolean }) {
  // Store the entire group being considered for deletion
  const [deletingGroup, setDeletingGroup] = useState<any>(null)
  const [editingSubject, setEditingSubject] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Delete a specific variant (single ID)
  const handleDeleteVariant = async (id: string) => {
    setIsProcessing(true)
    const result = await deleteSubject(id)
    setIsProcessing(false)
    
    if (result && result.success) {
      toast.success('Configuration deleted')
      // If this was the last variant, close modal
      if (deletingGroup && deletingGroup.variants.length <= 1) {
        setDeletingGroup(null)
      } else {
        // Update the local deletingGroup state to remove the deleted item from the list
        setDeletingGroup((prev: any) => ({
          ...prev,
          variants: prev.variants.filter((v: any) => v.id !== id)
        }))
      }
    } else {
      toast.error(result?.message || "Failed")
    }
  }

  // Delete everything (Group)
  const handleDeleteAll = async () => {
    if (!deletingGroup) return
    setIsProcessing(true)
    
    const ids = deletingGroup.variants.map((v: any) => v.id)
    try {
      await Promise.all(ids.map((id: string) => deleteSubject(id)))
      toast.success('Subject deleted completely')
      setDeletingGroup(null)
    } catch (error) {
      toast.error("Failed to delete all items")
    }
    
    setIsProcessing(false)
  }

  // Group Subjects
  const groupedSubjects = subjects.reduce((acc: any, subject) => {
    const key = `${subject.name?.trim().toLowerCase()}-${subject.code?.trim().toLowerCase()}`
    if (!acc[key]) {
      acc[key] = {
        name: subject.name,
        code: subject.code,
        variants: []
      }
    }
    acc[key].variants.push(subject)
    return acc
  }, {})

  const sortedGroups = Object.values(groupedSubjects).sort((a: any, b: any) => 
    a.name.localeCompare(b.name)
  )

  return (
    <>
      <div className="divide-y divide-slate-100">
        {/* @ts-ignore */}
        {sortedGroups.map((group: any) => {
          // Analyze variants for merged tagging
          const juniorVariants = group.variants.filter((v: any) => v.category === 'Junior')
          const seniorVariants = group.variants.filter((v: any) => v.category === 'Senior')
          const allVariants = group.variants.filter((v: any) => v.category === 'All')

          // Extract Senior Departments
          const seniorDepts = seniorVariants.map((v: any) => v.department_target).filter(Boolean)
          const uniqueSeniorDepts = Array.from(new Set(seniorDepts))

          // Teacher (Take first one found for display)
          const teacherProfile = group.variants.find((v: any) => v.profiles)?.profiles

          return (
            <div key={`${group.name}-${group.code}`} className="p-5 hover:bg-slate-50 transition-colors group/row flex items-start justify-between gap-4">
              
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 flex-1">
                {/* Subject Icon */}
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  {group.code}
                </div>

                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-lg">{group.name}</h4>
                  
                  {/* Merged Tags Display */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    
                    {/* 1. All Classes Tag */}
                    {allVariants.length > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        All Classes
                      </span>
                    )}

                    {/* 2. Junior Tag */}
                    {juniorVariants.length > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100">
                        Junior
                      </span>
                    )}

                    {/* 3. Senior Tag (Merged) */}
                    {seniorVariants.length > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100 gap-1">
                        <Layers className="w-3 h-3" />
                        Senior
                        {uniqueSeniorDepts.length > 0 && (
                          <span className="font-normal border-l border-purple-200 pl-1 ml-1 text-purple-800">
                            {uniqueSeniorDepts.join(', ')}
                          </span>
                        )}
                      </span>
                    )}

                    {/* Teacher Name */}
                    {teacherProfile && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 border-l border-slate-200 pl-2 ml-1">
                        <User className="w-3 h-3" />
                        <span className="truncate font-medium capitalize">{teacherProfile.last_name} {teacherProfile.first_name?.[0]}.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row-Level Actions */}
              {isAdmin && (
                <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity self-center">
                  <button 
                    onClick={() => setEditingSubject(group.variants[0])}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Subject Details"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setDeletingGroup(group)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 transition-colors"
                    title="Delete Configurations"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}

            </div>
          )
        })}
        
        {sortedGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Tag className="w-10 h-10 mb-3 opacity-20" />
            <p>No subjects found.</p>
          </div>
        )}
      </div>

      {/* Advanced Delete Modal */}
      {deletingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
           <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden flex flex-col">
              
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h3 className="font-bold text-slate-800">Delete Configuration</h3>
                 <button onClick={() => setDeletingGroup(null)} className="p-1 hover:bg-slate-200 rounded-full text-slate-500"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6">
                <p className="text-sm text-slate-500 mb-4">Select which configuration to delete for <strong>{deletingGroup.name}</strong>:</p>
                
                <div className="space-y-2 mb-6 max-h-[200px] overflow-y-auto">
                  {deletingGroup.variants.map((v: any) => (
                    <div key={v.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{v.category}</span>
                        {v.department_target && <span className="text-xs text-slate-500">{v.department_target}</span>}
                      </div>
                      <button 
                        onClick={() => handleDeleteVariant(v.id)}
                        disabled={isProcessing}
                        className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded transition-colors"
                      >
                        {isProcessing ? <Loader2 className="w-3 h-3 animate-spin"/> : 'Delete'}
                      </button>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleDeleteAll} 
                  disabled={isProcessing}
                  className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-600/20"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Entire Subject'}
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingSubject && (
        <EditSubjectModal 
          subject={editingSubject} 
          teachers={teachers} 
          onClose={() => setEditingSubject(null)} 
        />
      )}
    </>
  )
}