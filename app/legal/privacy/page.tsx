import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | LeetGaming.PRO',
  description: 'Learn about how LeetGaming.PRO collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <article className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-default-500 mb-8">Last updated: December 6, 2024</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
        <p className="text-default-600 mb-4">
          LeetGaming.PRO (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy
          explains how we collect, use, disclose, and safeguard your information when you use our competitive
          gaming platform and related services.
        </p>
        <p className="text-default-600">
          By using LeetGaming.PRO, you agree to the collection and use of information in accordance with this policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>

        <h3 className="text-lg font-medium mb-2">Account Information</h3>
        <p className="text-default-600 mb-4">
          When you create an account, we collect:
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-1">
          <li>Email address</li>
          <li>Username and display name</li>
          <li>Password (stored securely using industry-standard hashing)</li>
          <li>Profile information (avatar, bio, region)</li>
          <li>Linked gaming accounts (Steam ID, Discord ID, etc.)</li>
        </ul>

        <h3 className="text-lg font-medium mb-2">Gaming Data</h3>
        <p className="text-default-600 mb-4">
          To provide our services, we collect:
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-1">
          <li>Match history and statistics</li>
          <li>Replay files and gameplay data</li>
          <li>Skill ratings and rankings</li>
          <li>Tournament participation and results</li>
          <li>In-game performance metrics</li>
        </ul>

        <h3 className="text-lg font-medium mb-2">Technical Information</h3>
        <p className="text-default-600 mb-4">
          We automatically collect:
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-1">
          <li>IP address and approximate location</li>
          <li>Browser type and version</li>
          <li>Device information and operating system</li>
          <li>Usage patterns and feature interactions</li>
          <li>Error logs and performance data</li>
        </ul>

        <h3 className="text-lg font-medium mb-2">Payment Information</h3>
        <p className="text-default-600">
          For premium features and transactions, we collect payment information through our secure payment
          processors. We do not store complete credit card numbers on our servers.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
        <p className="text-default-600 mb-4">We use your information to:</p>
        <ul className="list-disc pl-6 text-default-600 space-y-1">
          <li>Provide and maintain our gaming platform</li>
          <li>Process matchmaking and skill-based rankings</li>
          <li>Analyze gameplay for anti-cheat and fair play enforcement</li>
          <li>Generate statistics, leaderboards, and player analytics</li>
          <li>Process payments and manage subscriptions</li>
          <li>Send important service updates and notifications</li>
          <li>Provide customer support</li>
          <li>Improve our services through analytics</li>
          <li>Detect and prevent fraud, abuse, and security issues</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">4. Information Sharing</h2>
        <p className="text-default-600 mb-4">
          We may share your information in the following circumstances:
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-2">
          <li>
            <strong>Public Profile:</strong> Your username, avatar, gaming statistics, and match history
            may be visible to other users as part of the competitive gaming experience.
          </li>
          <li>
            <strong>Team and Squad Members:</strong> Information relevant to team coordination may be shared
            with your teammates.
          </li>
          <li>
            <strong>Tournament Organizers:</strong> When you participate in tournaments, relevant information
            may be shared with organizers.
          </li>
          <li>
            <strong>Service Providers:</strong> We work with trusted third parties who help us operate our
            platform (hosting, analytics, payment processing).
          </li>
          <li>
            <strong>Legal Requirements:</strong> We may disclose information when required by law or to
            protect our rights and users&apos; safety.
          </li>
        </ul>
        <p className="text-default-600">
          We do not sell your personal information to third parties.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">5. Data Security</h2>
        <p className="text-default-600 mb-4">
          We implement appropriate technical and organizational measures to protect your data, including:
        </p>
        <ul className="list-disc pl-6 text-default-600 space-y-1">
          <li>Encryption of data in transit (TLS/SSL) and at rest</li>
          <li>Secure password hashing algorithms</li>
          <li>Regular security audits and penetration testing</li>
          <li>Access controls and authentication requirements</li>
          <li>Monitoring for suspicious activities</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">6. Your Rights</h2>
        <p className="text-default-600 mb-4">
          Depending on your location, you may have the following rights:
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-1">
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Correction:</strong> Update or correct inaccurate information</li>
          <li><strong>Deletion:</strong> Request deletion of your account and data</li>
          <li><strong>Portability:</strong> Receive your data in a portable format</li>
          <li><strong>Objection:</strong> Object to certain types of processing</li>
          <li><strong>Restriction:</strong> Request limitation of processing</li>
        </ul>
        <p className="text-default-600">
          To exercise these rights, contact us at{' '}
          <a href="mailto:privacy@leetgaming.pro" className="text-primary hover:underline">
            privacy@leetgaming.pro
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">7. Data Retention</h2>
        <p className="text-default-600 mb-4">
          We retain your data for as long as necessary to provide our services and fulfill the purposes
          described in this policy. Specifically:
        </p>
        <ul className="list-disc pl-6 text-default-600 space-y-1">
          <li>Account data is retained while your account is active</li>
          <li>Gaming statistics may be retained for historical leaderboards</li>
          <li>Payment records are retained as required by law</li>
          <li>After account deletion, most data is removed within 30 days</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">8. International Transfers</h2>
        <p className="text-default-600">
          Your information may be transferred to and processed in countries other than your own. We ensure
          appropriate safeguards are in place to protect your information in accordance with applicable
          data protection laws.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">9. Children&apos;s Privacy</h2>
        <p className="text-default-600">
          LeetGaming.PRO is not intended for children under 13 years of age. We do not knowingly collect
          personal information from children under 13. If you believe we have collected information from
          a child under 13, please contact us immediately.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">10. Changes to This Policy</h2>
        <p className="text-default-600">
          We may update this Privacy Policy periodically. We will notify you of significant changes by
          posting a notice on our platform or sending you an email. Your continued use of our services
          after changes take effect constitutes acceptance of the updated policy.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">11. Contact Us</h2>
        <p className="text-default-600 mb-4">
          For questions or concerns about this Privacy Policy or our data practices, contact us:
        </p>
        <ul className="list-none text-default-600 space-y-1">
          <li>
            Email:{' '}
            <a href="mailto:privacy@leetgaming.pro" className="text-primary hover:underline">
              privacy@leetgaming.pro
            </a>
          </li>
          <li>
            Data Protection Officer:{' '}
            <a href="mailto:dpo@leetgaming.pro" className="text-primary hover:underline">
              dpo@leetgaming.pro
            </a>
          </li>
        </ul>
      </section>
    </article>
  );
}
