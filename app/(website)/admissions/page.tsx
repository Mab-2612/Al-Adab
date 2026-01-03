import Link from 'next/link'
import { CheckCircle2, FileText, ArrowRight, Sparkles, GraduationCap } from 'lucide-react'

export default function AdmissionsLandingPage() {
  return (
    <div className="bg-white">
      
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-slate-900 py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Join the Al-Adab Family
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              We are accepting applications for the 2024/2025 Academic Session. Give your child the gift of world-class education rooted in excellence.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/admissions/apply"
                className="rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
              >
                Start Application
              </Link>
              <Link href="/about" className="text-sm font-semibold leading-6 text-white hover:text-blue-300 transition-colors">
                Learn more about us <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="py-24 sm:py-32 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600 uppercase tracking-wide">The Process</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How to Apply
            </p>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Our admission process is simple, digital, and transparent. Follow these three steps to secure a spot for your ward.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              
              <div className="flex flex-col items-start bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="rounded-lg bg-slate-100 p-3 ring-1 ring-slate-200">
                  <FileText className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <dt className="mt-4 font-semibold text-slate-900 text-lg">1. Online Application</dt>
                <dd className="mt-2 leading-7 text-slate-600 text-sm">
                  Fill out the online form with the student's details. You will need to upload a recent passport photograph and birth certificate.
                </dd>
              </div>

              <div className="flex flex-col items-start bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="rounded-lg bg-slate-100 p-3 ring-1 ring-slate-200">
                  <Sparkles className="h-6 w-6 text-purple-600" aria-hidden="true" />
                </div>
                <dt className="mt-4 font-semibold text-slate-900 text-lg">2. Entrance Assessment</dt>
                <dd className="mt-2 leading-7 text-slate-600 text-sm">
                  Once reviewed, your child will be invited for a Computer-Based Test (CBT) covering Mathematics, English, and General Knowledge.
                </dd>
              </div>

              <div className="flex flex-col items-start bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="rounded-lg bg-slate-100 p-3 ring-1 ring-slate-200">
                  <GraduationCap className="h-6 w-6 text-green-600" aria-hidden="true" />
                </div>
                <dt className="mt-4 font-semibold text-slate-900 text-lg">3. Admission Offer</dt>
                <dd className="mt-2 leading-7 text-slate-600 text-sm">
                  Successful candidates will receive a provisional offer letter. Pay the acceptance fee to secure the slot permanently.
                </dd>
              </div>

            </dl>
          </div>
        </div>
      </div>

      {/* Requirements Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 items-center">
            <div className="lg:pr-8 lg:pt-4">
              <div className="lg:max-w-lg">
                <h2 className="text-base font-semibold leading-7 text-blue-600">Prepare Ahead</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Admission Requirements</p>
                <p className="mt-6 text-lg leading-8 text-slate-600">
                  Before you begin the application, please ensure you have digital copies of the following documents ready.
                </p>
                <ul role="list" className="mt-10 space-y-4 text-slate-600">
                  <li className="flex gap-x-3 items-center">
                    <CheckCircle2 className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                    <span>Recent Passport Photograph (White background)</span>
                  </li>
                  <li className="flex gap-x-3 items-center">
                    <CheckCircle2 className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                    <span>Birth Certificate (NPC or Hospital)</span>
                  </li>
                  <li className="flex gap-x-3 items-center">
                    <CheckCircle2 className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                    <span>Last Academic Report (For transfer students)</span>
                  </li>
                  <li className="flex gap-x-3 items-center">
                    <CheckCircle2 className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                    <span>Guardian's ID Card</span>
                  </li>
                </ul>
                <div className="mt-10">
                  <Link href="/admissions/apply" className="text-sm font-semibold leading-6 text-blue-600 hover:text-blue-500 flex items-center gap-2">
                    I have these documents, proceed <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Visual Side (Optional Image) */}
            <div className="relative rounded-2xl bg-slate-50 border border-slate-100 p-8">
               <div className="aspect-[4/3] bg-slate-200 rounded-xl overflow-hidden relative">
                  {/* Placeholder for an image of students studying */}
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <span className="text-sm">School Facilities / Students Image</span>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}