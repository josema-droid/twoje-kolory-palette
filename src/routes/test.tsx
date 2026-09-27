import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pl } from "@/content/pl";
import { trackEvent } from "@/lib/tracking";

export const Route = createFileRoute("/test")({
  head: () => ({ meta: [{ title: "Test kolorystyczny — Twoje Kolory" }, { name: "description", content: "Odpowiedz na sześć krótkich pytań o swojej urodzie." }, { property: "og:title", content: "Test kolorystyczny — Twoje Kolory" }, { property: "og:description", content: "Sześć pytań dzieli Cię od osobistej palety kolorów." }] }),
  component: QuizPage,
});

function QuizPage() {
  const navigate = useNavigate({ from: "/test" });
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const question = pl.quiz.questions[step] ?? pl.quiz.questions[0];
  useEffect(() => { trackEvent("QuizStart"); sessionStorage.removeItem("twoje-kolory-answers"); }, []);
  const select = (answer: string) => {
    const next = [...answers]; next[step] = answer; setAnswers(next);
    window.setTimeout(() => {
      if (step === pl.quiz.questions.length - 1) {
        sessionStorage.setItem("twoje-kolory-answers", JSON.stringify(next));
        trackEvent("QuizComplete", { answers: next.length });
        navigate({ to: "/zdjecie" });
      } else setStep(step + 1);
    }, 180);
  };
  return <main className="min-h-[calc(100vh-4.5rem)] bg-secondary/35 px-5 py-8 md:py-16"><div className="mx-auto max-w-2xl"><div className="flex items-center justify-between text-xs font-semibold text-muted-foreground"><Button variant="ghost" size="sm" className="-ml-3 rounded-full" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft size={15} />{pl.back}</Button><span>{pl.quiz.progress} {step + 1} {pl.quiz.of} {pl.quiz.questions.length}</span></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-border"><div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${((step + 1) / pl.quiz.questions.length) * 100}%` }} /></div><section className="mt-10 md:mt-14"><p className="text-center text-xs font-bold uppercase tracking-[.2em] text-primary">{pl.quiz.eyebrow}</p><h1 className="mx-auto mt-4 max-w-xl text-center font-display text-4xl leading-tight md:text-5xl">{question?.title}</h1><p className="mt-4 text-center text-sm text-muted-foreground">{pl.quiz.subtitle}</p><div className="mt-9 grid gap-3">{question?.answers.map((answer) => <Button key={answer} variant={answers[step] === answer ? "default" : "outline"} className="h-auto min-h-16 justify-between rounded-lg px-6 py-4 text-left text-base font-medium shadow-none hover:border-primary hover:bg-primary hover:text-primary-foreground" onClick={() => select(answer)}><span className="whitespace-normal">{answer}</span><ArrowRight className="shrink-0" size={17} /></Button>)}</div></section></div></main>;
}