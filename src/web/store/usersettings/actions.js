/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const USER_SETTINGS_LOAD_REPORT_COMPOSER_DEFAULTS_SUCCESS =
  'USER_SETTINGS_LOAD_REPORT_COMPOSER_DEFAULTS_SUCCESS';
export const USER_SETTINGS_SET_TIMEZONE = 'USER_SETTINGS_SET_TIMEZONE';
export const USER_SETTINGS_SET_LOCALE = 'USER_SETTINGS_SET_LOCALE';
export const USER_SETTINGS_SET_USERNAME = 'USER_SETTINGS_SET_USERNAME';
export const USER_SETTINGS_SET_SESSION_TIMEOUT =
  'USER_SETTINGS_SET_SESSION_TIMEOUT';
export const USER_SETTINGS_SET_LOGGED_IN = 'USER_SETTINGS_SET_LOGGED_IN';

export const getReportComposerDefaultsAction = data => ({
  type: USER_SETTINGS_LOAD_REPORT_COMPOSER_DEFAULTS_SUCCESS,
  data,
});

export const loadReportComposerDefaults = gmp => () => dispatch =>
  gmp.user
    .getReportComposerDefaults()
    .then(response => dispatch(getReportComposerDefaultsAction(response.data)));

export const saveReportComposerDefaults = gmp => defaults => dispatch =>
  gmp.user
    .saveReportComposerDefaults(defaults)
    .then(() => dispatch(getReportComposerDefaultsAction(defaults)));

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

export const setSessionTimeout = timeout => ({
  type: USER_SETTINGS_SET_SESSION_TIMEOUT,
  timeout,
});

export const setIsLoggedIn = isLoggedIn => ({
  type: USER_SETTINGS_SET_LOGGED_IN,
  isLoggedIn: isLoggedIn === true,
});

export const renewSessionTimeout = gmp => () => async dispatch => {
  try {
    const response = await gmp.user.renewSession();
    dispatch(setSessionTimeout(response.data));
  } catch (error) {
    console.error('Error renewing session:', error);
  }
};
export const updateTimezone = gmp => timezone => dispatch => {
  gmp.setTimezone(timezone);
  return Promise.resolve(dispatch(setTimezone(timezone)));
};
