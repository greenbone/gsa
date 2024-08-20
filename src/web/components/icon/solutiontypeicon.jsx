/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import StMitigateIcon from 'web/components/icon/stmitigateicon';
import StNonAvailableIcon from 'web/components/icon/stnonavailableicon';
import StUnknownIcon from 'web/components/icon/stunknownicon';
import StVendorFixIcon from 'web/components/icon/stvendorfixicon';
import StWillNotFixIcon from 'web/components/icon/stwillnotfixicon';
import StWorkaroundIcon from 'web/components/icon/stworkaroundicon';

import Divider from 'web/components/layout/divider';

const SolutionType = ({type, displayTitleText = false}) => {
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
        <IconComponent size="small" title={title} alt={title} />
        <span>{title}</span>
      </Divider>
    );
  }

  return <IconComponent size="small" title={title} alt={title} />;
};

SolutionType.propTypes = {
  displayTitleText: PropTypes.bool,
  type: PropTypes.string,
};

export default SolutionType;

// vim: set ts=2 sw=2 tw=80:
