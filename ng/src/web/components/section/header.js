/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import glamorous from 'glamorous';

import {is_defined, is_string} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import Icon from '../icon/icon.js';

import Layout from '../layout/layout.js';
import withLayout from '../layout/withLayout.js';

const HeaderLayout = glamorous(Layout, {
  displayName: 'HeaderLayout',
})(
  'section-header',
  {
    margin: '10px 0px',
    paddingBottom: '1px',
    borderBottom: '2px solid black',
    position: 'relative',
  },
);

const HeaderHeading = withLayout()(glamorous.h2({
  margin: '0 0 1px 0',
}));

HeaderHeading.displayName = 'HeaderHeading';

const HeaderIconLayout = glamorous(Layout, {
  displayName: 'HeaderIconLayout',
})({
  marginRight: '5px',
});

const SectionHeader = ({
  children,
  align = ['space-between', 'end'],
  title,
  img,
}) => {
  return (
    <HeaderLayout
      flex
      align={align}
      className="section-header">
      <HeaderHeading flex align={['start', 'stretch']}>
        {is_defined(img) &&
          <HeaderIconLayout
            flex
            align={['start', 'end']}
          >
            {is_string(img) ?
              <Icon size="large" img={img}/> : img
            }
          </HeaderIconLayout>
        }
        {is_defined(title) &&
          <Layout flex align={['start', 'end']}>
            {title}
          </Layout>
        }
      </HeaderHeading>
      {children}
    </HeaderLayout>
  );
};

SectionHeader.propTypes = {
  align: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
  img: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]),
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]),
};

export default SectionHeader;

// vim: set ts=2 sw=2 tw=80:
