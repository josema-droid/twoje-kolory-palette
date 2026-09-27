import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { pl } from "@/content/pl";

export function LegalPage({ content }: { content: { title: string; text: string } }) {
  return <main className="mx-auto min-h-[60vh] max-w-3xl px-5 py-16 md:py-28"><Link to="/" className="inline-flex items-center gap-2 text-sm text-primary hover:underline"><ArrowLeft size={16} />{pl.backHome}</Link><h1 className="mt-12 font-display text-4xl font-semibold md:text-6xl">{content.title}</h1><p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">{content.text}</p></main>;
}