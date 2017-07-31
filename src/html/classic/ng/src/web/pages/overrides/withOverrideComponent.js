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

import  _ from 'gmp/locale.js';
import {is_defined, is_empty, includes, shorten} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import Wrapper from '../../components/layout/wrapper.js';

import withEntityComponent, {
  create_handler_props,
  has_mapping,
} from '../../entity/withEntityComponent.js';

import OverrideDialog from './dialog.js';

const DEFAULT_MAPPING = {
  onClone: 'onOverrideCloneClick',
  onCreate: 'onOverrideCreateClick',
  onDelete: 'onOverrideDeleteClick',
  onSave: 'onOverrideSaveClick',
  onDownload: 'onOverrideDownloadClick',
  onEdit: 'onOverrideEditClick',
};

const withOverrideComponent = (mapping = {}) => Component => {

  mapping = {
    ...DEFAULT_MAPPING,
    ...mapping,
  };

  class OverrideComponentWrapper extends React.Component {

    constructor(...args) {
      super(...args);

      this.openCreateOverrideDialog = this.openCreateOverrideDialog.bind(this);
      this.openOverrideDialog = this.openOverrideDialog.bind(this);
    }

    openOverrideDialog(override) {
      if (is_defined(override)) {
        let active = '0';
        if (override.isActive()) {
          if (is_empty(override.end_time)) {
            active = '-1';
          }
          else {
            active = '-2';
          }
        }

        let custom_severity = '0';
        let new_severity_from_list;
        let new_severity;

        if (includes([10, 5, 2, 0, -1], override.new_severity)) {
          new_severity_from_list = override.new_severity;
        }
        else {
          custom_severity = '1';
          new_severity = override.new_severity;
        }
        this.override_dialog.show({
          id: override.id,
          active,
          custom_severity,
          hosts: override.hosts,
          new_severity,
          new_severity_from_list,
          nvt: override.nvt,
          oid: override.nvt ? override.nvt.oid : undefined,
          override,
          override_severity: override.severity,
          port: override.port,
          result_id: is_defined(override.result) ? '' : '0',
          result_uuid: is_defined(override.result) ? override.result.id : '',
          severity: override.severity,
          task_id: is_defined(override.task) ? '' : '0',
          task_uuid: is_defined(override.task) ? override.task.id : '',
          text: override.text,
          visible: true,
        }, {
          title: _('Edit Override {{- name}}',
            {name: shorten(override.text, 20)}),
        });

        this.loadTasks();
      }
    }

    openCreateOverrideDialog(initial = {}) {
      this.override_dialog.show(initial);

      this.loadTasks();
    }

    loadTasks() {
      const {gmp} = this.context;

      gmp.tasks.getAll().then(tasks =>
        this.override_dialog.setValue('tasks', tasks));
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
        .set('onCreate', has_create, this.openCreateOverrideDialog)
        .set('onEdit', has_save, this.openOverrideDialog);
      return (
        <Wrapper>
          <Component
            {...this.props}
            {...handlers}
          />
          <OverrideDialog
            ref={ref => this.override_dialog = ref}
            onSave={onSaveHandler}/>
        </Wrapper>
      );
    }
  }

  OverrideComponentWrapper.contextTypes = {
    gmp: PropTypes.gmp.isRequired,
  };

  return withEntityComponent('override', mapping)(OverrideComponentWrapper);

};

export default withOverrideComponent;

// vim: set ts=2 sw=2 tw=80:
