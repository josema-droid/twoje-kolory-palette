import { commonStart, getQuestionsForPath, getVisibleQuestions, type Answers, type Question } from "./funnel";

export function getAllQuestionsForCurrentPath(answers: Answers): Question[] {
  const start = getVisibleQuestions(commonStart, answers);
  const path = getQuestionsForPath(answers);
  if (!path) return start;
  return [...start, ...getVisibleQuestions(path, answers)];
}

export function getAllPotentialQuestionIds(answers: Answers): Set<string> {
  const ids = new Set<string>(commonStart.map((q) => q.id));
  getQuestionsForPath(answers)?.forEach((q) => ids.add(q.id));
  return ids;
}

/**
 * Removes answers that no longer belong to the active dynamic path.
 * It iterates because removing one hidden parent answer can hide another child.
 */
export function sanitizeAnswers(input: Answers): Answers {
  let answers: Answers = { ...input };

  for (let iteration = 0; iteration < 8; iteration += 1) {
    const active = new Set(getAllQuestionsForCurrentPath(answers).map((q) => q.id));
    const potential = getAllPotentialQuestionIds(answers);
    let changed = false;
    const next: Answers = {};

    for (const [key, value] of Object.entries(answers)) {
      // Keep only answers that exist on the current demographic path AND are currently visible.
      if (potential.has(key) && active.has(key)) {
        next[key] = value;
      } else {
        changed = true;
      }
    }

    answers = next;
    if (!changed) break;
  }

  return answers;
}

export function updateAndSanitizeAnswer(
  answers: Answers,
  questionId: string,
  value: string | string[]
): Answers {
  return sanitizeAnswers({ ...answers, [questionId]: value });
}

export function firstQuestionId(answers: Answers): string {
  return getAllQuestionsForCurrentPath(answers)[0]?.id ?? "gender";
}

export function nextQuestionId(currentId: string, answers: Answers): string | null {
  const questions = getAllQuestionsForCurrentPath(answers);
  const index = questions.findIndex((q) => q.id === currentId);
  if (index < 0) return questions[0]?.id ?? null;
  return questions[index + 1]?.id ?? null;
}

export function previousQuestionId(currentId: string, answers: Answers): string | null {
  const questions = getAllQuestionsForCurrentPath(answers);
  const index = questions.findIndex((q) => q.id === currentId);
  if (index <= 0) return null;
  return questions[index - 1]?.id ?? null;
}

export function questionById(id: string, answers: Answers): Question | null {
  return getAllQuestionsForCurrentPath(answers).find((q) => q.id === id) ?? null;
}

export function progressForQuestion(id: string, answers: Answers) {
  const questions = getAllQuestionsForCurrentPath(answers);
  const index = Math.max(0, questions.findIndex((q) => q.id === id));
  return {
    current: index + 1,
    total: Math.max(questions.length, 1),
    percent: ((index + 1) / Math.max(questions.length, 1)) * 100,
  };
}
