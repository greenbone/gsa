/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined, isFunction} from 'gmp/utils/identity';
import TableData from 'web/components/table/TableData';
import EntitySelection, {Entity} from 'web/entities/EntitySelection';
import SelectionType, {SelectionTypeType} from 'web/utils/SelectionType';

type EntitiesActionsForwardProps<TProps> = Omit<
  TProps,
  | 'children'
  | 'data-testid'
  | 'entity'
  | 'selectionType'
  | 'onEntityDeselected'
  | 'onEntitySelected'
>;

export type EntitiesActionsRenderProps<
  TEntity extends Entity,
  TProps,
> = EntitiesActionsForwardProps<TProps> & {
  entity: TEntity;
};

type EntitiesActionsRenderFunc<TEntity extends Entity, TProps> = (
  props: EntitiesActionsRenderProps<TEntity, TProps>,
) => React.ReactNode;

export interface EntitiesActionsProps<TEntity extends Entity, TProps = {}> {
  children?: React.ReactNode | EntitiesActionsRenderFunc<TEntity, TProps>;
  'data-testid'?: string;
  entity: TEntity;
  selectionType?: SelectionTypeType;
  onEntityDeselected?: (entity: TEntity) => void;
  onEntitySelected?: (entity: TEntity) => void;
}

type EntitiesActionsComponentProps<
  TEntity extends Entity,
  TProps,
> = EntitiesActionsProps<TEntity, TProps> & EntitiesActionsForwardProps<TProps>;

const EntitiesActions = <TEntity extends Entity, TProps = {}>({
  children,
  'data-testid': dataTestId = 'entities-actions',
  entity,
  selectionType,
  onEntityDeselected,
  onEntitySelected,
  ...props
}: EntitiesActionsComponentProps<TEntity, TProps>) => {
  if (selectionType === SelectionType.SELECTION_USER) {
    return (
      <TableData align={['center', 'center']} data-testid={dataTestId}>
        <EntitySelection
          entity={entity}
          onDeselected={onEntityDeselected as (entity: Entity) => void}
          onSelected={onEntitySelected as (entity: Entity) => void}
        />
      </TableData>
    );
  }
  if (!isDefined(children)) {
    return null;
  }
  return (
    <TableData grow data-testid={dataTestId}>
      {isFunction(children)
        ? children({...(props as EntitiesActionsForwardProps<TProps>), entity})
        : children}
    </TableData>
  );
};

export default EntitiesActions;
