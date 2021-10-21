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

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import SeverityBar from 'web/components/bar/severitybar';

import DeleteIcon from 'web/components/icon/deleteicon';
import DetailsIcon from 'web/components/icon/detailsicon';

import Layout from 'web/components/layout/layout';
import IconDivider from 'web/components/layout/icondivider';

import DetailsLink from 'web/components/link/detailslink';

import Body from 'web/components/table/body';
import Data from 'web/components/table/data';
import Head from 'web/components/table/head';
import Header from 'web/components/table/header';
import Row from 'web/components/table/row';
import StripedTable from 'web/components/table/stripedtable';

import {Col} from 'web/entity/page';

import PropTypes from 'web/utils/proptypes';

import Theme from 'web/utils/theme';

const StyledDiv = styled.div`
  padding: 5px;
`;

const SelectionLink = styled.div`
  color: ${Theme.blue};
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

const HostRow = ({host, onDeleteHost, onSelectHost}) => {
  const {id, ip, hostname, severity} = host;
  return (
    <Row>
      <Data>
        <SelectionLink
          id={id}
          data-testid="hosttable-selectionlink"
          onClick={() => onSelectHost(host)}
        >
          {ip}
        </SelectionLink>
      </Data>
      <Data>
        {isDefined(hostname) && (
          <SelectionLink id={id} onClick={() => onSelectHost(host)}>
            {hostname}
          </SelectionLink>
        )}
      </Data>
      <Data>
        <SeverityBar severity={severity} />
      </Data>
      <Data>
        <IconDivider>
          <DeleteIcon
            title={_('Remove host from process')}
            onClick={() => onDeleteHost(id)}
          />
          <DetailsLink id={id} type="host">
            <DetailsIcon title={_('Open all details')} />
          </DetailsLink>
        </IconDivider>
      </Data>
    </Row>
  );
};

HostRow.propTypes = {
  host: PropTypes.object,
  onDeleteHost: PropTypes.func.isRequired,
  onSelectHost: PropTypes.func.isRequired,
};

const StyledLayout = styled(Layout)`
  width: 100%;
  overflow: auto;
`;

const HostTable = ({hosts, onDeleteHost, onSelectHost}) => {
  return (
    <StyledLayout align="start" flex="column">
      <StripedTable>
        <colgroup>
          <Col width="30%" />
          <Col width="40%" />
          <Col width="25%" />
          <Col width="5%" />
        </colgroup>
        <Header>
          <Row>
            <Head>{_('Host')}</Head>
            <Head>{_('Name')}</Head>
            <Head>{_('Severity')}</Head>
            <Head>{_('Actions')}</Head>
          </Row>
        </Header>
        {isDefined(hosts) && hosts.length > 0 && (
          <Body>
            {hosts.map((host, i) => (
              <HostRow
                key={i}
                host={host}
                onDeleteHost={onDeleteHost}
                onSelectHost={onSelectHost}
              />
            ))}
          </Body>
        )}
      </StripedTable>
      {isDefined(hosts) && hosts.length === 0 && (
        <StyledDiv>{_('No hosts associated with this process.')}</StyledDiv>
      )}
    </StyledLayout>
  );
};

HostTable.propTypes = {
  hosts: PropTypes.array,
  onDeleteHost: PropTypes.func.isRequired,
  onSelectHost: PropTypes.func.isRequired,
};

export default HostTable;

// vim: set ts=2 sw=2 tw=80:
