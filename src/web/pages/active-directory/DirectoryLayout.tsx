/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {theme} from '@greenbone/ui-lib';
import styled from 'styled-components';
import Column from 'web/components/layout/Column';
import Row from 'web/components/layout/Row';
import DetailsBlock from 'web/entity/DetailsBlock';

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

export const DirectoryFooter = styled(Row)`
  border-top: 1px solid var(--mantine-color-default-border);
  background-color: var(--mantine-color-default-hover);
  border-radius: 0 0 var(--mantine-radius-md) var(--mantine-radius-md);
  overflow-wrap: anywhere;

  button {
    max-inline-size: 100%;
  }

  @container ad-discovery (max-width: ${theme.breakpoints.xs}) {
    flex-direction: column;
    align-items: stretch;

    > button[data-size] {
      inline-size: 100%;
      min-block-size: 2.5rem;
      height: auto;
      padding-block: var(--mantine-spacing-xs);
      padding-inline: var(--mantine-spacing-xs);
    }
  }
`;

export const DirectorySelectionWarning = styled.div`
  min-inline-size: 0;

  &:has(> output:not(:empty)) {
    display: flex;
    inline-size: fit-content;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--mantine-spacing-xxs) var(--mantine-spacing-xs);
    padding: var(--mantine-spacing-xxs) var(--mantine-spacing-xs);
    border: 1px solid var(--border-color-warning);
    border-radius: var(--mantine-radius-sm);
    background-color: var(--background-color-warning);
    color: var(--mantine-color-text);
  }

  &:not(:first-child):has(> output:not(:empty)) {
    margin-inline-start: var(--mantine-spacing-xs);
  }

  > output:not(:empty) {
    display: flex;
    align-items: flex-start;
    gap: var(--mantine-spacing-xs);
    min-inline-size: 0;
  }

  > output > svg {
    flex-shrink: 0;
    margin-block-start: 0.15em;
  }

  > output > span {
    min-inline-size: 0;
    overflow-wrap: anywhere;
  }

  > button {
    max-inline-size: 100%;
    min-block-size: 1.5rem;
    block-size: auto;
    padding-inline: var(--mantine-spacing-xxs);
    font-size: 0.875em;
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
  grid-template-columns: minmax(0, 7fr) minmax(0, 4fr) minmax(0, 5fr) 3.25rem;
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
  > :last-child {
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
    > :last-child {
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

  &[data-directory-header-sticky] {
    position: sticky;
    inset-block-start: calc(-1 * var(--directory-sticky-top-padding, 0px));
    z-index: 2;
    background-color: var(--mantine-color-body);
  }

  > :first-child {
    font-weight: ${({$depth}) => ($depth === 0 ? 600 : 500)};
  }
  > :nth-child(2) {
    display: flex;
    align-items: center;
    grid-column: span 2;

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
    $ownerDepth === undefined
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

export const ComputerDetailsInset = styled.div<{$depth: number}>`
  margin-block-start: var(--mantine-spacing-xs);
  margin-block-end: var(--mantine-spacing-xs);
  margin-inline-end: var(--mantine-spacing-sm);
  margin-inline-start: ${({$depth}) =>
    `min(calc(${disclosureWidth} + var(--mantine-spacing-sm) + ${$depth} * ${directoryIndent}), 25%)`};

  @container ad-directory (max-width: ${theme.breakpoints.xs}) {
    margin-inline-start: var(--mantine-spacing-xs);
    margin-inline-end: var(--mantine-spacing-xs);
  }
`;

export const DirectoryHeading = styled.h3`
  margin: 0;
  font-weight: 600;
  overflow-wrap: anywhere;
`;

export const DirectoryDetailsSection = styled(DetailsBlock)`
  h2 {
    margin: 0 0 var(--mantine-spacing-xs);
  }
`;
