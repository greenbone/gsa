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

import StMitigateIcon from 'web/components/icon/stmitigateicon';
import StNonAvailableIcon from 'web/components/icon/stnonavailableicon';
import StUnknownIcon from 'web/components/icon/stunknownicon';
import StVendorFixIcon from 'web/components/icon/stvendorfixicon';
import StWillNotFixIcon from 'web/components/icon/stwillnotfixicon';
import StWorkaroundIcon from 'web/components/icon/stworkaroundicon';

import Divider from 'web/components/layout/divider';

import PropTypes from 'web/utils/proptypes';

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
