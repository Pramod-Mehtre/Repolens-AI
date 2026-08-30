/**
 * GitHub Service
 * Fetches comprehensive repository data from the GitHub REST API.
 * Limits data to keep responses fast and avoid exceeding token limits.
 */

import NodeCache from "node-cache";
import { logger } from "../utils/logger.js";

const GITHUB_API = "https://api.github.com";

// Max repo size in KB (500 MB) — reject anything larger
const MAX_REPO_SIZE_KB = 500 * 1024;

// Timeout for all GitHub API requests (15 seconds)
const GITHUB_TIMEOUT_MS = 15_000;

// Cache for 10 minutes (600 seconds), check for expired keys every 2 minutes
const repoCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

function getHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "RepoLens-AI/1.0",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

/**
 * Fetch a GitHub API endpoint with timeout and proper error handling.
 */
async function githubFetch(endpoint) {
  const url = `${GITHUB_API}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GITHUB_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(url, {
      headers: getHeaders(),
      signal: controller.signal,
    });
  } catch (fetchErr) {
    if (fetchErr.name === "AbortError") {
      const err = new Error("GitHub API request timed out.");
      err.statusCode = 504;
      err.errorType = "GITHUB_ERROR";
      throw err;
    }
    const err = new Error("Failed to connect to GitHub API.");
    err.statusCode = 502;
    err.errorType = "GITHUB_ERROR";
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (res.status === 404) {
    const err = new Error("Repository not found. Make sure it exists and is public.");
    err.statusCode = 404;
    err.errorType = "NOT_FOUND";
    throw err;
  }

  if (res.status === 403) {
    const rateLimitRemaining = res.headers.get("x-ratelimit-remaining");
    const rateLimitReset = res.headers.get("x-ratelimit-reset");

    if (rateLimitRemaining === "0") {
      const resetTime = rateLimitReset
        ? new Date(parseInt(rateLimitReset, 10) * 1000).toLocaleTimeString()
        : "soon";
      const err = new Error(
        `GitHub API rate limit exceeded. Try again after ${resetTime}.`
      );
      err.statusCode = 429;
      err.errorType = "RATE_LIMIT";
      throw err;
    }

    const err = new Error("Access forbidden. The repository may be private or restricted.");
    err.statusCode = 403;
    err.errorType = "FORBIDDEN";
    throw err;
  }

  if (res.status === 429) {
    const err = new Error("GitHub API rate limit exceeded. Try again later.");
    err.statusCode = 429;
    err.errorType = "RATE_LIMIT";
    throw err;
  }

  if (!res.ok) {
    const err = new Error("GitHub API returned an error. Please try again.");
    err.statusCode = 502;
    err.errorType = "GITHUB_ERROR";
    throw err;
  }

  return res.json();
}

/**
 * Fetch the README content, decoded from base64.
 * Returns null if no README exists. Truncated to keep prompt size manageable.
 */
async function fetchReadme(owner, repo) {
  try {
    const data = await githubFetch(`/repos/${owner}/${repo}/readme`);
    if (data.content && data.encoding === "base64") {
      const full = Buffer.from(data.content, "base64").toString("utf-8");
      if (full.length > 4000) {
        return full.slice(0, 4000) + "\n\n... (README truncated for analysis)";
      }
      return full;
    }
    return data.content || null;
  } catch {
    return null; // README is optional
  }
}

/**
 * Fetch the recursive file tree, limited to first ~100 entries.
 */
async function fetchTree(owner, repo, defaultBranch) {
  try {
    const data = await githubFetch(
      `/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`
    );

    const items = (data.tree || []).slice(0, 100).map((item) => ({
      path: item.path,
      type: item.type, // "blob" = file, "tree" = directory
      size: item.size || 0,
    }));

    const totalCount = (data.tree || []).length;
    return { items, totalCount };
  } catch {
    return { items: [], totalCount: 0 };
  }
}

/**
 * Fetch the content of a config file (if it exists).
 * Returns the decoded file content or null.
 */
async function fetchFileContent(owner, repo, filePath) {
  try {
    const data = await githubFetch(
      `/repos/${owner}/${repo}/contents/${filePath}`
    );
    if (data.content && data.encoding === "base64") {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * List of config files to attempt fetching for analysis.
 */
const CONFIG_FILES = [
  "package.json",
  "requirements.txt",
  "Pipfile",
  "pyproject.toml",
  "go.mod",
  "Cargo.toml",
  "pom.xml",
  "build.gradle",
  "Gemfile",
  "composer.json",
  "Makefile",
  "Dockerfile",
  "docker-compose.yml",
  "tsconfig.json",
  ".eslintrc.json",
  "next.config.js",
  "next.config.mjs",
  "vite.config.js",
  "vite.config.ts",
  "webpack.config.js",
];

/**
 * Main function: fetch all repository data in parallel.
 * Implements caching to avoid hitting GitHub API limits on repeated requests.
 */
export async function fetchRepoData(owner, repo) {
  const cacheKey = `${owner}/${repo}`;
  const cachedData = repoCache.get(cacheKey);

  if (cachedData) {
    logger.info(`[CACHE HIT] Returning cached data for ${cacheKey}`);
    return cachedData;
  }

  // Step 1: Get core metadata (must succeed)
  const metadata = await githubFetch(`/repos/${owner}/${repo}`);

  // Step 1b: Check if repo is too large
  if (metadata.size > MAX_REPO_SIZE_KB) {
    const sizeMB = (metadata.size / 1024).toFixed(0);
    const err = new Error(
      `Repository is too large (${sizeMB} MB). RepoLens AI supports repositories up to 500 MB.`
    );
    err.statusCode = 422;
    err.errorType = "REPO_TOO_LARGE";
    throw err;
  }

  const defaultBranch = metadata.default_branch || "main";

  // Step 2: Fetch everything else in parallel
  const [languages, readme, treeResult] = await Promise.all([
    githubFetch(`/repos/${owner}/${repo}/languages`).catch(() => ({})),
    fetchReadme(owner, repo),
    fetchTree(owner, repo, defaultBranch),
  ]);

  const { items: tree, totalCount: totalFiles } = treeResult;

  // Step 3: Identify which config files exist in the tree
  const treeFilePaths = new Set(
    tree.filter((item) => item.type === "blob").map((item) => item.path)
  );

  const configFilesToFetch = CONFIG_FILES.filter((f) => treeFilePaths.has(f));

  // Step 4: Fetch config file contents (limited to 5 to avoid rate limits)
  const configEntries = await Promise.all(
    configFilesToFetch.slice(0, 5).map(async (filePath) => {
      const content = await fetchFileContent(owner, repo, filePath);
      return content ? { path: filePath, content } : null;
    })
  );

  const configFiles = configEntries.filter(Boolean);

  // Step 4.5: Identify documentation files for AI context
  const docsList = [];
  for (const filePath of treeFilePaths) {
    const lower = filePath.toLowerCase();
    if (
      lower.startsWith("docs/") ||
      lower === "contributing.md" ||
      lower === "security.md" ||
      lower === "changelog.md" ||
      lower === "wiki"
    ) {
      docsList.push(filePath);
    }
  }

  // Step 5: Build summary tree (top-level dirs + key files)
  const treeFormatted = formatTree(tree, totalFiles);

  const result = {
    metadata: {
      name: metadata.name,
      fullName: metadata.full_name,
      description: metadata.description,
      stars: metadata.stargazers_count,
      forks: metadata.forks_count,
      watchers: metadata.subscribers_count,
      openIssues: metadata.open_issues_count,
      license: metadata.license?.spdx_id || metadata.license?.name || null,
      createdAt: metadata.created_at,
      updatedAt: metadata.updated_at,
      pushedAt: metadata.pushed_at,
      defaultBranch: metadata.default_branch,
      topics: metadata.topics || [],
      homepage: metadata.homepage || null,
      size: metadata.size,
      hasWiki: metadata.has_wiki,
      hasPages: metadata.has_pages,
      archived: metadata.archived,
      owner: {
        login: metadata.owner.login,
        type: metadata.owner.type,
        avatarUrl: metadata.owner.avatar_url,
      },
    },
    languages,
    readme,
    tree: treeFormatted,
    treeRaw: tree,
    configFiles,
    docsList,
  };

  // Cache the final structured result
  repoCache.set(cacheKey, result);

  return result;
}

/**
 * Format tree into a readable structure string.
 */
function formatTree(tree, totalFiles) {
  const topLevel = [];
  const dirContents = {};

  for (const item of tree) {
    const parts = item.path.split("/");
    if (parts.length === 1) {
      topLevel.push(item);
    } else {
      const topDir = parts[0];
      if (!dirContents[topDir]) {
        dirContents[topDir] = [];
      }
      if (dirContents[topDir].length < 10) {
        dirContents[topDir].push(item.path);
      }
    }
  }

  let result = "Root files:\n";
  for (const item of topLevel) {
    const icon = item.type === "tree" ? "📁" : "📄";
    result += `  ${icon} ${item.path}\n`;
  }

  result += "\nDirectories:\n";
  for (const [dir, files] of Object.entries(dirContents)) {
    result += `  📁 ${dir}/ (${files.length}+ files)\n`;
    for (const f of files.slice(0, 6)) {
      result += `      ${f}\n`;
    }
    if (files.length > 6) {
      result += `      ... and more\n`;
    }
  }

  if (totalFiles > 100) {
    result += `\n(Showing first 100 of ${totalFiles} total files)\n`;
  }

  return result;
}
