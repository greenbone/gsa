/* Copyright (C) 2019-2020 Greenbone Networks GmbH
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
          sortBy={sort ? 'issuer_dn' : false}
          onSortChange={onSortChange}
          title={_('Issuer DN')}
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
