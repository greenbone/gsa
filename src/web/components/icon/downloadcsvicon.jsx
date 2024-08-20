/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_} from 'gmp/locale/lang';

import withSvgIcon from './withSvgIcon';

import Icon from './svg/dl_csv.svg';

const DownloadCsvIcon = withSvgIcon({
  title: _('Download CSV'),
})(Icon);

export default DownloadCsvIcon;

// vim: set ts=2 sw=2 tw=80:
