/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';

type SVGGroupProps = React.SVGProps<SVGGElement>;

interface GroupProps extends SVGGroupProps {
  left?: number;
  top?: number;
  scale?: number;
}

const StyledGroup = styled.g<SVGGroupProps>`
  ${props =>
    isDefined(props.onClick)
      ? {
          cursor: 'pointer',
        }
      : undefined};
`;

const Group = ({left = 0, top = 0, scale = 1, ...props}: GroupProps) => (
  <StyledGroup
    transform={`translate(${left}, ${top}),scale(${scale})`}
    {...props}
  />
);

export default Group;
