// The downscaled photo waits in the buyer's own browser until they pay; only
// then is it sent for analysis (src/lib/photo-analysis.ts). It is never stored
// on our servers. Removed from the browser once the analysis succeeds.
const key = (resultId: string) => `twoje-kolory-photo:${resultId}`;

export function savePhoto(resultId: string, base64Jpeg: string): void {
  try {
    localStorage.setItem(key(resultId), base64Jpeg);
  } catch {
    // Storage full or blocked (private mode): the buyer uploads the photo again after paying.
  }
}

export function loadPhoto(resultId: string): string | null {
  try {
    return localStorage.getItem(key(resultId));
  } catch {
    return null;
  }
}

export function deletePhoto(resultId: string): void {
  try {
    localStorage.removeItem(key(resultId));
  } catch {
    // Nothing to clean up.
  }
}
