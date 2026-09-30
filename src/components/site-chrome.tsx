import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, LogOut, Palette, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pl } from "@/content/pl";
import { useAuthUser } from "@/hooks/use-auth-user";
import { claimLocalResults, signOut } from "@/lib/api";
import { trackEvent } from "@/lib/tracking";

const AUTH_PATHS = ["/logowanie", "/rejestracja", "/weryfikacja", "/nie-pamietam-hasla", "/nowe-haslo"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [cookieChoice, setCookieChoice] = useState<string | null>(null);
  const user = useAuthUser();
  const onAuthPage = AUTH_PATHS.includes(pathname);
  const userId = user?.id;
  // Attach results made on this device before logging in to the account.
  useEffect(() => { if (userId) void claimLocalResults(); }, [userId]);
  useEffect(() => {
    trackEvent("PageView", { path: pathname });
  }, [pathname]);
  useEffect(() => { setCookieChoice(localStorage.getItem("twoje-kolory-cookies")); }, []);
  const choose = (value: string) => {
    localStorage.setItem("twoje-kolory-cookies", value);
    setCookieChoice(value);
  };

  return <div className="min-h-screen bg-background text-foreground">
    <header className="relative z-20 border-b border-border/70 bg-background/95">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 md:h-21 md:px-10">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-foreground md:text-2xl"><span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground"><Sparkles size={17} strokeWidth={1.6} /></span>{pl.brand}<span className="text-primary">.</span></Link>
        <div className="flex items-center gap-1 md:gap-2">
          {user === null && !onAuthPage && <Button asChild variant="ghost" className="h-10 rounded-full px-3 text-xs font-semibold md:h-11 md:px-4 md:text-sm"><Link to="/logowanie" search={pathname === "/" ? {} : { redirect: pathname }} aria-label={pl.auth.navLogin}><UserRound size={17} /><span className="hidden sm:inline">{pl.auth.navLogin}</span></Link></Button>}
          {user && <Button asChild variant="ghost" aria-label={pl.auth.navMyResults} className="h-10 rounded-full px-3 text-xs font-semibold md:h-11 md:px-4 md:text-sm"><Link to="/moje-wyniki"><Palette size={17} /><span className="hidden sm:inline">{pl.auth.navMyResults}</span></Link></Button>}
          {user && <Button variant="ghost" title={user.email} aria-label={pl.auth.navLogout} className="h-10 rounded-full px-3 text-xs font-semibold md:h-11 md:px-4 md:text-sm" onClick={() => void signOut()}><LogOut size={17} /><span className="hidden sm:inline">{pl.auth.navLogout}</span></Button>}
          <Button asChild variant="outline" className="h-10 rounded-full border-primary/25 px-5 text-xs font-semibold text-primary hover:border-primary hover:bg-secondary md:h-11 md:text-sm"><Link to="/test">{pl.navStart}<ArrowRight size={15} /></Link></Button>
        </div>
      </div>
    </header>
    {children}
    <footer className="border-t border-border bg-secondary/45">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-14">
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          <div>
            <Link to="/" className="font-display text-xl font-semibold">{pl.brand}<span className="text-primary">.</span></Link>
            <p className="mt-2 text-sm text-muted-foreground">{pl.footer.note}</p>
            <p className="mt-1 text-sm text-muted-foreground">{pl.footer.tagline}</p>
          </div>
          <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
            <Link to="/regulamin" className="hover:text-primary">{pl.legal.terms.label}</Link>
            <Link to="/polityka-prywatnosci" className="hover:text-primary">{pl.legal.privacy.label}</Link>
            <Link to="/polityka-cookies" className="hover:text-primary">{pl.legal.cookies.label}</Link>
            <Link to="/odstapienie-od-umowy" className="hover:text-primary">{pl.legal.withdrawal.label}</Link>
          </nav>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{pl.footer.contactLabel}</p>
            <a href={`mailto:${pl.footer.contactEmail}`} className="mt-1 inline-block hover:text-primary">{pl.footer.contactEmail}</a>
            <p className="mt-5 flex items-center gap-2 text-xs"><Sparkles size={13} />{pl.footer.techNote}</p>
          </div>
        </div>
        <p className="mt-10 border-t border-border pt-5 text-xs text-muted-foreground">{pl.footer.copyright}</p>
      </div>
    </footer>
    {cookieChoice === null && <aside className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-lg border border-border bg-card p-5 shadow-xl md:bottom-6 md:p-6" role="dialog" aria-label={pl.cookies.title}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6"><div className="flex-1"><p className="font-display text-lg font-semibold">{pl.cookies.title}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{pl.cookies.text}</p></div><div className="flex shrink-0 gap-2"><Button variant="outline" className="h-11 flex-1 rounded-full px-4 text-xs md:flex-none" onClick={() => choose("necessary")}>{pl.cookies.necessary}</Button><Button className="h-11 flex-1 rounded-full px-4 text-xs md:flex-none" onClick={() => choose("all")}>{pl.cookies.accept}</Button></div></div>
    </aside>}
  </div>;
}