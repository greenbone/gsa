/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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
import {longDate} from 'gmp/locale/date';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Theme from 'web/utils/theme';

import Layout from 'web/components/layout/layout';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

const Pre = styled.pre`
  white-space: pre-wrap;
  word-wrap: normal;
`;

const BoxLayout = styled(Layout)`
  border: 1px solid ${Theme.lightGray};
  padding: 5px;
  margin-bottom: 10px;
  width: 400px;
  & h3 {
    margin-top: 0;
  }
`;

const EntityBox = ({
  children,
  modified,
  end,
  text,
  title,
  toolbox,
  ...props
}) => {
  return (
    <BoxLayout {...props} flex="column" align="space-between">
      <Layout align={['space-between', 'start']}>
        <h3>{title}</h3>
        {isDefined(toolbox) && toolbox}
      </Layout>
      <Pre>{text}</Pre>
      {children}
      <InfoTable>
        <TableBody>
          {isDefined(end) && (
            <TableRow>
              <TableData>{_('Active until')}</TableData>
              <TableData>{longDate(end)}</TableData>
            </TableRow>
          )}
          <TableRow>
            <TableData>{_('Modifed')}</TableData>
            <TableData>{longDate(modified)}</TableData>
          </TableRow>
        </TableBody>
      </InfoTable>
    </BoxLayout>
  );
};

EntityBox.propTypes = {
  end: PropTypes.date,
  modified: PropTypes.date,
  text: PropTypes.string,
  title: PropTypes.string.isRequired,
  toolbox: PropTypes.element,
};

export default EntityBox;

// vim: set ts=2 sw=2 tw=80:
