const fs = require('fs');
const path = require('path');

const repoUrlFromEnv = process.env.REPO_URL || 'https://github.com/NothingADSR123/JS_Mastery';
const repoUrl = repoUrlFromEnv.replace(/\.git$/, '');
const branch = process.env.REPO_BRANCH || 'main';
const rootDir = path.resolve(__dirname, '..');
const codeFilesDir = path.join(rootDir, 'CodeFiles');
const readmePath = path.join(rootDir, 'README.md');
const startMarker = '<!-- FILE_TABLE_START -->';
const endMarker = '<!-- FILE_TABLE_END -->';

const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Missing directory: ${dirPath}`);
  }
};

const encodeForGitHub = (relativePath) => {
  return relativePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
};

const buildTableRows = (files, indent) => {
  if (!files.length) {
    return [`${indent}| _No files found_ | _Add files under 'CodeFiles/'_ |`];
  }

  return files.map((file) => {
    const repoLink = `${repoUrl}/blob/${branch}/CodeFiles/${encodeForGitHub(file)}`;
    return `${indent}| ${file} | [Open on GitHub](${repoLink}) |`;
  });
};

const sliceTableBlock = (readmeContent) => {
  const tableRegex = /([ \t]*)<!-- FILE_TABLE_START -->[\s\S]*?<!-- FILE_TABLE_END -->/;
  const match = readmeContent.match(tableRegex);

  if (!match) {
    throw new Error('Could not locate the file table markers inside README.md');
  }

  const indent = match[1] || '';
  return { indent, regex: tableRegex };
};

const updateReadme = () => {
  ensureDirExists(codeFilesDir);

  const files = fs
    .readdirSync(codeFilesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name)
    .sort((a, b) => a.localeCompare(b));

  const readmeContent = fs.readFileSync(readmePath, 'utf8');
  const { indent, regex } = sliceTableBlock(readmeContent);

  const tableLines = [
    `${indent}| File | GitHub Link |`,
    `${indent}| --- | --- |`,
    ...buildTableRows(files, indent),
  ];

  const replacement = `${indent}${startMarker}\n${tableLines.join('\n')}\n${indent}${endMarker}`;
  const updatedContent = readmeContent.replace(regex, replacement);

  fs.writeFileSync(readmePath, updatedContent);
  console.log('README table refreshed with', files.length, 'file(s).');
};

updateReadme();
