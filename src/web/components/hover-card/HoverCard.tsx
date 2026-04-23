/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode} from 'react';
import {HoverCard as UIHoverCard, ICON_SIZES} from '@greenbone/ui-lib';
import {Info} from 'lucide-react';
import styled from 'styled-components';

interface HoverCardProps {
  ariaLabel?: string;
  children: ReactNode;
  dataTestId?: string;
}

const StyledSection = styled.section`
  display: inline-block;
  margin-left: 8px;
`;

/**
 * HoverCard component - displays information on hover
 * Uses HoverCard from shared library which provides the hover behavior
 * with an Info icon as the trigger target
 */
const HoverCard = ({
  ariaLabel = 'More information',
  children,
  dataTestId,
}: HoverCardProps) => {
  return (
    <StyledSection aria-label={ariaLabel} data-testid={dataTestId}>
      <UIHoverCard
        dropDownContent={<>{children}</>}
        target={<Info size={ICON_SIZES.MEDIUM} />}
      />
    </StyledSection>
  );
};

export default HoverCard;
