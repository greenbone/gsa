/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import PropTypes from 'web/utils/PropTypes';

class State extends React.Component {
  constructor(...args) {
    super(...args);

    const {children, ...props} = this.props;

    this.state = {
      ...props,
    };

    this.handleValueChange = this.handleValueChange.bind(this);
  }

  handleValueChange(value, name) {
    this.setState({[name]: value});
  }

  render() {
    const {children} = this.props;
    return children({state: this.state, onValueChange: this.handleValueChange});
  }
}

State.propTypes = {
  children: PropTypes.func.isRequired,
};

export default State;
