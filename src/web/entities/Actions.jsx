/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import TableData from 'web/components/table/TableData';
import EntitySelection from 'web/entities/EntitySelection';
import PropTypes from 'web/utils/PropTypes';
import SelectionType from 'web/utils/SelectionType';

const EntitiesActions = ({
  children,
  entity,
  selectionType,
  onEntityDeselected,
  onEntitySelected,
  ...props
}) => {
  if (!isDefined(children) && selectionType !== SelectionType.SELECTION_USER) {
    return null;
  }
  return selectionType === SelectionType.SELECTION_USER ? (
    <TableData align={['center', 'center']}>
      <EntitySelection
        entity={entity}
        onDeselected={onEntityDeselected}
        onSelected={onEntitySelected}
      />
    </TableData>
  ) : (
    <TableData grow>{children({entity, ...props})}</TableData>
  );
};

EntitiesActions.propTypes = {
  children: PropTypes.func,
  entity: PropTypes.model,
  selectionType: PropTypes.string,
  onEntityDeselected: PropTypes.func,
  onEntitySelected: PropTypes.func,
};

export default EntitiesActions;
