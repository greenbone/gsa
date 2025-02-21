/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import TrendDownIcon from 'web/components/icon/TrendDownIcon';
import TrendLessIcon from 'web/components/icon/TrendLessIcon';
import TrendMoreIcon from 'web/components/icon/TrendMoreIcon';
import TrendNoChangeIcon from 'web/components/icon/TrendNoChangeIcon';
import TrendUpIcon from 'web/components/icon/TrendUpIcon';
import PropTypes from 'web/utils/PropTypes';

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

  return <IconComponent alt={title} size="small" title={title} />;
};

Trend.propTypes = {
  name: PropTypes.string,
};

export default Trend;
