/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
