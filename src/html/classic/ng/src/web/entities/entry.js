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

import Layout from '../layout.js';
import SelectionType from '../selectiontype.js';

import Checkbox from '../form/checkbox.js';

import Icon from '../icons/icon.js';

export class EntitiesEntry extends React.Component {

  constructor(...args) {
    super(...args);

    this.onSelectionChange = this.onSelectionChange.bind(this);
  }

  onSelectionChange(value) {
    let {onDeselected, onSelected} = this.props;
    let {entity} = this.getEntity();

    if (value) {
      if (onSelected) {
        onSelected(entity);
      }
    }
    else if (onDeselected) {
      onDeselected(entity);
    }
  }

  renderSelection() {
    return (
      <td>
        <Layout flex align={['center', 'center']}>
          <Checkbox onChange={this.onSelectionChange}/>
        </Layout>
      </td>
    );
  }

  renderTableButtons() {
    return null;
  }

  renderDeleteButtonActive() {
    return (
      <Icon onClick={this.handleDelete} size="small" img="trashcan.svg"
        title={_('Delete')}/>
    );
  }

  renderDeleteButtonInActive(title) {
    return (
      <Icon size="small" img="trashcan_inactive.svg"
        title={title}/>
    );
  }

  renderEditButtonActive() {
    return (
      <Icon size="small" img="edit.svg" title={_('Edit')}
        onClick={this.handleEdit}/>
    );
  }

  renderEditButtonInActive(title) {
    return (
      <Icon size="small" img="edit_inactive.svg" title={title}/>
    );
  }

  renderCloneButtonActive() {
    return (
      <Icon size="small" img="clone.svg" title={_('Clone')}
        onClick={this.handleClone}/>
    );
  }

  renderCloneButtonInActive(title) {
    return (
      <Icon size="small" img="clone_inactive.svg"
        title={title}/>
    );
  }

  renderTableActions() {
    let {selection} = this.props;
    return selection === SelectionType.SELECTION_USER ?
      this.renderSelection() : this.renderTableButtons();
  }
}

EntitiesEntry.propTypes = {
  selection: React.PropTypes.string,
  onSelected: React.PropTypes.func,
  onDeselected: React.PropTypes.func,
};


export default EntitiesEntry;

// vim: set ts=2 sw=2 tw=80:
