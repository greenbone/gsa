/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import hoistStatics from 'hoist-non-react-statics';
import GmpContext from 'web/components/provider/GmpProvider';
import {updateDisplayName} from 'web/utils/displayName';

const withGmp = Component => {
  const WithGmp = props => (
    <GmpContext.Consumer>
      {gmp => <Component {...props} gmp={gmp} />}
    </GmpContext.Consumer>
  );
  return hoistStatics(
    updateDisplayName(WithGmp, Component, 'withGmp'),
    Component,
  );
};

export default withGmp;
