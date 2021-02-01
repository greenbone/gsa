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

import styled from 'styled-components';

import PropTypes from 'web/utils/proptypes';

const Anchor = styled.a`
  cursor: pointer;
`;

class SortBy extends React.Component {
  static ASC = 'asc';
  static DESC = 'desc';

  constructor(...args) {
    super(...args);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const {by, onClick} = this.props;

    if (onClick) {
      onClick(by);
    }
  }

  render() {
    const {children, className} = this.props;
    return (
      <Anchor onClick={this.handleClick} className={className}>
        {children}
      </Anchor>
    );
  }
}

SortBy.propTypes = {
  by: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default SortBy;

// vim: set ts=2 sw=2 tw=80:
