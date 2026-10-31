import { LegalShell, legalMetadata, SUPPORT_EMAIL } from "@/components/legal/LegalShell";

export const metadata = legalMetadata("/terms", "Terms of Use", "The terms for using the Zaprex Beta: Rex, the AI coding agent by Ingot, on the web and in the mobile apps.");

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Use" path="/terms">
      <p>These terms cover your use of Zaprex, including Rex, zaprex.dev and the Zaprex apps (the &ldquo;Service&rdquo;), operated by John Yaghobieh (Ingot), Israel. By using the Service you agree to them, and to the <a href="https://www.ingotide.com/legal/terms">Ingot terms</a> for your Ingot account.</p>
      <h2>Beta</h2>
      <p>The Service is in Beta. Features may change, break or be removed, and it is provided &ldquo;as is&rdquo; without warranties of any kind.</p>
      <h2>Your account</h2>
      <p>You need an Ingot account and must be at least 16. Keep your sign-in secure; you are responsible for activity on your account.</p>
      <h2>Your code and content</h2>
      <p>You keep all rights to your code, prompts and outputs. You give us permission to process them only to run the Service for you, as described in the <a href="/privacy">Privacy Policy</a>. Only connect repositories you have the right to use.</p>
      <h2>AI output</h2>
      <p>Rex can be wrong. It opens draft pull requests that you must review before merging. You are responsible for what you merge, ship or run.</p>
      <h2>Acceptable use</h2>
      <p>Do not use the Service to break the law, attack systems, create malware, infringe others&rsquo; rights, or get around plan limits. We may suspend accounts that do.</p>
      <h2>Plans and payment</h2>
      <p>Paid features follow your Ingot plan and its pricing. Usage limits apply.</p>
      <h2>Liability</h2>
      <p>To the extent the law allows, we are not liable for indirect or consequential damages, and our total liability is limited to what you paid us in the 12 months before the claim.</p>
      <h2>Ending</h2>
      <p>You can stop using the Service and <a href="/account/delete">delete your account</a> at any time. These terms are governed by the laws of Israel, with courts in Tel Aviv having jurisdiction.</p>
      <h2>Contact</h2>
      <p><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
    </LegalShell>
  );
}
