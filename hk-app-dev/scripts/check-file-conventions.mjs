#!/usr/bin/env node
import { execSync } from 'node:child_process';
import path from 'node:path';

const nextSpecialFiles = new Set([
  'page.tsx',
  'layout.tsx',
  'route.ts',
  'loading.tsx',
  'error.tsx',
  'not-found.tsx',
  'default.tsx',
  'template.tsx',
  'global-error.tsx',
  'globals.css',
  'admin.css',
]);

const isPascalCaseFile = (name) => /^[A-Z][A-Za-z0-9]*\.(tsx|ts)$/.test(name);
const isKebabCaseFile = (name) => /^[a-z0-9]+(?:-[a-z0-9]+)*\.(tsx|ts|css)$/.test(name);
const isKebabCaseDir = (name) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name);
const isNextRouteSegment = (name) => {
  if (/^\(.+\)$/.test(name)) {return true;} // route groups e.g. (public)
  if (/^\[\[?\.\.\.[^\]]+\]?\]$/.test(name)) {return true;} // catch-all
  if (/^\[[^\]]+\]$/.test(name)) {return true;} // dynamic e.g. [id]
  if (/^@?[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {return true;} // regular + parallel @slot
  return false;
};

const violations = [];

const raw = execSync('git ls-files', { encoding: 'utf8' }).trim();
const trackedFiles = raw ? raw.split('\n') : [];
const scopedFiles = trackedFiles.filter((file) => /^(app|components|lib)\//.test(file));

for (const relativePath of scopedFiles) {
  const parts = relativePath.split('/');
  const root = parts[0];
  const fileName = parts[parts.length - 1];
  const dirParts = parts.slice(1, -1);

  if (root === 'app') {
    for (const dirName of dirParts) {
      if (!isNextRouteSegment(dirName)) {
        violations.push(`${relativePath} -> invalid app directory segment '${dirName}'`);
      }
    }

    const isAllowedSpecial = nextSpecialFiles.has(fileName);
    const isAllowedComponentInApp = isPascalCaseFile(fileName);
    if (!isAllowedSpecial && !isAllowedComponentInApp) {
      violations.push(
        `${relativePath} -> app file must be Next special file (${Array.from(nextSpecialFiles).join(', ')}) or PascalCase component file`,
      );
    }

    if (relativePath.startsWith('app/api/') && fileName !== 'route.ts') {
      violations.push(`${relativePath} -> app/api files must be named route.ts`);
    }
  }

  if (root === 'components') {
    for (const dirName of dirParts) {
      if (!isKebabCaseDir(dirName)) {
        violations.push(`${relativePath} -> invalid components directory segment '${dirName}'`);
      }
    }

    const isUiComponent = relativePath.startsWith('components/ui/');
    if (isUiComponent) {
      if (!isKebabCaseFile(fileName)) {
        violations.push(`${relativePath} -> components/ui files must be kebab-case`);
      }
    } else {
      if (!isPascalCaseFile(fileName)) {
        violations.push(`${relativePath} -> component files must be PascalCase`);
      }
    }
  }

  if (root === 'lib') {
    for (const dirName of dirParts) {
      if (!isKebabCaseDir(dirName)) {
        violations.push(`${relativePath} -> invalid lib directory segment '${dirName}'`);
      }
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.ts$/.test(fileName)) {
      violations.push(`${relativePath} -> lib files must be kebab-case .ts`);
    }
  }
}

if (violations.length > 0) {
  console.error('❌ File/Directory naming convention violations found:\n');
  for (const item of violations) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log('✅ File/Directory naming conventions passed.');
