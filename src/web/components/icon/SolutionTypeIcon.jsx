/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
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
import PropTypes from 'web/utils/PropTypes';
const SolutionType = ({type, displayTitleText = false}) => {
  const [_] = useTranslation();
  let IconComponent;
  let title;

  switch (type) {
    case 'Workaround':
      title = _('Workaround');
      IconComponent = StWorkaroundIcon;
      break;
    case 'Mitigation':
      title = _('Mitigation');
      IconComponent = StMitigateIcon;
      break;
    case 'VendorFix':
      title = _('Vendorfix');
      IconComponent = StVendorFixIcon;
      break;
    case 'NoneAvailable':
      title = _('None available');
      IconComponent = StNonAvailableIcon;
      break;
    case 'WillNotFix':
      title = _('Will not fix');
      IconComponent = StWillNotFixIcon;
      break;
    case '':
      title = '';
      IconComponent = StUnknownIcon;
      break;
    default:
      return <span />;
  }

  if (displayTitleText) {
    return (
      <Divider align={['start', 'center']}>
        <IconComponent alt={title} size="small" title={title} />
        <span>{title}</span>
      </Divider>
    );
  }

  return <IconComponent alt={title} size="small" title={title} />;
};

SolutionType.propTypes = {
  displayTitleText: PropTypes.bool,
  type: PropTypes.string,
};

export default SolutionType;
