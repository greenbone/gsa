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
import {is_defined, is_function} from 'gmp/utils.js';

import EntityComponent from './component.js';

const log = logger.getLogger('web.entity.withEntityComponent');

export const goto_details = type => ({router}, {data}) =>
  router.push('/ng/' + type + '/' + data.id);

export const goto_list = type => ({router}) => router.push('/ng/' + type);

export const has_mapping = (props, mapping, name) => {
  const func_name = mapping[name];

  return is_function(func_name) || is_defined(props[func_name]);
};

export const create_handler_props = (props, mapping, handlers = {}) => {

  const set_handler = (name, _, handler) => {
    const onName = mapping[name];

    if (process.env.NODE_ENV !== 'production' && !is_defined(onName)) {
      log.error('No name for entity handler set');
      return handlers;
    }

    handlers[onName] = handler;

    return handlers;
  };

  Object.defineProperty(handlers, 'set', {
    value: set_handler,
  });

  return handlers;
};

export const get_handler = (props, handler) => {

  if (is_function(handler)) {
    return (...args) => handler(props, ...args);
  }
  return props[handler];
};

export const handle_promise = (promise, props, success, error) => {
  let onSuccess;
  let onError;

  if (is_function(success)) {
    onSuccess = (...args) => success(props, ...args);
  }
  else {
    onSuccess = props[success];
  }

  if (is_function(error)) {
    onError = (...args) => error(props, ...args);
  }
  else {
    onError = props[error];
  }
  return promise.then(onSuccess, onError);
};

export const DEFAULT_MAPPING = {
  create: 'onEntityCreateClick',
  onCreateError: undefined, // let dialogs handle error via returned promise
  onCreated: 'onCreated',
  clone: 'onEntityCloneClick',
  onCloneError: 'onCloneError',
  onCloned: 'onCloned',
  delete: 'onEntityDeleteClick',
  onDeleteError: 'onDeleteError',
  onDeleted: 'onDeleted',
  save: 'onEntitySaveClick',
  onSaveError: undefined, // same as onCreateError
  onSaved: 'onSaved',
  download: 'onEntityDownloadClick',
  onDownloadError: 'onDownloadError',
  onDownloaded: 'onDownloaded',
};

const withEntityComponent = (name, mapping) => Component => {

  mapping = {
    ...DEFAULT_MAPPING,
    ...mapping,
  };

  const EntityComponentWrapper = props => {
    const {
      create: create_name,
      clone: clone_name,
      delete: delete_name,
      download: download_name,
      save: save_name,
      onCreated,
      onCreateError,
      onDeleted,
      onDeleteError,
      onSaved,
      onSaveError,
      onDownloaded,
      onDownloadError,
    } = mapping;
    return (
      <EntityComponent
        name={name}
        onCreated={get_handler(props, onCreated)}
        onCreateError={get_handler(props, onCreateError)}
        onDeleted={get_handler(props, onDeleted)}
        onDeleteError={get_handler(props, onDeleteError)}
        onSaved={get_handler(props, onSaved)}
        onSaveError={get_handler(props, onSaveError)}
        onDownloaded={get_handler(props, onDownloaded)}
        onDownloadError={get_handler(props, onDownloadError)}
      >
        {({
          create,
          clone,
          delete: delete_func,
          save,
          download,
        }) => {
          const cprops = {
            [create_name]: create,
            [clone_name]: clone,
            [delete_name]: delete_func,
            [download_name]: download,
            [save_name]: save,
          };
          return (
            <Component {...props} {...cprops} />
          );
        }}
      </EntityComponent>
    );
  };

  return EntityComponentWrapper;
};

export default withEntityComponent;

// vim: set ts=2 sw=2 tw=80:
