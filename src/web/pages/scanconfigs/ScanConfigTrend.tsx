/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  SCANCONFIG_TREND_DYNAMIC,
  SCANCONFIG_TREND_STATIC,
  type ScanConfigTrend as ScanConfigTrendType,
} from 'gmp/models/scan-config';
import {TrendMoreIcon, TrendNoChangeIcon} from 'web/components/icon';
import useTranslation from 'web/hooks/useTranslation';

interface ScanConfigTrendProps {
  active?: boolean;
  trend: ScanConfigTrendType;
  titleDynamic?: string;
  titleStatic?: string;
}

const ScanConfigTrend = ({
  active,
  trend,
  titleDynamic,
  titleStatic,
}: ScanConfigTrendProps) => {
  const [_] = useTranslation();
  if (trend === SCANCONFIG_TREND_DYNAMIC) {
    return (
      <TrendMoreIcon active={active} title={titleDynamic ?? _('Dynamic')} />
    );
  }
  if (trend === SCANCONFIG_TREND_STATIC) {
    return (
      <TrendNoChangeIcon active={active} title={titleStatic ?? _('Static')} />
    );
  }
  return <span>{_('N/A')}</span>;
};

export default ScanConfigTrend;
