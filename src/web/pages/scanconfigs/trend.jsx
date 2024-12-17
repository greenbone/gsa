/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import _ from 'gmp/locale';
import {
  SCANCONFIG_TREND_DYNAMIC,
  SCANCONFIG_TREND_STATIC,
} from 'gmp/models/scanconfig';
import React from 'react';
import TrendMoreIcon from 'web/components/icon/trendmoreicon';
import TrendNoChangeIcon from 'web/components/icon/trendnochangeicon';
import PropTypes from 'web/utils/proptypes';

const Trend = ({trend, titleDynamic, titleStatic, ...props}) => {
  if (trend === SCANCONFIG_TREND_DYNAMIC) {
    return <TrendMoreIcon alt={_('Dynamic')} title={titleDynamic} {...props} />;
  }
  if (trend === SCANCONFIG_TREND_STATIC) {
    return (
      <TrendNoChangeIcon alt={_('Static')} title={titleStatic} {...props} />
    );
  }
  return <span>{_('N/A')}</span>;
};

Trend.propTypes = {
  titleDynamic: PropTypes.string,
  titleStatic: PropTypes.string,
  trend: PropTypes.oneOf([0, 1]),
};

export default Trend;

// vim: set ts=2 sw=2 tw=80:
