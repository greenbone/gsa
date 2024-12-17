/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

class Task extends React.Component {
  constructor(props) {
    super(props);
    this.state = {task: {}};
  }

  componentDidMount() {
    this.props.gmp.task.get(this.props.params).then(task => {
      this.setState({task: task});
    });
  }

  render() {
    return (
      <div>
        <h2>Task: {this.state.task.name}</h2>
      </div>
    );
  }
}

Task.propTypes = {
  gmp: PropTypes.gmp.isRequired,
  params: PropTypes.object,
};

export default withGmp(Task);
