/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import createLabel from 'web/components/label/Label';
import Theme from 'web/utils/Theme';

export const getConnectionStatusLabel = (status?: string) => {
  const connectionStatus = (status || 'unknown')
    .toLowerCase()
    .replace(/\s+/g, '');
  const statusStyles = {
    active: {
      backgroundColor: Theme.green,
      borderColor: Theme.green,
      textColor: Theme.white,
    },
    inactive: {
      backgroundColor: Theme.errorRed,
      borderColor: Theme.errorRed,
      textColor: Theme.white,
    },
    notauthorized: {
      backgroundColor: Theme.severityWarnYellow,
      borderColor: Theme.severityWarnYellow,
      textColor: Theme.white,
    },
  }[connectionStatus] || {
    backgroundColor: Theme.green,
    borderColor: Theme.green,
    textColor: Theme.white,
  };

  const Label = createLabel(
    statusStyles.backgroundColor,
    statusStyles.borderColor,
    statusStyles.textColor,
    'connection-status-label',
    connectionStatus
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
  );

  return <Label />;
};

export const getAuthorizationLabel = (authorized?: number) => {
  const isAuthorized = authorized === 1;
  const Label = createLabel(
    isAuthorized ? Theme.green : Theme.errorRed,
    isAuthorized ? Theme.green : Theme.errorRed,
    'white',
    'authorization-status-label',
    isAuthorized ? _l('Yes') : _l('No'),
  );

  return <Label />;
};
