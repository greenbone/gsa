/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';

const VALID_ROWSPERPAGE_ERROR_MESSAGE = _l(
  '"Rows per page" requires a value of 1 or greater.',
);

export const userSettingsRules = {
  rowsPerPage: value =>
    value > 0 ? undefined : VALID_ROWSPERPAGE_ERROR_MESSAGE,
};
