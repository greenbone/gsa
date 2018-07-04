/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import {is_defined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import {first} from 'gmp/utils/array';
import {getEntityType} from 'gmp/utils/entitytype';

import PropTypes from '../../utils/proptypes.js';
import compose from '../../utils/compose';
import withGmp from '../../utils/withGmp.js';
import withCapabilities from '../../utils/withCapabilities.js';

import Wrapper from '../../components/layout/wrapper.js';

import EntityComponent from '../../entity/component.js';

import TagDialog from './dialog.js';

export const RESOURCE_TYPES = {
  agent: _('Agent'),
  alert: _('Alert'),
  host: _('Host'),
  os: _('Operating System'),
  cpe: _('CPE'),
  credential: _('Credential'),
  cve: _('CVE'),
  cert_bund_adv: _('CERT-Bund Advisory'),
  dfn_cert_adv: _('DFN-CERT Advisory'),
  filter: _('Filter'),
  group: _('Group'),
  note: _('Note'),
  nvt: _('NVT'),
  ovaldef: _('OVAL Definition'),
  override: _('Override'),
  permission: _('Permission'),
  port_list: _('Port Lists'),
  report: _('Report'),
  report_format: _('Report Format'),
  result: _('Result'),
  role: _('Role'),
  config: _('Scan Config'),
  scanner: _('Scanner'),
  schedule: _('Schedule'),
  target: _('Target'),
  task: _('Task'),
  user: _('User'),
};

class TagComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {dialogVisible: false};

    this.closeTagDialog = this.closeTagDialog.bind(this);
    this.handleEnableTag = this.handleEnableTag.bind(this);
    this.handleDisableTag = this.handleDisableTag.bind(this);
    this.handleAddTag = this.handleAddTag.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.openTagDialog = this.openTagDialog.bind(this);
    this.openCreateTagDialog = this.openCreateTagDialog.bind(this);
  }

  handleEnableTag(tag) {
    const {gmp, onEnabled, onEnableError} = this.props;

    gmp.tag.enable(tag).then(onEnabled, onEnableError);
  }

  handleDisableTag(tag) {
    const {gmp, onDisabled, onDisableError} = this.props;

    gmp.tag.disable(tag).then(onDisabled, onDisableError);
  }

  handleAddTag({name, value, entity}) {
    const {gmp, onAdded, onAddError} = this.props;

    return gmp.tag.create({
      name,
      value,
      active: 1,
      resource_ids: [entity.id],
      resource_type: getEntityType(entity),
    }).then(onAdded, onAddError);
  }

  getResourceTypes() {
    const {capabilities} = this.props;
    const resource_types = [];
    if (capabilities.mayAccess('agents')) {
      resource_types.push(['agent', RESOURCE_TYPES.agent]);
    }
    if (capabilities.mayAccess('alerts')) {
      resource_types.push(['alert', RESOURCE_TYPES.alert]);
    }
    if (capabilities.mayAccess('assets')) {
      resource_types.push(['host', RESOURCE_TYPES.host]);
    }
    if (capabilities.mayAccess('assets')) {
      resource_types.push(['os', RESOURCE_TYPES.os]);
    }
    if (capabilities.mayAccess('info')) {
      resource_types.push(['cpe', RESOURCE_TYPES.cpe]);
    }
    if (capabilities.mayAccess('credentials')) {
      resource_types.push(['credential', RESOURCE_TYPES.credential]);
    }
    if (capabilities.mayAccess('info')) {
      resource_types.push(['cve', RESOURCE_TYPES.cve]);
    }
    if (capabilities.mayAccess('info')) {
      resource_types.push(['cert_bund_adv', RESOURCE_TYPES.cert_bund_adv]);
    }
    if (capabilities.mayAccess('info')) {
      resource_types.push(['dfn_cert_adv', RESOURCE_TYPES.dfn_cert_adv]);
    }
    if (capabilities.mayAccess('filters')) {
      resource_types.push(['filter', RESOURCE_TYPES.filter]);
    }
    if (capabilities.mayAccess('groups')) {
      resource_types.push(['group', RESOURCE_TYPES.group]);
    }
    if (capabilities.mayAccess('notes')) {
      resource_types.push(['note', RESOURCE_TYPES.note]);
    }
    if (capabilities.mayAccess('info')) {
      resource_types.push(['nvt', RESOURCE_TYPES.nvt]);
    }
    if (capabilities.mayAccess('info')) {
      resource_types.push(['ovaldef', RESOURCE_TYPES.ovaldef]);
    }
    if (capabilities.mayAccess('overrides')) {
      resource_types.push(['override', RESOURCE_TYPES.override]);
    }
    if (capabilities.mayAccess('permissions')) {
      resource_types.push(['permission', RESOURCE_TYPES.permission]);
    }
    if (capabilities.mayAccess('port_lists')) {
      resource_types.push(['port_list', RESOURCE_TYPES.port_list]);
    }
    if (capabilities.mayAccess('reports')) {
      resource_types.push(['report', RESOURCE_TYPES.report]);
    }
    if (capabilities.mayAccess('report_formats')) {
      resource_types.push(['report_format', RESOURCE_TYPES.report_format]);
    }
    if (capabilities.mayAccess('results')) {
      resource_types.push(['result', RESOURCE_TYPES.result]);
    }
    if (capabilities.mayAccess('roles')) {
      resource_types.push(['role', RESOURCE_TYPES.role]);
    }
    if (capabilities.mayAccess('configs')) {
      resource_types.push(['config', RESOURCE_TYPES.config]);
    }
    if (capabilities.mayAccess('scanners')) {
      resource_types.push(['scanner', RESOURCE_TYPES.scanner]);
    }
    if (capabilities.mayAccess('schedules')) {
      resource_types.push(['schedule', RESOURCE_TYPES.schedule]);
    }
    if (capabilities.mayAccess('targets')) {
      resource_types.push(['target', RESOURCE_TYPES.target]);
    }
    if (capabilities.mayAccess('tasks')) {
      resource_types.push(['task', RESOURCE_TYPES.task]);
    }
    if (capabilities.mayAccess('users')) {
      resource_types.push(['user', RESOURCE_TYPES.user]);
    }
    return resource_types;
  }

  openTagDialog(tag, options = {}) {
    const resource_types = this.getResourceTypes();
    const {gmp} = this.props;
    if (is_defined(tag)) {
      gmp.tag.get({id: tag.id}).then(response => {
        const loadedTag = response.data;
        this.setState({
          active: loadedTag.active,
          comment: loadedTag.comment,
          dialogVisible: true,
          id: loadedTag.id,
          name: loadedTag.name,
          resource_ids: loadedTag.resources.map(res => res.id),
          resource_type: is_defined(loadedTag.resource_type) ?
            loadedTag.resource_type :
            first(resource_types, [])[0],
          resource_types,
          title: _('Edit Tag {{name}}', {name: shorten(loadedTag.name)}),
          value: loadedTag.value,
          ...options,
        });
      });
    }
    else {
      this.setState({
        active: undefined,
        comment: undefined,
        name: undefined,
        resource_ids: [],
        resource_type: undefined,
        resource_types,
        dialogVisible: true,
        title: undefined,
        value: undefined,
        ...options,
      });
    }
  }

  closeTagDialog() {
    this.setState({dialogVisible: false});
  }

  openCreateTagDialog(options = {}) {
    this.openTagDialog(undefined, options);
  }

  handleRemove(tag_id, entity) {
    const {gmp, onRemoved, onRemoveError} = this.props;
    return gmp.tag.get({id: tag_id})
      .then(response => response.data)
      .then(tag => gmp.tag.save({
        ...tag,
        resource_id: entity.id,
        resource_type: tag.resource_type,
        resources_action: 'remove',
      }))
      .then(onRemoved, onRemoveError);
  }

  render() {
    const {
      children,
      onCloned,
      onCloneError,
      onCreated,
      onCreateError,
      onDeleted,
      onDeleteError,
      onDownloaded,
      onDownloadError,
      onSaved,
      onSaveError,
    } = this.props;

    const {
      active,
      comment,
      id,
      name,
      resource_ids,
      resource_type,
      resource_types = [],
      dialogVisible,
      title,
      value,
      ...options
    } = this.state;

    return (
      <EntityComponent
        name="tag"
        onCreated={onCreated}
        onCreateError={onCreateError}
        onCloned={onCloned}
        onCloneError={onCloneError}
        onDeleted={onDeleted}
        onDeleteError={onDeleteError}
        onDownloaded={onDownloaded}
        onDownloadError={onDownloadError}
        onSaved={onSaved}
        onSaveError={onSaveError}
      >
        {({
          save,
          ...other
        }) => (
          <Wrapper>
            {children({
              ...other,
              add: this.handleAddTag,
              create: this.openCreateTagDialog,
              edit: this.openTagDialog,
              enable: this.handleEnableTag,
              disable: this.handleDisableTag,
              remove: this.handleRemove,
            })}
            {dialogVisible &&
              <TagDialog
                active={active}
                comment={comment}
                id={id}
                name={name}
                resource_ids={resource_ids}
                resource_type={resource_type}
                resource_types={resource_types}
                title={title}
                value={value}
                onClose={this.closeTagDialog}
                onSave={save}
                {...options}
              />
            }
          </Wrapper>
        )}
      </EntityComponent>
    );
  }
}

TagComponent.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  children: PropTypes.func.isRequired,
  gmp: PropTypes.gmp.isRequired,
  onAddError: PropTypes.func,
  onAdded: PropTypes.func,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDisableError: PropTypes.func,
  onDisabled: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onEnableError: PropTypes.func,
  onEnabled: PropTypes.func,
  onRemoveError: PropTypes.func,
  onRemoved: PropTypes.func,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default compose(
  withGmp,
  withCapabilities,
)(TagComponent);

// vim: set ts=2 sw=2 tw=80:
