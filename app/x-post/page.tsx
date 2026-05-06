import { redirect } from "next/navigation";

export default function XPostPage() {
  redirect("/?tab=dashboard");
}
