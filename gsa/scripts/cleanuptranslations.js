/* Copyright (C) 2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
/* eslint-disable no-console */
const fs = require('fs');

// all locales that are included in .babelrc
const languages = ['de'];

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
  const newContent = {};
  Object.assign(newContent, content);
  for (const key in content) {
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
