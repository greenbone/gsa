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
import React from 'react';

import logger from 'gmp/log';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import TagsHandler from './tagshandler';

const log = logger.getLogger('web.entity.container');

class EntityContainer extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {};

    this.reload = this.reload.bind(this);

    this.handleChanged = this.handleChanged.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleTimer = this.handleTimer.bind(this);
  }

  componentDidMount() {
    const {id} = this.props;
    this.load(id);
  }

  componentDidUpdate() {
    const {id} = this.props;
    if (id !== this.state.id) {
      this.load(id);
    }
  }

  load(id) {
    this.props.load(id);
    this.setState({id});
  }

  reload() {
    const {id} = this.props;
    this.load(id);
  }

  handleChanged() {
    this.reload();
  }

  getRefreshInterval() {
    const {gmp} = this.props;
    return gmp.autorefresh * 1000;
  }

  startTimer(immediate = false) {
    const refresh = immediate ? 0 : this.getRefreshInterval();

    if (refresh >= 0) {
      this.timer = window.setTimeout(this.handleTimer, refresh);
      log.debug('Started reload timer with id', this.timer, 'and interval of',
        refresh, 'milliseconds');
    }
  }

  clearTimer() {
    if (isDefined(this.timer)) {
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
  }

  render() {
    const {
      children,
      entityType,
      onDownload,
      onInteraction,
    } = this.props;
    return (
      <TagsHandler
        resourceType={entityType}
        onChanged={this.handleChanged}
        onError={this.handleError}
        onInteraction={onInteraction}
      >
        {({
          add,
          create,
          delete: delete_func,
          disable,
          edit,
          enable,
          remove,
        }) => children({
          onChanged: this.handleChanged,
          onSuccess: this.handleChanged,
          onError: this.handleError,
          onDownloaded: onDownload,
          onInteraction: this.handleInteraction,
          onTagAddClick: add,
          onTagCreateClick: create,
          onTagDeleteClick: delete_func,
          onTagDisableClick: disable,
          onTagEditClick: edit,
          onTagEnableClick: enable,
          onTagRemoveClick: remove,
          ...this.props,
        })}
      </TagsHandler>
    );
  }
}

EntityContainer.propTypes = {
  children: PropTypes.func.isRequired,
  entityType: PropTypes.string.isRequired,
  gmp: PropTypes.gmp.isRequired,
  id: PropTypes.id.isRequired,
  load: PropTypes.func.isRequired,
  showError: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default EntityContainer;

// vim: set ts=2 sw=2 tw=80:
