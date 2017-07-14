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

import _ from 'gmp/locale.js';
import logger from 'gmp/log.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../utils/proptypes.js';

import Dialog from '../components/dialog/dialog.js';

import withDownload from '../components/form/withDownload.js';

import Layout from '../components/layout/layout.js';
import Wrapper from '../components/layout/wrapper.js';

import NoteDialog from '../pages/notes/dialog.js';

import OverrideDialog from '../pages/overrides/dialog.js';

import TagDialog from '../pages/tags/dialog.js';

import Promise from 'gmp/promise.js';

const log = logger.getLogger('web.entity.container');

export const loader = (name, filter_func) => function(id) {
  const {gmp} = this.context;

  log.debug('Loading', name, 'for entity', id);

  return gmp[name].getAll({
    filter: filter_func(id),
  }).then(entities => {

    this.setState({[name]: entities});

    const meta = entities.getMeta();

    if (meta.fromcache && meta.dirty) {
      log.debug('Forcing reload of', name, meta.dirty);
      return true;
    }

    return false;
  }).catch(err => {
    this.setState({[name]: undefined});
    return this.handleError(err);
  });
};

class EntityContainer extends React.Component {

  constructor(...args) {
    super(...args);

    const {name} = this.props;
    const {gmp} = this.context;

    this.name = name;

    this.entity_command = gmp[name];

    this.state = {
      loading: true,
    };

    this.reload = this.reload.bind(this);

    this.handleAddTag = this.handleAddTag.bind(this);
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

  componentWillUnmount() {
    this.clearTimer();
  }

  componentWillReceiveProps(next) {
    const {id} = this.props.params;
    if (id !== next.params.id) {
      this.load(next.params.id);
    }
  }

  load(id) {
    log.debug('Loading data for entity', id);

    const {gmp} = this.context;
    const loaders = [this.loadEntity, this.loadPermissions];

    if (is_defined(this.props.loaders)) {
      loaders.push(...this.props.loaders);
    }

    const promises = loaders.map(loader_func => loader_func.call(this, id));

    this.setState({loading: true});

    this.clearTimer(); // remove possible running timer

    Promise.all(promises)
      .then(values => values.reduce((sum, cur) => sum || cur, false))
      .then(refresh => this.startTimer(refresh ? 1 : gmp.autorefresh))
      .catch(err => {
        log.error('Error while loading data', err);
        this.setState({loading: false});
      });
  }

  reload() {
    const {id} = this.props.params;
    this.load(id);
  }

  loadEntity(id) {
    return this.entity_command.get({id}).then(response => {

      this.setState({entity: response.data, loading: false});

      const meta = response.getMeta();
      if (meta.fromcache && meta.dirty) {
        log.debug('Forcing reload of entity', meta.dirty);
        return true;
      }
      return false;
    })
    .catch(err => {
      this.setState({entity: undefined});
      return this.handleError(err);
    });
  }

  loadPermissions(id) {
    if (this.props.permissionsComponent === false) {
      return Promise.resolve(false);
    }

    const {gmp} = this.context;

    return gmp.permissions.getAll({
      filter: 'resource_uuid=' + id
    }).then(permissions => {

      this.setState({permissions});

      const meta = permissions.getMeta();

      if (meta.fromcache && meta.dirty) {
        log.debug('Forcing reload of permissions', meta.dirty);
        return true;
      }

      return false;
    })
    .catch(err => {
      this.setState({permissions: undefined});
      return this.handleError(err);
    });
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

  handleAddTag({name, value, entity}) {
    const {gmp} = this.context;

    return gmp.tag.create({
      name,
      value,
      active: 1,
      resource_id: entity.id,
      resource_type: this.name,
    }).then(this.reload, this.handleError);
  }

  handleEnableTag(tag) {
    const {gmp} = this.context;

    return gmp.tag.enable(tag).then(this.reload, this.handleError);
  }

  handleDisableTag(tag) {
    const {gmp} = this.context;

    return gmp.tag.disable(tag).then(this.reload, this.handleError);
  }

  handleDeleteTag(tag) {
    const {gmp} = this.context;

    return gmp.tag.delete(tag).then(this.reload, this.handleError);
  }

  handleError(error) {
    log.error(error);
    this.handleShowError(error.message);
    return Promise.reject(error);
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
        resource_type: t.resource.entity_type,
      }, {title: _('Edit Tag {{name}}', tag)});
    });
  }

  openCreateTagDialog(entity) {
    this.tag_dialog.show({
      fixed: true,
      resource_id: entity.id,
      resource_type: entity.entity_type,
      name: _('{{type}}:unnamed', {type: entity.entity_type}),
    });
  }

  render() {
    const Component = this.props.component;
    const {children, component, name, onDownload, ...other} = this.props;
    return (
      <Wrapper>
        <Component
          {...other}
          {...this.state}
          entityCommand={this.entity_command}
          onAddTag={this.handleAddTag}
          onNewNoteClick={this.openNoteDialog}
          onNewOverrideClick={this.openOverrideDialog}
          onNewTagClick={this.openCreateTagDialog}
          onEditTagClick={this.openEditTagDialog}
          onEnableTag={this.handleEnableTag}
          onDeleteTag={this.handleDeleteTag}
          onDisableTag={this.handleDisableTag}
          onDownloaded={onDownload}
          onChanged={this.handleChanged}
          onError={this.handleError}
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
      </Wrapper>
    );
  }
}

EntityContainer.propTypes = {
  component: PropTypes.component.isRequired,
  loaders: PropTypes.array,
  name: PropTypes.string.isRequired,
  permissionsComponent: PropTypes.componentOrFalse,
  onDownload: PropTypes.func.isRequired,
};

EntityContainer.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

EntityContainer = withDownload(EntityContainer);

export const withEntityContainer = (name, options = {}) => component => {
  const EntityContainerWrapper = props => {
    return (
      <EntityContainer
        {...options}
        {...props}
        name={name}
        component={component}
      />
    );
  };
  return EntityContainerWrapper;
};

// vim: set ts=2 sw=2 tw=80:
