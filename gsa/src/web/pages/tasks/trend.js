/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

import TrendUpIcon from 'web/components/icon/trendupicon';
import TrendDownIcon from 'web/components/icon/trenddownicon';
import TrendMoreIcon from 'web/components/icon/trendmoreicon';
import TrendLessIcon from 'web/components/icon/trendlessicon';
import TrendNoChangeIcon from 'web/components/icon/trendnochangeicon';

import PropTypes from 'web/utils/proptypes';

const Trend = ({name}) => {
  let title;
  let IconComponent;

  if (name === 'up') {
    title = _('Severity increased');
    IconComponent = TrendUpIcon;
  } else if (name === 'down') {
    title = _('Severity decreased');
    IconComponent = TrendDownIcon;
  } else if (name === 'more') {
    title = _('Vulnerability count increased');
    IconComponent = TrendMoreIcon;
  } else if (name === 'less') {
    title = _('Vulnerability count decreased');
    IconComponent = TrendLessIcon;
  } else if (name === 'same') {
    title = _('Vulnerabilities did not change');
    IconComponent = TrendNoChangeIcon;
  } else {
    return <span />;
  }

  return <IconComponent size="small" alt={title} title={title} />;
};

Trend.propTypes = {
  name: PropTypes.string,
};

export default Trend;

// vim: set ts=2 sw=2 tw=80:
