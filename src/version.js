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
  const [major, minor, ...rest] = VERSION.split('.');
  return `${major}.${minor}`;
};

<<<<<<< HEAD
export const VERSION = '21.4.5.dev1';
=======
const getCleanedMajorMinorVersion = () => {
  // eslint-disable-next-line no-unused-vars
  const [major, minor, ...rest] = VERSION.split('.');
  return `${major}.${parseInt(minor)}`;
};

export const VERSION = '22.04.0.dev1';
>>>>>>> 7cb61dcce (Fix: Introduce new function to remove leading zero fron version for correct links to GSM-Manual (#3460))

export const RELEASE_VERSION = getMajorMinorVersion();
export const REMOVED_ZERO_RELEASE_VERSION = getCleanedMajorMinorVersion();

export default VERSION;
