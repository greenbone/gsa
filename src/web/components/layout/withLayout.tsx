/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {updateDisplayName} from 'web/utils/displayName';

export interface WithLayoutProps {
  align?: string | [string, string];
  children?: React.ReactNode;
  flex?: true | string;
  basis?: string;
  grow?: true | string | number;
  wrap?: true | string;
  shrink?: true | string;
  'data-testid'?: string;
}

const convertAlign = (align: string): string => {
  switch (align) {
    case 'end':
    case 'start':
      return 'flex-' + align;
    default:
      return align;
  }
};

const withLayout =
  (defaults: WithLayoutProps = {}) =>
  (Component: React.ComponentType | string) => {
    const LayoutComponent = styled(
      ({align, basis, flex, grow, shrink, wrap, ...props}: WithLayoutProps) => (
        <Component {...props} />
      ),
    )`
      display: flex;
      flex-direction: ${({flex = defaults.flex}) =>
        isDefined(flex) && flex !== true ? flex : 'row'};
      flex-basis: ${({basis = defaults.basis}) => basis};
      flex-grow: ${({grow = defaults.grow}) => (grow === true ? 1 : grow)};
      flex-wrap: ${({wrap = defaults.wrap}) => (wrap === true ? 'wrap' : wrap)};
      flex-shrink: ${({shrink = defaults.shrink}) =>
        shrink === true ? 1 : shrink};
      ${({flex = defaults.flex, align = defaults.align}) => {
        if (isDefined(align)) {
          align = map(align, (al: string) => convertAlign(al)) as [
            string,
            string,
          ];
        } else {
          // use sane defaults for alignment
          align =
            flex === 'column' ? ['center', 'stretch'] : ['start', 'center'];
        }
        return {
          justifyContent: align[0],
          alignItems: align[1],
        };
      }}
    `;

    return updateDisplayName(LayoutComponent, Component, 'withLayout');
  };

export default withLayout;
