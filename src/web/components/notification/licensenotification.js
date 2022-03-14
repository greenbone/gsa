/* Copyright (C) 2022 Greenbone Networks GmbH
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

import date from 'gmp/models/date';

import {isDefined} from 'gmp/utils/identity';

import InfoPanel from 'web/components/panel/infopanel';

import PropTypes from 'web/utils/proptypes';
import useLicense from 'web/utils/useLicense';

const LICENSE_EXPIRATION_THRESHOLD = 30;

const LicenseNotification = ({capabilities, onCloseClick}) => {
  const {license} = useLicense();
  const days = license?.expires
    ? date(license?.expires).diff(date(), 'days')
    : undefined;

  if (!isDefined(days) || days > LICENSE_EXPIRATION_THRESHOLD) {
    return null;
  }

  const titleMessage = _(
    'Your Greenbone Enterprise License ends in {{days}} days!',
    {
      days,
    },
  );

  const message = capabilities.mayOp('modify_license')
    ? _(
        'After that your appliance remains valid and you can still log in ' +
          'and view or download all of your scan reports. You can re-activate ' +
          'the security feed via menu item "Administration > License".',
      )
    : _(
        'After that your appliance remains valid and you can still log in ' +
          'and view or download all of your scan reports. Please contact your ' +
          'administrator for re-activating the security feed.',
      );
  return (
    <InfoPanel
      noMargin={true}
      heading={titleMessage}
      onCloseClick={onCloseClick}
    >
      {message}
    </InfoPanel>
  );
};

LicenseNotification.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  onCloseClick: PropTypes.func.isRequired,
};

export default LicenseNotification;
