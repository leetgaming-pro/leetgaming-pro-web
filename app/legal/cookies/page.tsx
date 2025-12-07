import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | LeetGaming.PRO',
  description: 'Learn about how LeetGaming.PRO uses cookies and similar technologies.',
};

export default function CookiePolicyPage() {
  return (
    <article className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
      <p className="text-default-500 mb-8">Last updated: December 6, 2024</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. What Are Cookies</h2>
        <p className="text-default-600 mb-4">
          Cookies are small text files that are placed on your computer or mobile device when you visit a website.
          They are widely used to make websites work more efficiently and provide information to website owners.
        </p>
        <p className="text-default-600">
          LeetGaming.PRO uses cookies and similar technologies to enhance your gaming experience,
          remember your preferences, and provide personalized content and services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. Types of Cookies We Use</h2>

        <h3 className="text-lg font-medium mb-2">Essential Cookies</h3>
        <p className="text-default-600 mb-4">
          These cookies are necessary for the website to function properly. They enable core functionality such as
          security, network management, account authentication, and accessibility. You cannot opt out of these cookies.
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-1">
          <li>Session management and authentication</li>
          <li>Security tokens and CSRF protection</li>
          <li>Load balancing and server routing</li>
          <li>Cookie consent preferences</li>
        </ul>

        <h3 className="text-lg font-medium mb-2">Functional Cookies</h3>
        <p className="text-default-600 mb-4">
          These cookies enable enhanced functionality and personalization, such as remembering your language
          preferences, region settings, and display preferences.
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-1">
          <li>Language and region preferences</li>
          <li>Theme and display settings (dark/light mode)</li>
          <li>Game preferences and filter settings</li>
          <li>Recently viewed content</li>
        </ul>

        <h3 className="text-lg font-medium mb-2">Analytics Cookies</h3>
        <p className="text-default-600 mb-4">
          These cookies help us understand how visitors interact with our platform by collecting and reporting
          information anonymously. This helps us improve our services.
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-1">
          <li>Page views and navigation patterns</li>
          <li>Feature usage statistics</li>
          <li>Performance monitoring</li>
          <li>Error tracking and debugging</li>
        </ul>

        <h3 className="text-lg font-medium mb-2">Marketing Cookies</h3>
        <p className="text-default-600 mb-4">
          These cookies may be set through our site by our advertising partners to build a profile of your
          interests and show you relevant advertisements on other sites.
        </p>
        <ul className="list-disc pl-6 text-default-600 space-y-1">
          <li>Cross-site tracking for ad personalization</li>
          <li>Campaign effectiveness measurement</li>
          <li>Social media integration</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">3. Third-Party Cookies</h2>
        <p className="text-default-600 mb-4">
          We use services from third parties that may set their own cookies on your device. These include:
        </p>
        <ul className="list-disc pl-6 text-default-600 space-y-1">
          <li><strong>Authentication providers:</strong> Steam, Discord, Google for account linking</li>
          <li><strong>Payment processors:</strong> For secure transaction processing</li>
          <li><strong>Analytics services:</strong> To help us understand platform usage</li>
          <li><strong>Content delivery networks:</strong> To optimize content delivery</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">4. Managing Your Cookie Preferences</h2>
        <p className="text-default-600 mb-4">
          You can control and manage cookies in several ways:
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-2">
          <li>
            <strong>Cookie Settings:</strong> Use our cookie consent banner to accept or reject non-essential
            cookies when you first visit our site.
          </li>
          <li>
            <strong>Browser Settings:</strong> Most browsers allow you to refuse cookies or delete specific
            cookies. Check your browser&apos;s help documentation for instructions.
          </li>
          <li>
            <strong>Device Settings:</strong> On mobile devices, you can typically manage cookie preferences
            through your device settings.
          </li>
        </ul>
        <p className="text-default-600">
          Please note that blocking some cookies may impact your experience on our platform and limit the
          functionality available to you.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">5. Cookie Retention</h2>
        <p className="text-default-600 mb-4">
          Cookies have different retention periods depending on their purpose:
        </p>
        <ul className="list-disc pl-6 text-default-600 space-y-1">
          <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
          <li><strong>Persistent cookies:</strong> Remain on your device for a set period (typically 30 days to 2 years)</li>
          <li><strong>Authentication cookies:</strong> Typically expire after 30 days of inactivity</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">6. Updates to This Policy</h2>
        <p className="text-default-600">
          We may update this Cookie Policy from time to time to reflect changes in our practices or for
          operational, legal, or regulatory reasons. We will notify you of any material changes by posting
          the updated policy on this page with a new &quot;Last updated&quot; date.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">7. Contact Us</h2>
        <p className="text-default-600">
          If you have questions about our use of cookies or this Cookie Policy, please contact us at{' '}
          <a href="mailto:privacy@leetgaming.pro" className="text-primary hover:underline">
            privacy@leetgaming.pro
          </a>
        </p>
      </section>
    </article>
  );
}
