const fs = require('fs');
const path = require('path');

const repoUrlFromEnv =
  process.env.REPO_URL || 'https://github.com/NothingADSR123/JS_Mastery';

const repoUrl = repoUrlFromEnv.replace(/\.git$/, '');
const branch = process.env.REPO_BRANCH || 'main';

const rootDir = path.resolve(__dirname, '..');
const codeFilesDir = path.join(rootDir, 'CodeFiles');
const readmePath = path.join(rootDir, 'README.md');

const startMarker = '<!-- FILE_TABLE_START -->';
const endMarker = '<!-- FILE_TABLE_END -->';

// Ensure CodeFiles folder exists
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Missing directory: ${dirPath}`);
  }
};

// Encode file paths safely for GitHub URLs
const encodeForGitHub = (relativePath) => {
  return relativePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
};

// Build table rows
const buildTableRows = (files) => {
  if (!files.length) {
    return [`| _No files found_ | _Add files under CodeFiles/_ |`];
  }

  return files.map((file) => {
    const repoLink = `${repoUrl}/blob/${branch}/CodeFiles/${encodeForGitHub(file)}`;
    return `| ${file} | [Open on GitHub](${repoLink}) |`;
  });
};

// Replace table section in README
const updateReadme = () => {
  ensureDirExists(codeFilesDir);

  const files = fs
    .readdirSync(codeFilesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const readmeContent = fs.readFileSync(readmePath, 'utf8');

  const tableRegex =
    /<!-- FILE_TABLE_START -->[\s\S]*?<!-- FILE_TABLE_END -->/;

  if (!tableRegex.test(readmeContent)) {
    throw new Error('Markers not found in README.md');
  }

  const tableLines = [
    `| File | GitHub Link |`,
    `| --- | --- |`,
    ...buildTableRows(files),
  ];

  const replacement = `${startMarker}\n${tableLines.join('\n')}\n${endMarker}`;

  const updatedContent = readmeContent.replace(tableRegex, replacement);

  // Avoid unnecessary writes
  if (updatedContent === readmeContent) {
    console.log('No changes in README.');
    return;
  }

  fs.writeFileSync(readmePath, updatedContent);
  console.log(`README updated with ${files.length} file(s).`);
};

updateReadme();