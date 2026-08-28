import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: { absolute: "Admin login — SmartToolX" },
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-full items-center justify-center px-6 py-16">
      <LoginForm />
    </div>
  );
}
