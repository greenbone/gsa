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

import _ from 'gmp/locale.js';
import {is_defined, shorten, first} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';
import compose from '../../utils/compose';
import withGmp from '../../utils/withGmp.js';
import withCapabilties from '../../utils/withCapabilities.js';

import Wrapper from '../../components/layout/wrapper.js';

import EntityComponent from '../../entity/component.js';

import TagDialog from './dialog.js';

class TagComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleEnableTag = this.handleEnableTag.bind(this);
    this.handleDisableTag = this.handleDisableTag.bind(this);
    this.handleAddTag = this.handleAddTag.bind(this);
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
      resource_id: entity.id,
      resource_type: entity.entity_type,
    }).then(onAdded, onAddError);
  }

  getResourceTypes() {
    const {capabilities} = this.props;
    const resource_types = [];
    if (capabilities.mayAccess('agents')) {
      resource_types.push(['agent', _('Agent')]);
    }
    if (capabilities.mayAccess('alerts')) {
      resource_types.push(['alert', _('Alert')]);
    }
    if (capabilities.mayAccess('assets')) {
      resource_types.push(['host', _('Host')]);
    }
    if (capabilities.mayAccess('assets')) {
      resource_types.push(['os', _('Operating System')]);
    }
    if (capabilities.mayAccess('info')) {
      resource_types.push(['cpe', _('CPE')]);
    }
    if (capabilities.mayAccess('credentials')) {
      resource_types.push(['credential', _('Credential')]);
    }
    if (capabilities.mayAccess('info')) {
      resource_types.push(['cve', _('CVE')]);
    }
    if (capabilities.mayAccess('info')) {
      resource_types.push(['cert_bund_adv', _('CERT-Bund Advisory')]);
    }
    if (capabilities.mayAccess('info')) {
      resource_types.push(['dfn_cert_adv', _('DFN-CERT Advisory')]);
    }
    if (capabilities.mayAccess('filters')) {
      resource_types.push(['filter', _('Filter')]);
    }
    if (capabilities.mayAccess('groups')) {
      resource_types.push(['group', _('Group')]);
    }
    if (capabilities.mayAccess('notes')) {
      resource_types.push(['note', _('Note')]);
    }
    if (capabilities.mayAccess('info')) {
      resource_types.push(['nvt', _('NVT')]);
    }
    if (capabilities.mayAccess('info')) {
      resource_types.push(['ovaldef', _('OVAL Definition')]);
    }
    if (capabilities.mayAccess('overrides')) {
      resource_types.push(['override', _('Override')]);
    }
    if (capabilities.mayAccess('permissions')) {
      resource_types.push(['Permission', _('Permission')]);
    }
    if (capabilities.mayAccess('port_lists')) {
      resource_types.push(['port_list', _('Port Lists')]);
    }
    if (capabilities.mayAccess('reports')) {
      resource_types.push(['report', _('Report')]);
    }
    if (capabilities.mayAccess('report_formats')) {
      resource_types.push(['report_format', _('Report Format')]);
    }
    if (capabilities.mayAccess('results')) {
      resource_types.push(['result', _('Result')]);
    }
    if (capabilities.mayAccess('roles')) {
      resource_types.push(['role', _('Role')]);
    }
    if (capabilities.mayAccess('configs')) {
      resource_types.push(['config', _('Scan Config')]);
    }
    if (capabilities.mayAccess('schedules')) {
      resource_types.push(['schedule', _('Schedule')]);
    }
    if (capabilities.mayAccess('targets')) {
      resource_types.push(['target', _('Target')]);
    }
    if (capabilities.mayAccess('tasks')) {
      resource_types.push(['task', _('Task')]);
    }
    if (capabilities.mayAccess('users')) {
      resource_types.push(['user', _('User')]);
    }
    return resource_types;
  }

  openTagDialog(tag, options = {}) {
    const resource_types = this.getResourceTypes();

    if (is_defined(tag)) {
      const {resource = {}} = tag;

      this.tag_dialog.show({
        ...options,
        id: tag.id,
        tag,
        name: tag.name,
        comment: tag.comment,
        value: tag.value,
        active: tag.active,
        resource_id: resource.id,
        resource_type: is_defined(resource.entity_type) ?
          resource.entity_type :
          first(resource_types, [])[0],
        resource_types,
      }, {
        title: _('Edit tag {{name}}', {name: shorten(tag.name)}),
      });
    }
    else {
      this.tag_dialog.show({
        resource_types,
      });
    }
  }

  openCreateTagDialog(options = {}) {
    const resource_types = this.getResourceTypes();

    this.tag_dialog.show({
      ...options,
      resource_types,
    });
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
            })}
            <TagDialog
              ref={ref => this.tag_dialog = ref}
              onSave={save}
            />
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
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default compose(
  withGmp,
  withCapabilties,
)(TagComponent);

// vim: set ts=2 sw=2 tw=80:
