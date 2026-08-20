/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type RefObject, type ReactNode, type Ref} from 'react';
import styled from 'styled-components';
import {type ToString} from 'gmp/types';
import {isDefined} from 'gmp/utils/identity';
import LegendLabel from 'web/components/chart/base/LegendLabel';
import {DEFAULT_SHAPE_SIZE} from 'web/components/chart/base/LegendLine';
import ToolTip, {type ToolTipRef} from 'web/components/chart/base/ToolTip';
import Theme from 'web/utils/theme';

interface RectProps {
  color: string;
}

interface StyledLegendProps {
  $maxHeight?: number;
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
  maxHeight?: number;
  legendRef?: LegendRef;
  onItemClick?: (d: TData) => void;
}

export type LegendRef = RefObject<HTMLElement | null>;

const StyledLegend = styled.div<StyledLegendProps>`
  padding: 5px 10px;
  margin: 10px 5px;
  display: flex;
  flex-direction: column;
  max-height: ${({$maxHeight}) =>
    $maxHeight === undefined ? undefined : `${$maxHeight}px`};
  overflow-y: ${({$maxHeight}) =>
    $maxHeight === undefined ? undefined : 'auto'};
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
  border-radius: 4px;
`;

const Legend = <TData extends LegendData = LegendData>({
  data,
  children,
  maxHeight,
  onItemClick,
  legendRef,
}: LegendProps<TData>) => (
  <StyledLegend
    ref={legendRef as Ref<HTMLDivElement>}
    $maxHeight={maxHeight}
  >
    {data.map(d => (
      <ToolTip key={d.label} content={d.toolTip}>
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
