/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import {is_defined} from 'gmp/utils.js';

import Layout from '../components/layout/layout.js';

import PropTypes from '../utils/proptypes.js';
import {render_component} from '../utils/render.js';

import SelectionType from '../utils/selectiontype.js';

import EntitySelection from './selection.js';

const EntityActions = ({
  actionsComponent,
  entity,
  selectionType,
  onEntityDeselected,
  onEntitySelected,
  ...other
}) => {
  if (!is_defined(actionsComponent) &&
    selectionType !== SelectionType.SELECTION_USER) {
    return null;
  }

  return (
    <td className="table-actions">
      <Layout flex align={['center', 'center']}>
        {selectionType === SelectionType.SELECTION_USER ?
          <Layout flex align={['center', 'center']}>
            <EntitySelection
              entity={entity}
              onSelected={onEntitySelected}
              onDeselected={onEntityDeselected}/>
          </Layout> :
          render_component(actionsComponent, {...other, entity})
        }
      </Layout>
    </td>
  );
};

EntityActions.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model,
  selectionType: PropTypes.string,
  onEntityDeselected: PropTypes.func,
  onEntitySelected: PropTypes.func,
};

export const withEntityActions = component => {
  // filter actions from parent. actions may contain this component
  const EnityActionsWrapper = ({actions, ...props}) => { // eslint-disable-line no-unused
    return <EntityActions actionsComponent={component} {...props}/>;
  };

  EnityActionsWrapper.propTypes = {
    actions: PropTypes.any, // don't care
  };

  return EnityActionsWrapper;
};

export default EntityActions;

// vim: set ts=2 sw=2 tw=80:
