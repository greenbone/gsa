/* Copyright (C) 2020 Greenbone Networks GmbH
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

import SeverityBar from 'web/components/bar/severitybar';

import DeleteIcon from 'web/components/icon/deleteicon';

import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';

import Body from 'web/components/table/body';
import Data from 'web/components/table/data';
import Head from 'web/components/table/head';
import Header from 'web/components/table/header';
import Row from 'web/components/table/row';
import StripedTable from 'web/components/table/stripedtable';

import {Col} from 'web/entity/page';

import PropTypes from 'web/utils/proptypes';

const StyledDiv = styled.div`
  padding: 5px;
`;

const HostRow = ({host}) => {
  const {id, name, severity} = host;
  return (
    <Row>
      <Data>
        <DetailsLink id={id} type="host">
          {name}
        </DetailsLink>
      </Data>
      <Data>
        <SeverityBar severity={severity} />
      </Data>
      <Data>
        <DeleteIcon title={_('Remove host from process')} />
      </Data>
    </Row>
  );
};

HostRow.propTypes = {
  host: PropTypes.object,
};

const HostTable = ({hosts}) => {
  return (
    <Layout align="start" grow={true} flex="column">
      <StripedTable>
        <colgroup>
          <Col width="55%" />
          <Col width="30%" />
          <Col width="15%" />
        </colgroup>
        <Header>
          <Row>
            <Head>{_('Host')}</Head>
            <Head>{_('Severity')}</Head>
            <Head>{_('Actions')}</Head>
          </Row>
        </Header>
        {isDefined(hosts) && hosts.length > 0 && (
          <Body>
            {hosts.map((host, i) => (
              <HostRow key={i} host={host} />
            ))}
          </Body>
        )}
      </StripedTable>
      {isDefined(hosts) && hosts.length === 0 && (
        <StyledDiv>{_('No hosts associated with this process.')}</StyledDiv>
      )}
    </Layout>
  );
};

HostTable.propTypes = {
  hosts: PropTypes.array,
};

export default HostTable;

// vim: set ts=2 sw=2 tw=80:
