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

import styled from 'styled-components';

import Theme from 'web/utils/theme';

/**
 * Can be used as link anchor. Offsets the target so that it doesn't hide
 * behind the top menu bar.
 *
 * @module components/link/target.js
 *
 * @exports {Target}
 */

const Target = styled.div`
  content: '';
  display: block;
  height: 35px;
  z-index: ${Theme.Layers.belowAll};
  margin: -35px 0 0 0;
  position: relative;
  ${'' /* needs to be set for z-index to work in Firefox */}
`;

export default Target;
