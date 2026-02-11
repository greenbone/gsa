/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode} from 'react';
import {InfoI} from '@greenbone/ui-lib';
import styled from 'styled-components';

export type InfoTipPosition = 'top' | 'bottom' | 'left' | 'right';

interface InfoTipProps {
  ariaLabel?: string;
  children: ReactNode;
  dataTestId?: string;
  position?: InfoTipPosition;
}

const StyledSection = styled.section`
  display: inline-block;
  margin-left: 8px;
`;

/**
 * InfoTip component - displays information on hover
 * Uses InfoI from shared library which provides the Info icon and hover behavior
 */
const InfoTip = ({
  ariaLabel = 'More information',
  children,
  dataTestId,
  position = 'top',
}: InfoTipProps) => {
  return (
    <StyledSection aria-label={ariaLabel} data-testid={dataTestId}>
      <InfoI dropDownContent={<>{children}</>} position={position} />
    </StyledSection>
  );
};

export default InfoTip;
