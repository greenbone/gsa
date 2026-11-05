/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode} from 'react';
import {AccordionWrapper} from '@greenbone/ui-lib';
import {disclosureWidth} from 'web/pages/active-directory/DirectoryLayout';

interface DirectoryAccordionProps {
  children: ReactNode;
  value: string | null;
  onChange: (value: string | null) => void;
}

// Keep the shared accordion's behavior while letting the directory grid own
// header alignment and the existing cards own backgrounds and spacing.
const DirectoryAccordion = ({
  children,
  value,
  onChange,
}: DirectoryAccordionProps) => (
  <AccordionWrapper
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
        width: disclosureWidth,
        marginInlineEnd: 'var(--mantine-spacing-xs)',
      },
      content: {padding: 0},
    }}
    transitionDuration={0}
    value={value}
    variant="default"
    onChange={onChange}
  >
    {children}
  </AccordionWrapper>
);

export default DirectoryAccordion;
