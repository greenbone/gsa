/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import hoistStatics from 'hoist-non-react-statics';
import GmpContext from 'web/components/provider/GmpProvider';

const withGmp = Component => {
  const GmpWrapper = props => (
    <GmpContext.Consumer>
      {gmp => <Component {...props} gmp={gmp} />}
    </GmpContext.Consumer>
  );
  return hoistStatics(GmpWrapper, Component);
};

export default withGmp;

// vim: set ts=4 sw=4 tw=80:
