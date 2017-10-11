/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import {get_handler} from '../../entity/withEntityComponent.js';

import TargetComponent from './component.js';

const DEFAULT_MAPPING = {
  clone: 'onTargetCloneClick',
  onCloned: 'onCloned',
  create: 'onTargetCreateClick',
  onCreated: 'onCreated',
  delete: 'onTargetDeleteClick',
  onDeleted: 'onDeleted',
  save: 'onTargetSaveClick',
  onSaved: 'onSaved',
  download: 'onTargetDownloadClick',
  onDownloaded: 'onDownloaded',
  edit: 'onTargetEditClick',
};

const withTargetComponent = (mapping = {}) => Component => {

  mapping = {
    ...DEFAULT_MAPPING,
    ...mapping,
  };

  const TargetComponentWrapper = props => {
    const {
      create: create_name,
      clone: clone_name,
      delete: delete_name,
      download: download_name,
      save: save_name,
      onError,
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
      <TargetComponent
        onError={get_handler(props, onError)}
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
      </TargetComponent>
    );
  };

  return TargetComponentWrapper;
};

export default withTargetComponent;

// vim: set ts=2 sw=2 tw=80:
