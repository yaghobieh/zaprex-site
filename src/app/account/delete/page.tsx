import { LegalShell, legalMetadata, SUPPORT_EMAIL } from "@/components/legal/LegalShell";

export const metadata = legalMetadata("/account/delete", "Delete your account", "How to delete your Zaprex and Ingot account and the data linked to it.");

const MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Delete my Zaprex account")}&body=${encodeURIComponent("Please delete my Zaprex / Ingot account and its data.\n\nAccount email: ")}`;

export default function DeleteAccountPage() {
  return (
    <LegalShell title="Delete your account" path="/account/delete">
      <p>Zaprex uses your Ingot account. You can ask us to delete it, together with your Zaprex data, at any time.</p>
      <h2>How to request deletion</h2>
      <ul>
        <li>Email <a href={MAILTO}>{SUPPORT_EMAIL}</a> from the email address on your account, with the subject &ldquo;Delete my Zaprex account&rdquo;.</li>
        <li>We may ask you to confirm the request so nobody else can delete your account.</li>
        <li>We delete the account within 30 days and email you when it is done.</li>
      </ul>
      <h2>What gets deleted</h2>
      <ul>
        <li>Your account email, name and sign-in connections.</li>
        <li>Your chats, tasks, routines and Rex run history.</li>
        <li>Stored GitHub access tokens and device push tokens.</li>
      </ul>
      <p>Pull requests Rex already opened stay in your GitHub repositories; delete them there if you want. We keep billing records only as long as the law requires. See the <a href="/privacy">Privacy Policy</a> for details.</p>
    </LegalShell>
  );
}
