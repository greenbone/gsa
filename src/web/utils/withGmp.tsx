/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import hoistStatics from 'hoist-non-react-statics';
import type Gmp from 'gmp/gmp';
import GmpContext from 'web/components/provider/GmpProvider';
import {updateDisplayName} from 'web/utils/display-name';

export interface WithGmpComponentProps {
  gmp: Gmp;
}

type WithGmpProps<TProps> = Omit<TProps, 'gmp'>;

const withGmp = <TProps extends WithGmpComponentProps>(
  Component: React.ComponentType<TProps>,
) => {
  const WithGmp = (props: WithGmpProps<TProps>) => (
    <GmpContext.Consumer>
      {gmp => <Component {...(props as TProps)} gmp={gmp} />}
    </GmpContext.Consumer>
  );
  return hoistStatics(
    updateDisplayName(WithGmp, Component, 'withGmp'),
    Component,
  );
};

export default withGmp;
