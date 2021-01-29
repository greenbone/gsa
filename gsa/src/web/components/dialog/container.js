/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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
import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

const StyledDialogContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  margin: 10% auto;
  border: 0;
  outline: 0;
  width: ${props => (isDefined(props.width) ? props.width : '400px')};
  height: ${props => (isDefined(props.height) ? props.height : 'auto')};
`;

const DialogContainer = React.forwardRef(
  ({width = '', height = '', ...other}, ref) => {
    if (!width.toString().endsWith('px')) {
      width += 'px';
    }
    if (!height.toString().endsWith('px')) {
      height += 'px';
    }
    return (
      <StyledDialogContainer
        {...other}
        ref={ref}
        width={width}
        height={height}
      />
    );
  },
);

DialogContainer.displayName = 'DialogContainer';

DialogContainer.propTypes = {
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default DialogContainer;

// vim: set ts=2 sw=2 tw=80:
