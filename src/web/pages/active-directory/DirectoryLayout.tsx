/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {theme} from '@greenbone/ui-lib';
import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import Column from 'web/components/layout/Column';
import Row from 'web/components/layout/Row';

export const disclosureWidth = 'var(--mantine-spacing-xl)';
const directoryIndent = 'var(--mantine-spacing-lg)';
const directoryRowBorder =
  'color-mix(in srgb, var(--mantine-color-default-border) 60%, transparent)';

export const BrowserViewport = styled(Column)`
  container: ad-discovery / inline-size;
  min-inline-size: 0;
  color: var(--mantine-color-text);

  @media (min-width: 64rem) and (min-height: 48rem) {
    block-size: 0;
    min-block-size: 34rem;
    flex: 1 0 auto;
  }
`;

export const DirectoryWorkspace = styled(Column)`
  min-width: 0;
  border: 1px solid var(--mantine-color-default-border);
  border-radius: var(--mantine-radius-md);
`;

export const DirectoryToolbar = styled(Row)`
  border-bottom: 1px solid var(--mantine-color-default-border);
  overflow-wrap: anywhere;
`;

export const DirectoryScrollArea = styled(Column)`
  container: ad-directory / inline-size;
  min-inline-size: 0;

  @media (min-width: 64rem) and (min-height: 48rem) {
    min-block-size: 8rem;
    overflow: auto;
    scrollbar-gutter: stable;
  }
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
  --directory-row-indent: ${({$depth}) => `calc(${$depth} * ${directoryIndent})`};
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 4fr) minmax(0, 5fr);
  align-items: center;
  padding: var(--mantine-spacing-xs) var(--mantine-spacing-sm);
  > * {
    min-width: 0;
    overflow-wrap: anywhere;
    padding-inline: var(--mantine-spacing-xs);
  }
  > :first-child {
    padding-inline-start: min(var(--directory-row-indent), 40%);
  }
  > :nth-child(4) {
    display: flex;
    justify-content: center;
  }

  @container ad-directory (max-width: ${theme.breakpoints.xs}) {
    grid-template-columns: minmax(0, 1fr) 2.25rem;
    row-gap: var(--mantine-spacing-xxs);
    padding-inline: var(--mantine-spacing-xs);

    > :first-child {
      padding-inline-start: min(
        var(--directory-row-indent),
        40%,
        max(0px, calc(100% - 7rem))
      );
    }
    > :nth-child(4) {
      grid-area: 1 / 2;
    }
  }

  @container ad-directory (max-width: 17rem) {
    > :first-child {
      padding-inline-start: min(var(--directory-row-indent), 10%);
      padding-inline-end: var(--mantine-spacing-xxs);
    }
  }
`;

export const ComputerDirectoryRow = styled(DirectoryRow)`
  border-top: 1px solid ${directoryRowBorder};

  @container ad-directory (max-width: ${theme.breakpoints.xs}) {
    > :nth-child(2),
    > :nth-child(3) {
      grid-column: 1 / -1;
      padding-inline-start: var(--mantine-spacing-xs);
    }
  }
`;

export const ComputerMetadataLabel = styled.strong`
  display: none;

  @container ad-directory (max-width: ${theme.breakpoints.xs}) {
    display: inline;
    margin-inline-end: var(--mantine-spacing-xs);
  }
`;

export const BranchRow = styled(DirectoryRow)`
  min-block-size: 2.5rem;
  border-bottom: 1px solid ${directoryRowBorder};

  > :first-child {
    font-weight: ${({$depth}) => ($depth === 0 ? 600 : 500)};
  }
  > :nth-child(2) {
    display: flex;
    align-items: center;
    grid-column: 2 / -1;

    > output:not(:last-child) {
      flex-shrink: 0;
    }
    > span {
      height: auto;
      min-height: 1.25rem;
      max-inline-size: 100%;
      padding-block: var(--mantine-spacing-xxs);
      overflow-wrap: anywhere;
      white-space: normal;
    }
  }
  @container ad-directory (max-width: ${theme.breakpoints.xs}) {
    > :nth-child(2) {
      grid-column: 1;
      &:has(> div:only-child > output:empty) {
        display: none;
      }
    }
  }

  @container ad-directory (max-width: 17rem) {
    > :nth-child(2) {
      grid-column: 1 / -1;
    }
  }
`;

export const DirectoryBranchContent = styled(Column)<{$topLevel: boolean}>`
  background-color: ${({$topLevel}) =>
    $topLevel
      ? 'color-mix(in srgb, var(--mantine-color-default-hover) 55%, transparent)'
      : 'transparent'};
  border-end-start-radius: var(--mantine-radius-md);
  border-end-end-radius: var(--mantine-radius-md);
`;

export const DirectoryEmptyNotice = styled.output<{$ownerDepth?: number}>`
  display: block;
  margin-inline: var(--mantine-spacing-sm);
  margin-inline-start: ${({$ownerDepth}) =>
    !isDefined($ownerDepth)
      ? 'var(--mantine-spacing-sm)'
      : `calc(var(--mantine-spacing-sm) + ${disclosureWidth} + min(calc(${$ownerDepth} * ${directoryIndent}), 14%))`};
  padding: var(--mantine-spacing-xs) var(--mantine-spacing-sm);
  font-size: var(--mantine-font-size-sm);
  overflow-wrap: anywhere;
`;

export const DirectoryHeader = styled(DirectoryRow)`
  font-weight: 600;
  font-size: var(--mantine-font-size-sm);
  color: var(--mantine-color-text);
  background: var(--mantine-color-default-hover);

  > :first-child {
    padding-inline-start: calc(
      min(var(--directory-row-indent), 40%) + ${disclosureWidth} +
        var(--mantine-spacing-md) + var(--mantine-spacing-xs)
    );
  }

  @container ad-directory (max-width: ${theme.breakpoints.xs}) {
    display: none;
  }
`;

export const DirectoryHeading = styled.h3`
  margin: 0;
  font-weight: 600;
  overflow-wrap: anywhere;
`;
