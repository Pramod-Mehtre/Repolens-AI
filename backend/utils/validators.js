/**
 * Parses a GitHub URL and extracts owner and repo name.
 * Supports formats:
 *   - https://github.com/owner/repo
 *   - https://github.com/owner/repo.git
 *   - https://github.com/owner/repo/tree/branch
 *   - github.com/owner/repo
 */
export function parseGitHubUrl(url) {
  if (!url || typeof url !== "string") {
    return { valid: false, error: "Please provide a GitHub repository URL." };
  }

  let cleaned = url.trim();

  // Add protocol if missing
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = "https://" + cleaned;
  }

  try {
    const parsed = new URL(cleaned);

    if (
      parsed.hostname !== "github.com" &&
      parsed.hostname !== "www.github.com"
    ) {
      return {
        valid: false,
        error: "URL must be a GitHub repository (github.com).",
      };
    }

    // Extract path segments, filtering empty strings
    const segments = parsed.pathname.split("/").filter(Boolean);

    if (segments.length < 2) {
      return {
        valid: false,
        error:
          "Invalid GitHub URL. Expected format: https://github.com/owner/repo",
      };
    }

    const owner = segments[0];
    let repo = segments[1];

    // Remove .git suffix
    if (repo.endsWith(".git")) {
      repo = repo.slice(0, -4);
    }

    // Basic validation
    if (!/^[a-zA-Z0-9._-]+$/.test(owner) || !/^[a-zA-Z0-9._-]+$/.test(repo)) {
      return { valid: false, error: "Invalid repository owner or name." };
    }

    return { valid: true, owner, repo };
  } catch {
    return {
      valid: false,
      error: "Invalid URL format. Please provide a valid GitHub URL.",
    };
  }
}
