import { AppShell } from "@/components/app-shell/app-shell";
import { QaBoard } from "@/components/community/qa-board";
import { getQuestions } from "@/lib/data/trademind";

export default async function QuestionsPage() {
  const seed = await getQuestions();
  return (
    <AppShell>
      <QaBoard seed={seed} />
    </AppShell>
  );
}
