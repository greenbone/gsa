/* Copyright (C) 2016-2019 Greenbone Networks GmbH
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

import {isDefined, isString} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Theme from 'web/utils/theme';

import Icon from 'web/components/icon/icon';

import Layout from 'web/components/layout/layout';
import withLayout from 'web/components/layout/withLayout';

const HeaderLayout = styled(Layout)`
  margin: 10px 0px;
  padding-bottom: 1px;
  border-bottom: 2px solid ${Theme.lightGray};
  position: relative;
`;

const HeaderHeading = withLayout()(styled.h2`
  margin: 0 0 1px 0;
`);

HeaderHeading.displayName = 'HeaderHeading';

const HeaderIconLayout = styled(Layout)`
  margin-right: 5px;
`;

const SectionHeader = ({
  children,
  align = ['space-between', 'end'],
  title,
  img,
}) => {
  return (
    <HeaderLayout flex align={align} className="section-header">
      <HeaderHeading align={['start', 'stretch']}>
        {isDefined(img) && (
          <HeaderIconLayout flex align={['start', 'end']}>
            {isString(img) ? <Icon size="large" img={img} /> : img}
          </HeaderIconLayout>
        )}
        {isDefined(title) && <Layout align={['start', 'end']}>{title}</Layout>}
      </HeaderHeading>
      {children}
    </HeaderLayout>
  );
};

SectionHeader.propTypes = {
  align: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  img: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};

export default SectionHeader;

// vim: set ts=2 sw=2 tw=80:
