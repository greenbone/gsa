/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import PropTypes from 'web/utils/PropTypes';

const StyledGroup = styled.g`
  ${props =>
    isDefined(props.onClick)
      ? {
          cursor: 'pointer',
        }
      : undefined};
`;

const Group = ({left = 0, top = 0, scale = 1, ...props}) => (
  <StyledGroup
    transform={`translate(${left}, ${top}),scale(${scale})`}
    {...props}
  />
);

Group.propTypes = {
  left: PropTypes.number,
  scale: PropTypes.number,
  top: PropTypes.number,
};

export default Group;
