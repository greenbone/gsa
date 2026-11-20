/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode} from 'react';
import {AccordionWrapper, theme} from '@greenbone/ui-lib';
import styled from 'styled-components';
import {disclosureWidth} from 'web/pages/active-directory/DirectoryLayout';

interface DirectoryAccordionProps {
  children: ReactNode;
  value: string | null;
  onChange: (value: string | null) => void;
}

const DirectoryAccordionWrapper = styled(AccordionWrapper)`
  @container ad-directory (max-width: ${theme.breakpoints.xs}) {
    --directory-disclosure-width: 1.25rem;
    --directory-disclosure-start: 0px;
    --directory-disclosure-end: var(--mantine-spacing-xxs);
  }
`;

// Keep the shared accordion's behavior while letting the directory grid own
// header alignment and the existing cards own backgrounds and spacing.
const DirectoryAccordion = ({
  children,
  value,
  onChange,
}: DirectoryAccordionProps) => (
  <DirectoryAccordionWrapper
    keepMounted={false}
    styles={{
      item: {border: 0},
      control: {
        padding: 0,
        background: 'transparent',
        color: 'inherit',
        font: 'inherit',
      },
      label: {padding: 0, overflowWrap: 'anywhere', fontWeight: 'inherit'},
      chevron: {
        flexShrink: 0,
        justifyContent: 'center',
        width: `var(--directory-disclosure-width, ${disclosureWidth})`,
        marginInlineStart:
          'var(--directory-disclosure-start, var(--mantine-spacing-md))',
        marginInlineEnd:
          'var(--directory-disclosure-end, var(--mantine-spacing-xs))',
      },
      content: {padding: 0},
    }}
    transitionDuration={0}
    value={value}
    variant="default"
    onChange={onChange}
  >
    {children}
  </DirectoryAccordionWrapper>
);

export default DirectoryAccordion;
