/* Copyright (C) 2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

const getMajorMinorVersion = () => {
  // eslint-disable-next-line no-unused-vars
  let [major, minor, ...rest] = VERSION.split('.');
  minor = parseInt(minor);
  if (minor < 10) {
    // add a leading zero for the links
    minor = `0${minor}`;
  }
  return `${major}.${minor}`;
};

<<<<<<< HEAD
<<<<<<< HEAD
const getCleanedMajorMinorVersion = () => {
  // eslint-disable-next-line no-unused-vars
  const [major, minor, ...rest] = VERSION.split('.');
  return `${major}.${parseInt(minor)}`;
};

<<<<<<< HEAD
const VERSION = '20.8.4';
=======
=======
>>>>>>> ac264b224 (Fix: Adjust the release version string for the manual links)
=======
>>>>>>> 6e3e66e38 (Remove: Faulty previous changes, regarding version string)
export const VERSION = '22.04.0.dev1';
>>>>>>> ca25599c7 (Fix: Introduce new function to remove leading zero fron version for correct links to GSM-Manual)

export const RELEASE_VERSION = getMajorMinorVersion();

export default VERSION;
