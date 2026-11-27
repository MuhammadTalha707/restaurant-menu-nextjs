import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const authed = await isAdminAuthenticated();
  if (authed) {
    redirect("/admin");
  }
  return <LoginForm />;
}