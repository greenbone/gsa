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

import _ from 'gmp/locale';

import withIconSize from 'web/components/icon/withIconSize';

import Theme from 'web/utils/theme';

import PropTypes from 'web/utils/proptypes';

const StyledCloseButton = styled.div`
  display: flex;
  border: 1px solid ${Theme.darkGreen};
  font-weight: bold;
  font-size: 12px;
  font-family: ${Theme.Font.default};
  color: ${Theme.darkGreen};
  cursor: pointer;
  border-radius: 2px;
  padding: 0;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  :hover {
    color: ${Theme.white};
    background: ${Theme.darkGreen};
  }
`;

const CloseButton = ({title = _('Close'), ...props}) => (
  <StyledCloseButton {...props} title={title}>
    ×{/* Javascript unicode: \u00D7 */}
  </StyledCloseButton>
);

CloseButton.propTypes = {
  title: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

export default withIconSize('medium')(CloseButton);

// vim: set ts=2 sw=2 tw=80:
