export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-muted-foreground">Last updated: April 3, 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold">1. Introduction</h2>
          <p>
            Social Copilot ("we", "our", "us") operates the elo-pro.com website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li><strong>Account Information:</strong> Email address and profile data provided through Clerk authentication.</li>
            <li><strong>Social Media Data:</strong> When you connect social media accounts (Facebook, Instagram, LinkedIn), we store access tokens (encrypted) and account identifiers to manage posts and comments on your behalf.</li>
            <li><strong>Content Data:</strong> Posts, media files, comments, and replies you create or manage through our platform.</li>
            <li><strong>Usage Data:</strong> Basic usage information to improve our service.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>To provide and maintain our social media management service</li>
            <li>To publish posts to your connected social media accounts</li>
            <li>To monitor and manage comments on your posts</li>
            <li>To generate AI-powered content suggestions and auto-replies</li>
            <li>To schedule and manage your social media content</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Data Security</h2>
          <p>
            All social media access tokens are encrypted at rest using AES-256-GCM encryption. We use industry-standard security measures to protect your data. Our service is hosted on secure infrastructure with SSL/TLS encryption for all data in transit.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. Third-Party Services</h2>
          <p>We integrate with the following third-party services:</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li><strong>Clerk:</strong> For user authentication and session management.</li>
            <li><strong>Meta (Facebook/Instagram):</strong> To publish posts and manage comments via the Graph API.</li>
            <li><strong>LinkedIn:</strong> To publish posts and manage comments via the LinkedIn API.</li>
            <li><strong>Anthropic (Claude AI):</strong> To generate content suggestions and auto-replies. Your content may be sent to Anthropic's API for processing.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">6. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active. You can disconnect social media accounts at any time, which removes stored tokens. You may request deletion of your account and all associated data by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Disconnect social media accounts at any time</li>
            <li>Withdraw consent for data processing</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">8. Contact</h2>
          <p>
            For any questions about this Privacy Policy, please contact us at the email address associated with your account administrator.
          </p>
        </section>
      </div>
    </div>
  )
}
