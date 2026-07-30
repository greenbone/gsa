/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type SolutionTypeValue} from 'gmp/models/nvt';
import {
  StMitigateIcon,
  StUnknownIcon,
  StWorkaroundIcon,
  StNonAvailableIcon,
  StVendorFixIcon,
  StWillNotFixIcon,
} from 'web/components/icon';
import Divider from 'web/components/layout/Divider';
import useTranslation from 'web/hooks/useTranslation';

interface SolutionTypeProps {
  displayTitleText?: boolean;
  type?: SolutionTypeValue;
}

const SolutionType = ({type, displayTitleText = false}: SolutionTypeProps) => {
  const [_] = useTranslation();

  const iconConfigDefault = {
    title: '',
    Icon: StUnknownIcon,
  };

  const config: Record<
    SolutionTypeValue,
    {title: string; Icon: React.ElementType}
  > = {
    Workaround: {title: _('Workaround'), Icon: StWorkaroundIcon},
    Mitigation: {title: _('Mitigation'), Icon: StMitigateIcon},
    VendorFix: {title: _('Vendorfix'), Icon: StVendorFixIcon},
    NoneAvailable: {title: _('None available'), Icon: StNonAvailableIcon},
    WillNotFix: {title: _('Will not fix'), Icon: StWillNotFixIcon},
  };

  const iconConfig = config[type ?? ''] ?? iconConfigDefault;
  const {title, Icon} = iconConfig;

  if (displayTitleText) {
    return (
      <Divider align={['start', 'center']}>
        <Icon alt={title} size="small" title={title} />
        <span>{title}</span>
      </Divider>
    );
  }

  return <Icon alt={title} size="small" title={title} />;
};

export default SolutionType;
