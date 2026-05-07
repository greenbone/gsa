/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const USER_SETTINGS_LOAD_REPORT_COMPOSER_DEFAULTS_SUCCESS =
  'USER_SETTINGS_LOAD_REPORT_COMPOSER_DEFAULTS_SUCCESS';

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
