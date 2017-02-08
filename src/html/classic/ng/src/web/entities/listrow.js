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
import {is_defined, capitalize_first_letter} from '../../utils.js';

import Layout from '../layout.js';
import SelectionType from '../selectiontype.js';
import LegacyLink from '../legacylink.js';

import Icon from '../icons/icon.js';

import EntitySelection from './selection.js';

export class EntityListRow extends React.Component {

  constructor(name, ...args) {
    super(...args);

    this.name = name;

    this.onSave = this.onSave.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleClone = this.handleClone.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
  }

  renderEditDialog() {
    return null;
  }

  getEntityName() {
    return this.name;
  }

  getEntity() {
    let name = this.getEntityName();
    return this.state[name];
  }

  getGmp() {
    let name = this.getEntityName();
    return this.context.gmp[name];
  }

  componentWillReceiveProps(new_props) {
    let state = {};
    let name = this.getEntityName();
    state[name] = new_props[name];
    this.setState(state);
  }

  onSave() {
    let gmp = this.getGmp();
    let entity = this.getEntity();
    gmp.get(entity).then(nentity => {
      let state = {};
      state[this.getEntityName()] = nentity;
      this.setState(state);
    });
  }

  handleClone() {
    let gmp = this.getGmp();
    let entity = this.getEntity();
    let {onCloned} = this.props;

    gmp.clone(entity).then(e => {
      if (is_defined(onCloned)) {
        onCloned(e);
      }
    });
  }

  handleDelete() {
    let gmp = this.getGmp();
    let entity = this.getEntity();
    let {onDelete} = this.props;

    gmp.delete(entity).then(() => {
      if (is_defined(onDelete)) {
        onDelete(entity);
      }
    });
  }

  handleEdit() {
    this.edit_dialog.show();
  }

  renderSelection() {
    let entity = this.getEntity();
    let {onDeselected, onSelected} = this.props;
    return (
      <td className="table-actions">
        <Layout flex align={['center', 'center']}>
          <EntitySelection entity={entity} onSelected={onSelected}
            onDeselected={onDeselected}/>
        </Layout>
      </td>
    );
  }

  renderTableButtons() {
    return (
      <td>
        <Layout flex align={['center', 'center']}>
          {this.renderDeleteButton()}
          {this.renderCloneButton()}
          {this.renderEditButton()}
          {this.renderDownloadButton()}
        </Layout>
        {this.renderEditDialog()}
      </td>
    );
  }

  renderDeleteButton() {
    let {capabilities} = this.context;
    let name = this.getEntityName();
    let entity = this.getEntity();
    let uname = capitalize_first_letter(name);

    if (capabilities.mayDelete(name) && entity.isWriteable() &&
      !entity.isInUse()) {
      return this.renderDeleteButtonActive();
    }

    let title; // FIXME translation of entity name doesn't work here currently
    if (entity.isInUse()) {
      title = _('{{entity}} is still in use', {entity: uname});
    }
    else if (!entity.isWriteable()) {
      title = _('{{entity}} is not writable', {entity: uname});
    }
    else if (!capabilities.mayDelete(name)) { // eslint-disable-line no-negated-condition
      title = _('Permission to move {{entity}} to tashcan denied',
        {entity: uname});
    }
    else {
      title = _('Cannot move to tashcan');
    }
    return this.renderDeleteButtonInActive(title);
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

  renderEditButton() {
    let {capabilities} = this.context;
    let name = this.getEntityName();
    let entity = this.getEntity();
    let uname = capitalize_first_letter(name);

    if (capabilities.mayEdit(name) && entity.isWriteable()) {
      return this.renderEditButtonActive();
    }

    let title; // FIXME translation of entity name doesn't work here currently
    if (!entity.isWriteable()) {
      title = _('{{entity}} is not writable', {entity: uname});
    }
    else if (!capabilities.mayEdit(name)) { // eslint-disable-line no-negated-condition

      title = _('Permission to edit {{entity}} denied', {entity: uname});
    }
    else {
      title = _('Cannot modify {{entity}}');
    }
    return this.renderEditButtonInActive(title);
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

  renderCloneButton() {
    let {capabilities} = this.context;
    let name = this.getEntityName();
    return capabilities.mayClone(name) ?
      this.renderCloneButtonActive() : this.renderCloneButtonInActive();
  }

  renderCloneButtonActive() {
    return (
      <Icon size="small" img="clone.svg" title={_('Clone')}
        onClick={this.handleClone}/>
    );
  }

  renderCloneButtonInActive() {
    return (
      <Icon size="small" img="clone_inactive.svg"
        title={_('Permission to clone denied')}/>
    );
  }

  renderDownloadButton() {
    let name = this.getEntityName();
    let entity = this.getEntity();

    let props = {
      cmd: 'export_' + name,
    };
    props[name + '_id'] = entity.id;

    return (
      <LegacyLink className="icon icon-sm" {...props}>
        <Icon size="small" img="download.svg" title={_('Export')}/>
      </LegacyLink>
    );
  }

  renderTableActions() {
    let {selection} = this.props;
    return selection === SelectionType.SELECTION_USER ?
      this.renderSelection() : this.renderTableButtons();
  }
}

EntityListRow.propTypes = {
  selection: React.PropTypes.string,
  onSelected: React.PropTypes.func,
  onDeselected: React.PropTypes.func,
  onDelete: React.PropTypes.func,
  onCloned: React.PropTypes.func,
};


export default EntityListRow;

// vim: set ts=2 sw=2 tw=80:
