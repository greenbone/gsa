/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Model from 'gmp/models/model';
import EntitiesActions, {
  EntitiesActionsProps,
} from 'web/entities/EntitiesActions';
import {updateDisplayName} from 'web/utils/displayName';

/**
 * Props for component created by the `withEntitiesActions` higher-order component (HOC).
 *
 * @template TEntity - The type of the entity model.
 * @template TProps - Additional properties to be merged with the base `EntitiesActionsProps`.
 */
export type WithEntitiesActionsProps<TEntity extends Model, TProps> = Omit<
  EntitiesActionsProps<TEntity>,
  'children'
> &
  TProps;

/**
 * Props for the component passed to withEntitiesActions gets provided.
 *
 * @template TEntity - The type of the entity, which must extend the `Model` interface.
 * @property entity - The entity instance that the component will act upon.
 */
export interface WithEntitiesActionsComponentProps<TEntity extends Model> {
  entity: TEntity;
}

/**
 * A higher-order component (HOC) that wraps a given component with additional
 * functionality for handling entity actions, such as selection and deselection.
 *
 * @template TEntity - The type of the entity that extends the `Model` interface.
 * @template TProps - The type of the props that extend `WithEntity<TEntity>`.
 *
 * @param Component - The React component to be wrapped. It must accept props
 * of type `WithEntitiesActionsComponentProps<TEntity, TProps>`.
 *
 * @returns A new component that wraps the provided `Component` with the
 * `EntitiesActions` component, passing down entity-related props and handling
 * selection/deselection logic.
 *
 */
const withEntitiesActions = <
  TEntity extends Model,
  TProps extends WithEntitiesActionsComponentProps<TEntity>,
>(
  Component: React.ComponentType<TProps>,
) => {
  const EntitiesActionsWrapper = ({
    'data-testid': dataTestId,
    entity,
    selectionType,
    onEntityDeselected,
    onEntitySelected,
    ...props
  }: WithEntitiesActionsProps<TEntity, TProps>) => (
    <EntitiesActions
      data-testid={dataTestId}
      entity={entity}
      selectionType={selectionType}
      onEntityDeselected={onEntityDeselected}
      onEntitySelected={onEntitySelected}
    >
      <Component {...(props as TProps)} entity={entity} />
    </EntitiesActions>
  );

  return updateDisplayName(
    EntitiesActionsWrapper,
    Component,
    'withEntitiesActions',
  );
};

export default withEntitiesActions;
