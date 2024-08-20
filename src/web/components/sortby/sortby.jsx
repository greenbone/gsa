/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
