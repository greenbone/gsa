/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Alert, EStatus} from '@greenbone/ui-lib';

interface InlineNotificationProps {
  message: string;
  severity: 'error' | 'warning';
  details?: string;
  action?: {
    label: string;
    onClick: () => void;
    isLoading?: boolean;
  };
}

const InlineNotification = ({
  message,
  severity,
  details,
  action,
}: InlineNotificationProps) => (
  <Alert
    defaultButton={
      action
        ? {
            children: action.label,
            size: 'sm',
            loading: action.isLoading,
            disabled: action.isLoading,
            closeOnClick: false,
            onClick: action.onClick,
          }
        : undefined
    }
    dismissible={false}
    role={severity === 'error' ? 'alert' : 'status'}
    text={details}
    title={message}
    type={severity === 'error' ? EStatus.ERROR : EStatus.WARNING}
  />
);

export default InlineNotification;
