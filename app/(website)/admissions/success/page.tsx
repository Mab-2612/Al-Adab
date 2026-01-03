import Link from 'next/link'
import { CheckCircle, ArrowRight } from 'lucide-react'

export default function AdmissionSuccessPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 text-center animate-in fade-in zoom-in duration-500">
        
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Application Received!</h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Thank you for applying to Al-Adab School. We have received your details and documents. Our admissions office will review your application and contact you via email shortly.
        </p>

        <div className="space-y-3">
          <Link 
            href="/" 
            className="block w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
          >
            Return to Home
          </Link>
          <Link 
            href="/admissions/apply" 
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-slate-600 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            Submit Another Application
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  )
}