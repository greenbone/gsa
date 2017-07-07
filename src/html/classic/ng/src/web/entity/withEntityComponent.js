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

import logger from 'gmp/log.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../utils/proptypes.js';

const log = logger.getLogger('web.entity.withEntityComponent');

export const set_handlers = (handlers, props) => {
  const set_handler = (name, named, handler) => {
    if (process.env.NODE_ENV !== 'production' && !is_defined(name)) {
      log.error('No name for entity handler set');
    }
    handlers[name] = is_defined(props[named]) ? handler : undefined;
    return set_handler;
  };
  return set_handler;
};

export const DEFAULT_MAPPING = {
  onCreate: 'onEntityCreateClick',
  onCreateError: 'onCreateError',
  onCreated: 'onCreated',
  onClone: 'onEntityCloneClick',
  onCloneError: 'onCloneError',
  onCloned: 'onCloned',
  onDelete: 'onEntityDeleteClick',
  onDeleteError: 'onDeleteError',
  onDeleted: 'onDeleted',
  onSave: 'onEntitySaveClick',
  onSaveError: 'onSaveError',
  onSaved: 'onSaved',
  onDownload: 'onEntityDownloadClick',
  onDownloadError: 'onDownloadError',
  onDownloaded: 'onDownloaded',
};

const withEntityComponent = (name, mapping) => Component => {

  mapping = {
    ...DEFAULT_MAPPING,
    ...mapping,
  };

  class EntityComponentWrapper extends React.Component {

    constructor(...args) {
      super(...args);

      const {gmp} = this.context;

      this.cmd = gmp[name];

      this.handleEntityClone = this.handleEntityClone.bind(this);
      this.handleEntityDelete = this.handleEntityDelete.bind(this);
      this.handleEntityDownload = this.handleEntityDownload.bind(this);
      this.handleEntitySave = this.handleEntitySave.bind(this);
    }

    handleEntityDelete(entity) {
      const {onDeleted, onDeleteError} = mapping;
      const onError = this.props[onDeleteError];
      const onSuccess = this.props[onDeleted];

      return this.cmd.delete(entity).then(onSuccess, onError);
    }

    handleEntityClone(entity) {
      const {onCloned, onCloneError} = mapping;
      const onError = this.props[onCloneError];
      const onSuccess = this.props[onCloned];

      return this.cmd.clone(entity).then(onSuccess, onError);
    }

    handleEntitySave(data) {
      let promise;
      let onSuccess;
      let onError;

      if (is_defined(data.id)) {
        const {onSaved, onSaveError} = mapping;
        onError = this.props[onSaveError];
        onSuccess = this.props[onSaved];
        promise = this.cmd.save(data);
      }
      else {
        const {onCreated, onCreateError} = mapping;
        onError = this.props[onCreateError];
        onSuccess = this.props[onCreated];
        promise = this.cmd.create(data);
      }

      return promise.then(onSuccess, onError);
    }

    handleEntityDownload(entity) {
      const {onDownloaded, onDownloadError} = mapping;
      const onError = this.props[onDownloadError];
      const onSuccess = this.props[onDownloaded];

      const filename = name + '-' + entity.id + '.xml';

      return this.cmd.export([entity]).then(response => {
        if (is_defined(onSuccess)) {
          onSuccess({filename, data: response.data});
        }
      }, onError);
    }

    render() {
      const {
        onClone,
        onCloned,
        onCreate,
        onCreated,
        onDelete,
        onDeleted,
        onSave,
        onSaved,
        onDownload,
        onDownloaded,
      } = mapping;

      const handlers = {};

      set_handlers(handlers, this.props)(
        onCreate, onCreated, this.handleEntitySave,
      )(
        onClone, onCloned, this.handleEntityClone
      )(
        onDelete, onDeleted, this.handleEntityDelete
      )(
        onSave, onSaved, this.handleEntitySave,
      )(
        onDownload, onDownloaded, this.handleEntityDownload,
      );

      return (
        <Component
          {...handlers}
          {...this.props}
        />
      );
    }
  }

  EntityComponentWrapper.propTypes = {
    onError: PropTypes.func,
  };

  EntityComponentWrapper.contextTypes = {
    gmp: PropTypes.gmp.isRequired,
  };

  return EntityComponentWrapper;
};

export default withEntityComponent;

// vim: set ts=2 sw=2 tw=80:
