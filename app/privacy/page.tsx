import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - FLICKER PLAY",
  description: "Privacy Policy for FLICKER PLAY",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold border-b border-white/10 pb-4 text-orange-500">
          Privacy Policy
        </h1>

        <section className="space-y-4">
          <p className="text-gray-400">Last updated: May 13, 2026</p>
          <p>
            At FLICKER PLAY, we value your privacy and are committed to protecting your personal data. 
            This policy explains how we collect and use information when you use our services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Data Collection</h2>
          <p>
            When you sign in using Google OAuth, we collect the following information:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            <li>Your email address</li>
            <li>Your full name</li>
            <li>Your profile picture URL</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. How We Use Your Data</h2>
          <p>The information collected is used strictly for:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            <li>Authenticating your identity and managing your account.</li>
            <li>Providing access to your personalized content and settings.</li>
            <li>Communication regarding your account status or support requests.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Data Storage and Security</h2>
          <p>
            Your data is stored securely in our PostgreSQL database. 
            We implement industry-standard security measures to protect your information from unauthorized access or disclosure.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Third-Party Services</h2>
          <p>
            We use Google OAuth as a third-party authentication service. 
            Your use of Google services is governed by Google&apos;s Privacy Policy. 
            We do not sell, trade, or otherwise transfer your user data to outside parties.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Data Deletion</h2>
          <p>
            Users have the right to request the deletion of their data at any time. 
            If you wish to delete your account and associated data, please contact us at 
            <a href="mailto:support@devkreativ.xyz" className="text-orange-500 hover:underline ml-1">
              support@devkreativ.xyz
            </a>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            Email: <a href="mailto:support@devkreativ.xyz" className="text-orange-500 hover:underline">support@devkreativ.xyz</a>
            <br />
            Domain: devkreativ.xyz
          </p>
        </section>
      </div>
    </main>
  );
}
