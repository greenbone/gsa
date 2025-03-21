/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import styled from 'styled-components';
// @ts-expect-error not typed
import Divider from 'web/components/layout/Divider';

interface HorizontalSepProps {
  $separator?: string;
  $spacing?: string;
  $wrap?: boolean;
  children: React.ReactNode;
}

const HorizontalSep = styled(Divider)<HorizontalSepProps>`
  flex-wrap: ${({$wrap}) => (isDefined($wrap) ? $wrap : null)};
  & > *:not(:last-child)::after {
    content: ${({$separator = '•'}) => `'${$separator}'`};
    margin-left: ${({$spacing = '5px'}) => $spacing};
  }
`;

export default HorizontalSep;
