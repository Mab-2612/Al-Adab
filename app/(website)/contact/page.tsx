import { Mail, MapPin, Phone } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="grid md:grid-cols-2">
          
          {/* Info Side */}
          <div className="bg-slate-900 p-12 text-white">
            <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <MapPin className="w-6 h-6 text-blue-400 mt-1" />
                <div>
                  <h4 className="font-bold text-lg">Visit Us</h4>
                  <p className="text-slate-400">Al-Adab Comprehensive College,<br/>Gbede-Ogun, Off Akanran Rd., Ibadan.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Phone className="w-6 h-6 text-blue-400 mt-1" />
                <div>
                  <h4 className="font-bold text-lg">Call Us</h4>
                  <p className="text-slate-400">+234 906 433 0233<br/>+234 912 737 1638</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Mail className="w-6 h-6 text-blue-400 mt-1" />
                <div>
                  <h4 className="font-bold text-lg">Email Us</h4>
                  <p className="text-slate-400">aladab008@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="p-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Send a Message</h2>
            <form className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Name</label>
                <input type="text" className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <input type="email" className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Message</label>
                <textarea rows={4} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">
                Send Inquiry
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}