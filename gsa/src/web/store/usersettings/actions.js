/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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
export const USER_SETTINGS_SET_TIMEZONE = 'USER_SETTINGS_SET_TIMEZONE';
export const USER_SETTINGS_SET_LOCALE = 'USER_SETTINGS_SET_LOCALE';
export const USER_SETTINGS_SET_USERNAME = 'USER_SETTINGS_SET_USERNAME';

export const setTimezone = timezone => ({
  type: USER_SETTINGS_SET_TIMEZONE,
  timezone,
});

export const setLocale = locale => ({
  type: USER_SETTINGS_SET_LOCALE,
  locale,
});

export const setUsername = username => ({
  type: USER_SETTINGS_SET_USERNAME,
  username,
});

export const updateTimezone = ({
  gmp,
  timezone,
}) => dispatch => {
  gmp.setTimezone(timezone);
  return Promise.resolve(dispatch(setTimezone(timezone)));
};

// vim: set ts=2 sw=2 two=80:
