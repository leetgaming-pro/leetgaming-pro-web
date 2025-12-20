import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | LeetGaming.PRO',
  description: 'Read the Terms of Service for using LeetGaming.PRO competitive gaming platform.',
};

export default function TermsOfServicePage() {
  return (
    <article className="prose prose-invert max-w-none prose-headings:text-[#34445C] dark:prose-headings:text-[#F5F0E1] prose-p:text-default-600 prose-li:text-default-600 prose-lg lg:prose-xl">
      <div className="flex items-center gap-4 lg:gap-6 mb-8 lg:mb-10">
        <div className="w-14 h-14 lg:w-16 lg:h-16 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)' }}>
          <span className="text-2xl lg:text-3xl text-[#F5F0E1] dark:text-[#34445C]">📜</span>
        </div>
        <div>
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-0 text-[#34445C] dark:text-[#F5F0E1]">Terms of Service</h1>
          <p className="text-[#FF4654] dark:text-[#DCFF37] text-sm lg:text-base mt-1">Last updated: December 6, 2024</p>
        </div>
      </div>

      <section className="mb-10 lg:mb-12 p-6 lg:p-8 rounded-none border-l-4 border-[#FF4654] dark:border-[#DCFF37] bg-[#34445C]/5 dark:bg-[#DCFF37]/5">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4 text-[#34445C] dark:text-[#F5F0E1]">1. Acceptance of Terms</h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg leading-relaxed">
          Welcome to LeetGaming.PRO. By accessing or using our platform, you agree to be bound by these
          Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not use our services.
        </p>
        <p className="text-default-600 text-base lg:text-lg leading-relaxed">
          These Terms apply to all users, including players, team captains, tournament organizers, and
          spectators. Additional terms may apply to specific features or services.
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">2. Eligibility</h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">To use LeetGaming.PRO, you must:</p>
        <ul className="list-disc pl-6 text-default-600 space-y-2 text-base lg:text-lg">
          <li>Be at least 13 years of age (or the minimum age in your jurisdiction)</li>
          <li>Have the legal capacity to enter into these Terms</li>
          <li>Not be prohibited from using our services under applicable laws</li>
          <li>Not have been previously banned from our platform</li>
        </ul>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">3. Account Registration</h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          When creating an account, you agree to:
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-2 text-base lg:text-lg">
          <li>Provide accurate and complete information</li>
          <li>Maintain the security of your account credentials</li>
          <li>Notify us immediately of any unauthorized access</li>
          <li>Accept responsibility for all activities under your account</li>
          <li>Not share your account with others</li>
          <li>Not create multiple accounts to circumvent restrictions</li>
        </ul>
        <p className="text-default-600 text-base lg:text-lg">
          We reserve the right to suspend or terminate accounts that violate these Terms.
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">4. Fair Play and Conduct</h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          LeetGaming.PRO is committed to maintaining a fair and competitive environment. You agree to:
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-2 text-base lg:text-lg">
          <li>Play fairly and not use cheats, hacks, or exploits</li>
          <li>Not use unauthorized third-party software that provides unfair advantages</li>
          <li>Not manipulate matches or participate in match-fixing</li>
          <li>Not boost accounts or engage in skill manipulation</li>
          <li>Respect other players and maintain sportsmanlike conduct</li>
          <li>Not harass, threaten, or abuse other users</li>
          <li>Not use offensive or inappropriate usernames or content</li>
          <li>Comply with all tournament rules when participating in competitions</li>
        </ul>
        <p className="text-default-600 text-base lg:text-lg">
          Violations may result in warnings, temporary suspensions, permanent bans, or forfeiture of
          winnings and prizes.
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">5. Intellectual Property</h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          LeetGaming.PRO and its content are protected by intellectual property laws. You acknowledge that:
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-2 text-base lg:text-lg">
          <li>We own or license all platform content, designs, and technology</li>
          <li>You may not copy, modify, or distribute our content without permission</li>
          <li>Game replays and statistics may be used by us for platform features</li>
          <li>User-generated content remains yours, but you grant us a license to use it</li>
        </ul>
        <p className="text-default-600 text-base lg:text-lg">
          Third-party game content (CS2, Valorant, etc.) belongs to their respective owners and is used
          under their terms of service.
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">6. Premium Services and Payments</h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          Some features require payment. By purchasing premium services:
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-2 text-base lg:text-lg">
          <li>You authorize us to charge your selected payment method</li>
          <li>Subscriptions auto-renew unless cancelled before the renewal date</li>
          <li>Prices may change with notice before your next billing cycle</li>
          <li>Refunds are handled according to our refund policy</li>
          <li>Virtual items and currency have no real-world value and cannot be exchanged</li>
        </ul>
        <p className="text-default-600 text-base lg:text-lg">
          All prices are displayed in the currency selected at checkout and include applicable taxes.
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">7. Prize Pools and Winnings</h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          For tournaments with prize pools:
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-2 text-base lg:text-lg">
          <li>Prizes are distributed according to tournament rules</li>
          <li>You must verify your identity to claim significant prizes</li>
          <li>You are responsible for any taxes on your winnings</li>
          <li>Prizes may be forfeited for rule violations</li>
          <li>We reserve the right to modify prize structures before tournaments begin</li>
        </ul>
        <p className="text-default-600 text-base lg:text-lg">
          Participation in prize competitions may have additional age and legal requirements based on
          your jurisdiction.
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">8. Content Guidelines</h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          When uploading content (profiles, replays, messages), you agree not to post:
        </p>
        <ul className="list-disc pl-6 text-default-600 space-y-2 text-base lg:text-lg">
          <li>Illegal or harmful content</li>
          <li>Content that infringes intellectual property rights</li>
          <li>Hateful, discriminatory, or offensive material</li>
          <li>Spam, advertisements, or promotional content</li>
          <li>Personal information of others without consent</li>
          <li>Malware or malicious code</li>
        </ul>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">9. Disclaimers</h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          LeetGaming.PRO is provided &quot;as is&quot; without warranties of any kind. We do not guarantee:
        </p>
        <ul className="list-disc pl-6 text-default-600 mb-4 space-y-2 text-base lg:text-lg">
          <li>Uninterrupted or error-free service</li>
          <li>Accuracy of statistics or rankings</li>
          <li>Compatibility with all games or game updates</li>
          <li>Availability of specific features or services</li>
        </ul>
        <p className="text-default-600 text-base lg:text-lg">
          We are not responsible for actions of other users or third-party services.
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
        <p className="text-default-600 text-base lg:text-lg leading-relaxed">
          To the maximum extent permitted by law, LeetGaming.PRO shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages, including loss of profits, data, or
          goodwill, arising from your use of or inability to use our services, even if we have been
          advised of the possibility of such damages.
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">11. Indemnification</h2>
        <p className="text-default-600 text-base lg:text-lg leading-relaxed">
          You agree to indemnify and hold harmless LeetGaming.PRO and its officers, directors, employees,
          and agents from any claims, damages, losses, or expenses arising from your violation of these
          Terms or your use of our services.
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">12. Modifications to Terms</h2>
        <p className="text-default-600 text-base lg:text-lg leading-relaxed">
          We may modify these Terms at any time. Material changes will be communicated through our platform
          or via email. Your continued use after changes take effect constitutes acceptance of the modified
          Terms. If you do not agree to the changes, you must stop using our services.
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">13. Termination</h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          We may suspend or terminate your access to LeetGaming.PRO at any time for violation of these
          Terms or for any other reason at our discretion. Upon termination:
        </p>
        <ul className="list-disc pl-6 text-default-600 space-y-2 text-base lg:text-lg">
          <li>Your right to use the platform ceases immediately</li>
          <li>We may delete your account and data</li>
          <li>You forfeit any unredeemed virtual items or currency</li>
          <li>Provisions that should survive termination will remain in effect</li>
        </ul>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">14. Governing Law</h2>
        <p className="text-default-600 text-base lg:text-lg leading-relaxed">
          These Terms are governed by and construed in accordance with applicable laws. Any disputes
          arising from these Terms or your use of our services shall be resolved through binding
          arbitration or in the courts of the applicable jurisdiction.
        </p>
      </section>

      <section className="mb-10 lg:mb-12">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">15. Severability</h2>
        <p className="text-default-600 text-base lg:text-lg leading-relaxed">
          If any provision of these Terms is found to be unenforceable or invalid, that provision shall
          be limited or eliminated to the minimum extent necessary, and the remaining provisions shall
          remain in full force and effect.
        </p>
      </section>

      <section>
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">16. Contact Information</h2>
        <p className="text-default-600 mb-4 text-base lg:text-lg">
          For questions about these Terms, please contact us:
        </p>
        <ul className="list-none text-default-600 space-y-2 text-base lg:text-lg">
          <li>
            Email:{' '}
            <a href="mailto:legal@leetgaming.pro" className="text-[#FF4654] dark:text-[#DCFF37] hover:underline">
              legal@leetgaming.pro
            </a>
          </li>
          <li>
            Support:{' '}
            <a href="mailto:support@leetgaming.pro" className="text-[#FF4654] dark:text-[#DCFF37] hover:underline">
              support@leetgaming.pro
            </a>
          </li>
        </ul>
      </section>
    </article>
  );
}
