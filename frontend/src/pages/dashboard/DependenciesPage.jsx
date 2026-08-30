import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Box, Code } from 'lucide-react';
import { useAnalysis } from '../../hooks/useAnalysis';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import PageContainer from '../../components/ui/PageContainer';

const PURPOSES = {
  react: 'UI framework',
  vue: 'UI framework',
  angular: 'UI framework',
  next: 'React framework',
  vite: 'Build tool',
  webpack: 'Bundler',
  babel: 'Transpiler',
  typescript: 'Type safety',
  eslint: 'Linting',
  prettier: 'Code formatting',
  jest: 'Testing',
  vitest: 'Testing',
  mocha: 'Testing',
  express: 'Web server',
  fastify: 'Web server',
  axios: 'HTTP client',
  lodash: 'Utilities',
  tailwind: 'CSS framework',
  sass: 'CSS preprocessor',
  framer: 'Animations',

  prisma: 'Database ORM',
  dotenv: 'Environment variables',
  cors: 'CORS middleware',
  helmet: 'Security headers',
  zod: 'Schema validation',
  'react-router': 'Routing',
  redux: 'State management',
  zustand: 'State management',
};

function getPurpose(name) {
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(PURPOSES)) {
    if (lower.includes(key)) return val;
  }
  return '—';
}

function parseVersion(dep) {
  // dep can be "package@^1.2.3" or "package"
  const atIdx = dep.lastIndexOf('@');
  if (atIdx > 0) {
    return { name: dep.slice(0, atIdx), version: dep.slice(atIdx + 1) };
  }
  return { name: dep, version: '—' };
}

function DepTable({ deps, type }) {
  const [search, setSearch] = useState('');
  const parsed = (deps || []).map(parseVersion);
  const filtered = parsed.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-card border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Package size={15} className="text-textSecondary" />
          <span className="text-sm font-semibold text-textPrimary">{type}</span>
          <span className="text-xs bg-gray-800 text-textSecondary px-2 py-0.5 rounded-full">
            {deps?.length ?? 0}
          </span>
        </div>
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter…"
            className="bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-1 text-xs text-textPrimary placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-colors w-32"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-textSecondary text-sm">
          {search ? 'No matching packages' : 'No dependencies found'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-800 bg-gray-800/20">
                <th className="text-left px-5 py-2.5 font-medium">Package</th>
                <th className="text-left px-3 py-2.5 font-medium">Version</th>
                <th className="text-left px-3 py-2.5 font-medium">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ name, version }, i) => (
                <motion.tr
                  key={name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors"
                >
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <Box size={13} className="text-gray-600 shrink-0" />
                      <span className="font-mono text-xs text-textPrimary">{name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-xs text-textSecondary bg-gray-800/60 px-2 py-0.5 rounded">
                      {version}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-textSecondary">
                    {getPurpose(name)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function DependenciesPage() {
  const { dependencies, techStack, isLoading, hasStarted } = useAnalysis();

  if (!hasStarted || (isLoading && !dependencies)) {
    return <PageContainer><div><SkeletonCard lines={8} /></div></PageContainer>;
  }

  if (!dependencies || (!dependencies.major?.length && !dependencies.dev?.length)) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64 text-textSecondary text-sm">
          <div className="text-center">
            <Code size={32} className="text-gray-700 mx-auto mb-3" />
            <p>No dependency data available.</p>
            <p className="text-xs mt-1 text-gray-600">This repository does not contain any recognized package manifest files<br/>(e.g., package.json, requirements.txt, Cargo.toml, go.mod, pom.xml).</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        
        {/* Detected Tech Stack */}
        {techStack && techStack.length > 0 && (
          <div className="bg-card border border-gray-800 rounded-xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-textPrimary mb-4">Detected Frameworks & Tools</h2>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span key={tech} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-textPrimary">Dependencies</h2>
        <span className="text-xs text-textSecondary bg-gray-800 px-2 py-0.5 rounded-full">
          {(dependencies.major?.length || 0) + (dependencies.dev?.length || 0)} total
        </span>
      </div>

      {dependencies.major?.length > 0 && (
        <DepTable deps={dependencies.major} type="Production" />
      )}
      {dependencies.dev?.length > 0 && (
        <DepTable deps={dependencies.dev} type="Development" />
      )}
      </div>
    </PageContainer>
  );
}
