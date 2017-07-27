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

import {is_defined, map} from 'gmp/utils.js';

import compose from '../../utils/compose.js';

import PropTypes from '../../utils/proptypes.js';

import SelectionType from '../../utils/selectiontype.js';

import Wrapper from '../../components/layout/wrapper.js';

import withEntityComponent, {
  create_handler_props,
  goto_details,
  handle_promise,
  has_mapping,
} from '../../entity/withEntityComponent.js';

import withTargetComponent from '../targets/withTargetComponent.js';

import HostDialog from './dialog.js';

const DEFAULT_MAPPING = {
  onClone: 'onHostCloneClick',
  onCreate: 'onHostCreateClick',
  onDelete: 'onHostDeleteClick',
  onSave: 'onHostSaveClick',
  onDownload: 'onHostDownloadClick',
  onEdit: 'onHostEditClick',
  onIdentifierDelete: 'onHostIdentifierDeleteClick',
  onIdentifierDeleted: 'onHostIdentifierDeleted',
  onIdentifierDeleteError: 'onError',
};

const withHostComponent = (mapping = {}) => Component => {

  mapping = {
    ...DEFAULT_MAPPING,
    ...mapping,
  };

  class HostComponentWrapper extends React.Component {

    constructor(...args) {
      super(...args);

      this.handleIdentifierDelete = this.handleIdentifierDelete.bind(this);
      this.openHostDialog = this.openHostDialog.bind(this);
      this.openCreateTargetDialog = this.openCreateTargetDialog.bind(this);
      this.openCreateTargetSelectionDialog =
        this.openCreateTargetSelectionDialog.bind(this);
    }

    handleIdentifierDelete(identifier) {
      const {onIdentifierDeleted, onIdentifierDeleteError} = mapping;
      const {gmp} = this.context;
      return handle_promise(gmp.host.deleteIdentifier(identifier), this.props,
        onIdentifierDeleted, onIdentifierDeleteError);
    }

    openHostDialog(host) {
      this.hosts_dialog.show({
        host,
        id: is_defined(host) ? host.id : undefined,
        name: is_defined(host) ? host.name : '127.0.0.1',
        comment: is_defined(host) ? host.comment : '',
      });
    }

    openCreateTargetDialog(host) {
      this._openTargetDialog(1, 'uuid=' + host.id);
    }

    openCreateTargetSelectionDialog() {
      const {entities, entitiesSelected, selectionType, filter} = this.props;

      let size;
      let filterstring;

      if (selectionType === SelectionType.SELECTION_USER) {
        const hosts = [...entitiesSelected]; // convert set to array
        size = entitiesSelected.size;
        filterstring = map(hosts, host => 'uuid=' + host.id).join(" ");

      }
      else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
        size = entities.length;
        filterstring = filter.toFilterString();
      }
      else {
        const counts = entities.getCounts();
        size = counts.filtered;
        filterstring = filter.all().toFilterString();
      }
      this._openTargetDialog(size, filterstring);
    }

    _openTargetDialog(count, filterstring) {
      const {onTargetCreateClick} = this.props;
      onTargetCreateClick({
        target_source: 'asset_hosts',
        hosts_count: count,
        hosts_filter: filterstring,
      });
    }

    render() {
      const {
        onSave,
      } = mapping;

      const onSaveHandler  = this.props[onSave];

      const has_save = is_defined(onSaveHandler) &&
        has_mapping(this.props, mapping, 'onSaved');
      const has_create = is_defined(onSaveHandler) &&
        has_mapping(this.props, mapping, 'onCreated');

      const handlers = create_handler_props(this.props, mapping)
        .set('onEdit', has_save, this.openHostDialog)
        .set('onCreate', has_create, this.openHostDialog)
        .set('onIdentifierDelete', 'onIdentifierDeleted',
          this.handleIdentifierDelete);

      return (
        <Wrapper>
          <Component
            {...this.props}
            {...handlers}
            onTargetCreateFromSelection={this.openCreateTargetSelectionDialog}
            onTargetCreateFromHostClick={this.openCreateTargetDialog}
          />
          <HostDialog
            ref={ref => this.hosts_dialog = ref}
            onSave={onSaveHandler}
          />
        </Wrapper>
      );
    }
  }

  HostComponentWrapper.propTypes = {
    selectionType: PropTypes.string,
    entities: PropTypes.collection,
    entitiesSelected: PropTypes.set,
    filter: PropTypes.filter,
    onTargetCreateClick: PropTypes.func.isRequired,
  };

  HostComponentWrapper.contextTypes = {
    gmp: PropTypes.gmp.isRequired,
  };

  return compose(
    withTargetComponent({
      onCreated: goto_details('target'),
      onSaved: 'onChanged',
    }),
    withEntityComponent('host', mapping),
  )(HostComponentWrapper);

};

export default withHostComponent;
