/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import createLabel from 'web/components/label/Label';
import Theme from 'web/utils/theme';

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

const AuthorizedLabelNo = createLabel(
  Theme.errorRed,
  Theme.errorRed,
  Theme.white,
  'authorization-status-label',
  _l('No'),
);

const AuthorizedLabelYes = createLabel(
  Theme.green,
  Theme.green,
  Theme.white,
  'authorization-status-label',
  _l('Yes'),
);

export const getAuthorizationLabel = (authorized?: boolean) =>
  authorized ? <AuthorizedLabelYes /> : <AuthorizedLabelNo />;
