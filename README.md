# Twoje Kolory Palette

Build the FRONT END ONLY of a Polish-language web app called "Twoje Kolory" (AI seasonal color analysis).
Do NOT set up any backend, database, Supabase, Lovable Cloud, authentication, or payments. Use mock data only. I will connect the real backend myself later.

TECH AND STRUCTURE (important, I will continue in my own codebase)
- React, TypeScript, Tailwind.
- Put ALL fake backend calls in one file: src/lib/api.ts, with these async functions returning mock data after a short delay:
  - analyzePhoto(quizAnswers, photoFile) -> returns a Result object
  - getResult(id) -> returns a Result object (with isPaid true or false)
  - startCheckout(resultId) -> for now, just sets isPaid to true and navigates back
- Define the Result type in src/types/result.ts:
  id, season_pl, season_en, family ("Wiosna" | "Lato" | "Jesień" | "Zima"), description, best_colors (array of {name, hex}), avoid_colors (array of {name, hex}), best_neutrals (array of {name, hex}), confidence (0 to 1), isPaid.
- Put ALL Polish user-facing text in one file: src/content/pl.ts. No hard-coded text in components. (Someone will proofread it later.)
- Add a placeholder file src/lib/tracking.ts with an empty function trackEvent(name, data). Call it at: PageView, QuizStart, QuizComplete, PhotoUploaded, InitiateCheckout.

STYLE
Mobile-first, since users come from Instagram and TikTok ads. Soft, feminine, modern. Warm off-white background, one accent color, rounded cards, lots of white space. Trustworthy, not a cheap quiz.

PAGES
1. Landing page ("/")
   - Headline: "Odkryj swoje kolory w 60 sekund"
   - Subheadline: "Przestań kupować ubrania, w których wyglądasz na zmęczoną."
   - Big button: "Zacznij test"
   - "How it works" in 3 steps: quiz, selfie, your palette.
   - Example result card (use mock data).
   - Footer: "Analiza wykonywana przez AI", and links to Regulamin, Polityka prywatności, Polityka cookies, and "Odstąp od umowy" (simple placeholder pages).

2. Quiz ("/test"): 6 questions, one per screen, progress bar, big tap-friendly answer buttons:
   natural hair color; eye color; vein color on wrist (blue/purple, green, mixed); gold or silver jewelry suits you better; skin in sun (burns, tans easily, burns then tans); which colors people compliment you in.

3. Selfie upload ("/zdjecie")
   - Tips: daylight, no makeup, hair visible, no filter.
   - Required unticked consent checkbox: agree to AI photo processing; photo deleted automatically after 24 hours.
   - Image preview before submitting. Works with phone camera.

4. Analysis loading screen: friendly animation, about 4 seconds.
   - If mock confidence is below 0.6, show a "please retake your photo" screen with the tips again.

5. Result page ("/wynik/:id")
   - If NOT paid (teaser): show only the family, e.g. "Jesteś Latem". Show 3 colors clearly and the rest blurred. Text: "Twój dokładny typ to jeden z 3 typów Lata. Odblokuj pełny wynik." Above the button, a required unticked checkbox: user agrees to immediate delivery of digital content and loses the 14-day withdrawal right. Button: "Odblokuj pełny wynik – 39 zł" calls startCheckout.
   - If paid (full result): exact season name, description, full palette as color swatches with names, colors to avoid, best neutrals, and a "Pobierz kartę kolorów" button (just a placeholder for now).

6. Cookie consent banner in Polish (Accept all / Only necessary). Save the choice in the browser. No real pixels yet.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a6fa3e2c-b5fe-4cd1-9b21-bf2abc553362).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Accounts & email (Supabase Auth + Resend)

Users sign up with email + password at `/rejestracja`, then must enter a 6-digit
code emailed to them at `/weryfikacja` before they can log in at `/logowanie`.
"Forgot password" (`/nie-pamietam-hasla`) emails a code to the same screen,
then `/nowe-haslo` sets the new password. Logged-in users see their saved
results at `/moje-wyniki`; results made before logging in on the same device
are attached to the account on login (`claim_results` in migration 0002).
The code (not a magic link) is deliberate: traffic comes from Instagram/TikTok
in-app browsers, where an email link would open in a different browser.

One-time setup in the Supabase dashboard:

1. **Resend:** verify your sending domain in Resend and create an API key.
2. **Authentication → Emails → SMTP Settings:** enable custom SMTP with host
   `smtp.resend.com`, port `465`, username `resend`, password = the Resend API
   key, and a sender on the verified domain (e.g. `hello@twojekolory.pl`).
   (Or use Resend's Supabase integration, which fills these in for you.)
3. **Authentication → Sign In / Providers → Email:** keep "Confirm email" ON,
   set "Email OTP Length" to `6` (must match `CODE_LENGTH` in
   `src/routes/weryfikacja.tsx`), and set the minimum password length to `8`.
4. **Authentication → Emails:** paste `supabase/templates/confirm-signup.html`
   into "Confirm signup" and `supabase/templates/reset-password.html` into
   "Reset Password", with the subjects noted at the top of each file.
5. **SQL Editor:** run each file in `supabase/migrations/` that hasn't been
   applied yet, in order (0002 adds result ownership, 0003 stops anyone
   from listing all results).
6. **Authentication → Rate Limits:** raise the email rate limit (the built-in
   sender allows only a couple of emails per hour; custom SMTP lifts that).
