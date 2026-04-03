export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-muted-foreground">Last updated: April 3, 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Social Copilot at elo-pro.com ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. Description of Service</h2>
          <p>
            Social Copilot is a social media management platform that allows authorized users to manage social media accounts, create and schedule posts, monitor comments, and use AI-powered content assistance. The Service is intended for internal business use.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. User Accounts</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Access is granted by invitation from an administrator.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>You must not share your account with unauthorized individuals.</li>
            <li>Administrators can manage user roles and access levels.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Use the Service to violate any social media platform's terms of service</li>
            <li>Post spam, misleading, or harmful content through the Service</li>
            <li>Attempt to gain unauthorized access to other users' accounts or data</li>
            <li>Use the Service for any illegal or unauthorized purpose</li>
            <li>Bypass or interfere with security features of the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. Social Media Accounts</h2>
          <p>
            By connecting your social media accounts, you authorize Social Copilot to access and manage those accounts on your behalf, including publishing posts, reading comments, and posting replies. You remain responsible for all content published through the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">6. AI-Generated Content</h2>
          <p>
            The Service uses artificial intelligence to suggest content and generate auto-replies. All AI-generated replies require human review and approval before posting. You are responsible for reviewing and approving all content before it is published to social media platforms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">7. Data and Content</h2>
          <p>
            You retain ownership of all content you create and publish through the Service. We do not claim any ownership rights over your content. You grant us a limited license to store and process your content solely for the purpose of providing the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">8. Limitation of Liability</h2>
          <p>
            The Service is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of the Service, including but not limited to issues with social media platform APIs, failed post publications, or AI-generated content.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">9. Termination</h2>
          <p>
            We may terminate or suspend access to the Service at any time, with or without cause. Upon termination, your right to use the Service ceases immediately. You may request export or deletion of your data upon termination.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">10. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">11. Contact</h2>
          <p>
            For questions about these Terms of Service, please contact the account administrator.
          </p>
        </section>
      </div>
    </div>
  )
}
