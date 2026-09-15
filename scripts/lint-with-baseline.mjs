#!/usr/bin/env node
/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {spawn} from 'node:child_process';
import {readFile, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {createInterface} from 'node:readline/promises';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baselinePath = resolve(root, 'oxlint-baseline.json');
const oxlintPath = resolve(root, 'node_modules/.bin/oxlint');
const oxlintArgs = ['--format', 'json', 'src', 'e2e'];
const sourceLines = new Map();

const update = process.argv.includes('--update');
const fix = process.argv.includes('--fix');
const useColors =
  !process.env.NO_COLOR &&
  (process.env.FORCE_COLOR || process.stderr.isTTY === true);
const colors = {
  yellow: useColors ? '\u001b[33m' : '',
  cyan: useColors ? '\u001b[36m' : '',
  reset: useColors ? '\u001b[0m' : '',
};

const colorize = (color, text) => `${colors[color]}${text}${colors.reset}`;

const isInteractive = process.stdin.isTTY && process.stdout.isTTY;

const runOxlint = () =>
  new Promise((resolvePromise, reject) => {
    const child = spawn(
      oxlintPath,
      [...oxlintArgs, ...(fix ? ['--fix'] : [])],
      {cwd: root},
    );
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', chunk => {
      stdout += chunk;
    });
    child.stderr.on('data', chunk => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', exitCode => resolvePromise({exitCode, stdout, stderr}));
  });

const getLocation = diagnostic => {
  const label = diagnostic.labels?.[0];
  const span = label?.span;

  return {
    line: span?.line ?? 0,
    column: span?.column ?? 0,
    offset: span?.offset ?? 0,
  };
};

const getSourceLine = async diagnostic => {
  const location = getLocation(diagnostic);
  let lines = sourceLines.get(diagnostic.filename);

  if (!lines) {
    const content = await readFile(resolve(root, diagnostic.filename), 'utf8');
    lines = content.split('\n');
    sourceLines.set(diagnostic.filename, lines);
  }

  return lines[location.line - 1]?.trim() ?? '';
};

const getFingerprint = (diagnostic, sourceLine) => {
  const location = getLocation(diagnostic);

  return [
    diagnostic.filename,
    diagnostic.code,
    diagnostic.message,
    location.column,
    sourceLine,
  ].join('|');
};

const normalize = async diagnostic => {
  const sourceLine = await getSourceLine(diagnostic);

  return {
    filename: diagnostic.filename,
    code: diagnostic.code,
    message: diagnostic.message,
    location: getLocation(diagnostic),
    sourceLine,
    fingerprint: getFingerprint(diagnostic, sourceLine),
  };
};

const loadBaseline = async () => {
  try {
    const content = await readFile(baselinePath, 'utf8');
    const baseline = JSON.parse(content);
    return new Map(baseline.diagnostics.map(item => [item.fingerprint, item]));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return new Map();
    }
    throw error;
  }
};

const formatDiagnostic = diagnostic => {
  const {line, column} = diagnostic.location;
  return `${diagnostic.filename}:${line}:${column} ${diagnostic.code}: ${diagnostic.message}`;
};

const updateBaseline = async diagnostics => {
  const uniqueDiagnostics = [
    ...new Map(diagnostics.map(item => [item.fingerprint, item])).values(),
  ];
  const content = {
    version: 1,
    generatedBy: 'npm run lint:baseline:update',
    diagnostics: uniqueDiagnostics.sort((left, right) =>
      left.fingerprint.localeCompare(right.fingerprint),
    ),
  };
  await writeFile(baselinePath, `${JSON.stringify(content, null, 2)}\n`);
  return uniqueDiagnostics.length;
};

const promptToUpdateBaseline = async diagnostics => {
  if (!isInteractive) {
    return false;
  }

  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    const answer = await readline.question(
      '\nRun `npm run lint:baseline:update` now? [y/N] ',
    );
    if (!/^y(es)?$/i.test(answer.trim())) {
      return false;
    }

    const count = await updateBaseline(diagnostics);
    console.log(`Updated ${baselinePath} with ${count} diagnostics.`);
    return true;
  } finally {
    readline.close();
  }
};

const main = async () => {
  const {exitCode, stdout, stderr} = await runOxlint();

  if (stderr) {
    process.stderr.write(stderr);
  }

  let report;
  try {
    report = JSON.parse(stdout);
  } catch (error) {
    console.error('Unable to parse Oxlint JSON output.');
    console.error(error.message);
    process.exit(1);
  }

  if (exitCode !== 0 && report.diagnostics.length === 0) {
    console.error(
      `Oxlint exited with status ${exitCode} but produced no diagnostics.`,
    );
    process.exit(exitCode);
  }

  const diagnostics = await Promise.all(report.diagnostics.map(normalize));
  if (update) {
    const count = await updateBaseline(diagnostics);
    // oxlint-disable-next-line no-console
    console.log(`Updated ${baselinePath} with ${count} diagnostics.`);
    process.exit(exitCode === 0 ? 0 : 1);
  }

  const baseline = await loadBaseline();
  const current = new Map(diagnostics.map(item => [item.fingerprint, item]));
  const newDiagnostics = diagnostics.filter(
    item => !baseline.has(item.fingerprint),
  );
  const staleDiagnostics = [...baseline.values()].filter(
    item => !current.has(item.fingerprint),
  );

  if (newDiagnostics.length > 0 || staleDiagnostics.length > 0) {
    if (newDiagnostics.length > 0) {
      console.error(`\nNew Oxlint diagnostics (${newDiagnostics.length}):`);
      newDiagnostics.forEach(item => console.error(formatDiagnostic(item)));
    }
    if (staleDiagnostics.length > 0) {
      console.error(
        `\n${colorize('yellow', `Stale baseline entries (${staleDiagnostics.length}):`)}`,
      );
      staleDiagnostics.forEach(item => console.error(formatDiagnostic(item)));
      console.error(
        colorize(
          'cyan',
          '\nThese diagnostics no longer occur. Review the changes, then update the baseline to remove stale entries.',
        ),
      );
    }
    if (staleDiagnostics.length > 0) {
      const updated = await promptToUpdateBaseline(diagnostics);
      if (updated) {
        process.exit(exitCode === 0 && newDiagnostics.length === 0 ? 0 : 1);
      }
    }
    if (exitCode !== 0) {
      console.error(`\nOxlint exited with status ${exitCode}.`);
    }
    process.exit(1);
  }

  // oxlint-disable-next-line no-console
  console.log(
    `Oxlint passed: ${diagnostics.length} existing diagnostics acknowledged.`,
  );
};

await main();
