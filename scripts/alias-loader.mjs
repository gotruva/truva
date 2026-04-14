import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function resolveWithExtensions(basePath) {
  const extensionCandidates = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json'];
  const indexCandidates = extensionCandidates.map((ext) => path.join(basePath, `index${ext}`));

  if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
    return basePath;
  }

  for (const ext of extensionCandidates) {
    const candidate = `${basePath}${ext}`;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  if (fs.existsSync(basePath) && fs.statSync(basePath).isDirectory()) {
    for (const candidate of indexCandidates) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
      }
    }
  }

  return null;
}

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.startsWith('@/')) {
    const relative = specifier.slice(2);
    const basePath = path.join(projectRoot, relative);
    const resolvedPath = resolveWithExtensions(basePath);

    if (!resolvedPath) {
      throw new Error(`Unable to resolve alias import "${specifier}" from ${projectRoot}`);
    }

    return {
      url: pathToFileURL(resolvedPath).href,
      shortCircuit: true,
    };
  }

  return defaultResolve(specifier, context, defaultResolve);
}

