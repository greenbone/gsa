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

import {is_defined, shorten} from 'gmp/utils';
import {has_id} from 'gmp/utils/id.js';

import {NO_VALUE, YES_VALUE} from 'gmp/parser.js';

import {
  ANY,
  MANUAL,
  TASK_ANY,
  TASK_SELECTED,
  RESULT_ANY,
  RESULT_UUID,
  ACTIVE_NO_VALUE,
  ACTIVE_YES_ALWAYS_VALUE,
  ACTIVE_YES_UNTIL_VALUE,
} from 'gmp/models/override';

import PropTypes from '../../utils/proptypes.js';
import withGmp from '../../utils/withGmp';

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
      let active = ACTIVE_NO_VALUE;
      if (override.isActive()) {
        if (is_defined(override.end_time)) {
          active = ACTIVE_YES_UNTIL_VALUE;
        }
        else {
          active = ACTIVE_YES_ALWAYS_VALUE;
        }
      }

      let custom_severity = NO_VALUE;
      let new_severity_from_list;
      let new_severity;

      if ([10, 5, 2, 0, -1].includes(override.new_severity)) {
        new_severity_from_list = override.new_severity;
      }
      else {
        custom_severity = YES_VALUE;
        new_severity = override.new_severity;
      }

      const {result, task, nvt, hosts} = override;

      this.setState({
        dialogVisible: true,
        id: override.id,
        active,
        custom_severity,
        hosts: hosts.length > 0 ? MANUAL : ANY,
        hosts_manual: hosts.join(' '),
        new_severity,
        new_severity_from_list,
        nvt_name: is_defined(nvt) ? nvt.name : undefined,
        oid: is_defined(nvt) ? nvt.oid : undefined,
        override,
        port: is_defined(override.port) ? MANUAL : ANY,
        port_manual: override.port,
        result_id: has_id(result) ? RESULT_UUID : RESULT_ANY,
        result_name: has_id(result) ? result.name : undefined,
        result_uuid: has_id(result) ? result.id : undefined,
        severity: override.severity,
        task_id: has_id(task) ? TASK_SELECTED : TASK_ANY,
        task_uuid: has_id(task) ? task.id : undefined,
        text: override.text,
        title: _('Edit Override {{- name}}',
          {name: shorten(override.text, 20)}),
      });
    }
    else {
      this.setState({
        dialogVisible: true,
        active: undefined,
        custom_severity: undefined,
        hosts: undefined,
        hosts_manual: undefined,
        id: undefined,
        new_severity: undefined,
        nvt_name: undefined,
        oid: undefined,
        override: undefined,
        port: undefined,
        port_manual: undefined,
        result_id: undefined,
        result_name: undefined,
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
    const {gmp} = this.props;

    gmp.tasks.getAll().then(response =>
      this.setState({tasks: response.data}));
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
      nvt_name,
      oid,
      override,
      port,
      port_manual,
      result_id,
      result_name,
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
              nvt_name={nvt_name}
              oid={oid}
              override={override}
              port={port}
              port_manual={port_manual}
              result_id={result_id}
              result_name={result_name}
              result_uuid={result_uuid}
              severity={severity}
              task_id={task_id}
              task_uuid={task_uuid}
              tasks={tasks}
              text={text}
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
  gmp: PropTypes.gmp.isRequired,
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

export default withGmp(OverrideComponent);

// vim: set ts=2 sw=2 tw=80:
