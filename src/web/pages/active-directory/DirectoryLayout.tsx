/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import Column from 'web/components/layout/Column';
import Row from 'web/components/layout/Row';

export const disclosureWidth = '32px';

// Expanded branches scroll inside the available page height rather than
// increasing the page's intrinsic height.
export const BrowserViewport = styled(Column)`
  contain: size;
`;

export const DirectoryScrollArea = styled(Column)`
  overflow: auto;
`;

export const DirectoryFooter = styled(Row)`
  border-top: 1px solid var(--mantine-color-default-border);
`;

export const DirectoryList = styled.ul<{$spacing: 'xs' | 'sm'}>`
  display: flex;
  flex-direction: column;
  gap: ${({$spacing}) => `var(--mantine-spacing-${$spacing})`};
  list-style: none;
  padding: 0;
  margin: 0;
  min-width: 0;
`;

export const DirectoryRow = styled.div<{$depth: number}>`
  display: grid;
  grid-template-columns: 35% 22% 33% 10%;
  align-items: center;
  padding: var(--mantine-spacing-sm);
  > * {
    min-width: 0;
    overflow-wrap: anywhere;
    padding-inline: var(--mantine-spacing-xs);
  }
  > :first-child {
    padding-inline-start: ${({$depth}) => `calc(${$depth} * var(--mantine-spacing-md))`};
  }
  > :last-child {
    display: flex;
    justify-content: center;
  }
`;

export const BranchRow = styled(DirectoryRow)`
  padding-block: var(--mantine-spacing-xs);
  > :first-child {
    font-weight: 600;
  }
  > :nth-child(2) {
    grid-column: span 2;
  }
`;

export const DirectoryHeader = styled(DirectoryRow)`
  font-weight: 600;
  font-size: var(--mantine-font-size-sm);
`;

export const ComputerDetailsInset = styled.div<{$depth: number}>`
  margin: var(--mantine-spacing-xs) var(--mantine-spacing-sm) 0
    ${({$depth}) => `calc(${disclosureWidth} + var(--mantine-spacing-sm) + ${$depth} * var(--mantine-spacing-md))`};
`;

export const DirectoryHeading = styled.h3`
  margin: 0;
  font-size: var(--mantine-font-size-md);
  font-weight: 500;
`;
