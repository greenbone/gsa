/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode} from 'react';
import styled from 'styled-components';

interface DirectoryPanelProps {
  children?: ReactNode;
  'aria-busy'?: boolean | 'true' | 'false';
  'aria-label'?: string;
  background?: string;
  className?: string;
  padding?: string;
  paddingInline?: string;
}

const Panel = styled.div<{
  $background?: string;
  $padding?: string;
  $paddingInline?: string;
}>`
  min-width: 0;
  box-sizing: border-box;
  border-radius: var(--mantine-radius-md);
  background-color: ${({$background}) => $background ?? 'var(--mantine-color-default)'};
  box-shadow: var(--mantine-shadow-xs);
  padding: ${({$padding}) => $padding ?? 'var(--mantine-spacing-md)'};
  padding-inline: ${props => props.$paddingInline};
`;

const DirectoryPanel = ({
  background,
  padding,
  paddingInline,
  children,
  'aria-busy': ariaBusy,
  'aria-label': ariaLabel,
  className,
}: DirectoryPanelProps) => (
  <Panel
    $background={background}
    $padding={padding}
    $paddingInline={paddingInline}
    aria-busy={ariaBusy}
    aria-label={ariaLabel}
    className={className}
  >
    {children}
  </Panel>
);

export default DirectoryPanel;
