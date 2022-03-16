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

import Link from 'web/components/link/link';
import InfoPanel from 'web/components/panel/infopanel';

import PropTypes from 'web/utils/proptypes';
import useLicense from 'web/utils/useLicense';

const LICENSE_EXPIRATION_THRESHOLD = 30;

const LinkComponent = () => (
  <Link to="license">{_('License Management page')}</Link>
);

const LicenseNotification = ({capabilities, onCloseClick}) => {
  const {license} = useLicense();
  const days = license?.expires
    ? date(license?.expires).diff(date(), 'days')
    : undefined;

  const expiringMessageAdmin = _(
    'The Greenbone Enterprise License for this system will expire in ' +
      '{{days}} days. After that your appliance remains valid and you can ' +
      'still use the system without restrictions, but you will not receive ' +
      'updates anymore. You can find information about extending your ' +
      'license on the',
    {days},
  );
  const expiringMessageUser = _(
    'The Greenbone Enterprise License for this system will expire in ' +
      '{{days}} days. After that your appliance remains valid and you can ' +
      'still use the system without restrictions, but you will not receive ' +
      'updates anymore. Please contact your administrator for extending the ' +
      'license.',
    {days},
  );
  const expiringTitleMessage = _(
    'Your Greenbone Enterprise License ends in {{days}} days!',
    {
      days,
    },
  );

  const {status} = license;

  let titleMessage;
  let message;

  if (status === 'expired') {
    return null;
  }
  if (status === 'active') {
    if (!isDefined(days) || days > LICENSE_EXPIRATION_THRESHOLD) {
      return null;
    }
    message = capabilities.mayEdit('license')
      ? expiringMessageAdmin
      : expiringMessageUser;
    titleMessage = expiringTitleMessage;
  }

  return (
    <InfoPanel
      noMargin={true}
      heading={titleMessage}
      onCloseClick={onCloseClick}
    >
      {message}&nbsp;
      <LinkComponent />
    </InfoPanel>
  );
};

LicenseNotification.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  onCloseClick: PropTypes.func.isRequired,
};

export default LicenseNotification;
