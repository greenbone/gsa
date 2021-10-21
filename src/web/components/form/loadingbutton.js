/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import Button from 'web/components/form/button';

import Theme from 'web/utils/theme';

const LoadingButton = styled(Button)`
  color: ${props => (props.isLoading ? 'rgba(0, 0, 0, 0.0)' : Theme.darkGray)};
  background: ${props =>
    props.isLoading
      ? Theme.lightGreen + ' url(/img/loading.gif) center center no-repeat'
      : Theme.white};

  /* when hovering these settings have to be overwritten explicitly */
  :hover {
    color: ${props => (props.isLoading ? 'rgba(0, 0, 0, 0.0)' : Theme.white)};
    background: ${props =>
      props.isLoading
        ? Theme.green + ' url(/img/loading.gif) center center no-repeat'
        : Theme.green};
  }
`;

export default LoadingButton;
