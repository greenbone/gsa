/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const getMajorMinorVersion = () => {
  let [major, minor] = VERSION.split('.');
  const minorVersion = parseInt(minor);
  if (minorVersion < 10) {
    // add a leading zero for the links
    minor = `0${minorVersion}`;
  }
  return `${major}.${minor}`;
};

export const VERSION = '26.0.0';

export const RELEASE_VERSION = getMajorMinorVersion();

export default VERSION;
