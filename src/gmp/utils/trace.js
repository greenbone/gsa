/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/** Return the current stack trace a string */
export const trace = () => {
  try {
    throw Error();
  } catch (e) {
    return e.stack;
  }
};
