/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Badge, EThemeColors} from '@greenbone/ui-lib';
import styled, {keyframes} from 'styled-components';
import {type ReportExportStatusTone} from 'web/report-export/report-export-job-display';
import Theme from 'web/utils/theme';

export const BADGE_COLORS: Record<ReportExportStatusTone, EThemeColors> = {
  active: EThemeColors.Green,
  queued: EThemeColors.Blue,
  downloading: EThemeColors.Blue,
  canceled: EThemeColors.NeutralLight,
  error: EThemeColors.RedLight,
  complete: EThemeColors.Green,
};

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

// the ui-lib Spinner is a page-level loading container without a size prop,
// so the badge icon spins the refresh icon itself
export const Spinning = styled.span`
  animation: ${spin} 1.2s linear infinite;
  display: inline-flex;
`;

// light badge look (colored text on light background) instead of Badge's
// solid fill
export const StatusBadge = styled(Badge)<{$tone: ReportExportStatusTone}>`
  && {
    ${props =>
      props.$tone === 'queued' || props.$tone === 'downloading'
        ? `
            background-color: var(--info-tip-background-color);
            color: var(--info-tip-color);
          `
        : ''}
  }
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 600;
  justify-content: flex-start;
  line-height: 1;
  white-space: nowrap;
`;

export const StatusIcon = styled.span`
  align-items: center;
  display: inline-flex;
  height: 14px;
  width: 14px;
`;

export const BADGE_ICON_SIZE: [string, string] = ['14px', '14px'];

export const ActivityTrigger = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  display: inline-flex;
  padding: 4px;
  position: relative;

  @media (max-width: 600px) {
    background: var(--mantine-color-black);
    position: fixed;
    right: 8px;
    top: 9px;
  }
`;

export const ActivityDot = styled.span<{
  $state: 'active' | 'error' | 'complete';
}>`
  background: ${props => {
    if (props.$state === 'error') return Theme.darkRed;
    if (props.$state === 'active') return Theme.green;
    return Theme.mediumGray;
  }};
  border: 2px solid ${Theme.darkGray};
  border-radius: 50%;
  height: 9px;
  position: absolute;
  right: 0;
  top: 1px;
  width: 9px;
`;

export const ActivityTitle = styled.span`
  display: block;
  color: ${Theme.black};
  font-size: 14px;
  font-weight: 600;
  min-width: 0;
  overflow-wrap: anywhere;
  width: 100%;
`;

export const ActivityErrorText = styled.div`
  color: ${Theme.darkRed};
  font-size: 14px;
`;

export const ActivityStatusDetail = styled.span`
  color: ${Theme.darkGray};
  font-size: 12px;
  overflow-wrap: anywhere;
`;

export const ActivityMetadataSeparator = styled.span`
  color: ${Theme.darkGray};
  flex: 0 0 auto;
`;

export const ActivityTimestamp = styled.div`
  color: ${Theme.darkGray};
  font-size: 12px;
  line-height: 1.3;
  margin-left: auto;
  min-width: 0;
  overflow-wrap: anywhere;

  span {
    font-weight: 400;
  }
`;

export const ActivityJob = styled.div`
  background: ${Theme.white};
  border: 1px solid ${Theme.lightGray};
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  padding: 16px;
`;

export const ActivityDivider = styled.div`
  border-top: 1px solid ${Theme.lightGray};
  width: 100%;
`;
