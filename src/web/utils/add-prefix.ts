/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const addPrefix = (prefix?: string) => {
  const newPrefix = prefix ? `${prefix}_` : '';
  return (value: string) => `${newPrefix}${value}`;
};

export default addPrefix;
