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
import Promise from 'gmp/promise.js';
import {is_defined} from 'gmp/utils.js';

import compose from '../utils/compose.js';
import PropTypes from '../utils/proptypes.js';

import withDownload from '../components/form/withDownload.js';

import withDialogNotification from '../components/notification/withDialogNotifiaction.js'; // eslint-disable-line max-len

import TagsHandler from './tagshandler.js';

const log = logger.getLogger('web.entity.container');

export const loader = (name, filter_func) => function(id) {
  const {gmp} = this.context;

  log.debug('Loading', name, 'for entity', id);

  return gmp[name].getAll({
    filter: filter_func(id),
  }).then(entities => {

    log.debug('Loaded', name, entities);

    this.setState({[name]: entities});

    const meta = entities.getMeta();

    if (meta.fromcache && meta.dirty) {
      log.debug('Forcing reload of', name, meta.dirty);
      return true;
    }

    return false;
  }).catch(err => {
    // call handleError before setting state. setting state may hide the root
    // error
    const rej = this.handleError(err);
    this.setState({[name]: undefined});
    return rej;
  });
};

const permissions_loader = loader('permissions', id => 'resource_uuid=' + id);

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

    this.handleChanged = this.handleChanged.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleTimer = this.handleTimer.bind(this);
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
    const {gmp} = this.context;
    const {loaders, permissionsComponent} = this.props;

    const all_loaders = [this.loadEntity];

    if (permissionsComponent !== false) {
      all_loaders.push(permissions_loader);
    }

    if (is_defined(loaders)) {
      all_loaders.push(...this.props.loaders);
    }

    const promises = all_loaders.map(loader_func => loader_func.call(this, id));

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
    log.debug('Loading entity', id);

    return this.entity_command.get({id}).then(response => {

      const {data: entity, meta} = response;

      log.debug('Loaded entity', entity);

      this.setState({entity, loading: false});

      if (meta.fromcache && meta.dirty) {
        log.debug('Forcing reload of entity', meta.dirty);
        return true;
      }
      return false;
    })
    .catch(err => {
      const rej = this.handleError(err);
      this.setState({entity: undefined});
      return rej;
    });
  }

  handleChanged() {
    this.reload();
  }

  startTimer(refresh) {
    const {gmp} = this.context;

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

  handleError(error) {
    const {showError} = this.props;
    log.error(error);
    showError(error);
    return Promise.reject(error);
  }

  render() {
    const {
      children,
      resourceType,
      showError,
      showSuccessMessage,
      onDownload,
      ...other
    } = this.props;
    return (
      <TagsHandler
        resourceType={resourceType}
        onError={this.handleError}
        onSuccess={this.handleChanged}
      >
        {tprops => children({
          entityCommand: this.entity_command,
          resourceType: this.name,
          onDownloaded: onDownload,
          onChanged: this.handleChanged,
          onSuccess: this.handleChanged,
          onError: this.handleError,
          ...tprops,
          ...other,
          ...this.state,
        })}
      </TagsHandler>

    );
  }
}

EntityContainer.propTypes = {
  loaders: PropTypes.array,
  name: PropTypes.string.isRequired,
  permissionsComponent: PropTypes.componentOrFalse,
  resourceType: PropTypes.string,
  showError: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
};

EntityContainer.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default compose(
  withDialogNotification,
  withDownload,
)(EntityContainer);

// vim: set ts=2 sw=2 tw=80:
