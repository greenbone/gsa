/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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
};

export default withGmp(Task);

// vim: set ts=2 sw=2 tw=80:
