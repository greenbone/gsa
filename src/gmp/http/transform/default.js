/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const noop = arg => arg;

const noopObject = {
  success: noop,
  rejection: noop,
};

export default noopObject;
// vim: set ts=2 sw=2 tw=80:
