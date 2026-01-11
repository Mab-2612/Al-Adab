import Navbar from "@/components/website/Navbar"
import Footer from "@/components/website/Footer" 

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      <Navbar />

      <main className="flex-1 pt-16">
        {children}
      </main>

      <Footer />
    </div>
  )
}