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
import {getEntityType, typeName} from 'gmp/utils/entitytype';

import {YES_VALUE} from 'gmp/parser';

import PropTypes from '../../utils/proptypes.js';
import compose from '../../utils/compose';
import withGmp from '../../utils/withGmp.js';
import withCapabilities from '../../utils/withCapabilities.js';

import Wrapper from '../../components/layout/wrapper.js';

import EntityComponent from '../../entity/component.js';

import TagDialog from './dialog.js';

const TYPES = [
  'agent',
  'alert',
  'host',
  'operatingsystem',
  'cpe',
  'credential',
  'cve',
  'certbund',
  'dfncert',
  'filter',
  'group',
  'note',
  'nvt',
  'ovaldef',
  'override',
  'permission',
  'portlist',
  'report',
  'reportformat',
  'result',
  'role',
  'scanconfig',
  'scanner',
  'schedule',
  'target',
  'task',
  'user',
];

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
      active: YES_VALUE,
      resource_ids: [entity.id],
      resource_type: getEntityType(entity),
    }).then(onAdded, onAddError);
  }

  getResourceTypes() {
    const {capabilities} = this.props;
    return TYPES.map(type => capabilities.mayAccess(type) ?
     [type, typeName(type)] : undefined).filter(is_defined);
  }

  openTagDialog(tag, options = {}) {
    const {gmp} = this.props;
    const resource_types = this.getResourceTypes();

    if (is_defined(tag)) {
      gmp.tag.get({id: tag.id}).then(response => {
        const {
          active,
          comment,
          id,
          name,
          resources,
          resource_type,
          value,
        } = response.data;

        this.setState({
          active,
          comment,
          dialogVisible: true,
          id,
          name,
          resource_ids: resources.map(res => res.id),
          resource_type: is_defined(resource_type) ?
            resource_type :
            first(resource_types, [])[0],
          resource_types,
          title: _('Edit Tag {{name}}', {name: shorten(name)}),
          value,
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
