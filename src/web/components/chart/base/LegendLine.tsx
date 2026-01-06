/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Line as VxLine} from '@visx/shape';
import styled from 'styled-components';
import {type ToString} from 'gmp/types';
import Theme from 'web/utils/Theme';

interface LegendLineProps {
  width?: number;
  height?: number;
  color: ToString;
  lineWidth?: number;
  dashArray?: string;
}

interface StyledDivProps {
  height?: number;
}

export const DEFAULT_SHAPE_SIZE = 15;

const StyledDiv = styled.div<StyledDivProps>`
  height: ${props => props.height}px;
  background-color: ${Theme.white};
  padding: 0 2px;
`;

const LegendLine = ({
  width = DEFAULT_SHAPE_SIZE + 5,
  height = DEFAULT_SHAPE_SIZE,
  color,
  lineWidth = 1,
  dashArray,
}: LegendLineProps) => {
  const y = height / 2;
  return (
    <StyledDiv>
      <svg height={height} width={width}>
        <VxLine
          from={{x: 0, y}}
          stroke={String(color)}
          strokeDasharray={dashArray}
          strokeWidth={lineWidth}
          to={{x: width, y}}
        />
      </svg>
    </StyledDiv>
  );
};

export default LegendLine;
