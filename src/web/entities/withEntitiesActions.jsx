/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import EntitiesActions from 'web/entities/Actions';

const withEntitiesActions = Component => {
  const EnitiesActionsWrapper = props => (
    <EntitiesActions {...props}>
      {actionprops => <Component {...actionprops} />}
    </EntitiesActions>
  );

  return EnitiesActionsWrapper;
};

export default withEntitiesActions;
