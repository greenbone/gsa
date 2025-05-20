/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {LucideIcon} from 'lucide-react';
import DynamicIcon, {DynamicIconProps} from 'web/components/icon/DynamicIcon';

export interface ExtendedDynamicIconProps<TValue = string>
  extends Omit<DynamicIconProps<TValue>, 'icon'> {
  'data-testid'?: string;
}

export interface IconComponentsType {
  [key: string]: {
    <TValue = string>(props: ExtendedDynamicIconProps<TValue>): React.ReactNode;
    displayName?: string;
  };
}

export interface IconDefinition {
  name: string;
  component: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
  dataTestId: string;
  ariaLabel: string;
  isLucide: boolean;
}

export const getIconStyling = (
  isLucide: boolean,
  color?: string,
  active?: boolean,
) => {
  return {
    strokeWidth: isLucide ? 1.5 : undefined,
    style: !isLucide
      ? {
          color: color,
          fill: !active ? 'var(--mantine-color-gray-5)' : undefined,
        }
      : undefined,
  };
};

const createIconComponents = (icons: IconDefinition[]): IconComponentsType => {
  return icons.reduce(
    (acc, {name, component, dataTestId, ariaLabel, isLucide}) => {
      acc[name] = (props: ExtendedDynamicIconProps) => {
        const {
          'data-testid': dataTestIdFromProps,
          color,
          active,
          ...otherProps
        } = props;
        const finalDataTestId = dataTestIdFromProps ?? dataTestId;
        const {strokeWidth, style} = getIconStyling(isLucide, color, active);

        return (
          <DynamicIcon
            active={active}
            ariaLabel={ariaLabel}
            color={color}
            dataTestId={finalDataTestId}
            icon={component}
            strokeWidth={strokeWidth}
            style={style}
            {...otherProps}
          />
        );
      };

      acc[name].displayName = `${name}Icon`;

      return acc;
    },
    {},
  );
};

export {createIconComponents};
