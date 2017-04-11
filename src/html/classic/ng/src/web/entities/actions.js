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

import _ from '../../locale.js';
import {is_defined} from '../../utils.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';
import SelectionType from '../selectiontype.js';
import {render_component} from '../render.js';

import EntitySelection from './selection.js';


export const EntityActions = props => {
  let {selectionType, entity, onEntitySelected, onEntityDeselected,
    actionsComponent, ...other} = props;

  if (!is_defined(actionsComponent) &&
    selectionType !== SelectionType.SELECTION_USER) {
    return null;
  }

  return (
    <td className="table-actions">
      {selectionType === SelectionType.SELECTION_USER ?
        <Layout flex align={['center', 'center']}>
          <EntitySelection entity={entity} onSelected={onEntitySelected}
            onDeselected={onEntityDeselected}/>
        </Layout> :
          render_component(actionsComponent, {...other, entity})
      }
    </td>
  );
};

EntityActions.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model,
  selectionType: PropTypes.string,
  onEntitySelected: PropTypes.func,
  onEntityDeselected: PropTypes.func,
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
