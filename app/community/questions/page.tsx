import { AppShell } from "@/components/app-shell/app-shell";
import { QuestionList } from "@/components/community/question-list";
import { getQuestions } from "@/lib/data/trademind";

export default async function QuestionsPage() {
  const questions = await getQuestions();
  return (
    <AppShell>
      <QuestionList questions={questions} />
    </AppShell>
  );
}
