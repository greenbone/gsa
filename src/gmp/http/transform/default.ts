/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const noop = <T>(arg: T): T => arg;

const noopObject = {
  success: noop,
  rejection: noop,
};

export default noopObject;
