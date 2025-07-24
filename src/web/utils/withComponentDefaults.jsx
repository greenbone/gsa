/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {updateDisplayName} from 'web/utils/displayName';

export const withComponentDefaults =
  (options = {}) =>
  Component => {
    const ComponentDefaultsWrapper = props => (
      <Component {...options} {...props} />
    );
    return updateDisplayName(
      ComponentDefaultsWrapper,
      Component,
      'withComponentDefaults',
    );
  };

export default withComponentDefaults;
