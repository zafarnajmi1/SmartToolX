import { LoginForm } from "@/components/admin/LoginForm";
import { seoMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return seoMetadata("/admin/login");
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-full items-center justify-center px-6 py-16">
      <LoginForm />
    </div>
  );
}
