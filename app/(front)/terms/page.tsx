export default function Terms() { 
  return ( 
    <main className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-[#080a1a]"> 
      <div className="max-w-4xl mx-auto bg-[#0f1123] border border-orange-500/10 rounded-2xl p-8 md:p-12 shadow-2xl">
        <h1 className="text-4xl font-extrabold text-orange-500 mb-8 border-b border-orange-500/20 pb-4">
          Terms of Service
        </h1> 
        
        <div className="space-y-6 text-gray-300 leading-relaxed text-lg">
          <p>
            Welcome to <strong className="text-white">Flicker Play</strong>. By accessing or using our service, you agree to be bound by these terms.
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. User Agreement</h2>
            <p>By using Flicker Play, you agree to use the service responsibly and in compliance with all applicable laws.</p> 
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Account Policies</h2>
            <p>We reserve the right to suspend or terminate accounts that violate our community guidelines or engage in fraudulent activities.</p> 
          </section>

          <div className="bg-orange-500/5 border-l-4 border-orange-500 p-4 my-6">
            <p className="text-gray-300">
              Our service is provided "as is" without any warranties of any kind.
            </p>
          </div>

          <p className="pt-4 border-t border-white/5 text-sm text-gray-500">
            If you have any questions regarding these terms, please contact: 
            <br />
            <span className="text-orange-400 font-medium">maripatechagency@gmail.com</span>
          </p> 
        </div>
      </div>
    </main> 
  ); 
} 
