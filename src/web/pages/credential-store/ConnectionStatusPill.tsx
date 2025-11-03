/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled, {css, keyframes} from 'styled-components';
import {
  PlugZapIcon,
  VerifyIcon,
  VerifyNoIcon,
  ScheduleIcon,
} from 'web/components/icon';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/Theme';

type ConnectionStatus = 'success' | 'failed' | 'testing' | undefined;

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

const StyledPill = styled.button<{
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
  background: none;
  font-family: inherit;

  &:focus {
    outline: 2px solid ${Theme.green};
    outline-offset: 2px;
  }

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

const ConnectionStatusPill = ({
  status,
  onClick,
  disabled = false,
}: ConnectionStatusPillProps) => {
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

  const getAriaLabel = () => {
    switch (status) {
      case 'success':
        return _('Connection test successful. Click to test again.');
      case 'failed':
        return _('Connection test failed. Click to retry test.');
      case 'testing':
        return _('Connection test in progress. Please wait.');
      default:
        return _('Test connection button. Click to start connection test.');
    }
  };

  const handleClick = () => {
    if (!disabled && status !== 'testing' && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const isInteractive = !disabled && status !== 'testing' && onClick;

  return (
    <StyledPill
      $disabled={disabled || status === 'testing'}
      $status={status}
      aria-label={getAriaLabel()}
      disabled={!isInteractive}
      title={getTitle()}
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {getStatusIcon()}
      <span>{getStatusText()}</span>
    </StyledPill>
  );
};

export default ConnectionStatusPill;
