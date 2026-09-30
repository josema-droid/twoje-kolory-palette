import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pl } from "@/content/pl";
import {
  firstQuestionId,
  nextQuestionId,
  previousQuestionId,
  progressForQuestion,
  questionById,
  updateAndSanitizeAnswer,
} from "@/content/navigation";
import type { Answers } from "@/content/funnel";
import { trackEvent } from "@/lib/tracking";

export const Route = createFileRoute("/test")({
  head: () => ({ meta: [{ title: "Test kolorystyczny — Twoje Kolory" }, { name: "description", content: "Odpowiedz na pytania o swojej urodzie i stylu." }, { property: "og:title", content: "Test kolorystyczny — Twoje Kolory" }, { property: "og:description", content: "Kilka pytań dzieli Cię od osobistej palety kolorów." }] }),
  component: QuizPage,
});

function QuizPage() {
  const navigate = useNavigate({ from: "/test" });
  const [answers, setAnswers] = useState<Answers>({});
  const [questionId, setQuestionId] = useState(() => firstQuestionId({}));
  const [multiSelection, setMultiSelection] = useState<string[]>([]);
  const advancing = useRef(false);

  useEffect(() => {
    trackEvent("QuizStart");
    sessionStorage.removeItem("twoje-kolory-answers");
  }, []);

  const question = questionById(questionId, answers);
  const progress = progressForQuestion(questionId, answers);
  const previousId = previousQuestionId(questionId, answers);

  useEffect(() => {
    const existing = answers[questionId];
    setMultiSelection(Array.isArray(existing) ? existing : []);
    // Only reset the in-progress multi-selection when the question itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  if (!question) return null;

  const goToNext = (nextAnswers: Answers) => {
    const next = nextQuestionId(questionId, nextAnswers);
    if (next) {
      setQuestionId(next);
      return;
    }
    sessionStorage.setItem("twoje-kolory-answers", JSON.stringify(nextAnswers));
    trackEvent("QuizComplete", { answers: Object.keys(nextAnswers).length });
    navigate({ to: "/zdjecie" });
  };

  const selectSingle = (value: string) => {
    if (advancing.current) return;
    advancing.current = true;
    const next = updateAndSanitizeAnswer(answers, questionId, value);
    setAnswers(next);
    window.setTimeout(() => {
      goToNext(next);
      advancing.current = false;
    }, 180);
  };

  const toggleMulti = (value: string) => {
    const max = question.max ?? question.options.length;
    setMultiSelection((current) => {
      if (current.includes(value)) return current.filter((v) => v !== value);
      if (current.length >= max) return current;
      return [...current, value];
    });
  };

  const confirmMulti = () => {
    if (multiSelection.length === 0) return;
    const next = updateAndSanitizeAnswer(answers, questionId, multiSelection);
    setAnswers(next);
    goToNext(next);
  };

  const isMulti = question.type === "multi";

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-secondary/35 px-5 py-8 md:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <Button variant="ghost" size="sm" className="-ml-3 rounded-full" disabled={!previousId} onClick={() => previousId && setQuestionId(previousId)}>
            <ArrowLeft size={15} />{pl.back}
          </Button>
          <span>{pl.quiz.progress} {progress.current} {pl.quiz.of} {progress.total}</span>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress.percent}%` }} />
        </div>
        <section className="mt-10 md:mt-14">
          <p className="text-center text-xs font-bold uppercase tracking-[.2em] text-primary">{pl.quiz.eyebrow}</p>
          <h1 className="mx-auto mt-4 max-w-xl text-center font-display text-4xl leading-tight md:text-5xl">{question.title}</h1>
          <p className="mt-4 text-center text-sm text-muted-foreground">{question.helper ?? pl.quiz.subtitle}</p>
          <div className="mt-9 grid gap-3">
            {question.options.map((option) => {
              const selected = isMulti ? multiSelection.includes(option) : answers[questionId] === option;
              return (
                <Button
                  key={option}
                  variant={selected ? "default" : "outline"}
                  className="h-auto min-h-16 justify-between rounded-lg px-6 py-4 text-left text-base font-medium shadow-none hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => (isMulti ? toggleMulti(option) : selectSingle(option))}
                >
                  <span className="whitespace-normal">{option}</span>
                  {isMulti ? (selected ? <Check className="shrink-0" size={17} /> : null) : <ArrowRight className="shrink-0" size={17} />}
                </Button>
              );
            })}
          </div>
          {isMulti && (
            <Button className="mt-6 h-13 w-full rounded-full text-base" disabled={multiSelection.length === 0} onClick={confirmMulti}>
              {pl.next}<ArrowRight size={17} />
            </Button>
          )}
        </section>
      </div>
    </main>
  );
}
