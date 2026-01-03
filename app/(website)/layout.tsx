import Navbar from "@/components/website/Navbar" // 👈 Import the new component

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Smart Navbar (Handles Mobile & Active States) */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 pt-16">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Al-Adab School. Building Leaders for Tomorrow.
          </p>
        </div>
      </footer>
    </div>
  )
}