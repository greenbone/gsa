/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_} from 'gmp/locale/lang';
import Icon from 'web/components/icon/svg/dl_csv.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const DownloadCsvIconComponent = withSvgIcon({
  title: _('Download CSV'),
})(Icon);

const DownloadCsvIcon = props => (
  <DownloadCsvIconComponent {...props} data-testid="download-csv-icon" />
);

export default DownloadCsvIcon;
