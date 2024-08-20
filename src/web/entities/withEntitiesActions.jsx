/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import EntitiesActions from './actions';

const withEntitiesActions = Component => {
  const EnitiesActionsWrapper = props => (
    <EntitiesActions {...props}>
      {actionprops => <Component {...actionprops} />}
    </EntitiesActions>
  );

  return EnitiesActionsWrapper;
};

export default withEntitiesActions;

// vim: set ts=2 sw=2 tw=80:
