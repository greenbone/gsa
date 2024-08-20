/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import TrendUpIcon from 'web/components/icon/trendupicon';
import TrendDownIcon from 'web/components/icon/trenddownicon';
import TrendMoreIcon from 'web/components/icon/trendmoreicon';
import TrendLessIcon from 'web/components/icon/trendlessicon';
import TrendNoChangeIcon from 'web/components/icon/trendnochangeicon';

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
