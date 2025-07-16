/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined, isFunction} from 'gmp/utils/identity';
import TableData from 'web/components/table/TableData';
import EntitySelection, {Entity} from 'web/entities/EntitySelection';
import SelectionType, {SelectionTypeType} from 'web/utils/SelectionType';

export interface EntitiesActionsProps<TEntity extends Entity, TProps = {}> {
  children?:
    | React.ReactNode
    | ((props: TProps & {entity: TEntity}) => React.ReactNode);
  'data-testid'?: string;
  entity: TEntity;
  selectionType?: SelectionTypeType;
  onEntityDeselected?: (entity: TEntity) => void;
  onEntitySelected?: (entity: TEntity) => void;
}

const EntitiesActions = <TEntity extends Entity, TProps = {}>({
  children,
  'data-testid': dataTestId = 'entities-actions',
  entity,
  selectionType,
  onEntityDeselected,
  onEntitySelected,
  ...props
}: EntitiesActionsProps<TEntity, TProps> & TProps) => {
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
        ? children({...(props as TProps), entity})
        : children}
    </TableData>
  );
};

export default EntitiesActions;
