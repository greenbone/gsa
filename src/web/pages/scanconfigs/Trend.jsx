/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  SCANCONFIG_TREND_DYNAMIC,
  SCANCONFIG_TREND_STATIC,
} from 'gmp/models/scanconfig';
import React from 'react';
import useTranslation from 'src/web/hooks/useTranslation';
import {TrendMoreIcon, TrendNoChangeIcon} from 'web/components/icon';
import PropTypes from 'web/utils/PropTypes';
const Trend = ({trend, titleDynamic, titleStatic, ...props}) => {
  const [_] = useTranslation();
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
