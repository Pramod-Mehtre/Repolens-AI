/**
 * Analyzer Service
 * Programmatically analyzes repository files and dependencies
 * without relying on the LLM to save time and tokens.
 */

import { logger } from "../utils/logger.js";

// Basic mappings for tech stack detection based on dependencies or files
const TECH_STACK_MAP = {
  "react": "React",
  "react-dom": "React",
  "next": "Next.js",
  "vue": "Vue.js",
  "nuxt": "Nuxt.js",
  "angular": "Angular",
  "svelte": "Svelte",
  "express": "Express.js",
  "nestjs": "NestJS",
  "fastify": "Fastify",
  "pg": "PostgreSQL",
  "mysql": "MySQL",
  "sequelize": "Sequelize",
  "prisma": "Prisma",
  "tailwindcss": "Tailwind CSS",
  "bootstrap": "Bootstrap",
  "vite": "Vite",
  "webpack": "Webpack",
  "typescript": "TypeScript",
  "jest": "Jest",
  "cypress": "Cypress",
  "docker": "Docker",
  "aws-sdk": "AWS",
  "firebase": "Firebase",
  "redis": "Redis",
  "graphql": "GraphQL",
};

export function detectTechStack(dependencies, devDependencies, fileTree) {
  const stack = new Set();
  
  // Check dependencies
  const allDeps = { ...dependencies, ...devDependencies };
  for (const dep of Object.keys(allDeps)) {
    for (const [key, name] of Object.entries(TECH_STACK_MAP)) {
      if (dep.includes(key)) stack.add(name);
    }
  }

  // Check file tree for specific tech
  const fileString = fileTree.map(f => f.path.toLowerCase()).join(" ");
  if (fileString.includes("dockerfile") || fileString.includes("docker-compose")) stack.add("Docker");
  if (fileString.includes("tailwind.config")) stack.add("Tailwind CSS");
  if (fileString.includes("tsconfig.json")) stack.add("TypeScript");
  if (fileString.includes("next.config")) stack.add("Next.js");
  if (fileString.includes("vite.config")) stack.add("Vite");
  if (fileString.includes("pom.xml") || fileString.includes("build.gradle")) stack.add("Java/Spring");
  if (fileString.includes("requirements.txt") || fileString.includes("pipfile")) stack.add("Python");
  if (fileString.includes("cargo.toml")) stack.add("Rust");
  if (fileString.includes("go.mod")) stack.add("Go");

  return Array.from(stack);
}

export function parseDependencies(configFiles) {
  const deps = {
    major: [],
    dev: [],
    all: {}
  };

  // Node.js (package.json)
  const packageJson = configFiles.find(f => f.path === "package.json");
  if (packageJson) {
    try {
      const parsed = JSON.parse(packageJson.content);
      if (parsed.dependencies) {
        deps.major.push(...Object.keys(parsed.dependencies).map(name => `${name}@${parsed.dependencies[name]}`));
        Object.assign(deps.all, parsed.dependencies);
      }
      if (parsed.devDependencies) {
        deps.dev.push(...Object.keys(parsed.devDependencies).map(name => `${name}@${parsed.devDependencies[name]}`));
        Object.assign(deps.all, parsed.devDependencies);
      }
    } catch (e) {
      logger.warn(`Failed to parse package.json for dependency analysis: ${e.message}`);
    }
  }

  // Python (requirements.txt)
  const reqsTxt = configFiles.find(f => f.path === "requirements.txt");
  if (reqsTxt) {
    const lines = reqsTxt.content.split('\n');
    for (let line of lines) {
      line = line.split('#')[0].trim();
      if (line) {
        const parts = line.split(/==|>=|<=|~=/);
        const name = parts[0].trim();
        const version = parts[1] ? parts[1].trim() : 'latest';
        deps.major.push(`${name}@${version}`);
        deps.all[name] = version;
      }
    }
  }

  // Rust (Cargo.toml)
  const cargoToml = configFiles.find(f => f.path === "Cargo.toml");
  if (cargoToml) {
    let inDeps = false;
    for (const line of cargoToml.content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('[')) {
        inDeps = trimmed === '[dependencies]';
        continue;
      }
      if (inDeps && trimmed && !trimmed.startsWith('#')) {
        const parts = trimmed.split('=');
        if (parts.length >= 2) {
          const name = parts[0].trim();
          let version = parts[1].trim().replace(/['"]/g, '');
          if (version.startsWith('{')) version = 'complex';
          deps.major.push(`${name}@${version}`);
          deps.all[name] = version;
        }
      }
    }
  }

  // Go (go.mod)
  const goMod = configFiles.find(f => f.path === "go.mod");
  if (goMod) {
    let inRequire = false;
    for (const line of goMod.content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('require (')) {
        inRequire = true;
        continue;
      }
      if (trimmed === ')') {
        inRequire = false;
        continue;
      }
      if (inRequire && trimmed && !trimmed.startsWith('//')) {
        const parts = trimmed.split(/\s+/);
        if (parts.length >= 2) {
          const name = parts[0];
          const version = parts[1];
          deps.major.push(`${name}@${version}`);
          deps.all[name] = version;
        }
      } else if (trimmed.startsWith('require ') && !inRequire) {
        const parts = trimmed.split(/\s+/);
        if (parts.length >= 3) {
          const name = parts[1];
          const version = parts[2];
          deps.major.push(`${name}@${version}`);
          deps.all[name] = version;
        }
      }
    }
  }

  // Java (pom.xml)
  const pomXml = configFiles.find(f => f.path === "pom.xml");
  if (pomXml) {
    const artifactRegex = /<artifactId>(.*?)<\/artifactId>/g;
    let match;
    while ((match = artifactRegex.exec(pomXml.content)) !== null) {
      const name = match[1];
      if (name !== 'project') {
        deps.major.push(`${name}@maven`);
        deps.all[name] = 'maven';
      }
    }
  }

  return deps;
}

export function runSecurityScan(fileTree, configFiles) {
  const warnings = [];

  const sensitiveFiles = [
    ".env", ".env.local", ".env.production",
    "id_rsa", "id_dsa",
    "credentials.json", "client_secret.json",
    "aws_credentials", "keystore.jks"
  ];

  fileTree.forEach(file => {
    const filename = file.path.split('/').pop().toLowerCase();
    if (sensitiveFiles.includes(filename)) {
      warnings.push(`Sensitive file detected: ${file.path}`);
    }
    if (file.path.endsWith(".pem") || file.path.endsWith(".key")) {
      warnings.push(`Certificate/Key file detected: ${file.path}`);
    }
    if (file.size > 50 * 1024 * 1024) {
      warnings.push(`Large binary file detected: ${file.path} (${(file.size/1024/1024).toFixed(1)}MB)`);
    }
  });

  configFiles.forEach(file => {
    const content = file.content.toLowerCase();
    if (content.includes("api_key=") || content.includes("secret=") || content.includes("password=")) {
      warnings.push(`Possible hardcoded credentials found in ${file.path}`);
    }
  });

  const hasGitIgnore = fileTree.some(f => f.path === ".gitignore");
  if (!hasGitIgnore) {
    warnings.push("Missing .gitignore file - repository might commit unnecessary files.");
  }

  return warnings;
}
