/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const getImageURL = (name: string) =>
  import.meta.env.BASE_URL + 'img/' + name;
