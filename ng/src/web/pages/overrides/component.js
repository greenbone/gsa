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
import 'core-js/fn/array/includes';

import React from 'react';

import _ from 'gmp/locale.js';
import {is_defined, is_empty, shorten} from 'gmp/utils';

import {ANY, MANUAL} from 'gmp/commands/overrides.js';

import PropTypes from '../../utils/proptypes.js';

import Wrapper from '../../components/layout/wrapper.js';

import EntityComponent from '../../entity/component.js';

import OverrideDialog from './dialog.js';

class OverrideComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {dialogVisible: false};

    this.closeOverrideDialog = this.closeOverrideDialog.bind(this);
    this.openCreateOverrideDialog = this.openCreateOverrideDialog.bind(this);
    this.openOverrideDialog = this.openOverrideDialog.bind(this);
  }

  openOverrideDialog(override, initial) {
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
      this.setState({
        dialogVisible: true,
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
        title: _('Edit Override {{- name}}',
          {name: shorten(override.text, 20)}),
      });
    }
    else {
      this.setState({
        dialogVisible: true,
        active: undefined,
        hosts: undefined,
        hosts_manual: [],
        new_severity: undefined,
        override: undefined,
        port: undefined,
        result_id: undefined,
        result_uuid: undefined,
        severity: undefined,
        task_id: undefined,
        task_uuid: undefined,
        text: undefined,
        title: undefined,
        ...initial,
      });
    }
    this.loadTasks();
  }

  closeOverrideDialog() {
    this.setState({dialogVisible: false});
  }

  openCreateOverrideDialog(initial = {}) {
    this.openOverrideDialog(undefined, initial);
  }

  loadTasks() {
    const {gmp} = this.context;

    gmp.tasks.getAll().then(tasks =>
      this.setState({tasks: tasks}));
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
      dialogVisible,
      active,
      custom_severity,
      hosts,
      hosts_manual,
      id,
      new_severity,
      new_severity_from_list,
      nvt,
      oid,
      override,
      override_severity,
      port,
      port_manual,
      result_id,
      result_uuid,
      severity,
      task_id,
      task_uuid,
      tasks,
      text,
      title,
      ...initial
    } = this.state;

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
              visible={dialogVisible}
              active={active}
              custom_severity={custom_severity}
              hosts={hosts}
              hosts_manual={hosts_manual}
              id={id}
              new_severity={new_severity}
              new_severity_from_list={new_severity_from_list}
              nvt={nvt}
              oid={oid}
              override={override}
              override_severity={override_severity}
              port={port}
              port_manual={port_manual}
              result_id={result_id}
              result_uuid={result_uuid}
              severity={severity}
              task_id={task_id}
              task_uuid={task_uuid}
              tasks={tasks}
              title={title}
              onClose={this.closeOverrideDialog}
              onSave={save}
              {...initial}
            />
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
