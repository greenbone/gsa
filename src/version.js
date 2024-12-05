/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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

export const VERSION = '24.1.0';

export const RELEASE_VERSION = getMajorMinorVersion();

export default VERSION;
