export default function Privacy() { 
  return ( 
    <main className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-[#080a1a]"> 
      <div className="max-w-4xl mx-auto bg-[#0f1123] border border-orange-500/10 rounded-2xl p-8 md:p-12 shadow-2xl">
        <h1 className="text-4xl font-extrabold text-orange-500 mb-8 border-b border-orange-500/20 pb-4">
          Privacy Policy
        </h1> 
        
        <div className="space-y-6 text-gray-300 leading-relaxed text-lg">
          <p> 
            <strong className="text-white">Flicker Play</strong> collects basic user information such as name, email, and 
            profile picture via Google OAuth. 
          </p> 
          
          <p> 
            This data is used exclusively for authentication purposes and to improve your personal user experience on our platform. 
          </p> 
          
          <div className="bg-orange-500/5 border-l-4 border-orange-500 p-4 my-6">
            <p className="italic text-orange-200">
              "We value your privacy. We do not sell, share, or trade your personal data with any third parties."
            </p>
          </div>

          <p>
            Our use of information received from Google APIs will adhere to the Google API Service User Data Policy, including the Limited Use requirements.
          </p>

          <p className="pt-4 border-t border-white/5 text-sm text-gray-500">
            For any privacy-related inquiries, please contact us at: 
            <br />
            <span className="text-orange-400 font-medium">maripatechagency@gmail.com</span>
          </p> 
        </div>
      </div>
    </main> 
  ); 
} 
