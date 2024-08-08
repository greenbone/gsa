/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* eslint-disable no-console */
const fs = require('fs');

// all locales that are included in .babelrc
const languages = ['de', 'zh_TW', 'zh_CN'];

for (const lang of languages) {
  const path = './public/locales/gsa-' + lang + '.json';
  let content;

  try {
    const jsonString = fs.readFileSync(path);
    content = JSON.parse(jsonString);
  } catch (err) {
    console.log('An error occurred while trying to read from', path);
    console.log(err);
    continue;
  }

  // remove all strings that were not translated
  const newContent = {...content};
  for (const key of Object.keys(content)) {
    if (content[key] === '') {
      delete newContent[key];
    }
  }

  const newJsonString = JSON.stringify(newContent, null, 2);
  try {
    fs.writeFileSync(path, newJsonString);
    console.log('Clean up for ', path, ' was successful!');
  } catch (err) {
    console.log('An error occurred while trying to write to', path);
    console.log(err);
    continue;
  }
}
