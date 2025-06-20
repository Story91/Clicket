import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <Link href="/" className="text-purple-600 hover:underline mb-4 inline-block">
            ← Back to Giveaway
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🔒 Privacy Policy
          </h1>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              📋 Information We Collect
            </h2>
            <p className="text-gray-700 mb-4">
              When you participate in our Concert Ticket Giveaway through Clicket, we collect the following information:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Email Address:</strong> To notify winners and send giveaway updates</li>
              <li><strong>Full Name:</strong> For ticket registration and prize verification</li>
              <li><strong>Physical Address:</strong> For shipping prizes and merchandise</li>
              <li><strong>Phone Number (Optional):</strong> For urgent prize-related communications</li>
              <li><strong>Wallet Address:</strong> For transaction verification and NFT delivery</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              🎯 How We Use Your Information
            </h2>
            <p className="text-gray-700 mb-4">
              Your information is used exclusively for giveaway-related purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Conducting the concert ticket giveaway</li>
              <li>Verifying participant eligibility</li>
              <li>Contacting winners and arranging prize delivery</li>
              <li>Shipping physical prizes and merchandise</li>
              <li>Preventing duplicate entries</li>
              <li>Complying with legal requirements for prize distribution</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              🛡️ Data Protection & Security
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>
                We implement appropriate security measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Data is encrypted in transit and at rest</li>
                <li>Access is limited to authorized personnel only</li>
                <li>We use secure servers and trusted infrastructure</li>
                <li>Regular security audits and updates</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              🚫 What We Don't Do
            </h2>
            <div className="bg-green-50 rounded-lg p-4">
              <ul className="list-disc pl-6 text-green-800 space-y-2">
                <li><strong>We DO NOT sell</strong> your personal information to third parties</li>
                <li><strong>We DO NOT share</strong> your data with marketing companies</li>
                <li><strong>We DO NOT use</strong> your information for unrelated marketing</li>
                <li><strong>We DO NOT store</strong> unnecessary data longer than required</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              📤 Data Sharing & Third Parties
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>
                We may share your information only in these limited circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Shipping Partners:</strong> Your address with delivery services for prize shipment</li>
                <li><strong>Event Organizers:</strong> Winner information for ticket registration</li>
                <li><strong>Legal Requirements:</strong> If required by law or legal process</li>
                <li><strong>Service Providers:</strong> With trusted partners who help us operate the giveaway</li>
              </ul>
              <p className="mt-4">
                All third parties are bound by strict confidentiality agreements.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              ⏰ Data Retention
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>We retain your information for the following periods:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Active Giveaway Period:</strong> Until giveaway completion and prize delivery</li>
                <li><strong>Winners:</strong> Up to 1 year for tax reporting and record keeping</li>
                <li><strong>Non-winners:</strong> 90 days after giveaway completion</li>
              </ul>
              <p>
                After these periods, all personal data is securely deleted from our systems.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              ⚖️ Your Rights
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>You have the following rights regarding your personal data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of your stored data</li>
                <li><strong>Correction:</strong> Update incorrect or incomplete information</li>
                <li><strong>Deletion:</strong> Request removal of your data (subject to legal requirements)</li>
                <li><strong>Withdrawal:</strong> Withdraw from the giveaway at any time</li>
                <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              🔗 Smart Wallet & Blockchain Data
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>
                This giveaway uses Coinbase Smart Wallet and Base blockchain technology:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Transaction data is recorded on the Base blockchain (public)</li>
                <li>Personal information is NOT stored on the blockchain</li>
                <li>Wallet addresses are public by nature of blockchain technology</li>
                <li>Smart contract interactions may be visible in blockchain explorers</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              🍪 Cookies & Tracking
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Our website uses minimal tracking:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Essential cookies for wallet connection and functionality</li>
                <li>No advertising or marketing cookies</li>
                <li>No cross-site tracking</li>
                <li>Session storage for user experience improvements</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              📞 Contact Us
            </h2>
            <div className="bg-purple-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or your data:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> privacy@clicket.example.com</p>
                <p><strong>Subject Line:</strong> "Privacy Policy Question - Giveaway"</p>
                <p><strong>Response Time:</strong> Within 48 hours</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              📋 Policy Updates
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>
                We may update this Privacy Policy from time to time. Changes will be:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Posted on this page with an updated "Last modified" date</li>
                <li>Communicated to participants via email for significant changes</li>
                <li>Effective immediately upon posting unless otherwise stated</li>
              </ul>
            </div>
          </section>

          <section className="border-t pt-6 mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              ✅ Consent Summary
            </h2>
            <div className="bg-blue-50 rounded-lg p-6">
              <p className="text-blue-900 font-medium mb-3">
                By participating in this giveaway, you consent to:
              </p>
              <ul className="list-disc pl-6 text-blue-800 space-y-1">
                <li>Collection of the information specified above</li>
                <li>Use of your data for giveaway and prize delivery purposes</li>
                <li>Sharing with necessary third parties as described</li>
                <li>Storage of your data for the specified retention periods</li>
              </ul>
              <p className="text-blue-900 mt-4 font-medium">
                You can withdraw your consent at any time by contacting us.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t text-center">
          <Link 
            href="/" 
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            🎯 Return to Giveaway
          </Link>
        </div>
      </div>
    </div>
  );
} 