/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {_, _l} from 'gmp/locale/lang';
import DateTime from 'web/components/date/DateTime';
import {DownloadIcon} from 'web/components/icon';
import Link from 'web/components/link/Link';
import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import RowDetailsToggle from 'web/entities/RowDetailsToggle';
import withRowDetails from 'web/entities/withRowDetails';
import TlsCertificateDetails from 'web/pages/tlscertificates/Details';
import PropTypes from 'web/utils/PropTypes';
import {formattedUserSettingShortDate} from 'web/utils/user-setting-time-date-formatters';

const Div = styled.div`
  word-break: break-all;
`;

const StyledSpan = styled.span`
  word-break: break-all;
`;

const getColumns = ({
  actions = true,
  links = true,
  onTlsCertificateDownloadClick,
  onToggleDetailsClick,
}) =>
  [
    {
      key: 'dn',
      title: _('Subject DN'),
      width: actions ? '35%' : '40%',
      sortBy: 'dn',
      render: entity => (
        <StyledSpan>
          <RowDetailsToggle name={entity.id} onClick={onToggleDetailsClick}>
            <Div>{entity.subjectDn}</Div>
          </RowDetailsToggle>
        </StyledSpan>
      ),
    },
    {
      key: 'serial',
      title: _('Serial'),
      width: '10%',
      sortBy: 'serial',
      render: entity => entity.serial,
    },
    {
      key: 'notvalidbefore',
      title: _('Activates'),
      width: '10%',
      sortBy: 'notvalidbefore',
      render: entity => (
        <DateTime date={entity.activationTime} format={formattedUserSettingShortDate} />
      ),
    },
    {
      key: 'notvalidafter',
      title: _('Expires'),
      width: '10%',
      sortBy: 'notvalidafter',
      render: entity => (
        <DateTime date={entity.expirationTime} format={formattedUserSettingShortDate} />
      ),
    },
    {
      key: 'ip',
      title: _('IP'),
      width: '10%',
      sortBy: 'ip',
      render: entity => (
        <Link
          filter={'name=' + entity.ip}
          textOnly={!links}
          title={_('Show all Hosts with IP {{ip}}', {ip: entity.ip})}
          to="hosts"
        >
          {entity.ip}
        </Link>
      ),
    },
    {
      key: 'hostname',
      title: _('Hostname'),
      width: '15%',
      sortBy: 'hostname',
      render: entity => entity.hostname,
    },
    {
      key: 'port',
      title: _('Port'),
      width: '5%',
      sortBy: 'port',
      render: entity => entity.port,
    },
    {
      key: 'actions',
      title: _('Actions'),
      width: '5%',
      align: 'center',
      render: entity => (
        <DownloadIcon
          title={_('Download TLS Certificate')}
          value={entity}
          onClick={onTlsCertificateDownloadClick}
        />
      ),
      hidden: !actions,
    },
  ].filter(column => !column.hidden);

const Header = ({
  actions = true,
  currentSortDir,
  currentSortBy,
  sort = true,
  onSortChange,
}) => {
  const columns = getColumns({actions});

  return (
    <TableHeader>
      <TableRow>
        {columns.map(column => (
          <TableHead
            key={column.key}
            align={column.align}
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sortBy={sort ? column.sortBy : undefined}
            title={column.title}
            width={column.width}
            onSortChange={onSortChange}
          />
        ))}
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

const Row = ({
  actions = true,
  entity,
  links = true,
  onTlsCertificateDownloadClick,
  onToggleDetailsClick,
}) => {
  const columns = getColumns({
    actions,
    links,
    onTlsCertificateDownloadClick,
    onToggleDetailsClick,
  });

  return (
    <TableRow>
      {columns.map(column => (
        <TableData
          key={column.key}
          align={column.align === 'center' ? ['center', 'center'] : undefined}
        >
          {column.render(entity)}
        </TableData>
      ))}
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
