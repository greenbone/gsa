/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
