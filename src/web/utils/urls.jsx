/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


const public_url_loader = name => {
  return import.meta.env.BASE_URL + 'img/' + name; // eslint-disable-line no-process-env,no-undef
};

let url_loader = public_url_loader;

export function get_img_url(name) {
  return url_loader(name);
}

export const set_url_loader = loader => {
  url_loader = loader;
};

// vim: set ts=2 sw=2 tw=80:
