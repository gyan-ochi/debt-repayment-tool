import { AppClient } from "@/components/app-client";

const tabs = ["dashboard", "input", "debts", "graphs"] as const;
type TabKey = (typeof tabs)[number];

function isTabKey(value: string | undefined): value is TabKey {
  return tabs.includes((value ?? "") as TabKey);
}

export default async function HomePage({
  searchParams
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolved = searchParams ? await searchParams : undefined;
  const initialTab: TabKey = isTabKey(resolved?.tab) ? resolved.tab : "dashboard";

  return <AppClient initialTab={initialTab} />;
}
