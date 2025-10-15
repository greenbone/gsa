/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import TableData from 'web/components/table/TableData';
import EntitySelection, {type Entity} from 'web/entities/EntitySelection';
import SelectionType, {type SelectionTypeType} from 'web/utils/SelectionType';

export interface EntitiesActionsProps<TEntity> {
  children?: React.ReactNode;
  'data-testid'?: string;
  entity: TEntity;
  selectionType?: SelectionTypeType;
  onEntityDeselected?: (entity: TEntity) => void;
  onEntitySelected?: (entity: TEntity) => void;
}

const EntitiesActions = <TEntity extends Entity>({
  children,
  'data-testid': dataTestId = 'entities-actions',
  entity,
  selectionType,
  onEntityDeselected,
  onEntitySelected,
  ...props
}: EntitiesActionsProps<TEntity>) => {
  if (selectionType === SelectionType.SELECTION_USER) {
    return (
      <TableData align={['center', 'center']} data-testid={dataTestId}>
        <EntitySelection
          entity={entity}
          onDeselected={onEntityDeselected}
          onSelected={onEntitySelected}
        />
      </TableData>
    );
  }
  if (!isDefined(children)) {
    return null;
  }
  return (
    <TableData grow data-testid={dataTestId}>
      {children}
    </TableData>
  );
};

export default EntitiesActions;
