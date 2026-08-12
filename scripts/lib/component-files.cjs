'use strict';

const fs = require('node:fs');
const path = require('node:path');

const IMPLEMENTATION_EXTENSION = /\.(?:ts|tsx)$/;
const EXCLUDED_IMPLEMENTATION = /\.(?:stories|test|spec)\.(?:ts|tsx)$/;

function listComponentDirs(componentsDir) {
  return fs.existsSync(componentsDir)
    ? fs
        .readdirSync(componentsDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
        .map((entry) => entry.name)
        .sort()
    : [];
}

function walkFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(absolute));
    else files.push(absolute);
  }
  return files.sort();
}

function relativeFiles(componentDir) {
  return walkFiles(componentDir).map((file) => path.relative(componentDir, file).split(path.sep).join('/'));
}

function implementationFiles(componentDir) {
  return relativeFiles(componentDir).filter(
    (file) => IMPLEMENTATION_EXTENSION.test(file) && !EXCLUDED_IMPLEMENTATION.test(file),
  );
}

function implementationTsxFiles(componentDir) {
  return implementationFiles(componentDir).filter((file) => file.endsWith('.tsx'));
}

function storyFiles(componentDir) {
  return relativeFiles(componentDir).filter((file) => file.endsWith('.stories.tsx'));
}

module.exports = {
  implementationFiles,
  implementationTsxFiles,
  listComponentDirs,
  relativeFiles,
  storyFiles,
  walkFiles,
};
