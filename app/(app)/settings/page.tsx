import { connectDb } from "@/lib/db/connect";
import { Settings } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { SettingsForm } from "./settings-form";
import { SignOutButton } from "./sign-out-button";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { email } = await requireUser();
  await connectDb();
  const s = await Settings.findOne({ ownerEmail: email }).lean<any>();
  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Settings</p>
        <h1 className="font-display text-headline-xl">Configuration</h1>
        <p className="mt-1 text-sm text-muted-foreground">{email}</p>
      </header>
      <SettingsForm
        initial={{
          units: s?.units ?? "kg",
          defaultRestSeconds: s?.defaultRestSeconds ?? 90,
          rpeEnabled: s?.rpeEnabled ?? true,
          showWarmups: s?.showWarmups ?? true,
        }}
      />
      <SignOutButton />
    </div>
  );
}
