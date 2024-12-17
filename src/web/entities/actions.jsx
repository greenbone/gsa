/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import TableData from 'web/components/table/data';
import PropTypes from 'web/utils/proptypes';
import SelectionType from 'web/utils/selectiontype';

import EntitySelection from './selection';

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

// vim: set ts=2 sw=2 tw=80:
