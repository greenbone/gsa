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
import 'core-js/fn/array/includes';

import React from 'react';

import _ from 'gmp/locale.js';
import {is_defined, is_empty, shorten} from 'gmp/utils.js';

import {ANY, MANUAL} from 'gmp/commands/overrides.js';

import PropTypes from '../../utils/proptypes.js';

import Wrapper from '../../components/layout/wrapper.js';

import EntityComponent from '../../entity/component.js';

import OverrideDialog from './dialog.js';

class OverrideComponent extends React.Component {

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

      if ([10, 5, 2, 0, -1].includes(override.new_severity)) {
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
        hosts: override.hosts.length > 0 ? MANUAL : ANY,
        hosts_manual: override.hosts.join(' '),
        new_severity,
        new_severity_from_list,
        nvt: override.nvt,
        oid: override.nvt ? override.nvt.oid : undefined,
        override,
        override_severity: override.severity,
        port: is_defined(override.port) ? MANUAL : ANY,
        port_manual: override.port,
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
        name="override"
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
              create: this.openCreateOverrideDialog,
              edit: this.openOverrideDialog,
            })}
            <OverrideDialog
              ref={ref => this.override_dialog = ref}
              onSave={save}/>
          </Wrapper>
        )}
      </EntityComponent>
    );
  }
}

OverrideComponent.propTypes = {
  children: PropTypes.func.isRequired,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

OverrideComponent.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default OverrideComponent;

// vim: set ts=2 sw=2 tw=80:
