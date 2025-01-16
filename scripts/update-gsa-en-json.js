#!/usr/bin/env node
/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* eslint-disable no-console */
import * as fs from 'node:fs';

const GSA_EN_JSON = './public/locales/gsa-en.json';

function main() {
  let content;

  try {
    const jsonString = fs.readFileSync(GSA_EN_JSON);
    content = JSON.parse(jsonString);
  } catch (err) {
    console.log('An error occurred while trying to read from', GSA_EN_JSON);
    console.log(err);
    return 1;
  }

  for (const key of Object.keys(content)) {
    content[key] = key;
  }

  const newJsonString = JSON.stringify(content, null, 2);
  try {
    fs.writeFileSync(GSA_EN_JSON, newJsonString);
    console.log('Updated', GSA_EN_JSON, 'successfully!');
  } catch (err) {
    console.log('An error occurred while trying to write to', GSA_EN_JSON);
    console.log(err);
    return 2;
  }
  return 0;
}

process.exitCode = main();
