/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

export const getReportComposerDefaults = rootState => {
  const {userSettings = {}} = rootState;
  const {reportComposerDefaults} = userSettings;
  return reportComposerDefaults;
};

export const getTimezone = rootState => rootState.userSettings.timezone;

export const getLocale = rootState => rootState.userSettings.locale;

export const getSessionTimeout = rootState =>
  rootState.userSettings.sessionTimeout;

export const getUsername = rootState => rootState.userSettings.username;

export const isLoggedIn = rootState =>
  rootState.userSettings.isLoggedIn === true;

// vim: set ts=2 sw=2 tw=80:
