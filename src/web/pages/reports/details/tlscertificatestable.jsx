/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import {_, _l} from 'gmp/locale/lang';
import {formattedUserSettingShortDate} from 'web/utils/userSettingTimeDateFormatters';

import PropTypes from 'web/utils/proptypes';

import DateTime from 'web/components/date/datetime';

import DownloadIcon from 'web/components/icon/downloadicon';

import Link from 'web/components/link/link';

import TableData from 'web/components/table/data';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import TlsCertificateDetails from '../../tlscertificates/details';
import withRowDetails from 'web/entities/withRowDetails';
import {RowDetailsToggle} from 'web/entities/row';

import {createEntitiesTable} from 'web/entities/table';

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
          title={_('Subject DN')}
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

const Div = styled.div`
  word-break: break-all;
`;

const StyledSpan = styled.span`
  word-break: break-all;
`;

const Row = ({
  actions = true,
  entity,
  links = true,
  onTlsCertificateDownloadClick,
  onToggleDetailsClick,
}) => {
  const {serial, activationTime, expirationTime, hostname, ip, port} = entity;
  return (
    <TableRow>
      <TableData>
        <StyledSpan>
          <RowDetailsToggle name={entity.id} onClick={onToggleDetailsClick}>
            <Div>{entity.subjectDn}</Div>
          </RowDetailsToggle>
        </StyledSpan>
      </TableData>
      <TableData>{serial}</TableData>
      <TableData>
        <DateTime
          format={formattedUserSettingShortDate}
          date={activationTime}
        />
      </TableData>
      <TableData>
        <DateTime
          format={formattedUserSettingShortDate}
          date={expirationTime}
        />
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
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default createEntitiesTable({
  header: Header,
  emptyTitle: _l('No TLS Certificates available'),
  row: Row,
  rowDetails: withRowDetails('tlscertificate', 6, false)(TlsCertificateDetails),
});

// vim: set ts=2 sw=2 tw=80:
