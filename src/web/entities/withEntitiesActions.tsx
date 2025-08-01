/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Model from 'gmp/models/model';
import EntitiesActions, {
  EntitiesActionsProps,
  EntitiesActionsRenderProps,
} from 'web/entities/EntitiesActions';
import {updateDisplayName} from 'web/utils/displayName';

export type WithEntitiesActionsComponentProps<
  TEntity extends Model,
  TProps,
> = EntitiesActionsProps<TEntity, TProps> & TProps;

const withEntitiesActions = <TEntity extends Model, TProps>(
  Component: React.ComponentType<
    EntitiesActionsRenderProps<TEntity, TProps> & TProps
  >,
) => {
  const EntitiesActionsWrapper = (
    props: WithEntitiesActionsComponentProps<TEntity, TProps>,
  ) => (
    <EntitiesActions {...props}>
      {actionProps => (
        <Component
          {...(actionProps as WithEntitiesActionsComponentProps<
            TEntity,
            TProps
          >)}
        />
      )}
    </EntitiesActions>
  );

  return updateDisplayName(
    EntitiesActionsWrapper,
    Component,
    'withEntitiesActions',
  );
};

export default withEntitiesActions;
