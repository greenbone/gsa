/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {LucideIcon} from 'lucide-react';
import React, {JSX} from 'react';
import DynamicIcon, {DynamicIconProps} from 'web/components/icon/DynamicIcon';

export interface ExtendedDynamicIconProps<TValue = string>
  extends Omit<DynamicIconProps<TValue>, 'icon'> {
  'data-testid'?: string;
}

export interface IconComponentsType {
  [key: string]: {
    <T = string>(props: ExtendedDynamicIconProps<T>): JSX.Element;
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

const createIconComponents = (icons: IconDefinition[]): IconComponentsType => {
  return icons.reduce(
    (acc, {name, component, dataTestId, ariaLabel, isLucide}) => {
      acc[name] = (props: ExtendedDynamicIconProps) => {
        const {'data-testid': dataTestIdFromProps, ...otherProps} = props;
        const finalDataTestId = dataTestIdFromProps ?? dataTestId;

        return (
          <DynamicIcon
            ariaLabel={ariaLabel}
            dataTestId={finalDataTestId}
            icon={component}
            strokeWidth={isLucide ? 1.5 : undefined}
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
