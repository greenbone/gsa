/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type RefObject, type ReactNode, type Ref} from 'react';
import styled from 'styled-components';
import {type ToString} from 'gmp/types';
import {isDefined} from 'gmp/utils/identity';
import LegendLabel from 'web/components/chart/base/LagendLabel';
import {DEFAULT_SHAPE_SIZE} from 'web/components/chart/base/LegendLine';
import ToolTip, {type ToolTipRef} from 'web/components/chart/base/Tooltip';
import Theme from 'web/utils/Theme';

interface RectProps {
  color: string;
}

export interface LegendData {
  color: ToString;
  label: string;
  toolTip?: ReactNode;
}

interface LegendRenderProps<TData extends LegendData> {
  d: TData;
  toolTipProps: {
    ref?: ToolTipRef;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
  onItemClick?: (d: TData) => void;
}

interface LegendProps<TData extends LegendData = LegendData> {
  children?: (props: LegendRenderProps<TData>) => ReactNode;
  data: TData[];
  legendRef?: LegendRef;
  onItemClick?: (d: TData) => void;
}

export type LegendRef = RefObject<HTMLElement>;

const StyledLegend = styled.div`
  padding: 5px 10px;
  margin: 10px 5px;
  display: flex;
  flex-direction: column;
  user-select: none;
  color: ${Theme.black};
  opacity: 0.75;
`;

export const Item = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 5px 0;
  ${props =>
    isDefined(props.onClick)
      ? {
          cursor: 'pointer',
        }
      : undefined};
`;

const Rect = styled.div<RectProps>`
  display: flex;
  align-items: center;
  width: ${DEFAULT_SHAPE_SIZE}px;
  height: 10px;
  background-color: ${props => props.color};
`;

const Legend = <TData extends LegendData = LegendData>({
  data,
  children,
  onItemClick,
  legendRef,
}: LegendProps<TData>) => (
  <StyledLegend ref={legendRef as Ref<HTMLDivElement>}>
    {data.map((d, i) => (
      <ToolTip key={i} content={d.toolTip}>
        {({targetRef, hide, show}) =>
          isDefined(children) ? (
            children({
              d,
              toolTipProps: {
                ref: targetRef,
                onMouseEnter: show,
                onMouseLeave: hide,
              },
              onItemClick,
            })
          ) : (
            <Item
              ref={targetRef as Ref<HTMLDivElement>}
              onClick={
                isDefined(onItemClick) ? () => onItemClick(d) : undefined
              }
              onMouseEnter={show}
              onMouseLeave={hide}
            >
              <Rect color={String(d.color)} />
              <LegendLabel>{d.label}</LegendLabel>
            </Item>
          )
        }
      </ToolTip>
    ))}
  </StyledLegend>
);

export default Legend;
