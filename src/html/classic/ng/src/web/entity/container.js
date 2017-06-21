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

import _ from '../../locale.js';
import logger from '../../log.js';
import {is_defined} from '../../utils.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';

import Dialog from '../dialog/dialog.js';

import NoteDialog from '../notes/dialog.js';

import OverrideDialog from '../overrides/dialog.js';

import TagDialog from '../tags/dialog.js';

const log = logger.getLogger('web.entity.container');

class EntityContainer extends React.Component {

  constructor(...args) {
    super(...args);

    const {gmpname} = this.props;
    const {gmp} = this.context;

    this.entity_command = gmp[gmpname];

    this.state = {
      loading: true,
    };

    this.reload = this.reload.bind(this);

    this.handleChanged = this.handleChanged.bind(this);
    this.handleDeleteTag = this.handleDeleteTag.bind(this);
    this.handleDisableTag = this.handleDisableTag.bind(this);
    this.handleEnableTag = this.handleEnableTag.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleSaveNote = this.handleSaveNote.bind(this);
    this.handleSaveOverride = this.handleSaveOverride.bind(this);
    this.handleSaveTag = this.handleSaveTag.bind(this);
    this.handleTimer = this.handleTimer.bind(this);
    this.handleShowError = this.handleShowError.bind(this);
    this.handleShowSuccess = this.handleShowSuccess.bind(this);

    this.openNoteDialog = this.openNoteDialog.bind(this);
    this.openOverrideDialog = this.openOverrideDialog.bind(this);
    this.openCreateTagDialog = this.openCreateTagDialog.bind(this);
    this.openEditTagDialog = this.openEditTagDialog.bind(this);
  }

  componentDidMount() {
    const {id} = this.props.params;
    this.load(id);
  }

  componentWillReceiveProps(next) {
    const {id} = this.props.params;
    if (id !== next.params.id) {
      this.load(next.params.id);
    }
  }

  load(id) {
    this.setState({loading: true});

    this.clearTimer(); // remove possible running timer

    this.entity_command.get({id}).then(response => {
      this.setState({entity: response.data, loading: false});

      const meta = response.getMeta();
      let refresh;

      if (meta.fromcache && meta.dirty) {
        log.debug('Forcing reload of entities', meta.dirty);
        refresh = 1;
      }

      this.startTimer(refresh);
    })
    .catch(err => {
      this.setState({entity: undefined, loading: false});
      this.handleError(err);
    });
  }

  reload() {
    const {id} = this.props.params;
    this.load(id);
  }

  handleChanged() {
    this.reload();
  }

  startTimer(refresh) {
    let {gmp} = this.context;
    refresh = is_defined(refresh) ? refresh : gmp.autorefresh;
    if (refresh && refresh >= 0) {
      this.timer = window.setTimeout(this.handleTimer, refresh * 1000);
      log.debug('Started reload timer with id', this.timer, 'and interval',
        refresh);
    }
  }

  clearTimer() {
    if (is_defined(this.timer)) {
      log.debug('Clearing reload timer with id', this.timer);
      window.clearTimeout(this.timer);
    }
  }

  handleTimer() {
    log.debug('Timer', this.timer, 'finished. Reloading data.');

    this.timer = undefined;
    this.reload();
  }

  handleSaveNote(data) {
    const {gmp} = this.context;

    return gmp.note.create(data).then(this.reload);
  }

  handleSaveOverride(data) {
    const {gmp} = this.context;

    return gmp.override.create(data).then(this.reload);
  }

  handleSaveTag(data) {
    const {gmp} = this.context;

    let promise;

    if (is_defined(data.id)) {
      promise = gmp.tag.save(data);
    }
    else {
      promise = gmp.tag.create(data);
    }

    return promise.then(this.reload);
  }

  handleEnableTag(tag) {
    const {gmp} = this.context;

    gmp.tag.enable(tag).then(this.reload, this.handleError);
  }

  handleDisableTag(tag) {
    const {gmp} = this.context;

    gmp.tag.disable(tag).then(this.reload, this.handleError);
  }

  handleDeleteTag(tag) {
    const {gmp} = this.context;

    gmp.tag.delete(tag).then(this.reload, this.handleError);
  }

  handleError(error) {
    log.error(error);
    this.handleShowError(error.message);
  }

  handleShowError(error) {
    this.notice_dialog.show({
      content: (
        <Layout flex align="center">
          {error}
        </Layout>
      ),
      title: _('Error'),
    });
  }

  handleShowSuccess(message) {
    this.notice_dialog.show({
      content: (
        <Layout flex align="center">
          {message}
        </Layout>
      ),
      title: _('Success'),
    });
  }

  openNoteDialog(result) {
    this.note_dialog.show({
      fixed: true,
      oid: result.nvt.oid,
      nvt: result.nvt,
      task_id: '0',
      task_name: result.task.name,
      result_id: '',
      task_uuid: result.task.id,
      result_uuid: result.id,
      result_name: result.name,
      severity: result.original_severity > 0 ? 0.1 : result.original_severity,
      note_severity: result.original_severity,
      hosts: '--',
      hosts_manual: result.host.name,
      port: '--',
      port_manual: result.port,
    });
  }

  openOverrideDialog(result) {
    this.override_dialog.show({
      fixed: true,
      oid: result.nvt.oid,
      nvt: result.nvt,
      task_id: '0',
      task_name: result.task.name,
      result_id: '',
      task_uuid: result.task.id,
      result_uuid: result.id,
      result_name: result.name,
      severity: result.original_severity > 0 ? 0.1 : result.original_severity,
      note_severity: result.original_severity,
      hosts: '--',
      hosts_manual: result.host.name,
      port: '--',
      port_manual: result.port,
    });
  }

  openEditTagDialog(tag) {
    const {gmp} = this.context;

    gmp.tag.get(tag).then(response => {
      const t = response.data;
      this.tag_dialog.show({
        fixed: true,
        id: t.id,
        active: t.active,
        name: t.name,
        value: t.value,
        comment: t.comment,
        resource_id: t.resource.id,
        resource_type: t.resource.type,
      });
    });
  }

  openCreateTagDialog({type, entity}) {
    this.tag_dialog.show({
      fixed: true,
      resource_id: entity.id,
      resource_type: type,
      name: _('{{type}}:unnamed', {type}),
    });
  }

  render() {
    const {loading, entity} = this.state;
    const Component = this.props.component;
    const {children, component, gmpname, ...other} = this.props;
    return (
      <Layout>
        <Component
          entity={entity}
          entityCommand={this.entity_command}
          loading={loading}
          onNewNoteClick={this.openNoteDialog}
          onNewOverrideClick={this.openOverrideDialog}
          onNewTagClick={this.openCreateTagDialog}
          onEditTagClick={this.openEditTagDialog}
          onEnableTag={this.handleEnableTag}
          onDeleteTag={this.handleDeleteTag}
          onDisableTag={this.handleDisableTag}
          onChanged={this.handleChanged}
          {...other}
        />
        <NoteDialog
          ref={ref => this.note_dialog = ref}
          onSave={this.handleSaveNote}
        />
        <OverrideDialog
          ref={ref => this.override_dialog = ref}
          onSave={this.handleSaveOverride}
        />
        <TagDialog
          ref={ref => this.tag_dialog = ref}
          onSave={this.handleSaveTag}
        />
        <Dialog
          width="400px"
          ref={ref => this.notice_dialog = ref}
        />
      </Layout>
    );
  }
}

EntityContainer.propTypes = {
  component: PropTypes.component.isRequired,
  gmpname: PropTypes.string.isRequired,
};

EntityContainer.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export const withEntityContainer = (component, gmpname, options = {}) => {
  const EntityContainerWrapper = props => {
    return (
      <EntityContainer
        {...options}
        {...props}
        gmpname={gmpname}
        component={component}
      />
    );
  };
  return EntityContainerWrapper;
};

// vim: set ts=2 sw=2 tw=80:
