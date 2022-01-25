/* Copyright (C) 2017-2022 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import logger from 'gmp/log';

import PropTypes from 'web/utils/proptypes';

const log = logger.getLogger('web.entity.container');

class EntityContainer extends React.Component {
  constructor(...args) {
    super(...args);

    this.reload = this.reload.bind(this);

    this.handleChanged = this.handleChanged.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  componentDidUpdate(prevProps) {
    const {id} = this.props;
    if (id !== prevProps.id) {
      this.reload();
    }
  }

  reload() {
    const {id} = this.props;

    this.props.reload(id);
  }

  handleChanged() {
    this.reload();
  }

  handleError(error) {
    const {showError} = this.props;
    log.error(error);
    showError(error);
  }

  render() {
    const {children, onDownload, showSuccessMessage} = this.props;
    return children({
      ...this.props,
      onChanged: this.handleChanged,
      onSuccess: this.handleChanged,
      onError: this.handleError,
      onDownloaded: onDownload,
      showSuccess: showSuccessMessage,
    });
  }
}

EntityContainer.propTypes = {
  children: PropTypes.func.isRequired,
  id: PropTypes.id.isRequired,
  reload: PropTypes.func.isRequired,
  showError: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default EntityContainer;

// vim: set ts=2 sw=2 tw=80:
