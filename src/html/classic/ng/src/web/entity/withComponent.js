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

import {is_function} from 'gmp/utils.js';

const get_handler = (props, handler) => {

  if (is_function(handler)) {
    return (...args) => handler(props, ...args);
  }
  return props[handler];
};

const withComponent = (default_mapping, EntityComponent) => (mapping = {}) =>
  Component => {

  mapping = {
    ...default_mapping,
    ...mapping,
  };

  const ComponentWrapper = props => {
    const {
      create: create_name,
      clone: clone_name,
      delete: delete_name,
      download: download_name,
      edit: edit_name,
      save: save_name,
      onCloned,
      onCloneError,
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
        onCreated={get_handler(props, onCreated)}
        onCreateError={get_handler(props, onCreateError)}
        onCloned={get_handler(props, onCloned)}
        onCloneError={get_handler(props, onCloneError)}
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
          edit,
          save,
          download,
        }) => {
          const cprops = {
            [create_name]: create,
            [clone_name]: clone,
            [delete_name]: delete_func,
            [download_name]: download,
            [edit_name]: edit,
            [save_name]: save,
          };
          return (
            <Component {...props} {...cprops} />
          );
        }}
      </EntityComponent>
    );
  };

  return ComponentWrapper;
};

export default withComponent;

// vim: set ts=2 sw=2 tw=80:
