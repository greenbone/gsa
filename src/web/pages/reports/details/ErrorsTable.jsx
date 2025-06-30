/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_, _l} from 'gmp/locale/lang';
import {isDefined} from 'gmp/utils/identity';
import DetailsLink from 'web/components/link/DetailsLink';
import TableData from 'web/components/table/Data';
import TableHead from 'web/components/table/Head';
import TableHeader from 'web/components/table/Header';
import TableRow from 'web/components/table/TableRow';
import {createEntitiesTable} from 'web/entities/Table';
import PropTypes from 'web/utils/PropTypes';

const Header = ({currentSortDir, currentSortBy, sort = true, onSortChange}) => (
  <TableHeader>
    <TableRow>
      <TableHead
        currentSortBy={currentSortBy}
        currentSortDir={currentSortDir}
        sortBy={sort ? 'error' : false}
        title={_('Error Message')}
        onSortChange={onSortChange}
      />
      <TableHead
        currentSortBy={currentSortBy}
        currentSortDir={currentSortDir}
        sortBy={sort ? 'host' : false}
        title={_('Host')}
        onSortChange={onSortChange}
      />
      <TableHead
        currentSortBy={currentSortBy}
        currentSortDir={currentSortDir}
        sortBy={sort ? 'hostname' : false}
        title={_('Hostname')}
        onSortChange={onSortChange}
      />
      <TableHead
        currentSortBy={currentSortBy}
        currentSortDir={currentSortDir}
        sortBy={sort ? 'nvt' : false}
        title={_('NVT')}
        onSortChange={onSortChange}
      />
      <TableHead
        currentSortBy={currentSortBy}
        currentSortDir={currentSortDir}
        sortBy={sort ? 'port' : false}
        title={_('Port')}
        onSortChange={onSortChange}
      />
    </TableRow>
  </TableHeader>
);

Header.propTypes = {
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

const Row = ({entity, links = true}) => {
  const {nvt, host, port, description} = entity;
  return (
    <TableRow>
      <TableData>{description}</TableData>
      <TableData>
        {isDefined(host.id) ? (
          <span>
            <DetailsLink id={host.id} textOnly={!links} type="host">
              {host.ip}
            </DetailsLink>
          </span>
        ) : (
          host.ip
        )}
      </TableData>
      <TableData>
        <i>{host.name}</i>
      </TableData>
      <TableData>
        <span>
          <DetailsLink id={nvt.id} textOnly={!links} type="nvt">
            {nvt.name}
          </DetailsLink>
        </span>
      </TableData>
      <TableData>{port}</TableData>
    </TableRow>
  );
};

Row.propTypes = {
  entity: PropTypes.object.isRequired,
  links: PropTypes.bool,
};

export default createEntitiesTable({
  header: Header,
  emptyTitle: _l('No Errors available'),
  row: Row,
});
