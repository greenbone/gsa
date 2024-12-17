/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {_, _l} from 'gmp/locale/lang';
import React from 'react';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';
import {createEntitiesFooter} from 'web/entities/footer';
import {createEntitiesTable} from 'web/entities/table';
import withRowDetails from 'web/entities/withRowDetails';
import PropTypes from 'web/utils/proptypes';

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
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'subject_dn' : false}
          title={_('Subject DN')}
          width="30%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'serial' : false}
          title={_('Serial')}
          width="26%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'activates' : false}
          title={_('Activates')}
          width="12%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'expires' : false}
          title={_('Expires')}
          width="12%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'last_seen' : false}
          title={_('Last seen')}
          width="12%"
          onSortChange={onSortChange}
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
