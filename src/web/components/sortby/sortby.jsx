/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'web/utils/proptypes';

const SortButton = styled.button`
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
`;

const SortBy = ({by, children, className, onClick}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(by);
    }
  };

  return (
    <SortButton className={className} onClick={handleClick}>
      {children}
    </SortButton>
  );
};

SortBy.ASC = 'asc';
SortBy.DESC = 'desc';

SortBy.propTypes = {
  children: PropTypes.node,
  by: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default SortBy;
