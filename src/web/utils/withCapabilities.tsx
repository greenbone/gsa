/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import hoistStatics from 'hoist-non-react-statics';
import type Capabilities from 'gmp/capabilities/capabilities';
import CapabilitiesContext from 'web/components/provider/CapabilitiesProvider';
import {updateDisplayName} from 'web/utils/display-name';

export interface WithCapabilitiesComponentProps {
  capabilities: Capabilities;
}

type WithCapabilitiesProps<TProps> = Omit<TProps, 'capabilities'>;

const withCapabilities = <TProps extends WithCapabilitiesComponentProps>(
  Component: React.ComponentType<TProps>,
) => {
  const CapabilitiesWrapper = (props: WithCapabilitiesProps<TProps>) => (
    <CapabilitiesContext.Consumer>
      {capabilities => (
        <Component {...(props as TProps)} capabilities={capabilities} />
      )}
    </CapabilitiesContext.Consumer>
  );

  return hoistStatics(
    updateDisplayName(CapabilitiesWrapper, Component, 'withCapabilities'),
    Component,
  );
};

export default withCapabilities;
