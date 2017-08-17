/* Greenbone Security Assistant
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

const img_url_overrides = {};

export function get_img_url(name) {
  let overridden = img_url_overrides[name];
  if (overridden) {
    return overridden;
  }

  return process.env.PUBLIC_URL + '/img/' + name; // eslint-disable-line no-process-env,no-undef
};

export function set_img_url_override(name, new_url) {
  img_url_overrides[name] = new_url;
};

// vim: set ts=2 sw=2 tw=80:
