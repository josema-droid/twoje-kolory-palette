import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pl } from "@/content/pl";
import { useAuthUser } from "@/hooks/use-auth-user";
import { trackEvent } from "@/lib/tracking";
import { disableAnalytics, enableAnalytics } from "@/lib/analytics";
import { ShareButton } from "@/components/share-button";
import logoMark from "@/assets/landing/twoj-color-logo.png";

const seasonLinks = pl.landing.seasons.list.map((s) => ({ slug: s.key, label: s.label }));

const AUTH_PATHS = ["/logowanie", "/rejestracja", "/weryfikacja", "/nie-pamietam-hasla", "/nowe-haslo"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [cookieChoice, setCookieChoice] = useState<string | null>(null);
  const user = useAuthUser();
  const onAuthPage = AUTH_PATHS.includes(pathname);
  const userId = user?.id;
  // Attach results made on this device before logging in to the account.
  useEffect(() => { if (userId) void import("@/lib/api").then((api) => api.claimLocalResults()); }, [userId]);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    trackEvent("PageView", { path: pathname });
    setMenuOpen(false); // close the mobile menu after navigating
  }, [pathname]);
  useEffect(() => {
    const saved = localStorage.getItem("twoje-kolory-cookies");
    setCookieChoice(saved);
    if (saved === "all") enableAnalytics();
  }, []);
  const [bannerOpen, setBannerOpen] = useState(false);
  const choose = (value: string) => {
    localStorage.setItem("twoje-kolory-cookies", value);
    setCookieChoice(value);
    setBannerOpen(false);
    // Google Analytics runs only with consent ("Akceptuj wszystkie").
    if (value === "all") enableAnalytics();
    else disableAnalytics();
  };

  return <div className="min-h-screen bg-background text-foreground">
    <a className="skip-link" href="#main">{pl.skipToContent}</a>
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="logo" aria-label={pl.navHome}>
          <img className="logo__mark" src={logoMark} width={264} height={324} alt="" />
          <span className="logo__text">Twój<br />Color</span>
        </Link>

        <button type="button" className="nav-toggle" aria-controls="site-nav" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          <span className="sr-only">{pl.navMenu}</span>
          <span className="nav-toggle__bar" aria-hidden="true" />
        </button>

        <nav className={`site-nav${menuOpen ? " is-open" : ""}`} id="site-nav" aria-label="Główna nawigacja">
          <ul className="site-nav__list">
            <li><a className="site-nav__link" href="/#faq" onClick={() => setMenuOpen(false)}>{pl.navFaq}</a></li>
            {user === null && !onAuthPage && <li><Link className="site-nav__link" to="/logowanie" search={pathname === "/" ? {} : { redirect: pathname }}>{pl.auth.navLogin}</Link></li>}
            {user && <li><Link className="site-nav__link" to="/moje-wyniki">{pl.auth.navMyResults}</Link></li>}
            {user && <li><button type="button" className="site-nav__link" title={user.email} onClick={() => void import("@/lib/api").then((api) => api.signOut())}>{pl.auth.navLogout}</button></li>}
          </ul>
          <Link className="lp-btn lp-btn--light" to="/test">{pl.navStart} <span className="lp-btn__arrow" aria-hidden="true">➜</span></Link>
        </nav>
      </div>
    </header>
    <div id="main" tabIndex={-1} className="outline-none">{children}</div>
    <footer className="border-t border-border bg-secondary/45">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-14">
        <div className="grid gap-10 md:grid-cols-4 md:gap-8">
          <div>
            <Link to="/" className="font-display text-xl font-semibold">{pl.brand}<span className="text-primary">.</span></Link>
            <p className="mt-2 text-sm text-muted-foreground">{pl.footer.note}</p>
            <p className="mt-1 text-sm text-muted-foreground">{pl.footer.tagline}</p>
          </div>
          <nav aria-label={pl.footer.guideLabel} className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{pl.footer.guideLabel}</p>
            <Link to="/typy-urody" className="hover:text-primary">{pl.footer.guideAll}</Link>
            {seasonLinks.map((s) => <Link key={s.slug} to="/typy-urody/$slug" params={{ slug: s.slug }} className="hover:text-primary">{s.label}</Link>)}
          </nav>
          <nav aria-label={pl.footer.legalLabel} className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{pl.footer.legalLabel}</p>
            <Link to="/regulamin" className="hover:text-primary">{pl.legal.terms.label}</Link>
            <Link to="/polityka-prywatnosci" className="hover:text-primary">{pl.legal.privacy.label}</Link>
            <Link to="/polityka-cookies" className="hover:text-primary">{pl.legal.cookies.label}</Link>
            <Link to="/odstapienie-umowy" className="hover:text-primary">{pl.legal.withdrawal.label}</Link>
            <button type="button" onClick={() => setBannerOpen(true)} className="text-left hover:text-primary">{pl.cookies.settings}</button>
          </nav>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{pl.footer.contactLabel}</p>
            <a href={`mailto:${pl.footer.contactEmail}`} className="mt-1 inline-block hover:text-primary">{pl.footer.contactEmail}</a>
            <p className="mt-5 flex items-center gap-2 text-xs"><Sparkles size={13} />{pl.footer.techNote}</p>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
          <p className="text-xs text-muted-foreground">{pl.footer.copyright}</p>
          <ShareButton />
        </div>
      </div>
    </footer>
    {(cookieChoice === null || bannerOpen) && <aside className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-lg border border-border bg-card p-5 shadow-xl md:bottom-6 md:p-6" role="dialog" aria-label={pl.cookies.title}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6"><div className="flex-1"><p className="font-display text-lg font-semibold">{pl.cookies.title}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{pl.cookies.text}</p></div><div className="flex shrink-0 gap-2"><Button variant="outline" className="h-11 flex-1 rounded-full px-4 text-xs md:flex-none" onClick={() => choose("necessary")}>{pl.cookies.necessary}</Button><Button className="h-11 flex-1 rounded-full px-4 text-xs md:flex-none" onClick={() => choose("all")}>{pl.cookies.accept}</Button></div></div>
    </aside>}
  </div>;
}