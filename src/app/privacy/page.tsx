import { LegalShell, legalMetadata, PRIVACY_EMAIL, SUPPORT_EMAIL } from "@/components/legal/LegalShell";

export const metadata = legalMetadata("/privacy", "Privacy Policy", "How Zaprex (Rex by Ingot) collects, uses, shares and protects your data, and your rights under GDPR and Israeli privacy law.");

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" path="/privacy">
      <p>This policy explains how Zaprex, including the Rex coding agent, the zaprex.dev website and the Zaprex Android and iOS apps (together, the &ldquo;Service&rdquo;), handles your data. The Service is operated by John Yaghobieh (Ingot), Israel (&ldquo;we&rdquo;, &ldquo;us&rdquo;). Zaprex uses your Ingot account; the <a href="https://www.ingotide.com/legal/privacy">Ingot privacy policy</a> also applies to that account.</p>
      <h2>Data we collect</h2>
      <ul>
        <li><b>Account data:</b> your email address and name from your Ingot account (or the Google or GitHub sign-in you used to create it).</li>
        <li><b>Chat and task content:</b> the messages, prompts, tasks and routines you send to Rex, and Rex&rsquo;s replies and run history.</li>
        <li><b>GitHub code context:</b> when you connect GitHub, the repository contents, branches and pull request details Rex needs to do the task you asked for. Rex opens draft pull requests only.</li>
        <li><b>Push token:</b> if you allow notifications in the app, a device push token so we can tell you when a run finishes.</li>
        <li><b>Technical data:</b> basic server logs (IP address, timestamps, errors) used for security and debugging, and usage counts used for plan limits and billing.</li>
      </ul>
      <p>We do not collect your location, contacts, photos or files on your device, and we do not show ads or sell your data.</p>
      <h2>How we use it</h2>
      <ul>
        <li>To provide the Service: run Rex on your tasks, show your history, and sync across web, desktop and mobile.</li>
        <li>To secure the Service, prevent abuse and enforce plan limits.</li>
        <li>To contact you about your account, billing or important changes.</li>
      </ul>
      <p>Our legal bases (GDPR) are performance of our contract with you, our legitimate interests in security and improving the Service, and your consent for push notifications.</p>
      <h2>AI model providers and other processors</h2>
      <p>To answer you, your prompts and the relevant code context are sent to the AI model providers that run the models (for example through OpenRouter and the model vendors it routes to). They process this data on our behalf to generate the response. We also use hosting and infrastructure providers (such as Vercel and Fly.io), GitHub for repository access, and payment processors for billing. We do not use your code or chats to train our own models.</p>
      <h2>Security</h2>
      <p>All traffic between the apps, the website and our servers uses HTTPS (TLS). Access tokens are stored encrypted, and access to production data is limited to the operator.</p>
      <h2>Retention</h2>
      <p>We keep your account data and chat and run history while your account is active. Server logs are kept for up to 90 days. When you delete your account, we delete your personal data and content within 30 days, except where the law requires us to keep billing records.</p>
      <h2>Your rights</h2>
      <p>Under the EU/UK GDPR and the Israeli Protection of Privacy Law, 5741-1981 (including Amendment 13), you can ask to access, correct, export or delete your data, object to or restrict processing, and withdraw consent at any time. You can also complain to your data protection authority, or in Israel to the Privacy Protection Authority. To exercise a right, email <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a> or <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. To delete your account, see <a href="/account/delete">Delete your account</a>.</p>
      <h2>International transfers</h2>
      <p>Our providers may process data outside Israel and the EU, including in the United States. Where required, we rely on appropriate safeguards such as standard contractual clauses.</p>
      <h2>Children</h2>
      <p>The Service is not intended for children under 16, and we do not knowingly collect their data.</p>
      <h2>Changes</h2>
      <p>We will post updates here and change the effective date. For significant changes we will notify you by email or in the app.</p>
      <h2>Contact</h2>
      <p>John Yaghobieh (Ingot), Israel. Email <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a> or <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
    </LegalShell>
  );
}
