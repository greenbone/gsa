/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {_, _l} from 'gmp/locale/lang';

import PropTypes from 'web/utils/proptypes';

import {createEntitiesFooter} from 'web/entities/footer';
import {createEntitiesTable} from 'web/entities/table';
import withRowDetails from 'web/entities/withRowDetails';

import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import TlsCertificateDetails from './details';
import TlsCertificateRow from './row';

const Header = ({
  links = true,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          width="30%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'subject_dn' : false}
          onSortChange={onSortChange}
          title={_('Subject DN')}
        />
        <TableHead
          width="26%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'serial' : false}
          onSortChange={onSortChange}
          title={_('Serial')}
        />
        <TableHead
          width="12%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'activates' : false}
          onSortChange={onSortChange}
          title={_('Activates')}
        />
        <TableHead
          width="12%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'expires' : false}
          onSortChange={onSortChange}
          title={_('Expires')}
        />
        <TableHead
          width="12%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'last_seen' : false}
          onSortChange={onSortChange}
          title={_('Last seen')}
        />
        <TableHead align="center">{_('Actions')}</TableHead>
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
  links: PropTypes.bool,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

const Footer = createEntitiesFooter({
  span: 6,
  delete: true,
  download: 'tls-certificates.xml',
});

export const TlsCertificatesTable = createEntitiesTable({
  emptyTitle: _l('No certificates available'),
  header: Header,
  footer: Footer,
  row: TlsCertificateRow,
  rowDetails: withRowDetails('tlscertificate', 6)(TlsCertificateDetails),
});

export default TlsCertificatesTable;

// vim: set ts=2 sw=2 tw=80:
