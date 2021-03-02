/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import _ from 'gmp/locale';

import ProgressBar from 'web/components/bar/progressbar';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const ComplianceStatusBar = ({complianceStatus}) => {
  let text;
  let boxBackground;
  if (complianceStatus < 0 || complianceStatus > 100) {
    text = _('N/A');
    boxBackground = Theme.darkGrey;
  } else {
    text = complianceStatus + '%';
    boxBackground = Theme.errorRed;
  }

  return (
    <ProgressBar
      title={text}
      progress={complianceStatus}
      background={Theme.statusRunGreen}
      boxBackground={boxBackground}
    >
      {text}
    </ProgressBar>
  );
};

ComplianceStatusBar.propTypes = {
  complianceStatus: PropTypes.numberOrNumberString,
};

export default ComplianceStatusBar;

// vim: set ts=2 sw=2 tw=80:
