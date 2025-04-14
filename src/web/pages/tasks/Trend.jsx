/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import {
  TrendDownIcon,
  TrendLessIcon,
  TrendMoreIcon,
  TrendUpIcon,
  TrendNoChangeIcon,
} from 'web/components/icon';
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

  return (
    <IconComponent
      alt={title}
      data-testid="trend-icon"
      size="small"
      title={title}
    />
  );
};

Trend.propTypes = {
  name: PropTypes.string,
};

export default Trend;
