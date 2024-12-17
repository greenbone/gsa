/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


const warning = (condition, ...args) => {
  if (process.env.NODE_ENV !== 'production' && condition) {
    console.warn(...args);  
  }
};

export default warning;

// vim: set ts=2 sw=2 tw=80:
