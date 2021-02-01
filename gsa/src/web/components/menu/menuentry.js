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

import {isDefined} from 'gmp/utils/identity';

import withClickHandler from 'web/components/form/withClickHandler';

import Layout from 'web/components/layout/layout';

import Link from 'web/components/link/link';

import PropTypes from 'web/utils/proptypes';

const StyledLink = styled(Link)`
  height: 100%;
`;

const MenuEntry = ({children, title = children, to, ...props}) => (
  <Layout {...props} grow="1" align={['start', 'center']}>
    {isDefined(to) ? <StyledLink to={to}>{title}</StyledLink> : title}
  </Layout>
);

MenuEntry.propTypes = {
  title: PropTypes.string,
  to: PropTypes.string,
};

export default withClickHandler()(MenuEntry);

// vim: set ts=2 sw=2 tw=80:
