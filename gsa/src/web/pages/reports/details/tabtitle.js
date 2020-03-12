/* Copyright (C) 2019-2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';

const TabTitleCounts = styled.span`
  font-size: 0.7em;
`;

const TabTitle = ({title, counts = {filtered: 0, all: 0}, count}) => (
  <Layout flex="column" align={['center', 'center']}>
    <span>{title}</span>
    <TabTitleCounts>
      (<i>{isDefined(count) ? count : _('{{filtered}} of {{all}}', counts)}</i>)
    </TabTitleCounts>
  </Layout>
);

TabTitle.propTypes = {
  count: PropTypes.number,
  counts: PropTypes.shape({
    filtered: PropTypes.numberOrNumberString.isRequired,
    all: PropTypes.numberOrNumberString.isRequired,
  }),
  title: PropTypes.string.isRequired,
};

export default TabTitle;
