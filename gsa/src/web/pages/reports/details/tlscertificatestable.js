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

import React from 'react';

import styled from 'styled-components';

import {_, _l} from 'gmp/locale/lang';
import {shortDate} from 'gmp/locale/date';

import DateTime from 'web/components/date/datetime';

import DownloadIcon from 'web/components/icon/downloadicon';

import Link from 'web/components/link/link';

import TableData from 'web/components/table/data';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import {createEntitiesTable} from 'web/entities/table';

import PropTypes from 'web/utils/proptypes';

const Header = ({
  actions = true,
  currentSortDir,
  currentSortBy,
  sort = true,
  onSortChange,
}) => {
  const sortProps = {
    currentSortDir,
    currentSortBy,
    sort,
    onSortChange,
  };
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          {...sortProps}
          sortBy="dn"
          width={actions ? '35%' : '40%'}
          title={_('Issuer DN')}
        />
        <TableHead
          {...sortProps}
          sortBy="serial"
          width="10%"
          title={_('Serial')}
        />
        <TableHead
          {...sortProps}
          sortBy="notvalidbefore"
          width="10%"
          title={_('Activates')}
        />
        <TableHead
          {...sortProps}
          sortBy="notvalidafter"
          width="10%"
          title={_('Expires')}
        />
        <TableHead {...sortProps} sortBy="ip" width="10%" title={_('IP')} />
        <TableHead
          {...sortProps}
          sortBy="hostname"
          width="15%"
          title={_('Hostname')}
        />
        <TableHead {...sortProps} sortBy="port" width="5%" title={_('Port')} />
        {actions && (
          <TableHead width="5%" align="center">
            {_('Actions')}
          </TableHead>
        )}
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  actions: PropTypes.bool,
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

const StyledSpan = styled.span`
  word-break: break-all;
`;

const Row = ({
  actions = true,
  entity,
  links = true,
  onTlsCertificateDownloadClick,
}) => {
  const {issuer, serial, notafter, notbefore, hostname, ip, port} = entity;
  return (
    <TableRow>
      <TableData>
        <StyledSpan>{issuer}</StyledSpan>
      </TableData>
      <TableData>{serial}</TableData>
      <TableData>
        <DateTime format={shortDate} date={notbefore} />
      </TableData>
      <TableData>
        <DateTime format={shortDate} date={notafter} />
      </TableData>
      <TableData>
        <Link
          to="hosts"
          filter={'name=' + ip}
          textOnly={!links}
          title={_('Show all Hosts with IP {{ip}}', {ip})}
        >
          {ip}
        </Link>
      </TableData>
      <TableData>{hostname}</TableData>
      <TableData>{port}</TableData>
      {actions && (
        <TableData align={['center', 'center']}>
          <DownloadIcon
            title={_('Download TLS Certificate')}
            value={entity}
            onClick={onTlsCertificateDownloadClick}
          />
        </TableData>
      )}
    </TableRow>
  );
};

Row.propTypes = {
  actions: PropTypes.bool,
  entity: PropTypes.object.isRequired,
  links: PropTypes.bool,
  onTlsCertificateDownloadClick: PropTypes.func,
};

export default createEntitiesTable({
  header: Header,
  emptyTitle: _l('No TLS Certificates available'),
  row: Row,
});

// vim: set ts=2 sw=2 tw=80:
