/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import EntitiesActions from 'web/entities/EntitiesActions';

const withEntitiesActions = Component => {
  const EntitiesActionsWrapper = props => (
    <EntitiesActions {...props}>
      {actionProps => <Component {...actionProps} />}
    </EntitiesActions>
  );

  return EntitiesActionsWrapper;
};

export default withEntitiesActions;
