/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode} from 'react';
import styled, {css, keyframes} from 'styled-components';
import {
  StartIcon,
  RefreshIcon,
  CheckIcon,
  AlertCircleIcon,
} from 'web/components/icon';
import Theme from 'web/utils/theme';

export type StatusActionState = 'idle' | 'testing' | 'success' | 'failed';

type ActionStatus = Exclude<StatusActionState, 'idle'>;

interface StatusActionButtonProps {
  labels: Record<StatusActionState, string>;
  'aria-describedby'?: string;
  icons?: Partial<Record<StatusActionState, ReactNode>>;
  status?: ActionStatus;
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
  $status?: ActionStatus;
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

const IconContainer = styled.span`
  display: flex;
  align-items: center;
`;

const StatusActionButton = ({
  labels,
  'aria-describedby': ariaDescribedBy,
  icons,
  status,
  onClick,
  disabled = false,
}: StatusActionButtonProps) => {
  const state = status ?? 'idle';
  const defaultIcons: Record<StatusActionState, ReactNode> = {
    idle: <StartIcon color="currentColor" size="small" />,
    testing: <RefreshIcon color="currentColor" size="small" />,
    success: <CheckIcon color="currentColor" size="small" />,
    failed: <AlertCircleIcon color="currentColor" size="small" />,
  };
  const icon =
    icons?.[state] === undefined ? defaultIcons[state] : icons[state];

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
      aria-describedby={ariaDescribedBy}
      disabled={!isInteractive}
      title={status === 'testing' ? labels.testing : labels.idle}
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {icon !== null && icon !== undefined && (
        <IconContainer aria-hidden="true">{icon}</IconContainer>
      )}
      <span>{labels[state]}</span>
    </StyledPill>
  );
};

export default StatusActionButton;
