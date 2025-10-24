/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled, {css, keyframes} from 'styled-components';
import {
  PlugZapIcon,
  VerifyIcon,
  VerifyNoIcon,
  ScheduleIcon,
} from 'web/components/icon';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/Theme';

type ConnectionStatus = 'success' | 'failed' | 'testing' | null;

interface ConnectionStatusPillProps {
  status?: ConnectionStatus;
  onClick?: () => void;
  disabled?: boolean;
}

// Keyframe animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
`;

const pulse = keyframes`
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
`;

// Base styled component
const StyledPill = styled.div<{
  $status?: ConnectionStatus;
  $disabled?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
  min-width: 140px;
  justify-content: center;

  &:hover {
    transform: ${props => (props.$disabled ? 'none' : 'translateY(-1px)')};
    box-shadow: ${props =>
      props.$disabled
        ? '0 2px 4px rgba(0, 0, 0, 0.1)'
        : '0 4px 8px rgba(0, 0, 0, 0.15)'};
  }

  ${props => {
    switch (props.$status) {
      case 'success':
        return css`
          background-color: ${Theme.lightGreen};
          color: ${Theme.darkGreen};
          border-color: ${Theme.green};
          animation: ${fadeIn} 0.5s ease-in;

          &:hover {
            background-color: ${Theme.green};
            color: ${Theme.white};
          }
        `;
      case 'failed':
        return css`
          background-color: ${Theme.lightRed};
          color: ${Theme.darkRed};
          border-color: ${Theme.mediumLightRed};
          animation: ${shake} 0.5s ease-in-out;

          &:hover {
            background-color: ${Theme.mediumLightRed};
          }
        `;
      case 'testing':
        return css`
          background-color: ${Theme.severityWarnYellow};
          color: ${Theme.white};
          border-color: ${Theme.severityWarnYellow};
          animation: ${pulse} 1.5s infinite;
        `;
      default:
        return css`
          background-color: ${Theme.lightGray};
          color: ${Theme.darkGray};
          border-color: ${Theme.mediumGray};
        `;
    }
  }}
`;

const ConnectionStatusPill: React.FC<ConnectionStatusPillProps> = ({
  status,
  onClick,
  disabled = false,
}) => {
  const [_] = useTranslation();

  const getStatusText = () => {
    switch (status) {
      case 'success':
        return _('Connection successful');
      case 'failed':
        return _('Connection failed');
      case 'testing':
        return _('Testing connection...');
      default:
        return _('Test Connection');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <VerifyIcon size="small" />;
      case 'failed':
        return <VerifyNoIcon size="small" />;
      case 'testing':
        return <ScheduleIcon size="small" />;
      default:
        return <PlugZapIcon size="small" />;
    }
  };

  const getTitle = () => {
    if (status === 'testing') {
      return _('Testing in progress...');
    }
    return _('Test Connection');
  };

  const handleClick = () => {
    if (!disabled && status !== 'testing' && onClick) {
      onClick();
    }
  };

  return (
    <StyledPill
      $disabled={disabled || status === 'testing'}
      $status={status}
      title={getTitle()}
      onClick={handleClick}
    >
      {getStatusIcon()}
      <span>{getStatusText()}</span>
    </StyledPill>
  );
};

export default ConnectionStatusPill;
