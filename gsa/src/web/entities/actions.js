/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {isDefined} from 'gmp/utils/identity';

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
  'data-testid': dataTestId,
  ...props
}) => {
  if (!isDefined(children) && selectionType !== SelectionType.SELECTION_USER) {
    return null;
  }
  return selectionType === SelectionType.SELECTION_USER ? (
    <TableData align={['center', 'center']} data-testid={dataTestId}>
      <EntitySelection
        entity={entity}
        onSelected={onEntitySelected}
        onDeselected={onEntityDeselected}
      />
    </TableData>
  ) : (
    <TableData grow data-testid={dataTestId}>
      {children({entity, ...props})}
    </TableData>
  );
};

EntitiesActions.propTypes = {
  children: PropTypes.func,
  'data-testid': PropTypes.string,
  entity: PropTypes.model,
  selectionType: PropTypes.string,
  onEntityDeselected: PropTypes.func,
  onEntitySelected: PropTypes.func,
};

export default EntitiesActions;

// vim: set ts=2 sw=2 tw=80:
