/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import Group from 'web/components/chart/base/Group';
import {type LegendData} from 'web/components/chart/base/Legend';
import ToolTip from 'web/components/chart/base/Tooltip';
import Theme from 'web/utils/Theme';

interface Arc2dData extends LegendData {
  value: number;
}

interface Arc2dProps<TData extends Arc2dData> {
  data: TData;
  path: string;
  x: number;
  y: number;
  onDataClick?: (data: TData) => void;
}

const Arc2d = <TData extends Arc2dData = Arc2dData>({
  data,
  path,
  x,
  y,
  onDataClick,
}: Arc2dProps<TData>) => {
  const {color = Theme.lightGray, toolTip} = data;
  return (
    <ToolTip content={toolTip}>
      {({targetRef, hide, show}) => (
        <Group
          onClick={isDefined(onDataClick) ? () => onDataClick(data) : undefined}
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          <path d={path} fill={String(color)} />
          <circle // used as positioning ref for tooltips
            ref={targetRef as React.Ref<SVGCircleElement>}
            cx={x}
            cy={y}
            r="1"
            visibility="hidden"
          />
        </Group>
      )}
    </ToolTip>
  );
};

export default Arc2d;
