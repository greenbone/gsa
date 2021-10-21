/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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
import Theme from 'web/utils/theme';

const DEFAULT_SIZE = 8000;
const DEFAULT_COLOR = Theme.dialogGray;

const Background = ({
  color = DEFAULT_COLOR,
  height = DEFAULT_SIZE,
  width = DEFAULT_SIZE,
}) => (
  <rect
    fill={Theme.lightGray}
    fillOpacity="0.2"
    height={height}
    width={width}
  />
);

Background.propTypes = {
  color: PropTypes.string,
  height: PropTypes.number,
  width: PropTypes.number,
};

export default Background;

// vim: set ts=2 sw=2 tw=80:
