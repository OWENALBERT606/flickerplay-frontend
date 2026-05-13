import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - FLICKER PLAY",
  description: "Terms of Service for FLICKER PLAY",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold border-b border-white/10 pb-4 text-orange-500">
          Terms of Service
        </h1>

        <section className="space-y-4">
          <p className="text-gray-400">Last updated: May 13, 2026</p>
          <p>
            Welcome to FLICKER PLAY. By accessing or using our platform, you agree to be bound by the following terms and conditions.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
          <p>
            By using FLICKER PLAY (devkreativ.xyz), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. 
            If you do not agree, please do not use our platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. User Conduct</h2>
          <p>
            Users must not misuse the platform. This includes, but is not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            <li>Attempting to bypass security measures.</li>
            <li>Using the service for any illegal or unauthorized purpose.</li>
            <li>Interfering with other users&apos; access to the platform.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Account Termination</h2>
          <p>
            We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, 
            for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Intellectual Property</h2>
          <p>
            The FLICKER PLAY platform, including its original content, features, and functionality, 
            is and will remain the exclusive property of FLICKER PLAY and its licensors.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Disclaimer of Warranty</h2>
          <p>
            The service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. 
            FLICKER PLAY makes no warranties, expressed or implied, regarding the reliability or availability of the service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Contact Information</h2>
          <p>
            For any questions regarding these Terms of Service, please contact us at:
            <br />
            Email: <a href="mailto:support@devkreativ.xyz" className="text-orange-500 hover:underline">support@devkreativ.xyz</a>
          </p>
        </section>
      </div>
    </main>
  );
}
