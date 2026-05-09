import { connectDb } from "@/lib/db/connect";
import { Settings } from "@/lib/db/models";
import { requireUser } from "@/lib/session-guard";
import { SettingsForm } from "./settings-form";

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
      </header>
      <SettingsForm
        initial={{
          defaultRestSeconds: s?.defaultRestSeconds ?? 90,
          rpeEnabled: s?.rpeEnabled ?? true,
        }}
      />
    </div>
  );
}
