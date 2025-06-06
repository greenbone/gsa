/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import hoistStatics from 'hoist-non-react-statics';
import CapabilitiesContext from 'web/components/provider/CapabilitiesProvider';

const withCapabilities = Component => {
  const CapabilitiesWrapper = props => (
    <CapabilitiesContext.Consumer>
      {capabilities => <Component {...props} capabilities={capabilities} />}
    </CapabilitiesContext.Consumer>
  );

  return hoistStatics(CapabilitiesWrapper, Component);
};

export default withCapabilities;
