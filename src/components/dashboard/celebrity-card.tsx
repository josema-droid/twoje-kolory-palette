import { useEffect, useState } from "react";
import { SHOW_CELEBRITY_PHOTOS, type Celebrity } from "@/content/celebrities";
import type { Swatch } from "@/content/dashboard";

type Photo = { src: string; credit: string; license: string; filePage: string };

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

/**
 * Loads the celebrity's lead portrait from Wikipedia and shows it only when it is
 * freely licensed (CC / public domain), with photographer and licence credit.
 */
async function loadPortrait(wiki: string, signal: AbortSignal): Promise<Photo | null> {
  const api = "https://en.wikipedia.org/w/api.php?format=json&origin=*&action=query";
  const page = await (await fetch(`${api}&prop=pageimages&piprop=name|thumbnail&pithumbsize=480&titles=${encodeURIComponent(wiki.replace(/_/g, " "))}`, { signal })).json();
  const p = Object.values(page?.query?.pages ?? {})[0] as { pageimage?: string; thumbnail?: { source: string } } | undefined;
  if (!p?.pageimage || !p.thumbnail) return null;
  const info = await (await fetch(`${api}&prop=imageinfo&iiprop=extmetadata&titles=${encodeURIComponent(`File:${p.pageimage}`)}`, { signal })).json();
  const file = Object.values(info?.query?.pages ?? {})[0] as { imageinfo?: { extmetadata?: Record<string, { value: string }> }[] } | undefined;
  const meta = file?.imageinfo?.[0]?.extmetadata ?? {};
  const license = meta["LicenseShortName"]?.value ?? "";
  if (!/(^CC|CC0|public domain|^PD)/i.test(license)) return null; // never show non-free images
  return {
    src: p.thumbnail.source,
    credit: stripHtml(meta["Artist"]?.value ?? "") || "Wikimedia Commons",
    license,
    filePage: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(p.pageimage)}`,
  };
}

export function CelebrityCard({ celebrity, palette }: { celebrity: Celebrity; palette: readonly Swatch[] }) {
  const [photo, setPhoto] = useState<Photo | null>(null);
  useEffect(() => {
    if (!SHOW_CELEBRITY_PHOTOS) return;
    const controller = new AbortController();
    loadPortrait(celebrity.wiki, controller.signal).then(setPhoto).catch(() => setPhoto(null));
    return () => controller.abort();
  }, [celebrity.wiki]);

  // Without a free photo, a "portrait" made of the type's palette stands in.
  const gradient = `conic-gradient(${palette.map((c, i) => `${c.hex} ${(i / palette.length) * 100}% ${((i + 1) / palette.length) * 100}%`).join(", ")})`;
  return (
    <figure className="dash-celeb">
      <div className="dash-celeb__img">
        {photo ? <img src={photo.src} alt={`${celebrity.name} — portret`} loading="lazy" decoding="async" referrerPolicy="no-referrer" /> : <span className="dash-celeb__palette" style={{ background: gradient }} aria-hidden="true" />}
      </div>
      <figcaption>
        <span className="dash-celeb__name">{celebrity.name}</span>
        {photo && (
          <span className="dash-celeb__credit">
            Fot.: {photo.credit} · <a href={photo.filePage} target="_blank" rel="noopener noreferrer">{photo.license}</a>, Wikimedia Commons
          </span>
        )}
      </figcaption>
    </figure>
  );
}
