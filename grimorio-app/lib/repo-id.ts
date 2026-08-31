export function repoIdFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/\./g, "-");
    const path = u.pathname
      .replace(/[\/.]+/g, "-")
      .replace(/^-/, "")
      .slice(0, 24) || "root";
    return `${host}-${path}`;
  } catch {
    let h = 0;
    for (let i = 0; i < url.length; i++) {
      h = (h * 31 + url.charCodeAt(i)) | 0;
    }
    return `repo-${Math.abs(h).toString(36)}`;
  }
}