import { AdminShell } from "@/components/admin/AdminShell";
import { MessageList } from "@/components/admin/MessageList";
import { getContactMessages } from "@/lib/contact-messages";
import { seoMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return seoMetadata("/admin/messages");
}

export default async function AdminMessagesPage() {
  const messages = await getContactMessages();

  return (
    <AdminShell title="Messages">
      <p className="text-text-dim mb-8 max-w-[640px] text-[14px] leading-[1.6]">
        Notes sent from the public Contact Us form. Reply from your email
        client. Delete a message after you have handled it.
      </p>
      <MessageList messages={messages} />
    </AdminShell>
  );
}
