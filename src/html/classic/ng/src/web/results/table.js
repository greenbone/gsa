/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import glamorous from 'glamorous';

import _ from '../../locale.js';

import PropTypes from '../utils/proptypes.js';

import {createEntitiesFooter} from '../entities/footer.js';
import {withEntitiesHeader} from '../entities/header.js';
import {createEntitiesTable} from '../entities/table.js';

import Icon from '../components/icon/icon.js';

import Layout from '../components/layout/layout.js';

import DetailsLink from '../components/link/detailslink.js';

import Sort from '../components/sortby/sortby.js';

import TableData from '../components/table/data.js';
import TableHead from '../components/table/head.js';
import TableHeader from '../components/table/header.js';
import TableRow from '../components/table/row.js';

import ResultsRow from './row.js';
import ResultDetails from './details.js';

const Header = ({onSortChange, links = true, sort = true, actions}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          sortby={sort ? 'vulnerability' : false}
          onSortChange={onSortChange}>
          {_('Vulnerability')}
        </TableHead>
        <TableHead width="5em">
          <Layout flex align="center">
            {sort ?
              <Sort by="solution_type" onClick={onSortChange}>
                <Icon title={_('Solution type')} img="solution_type.svg"/>
              </Sort> :
              <Icon title={_('Solution type')} img="solution_type.svg"/>
            }
          </Layout>
        </TableHead>
        <TableHead width="10em"
          sortby={sort ? 'severity' : false}
          onSortChange={onSortChange}>
          {_('Severity')}
        </TableHead>
        <TableHead width="6em"
          sortby={sort ? 'qod' : false}
          onSortChange={onSortChange}>
          {_('QoD')}
        </TableHead>
        <TableHead width="10em"
          sortby={sort ? 'host' : false}
          onSortChange={onSortChange}>
          {_('Host')}
        </TableHead>
        <TableHead width="10em"
          sortby={sort ? 'location' : false}
          onSortChange={onSortChange}>
          {_('Location')}
        </TableHead>
        <TableHead width="20em"
          sortby={sort ? 'created' : false}
          onSortChange={onSortChange}>
          {_('Created')}
        </TableHead>
        {actions}
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  actions: PropTypes.element,
  links: PropTypes.bool,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

const Indent = glamorous.div({
  display: 'flex',
  width: '3em',
});

const ResultsRowDetails = glamorous(({
    className,
    entity,
    links,
  }) => {
  return (
    <TableRow className={className}>
      <TableData
        colSpan="7"
        flex
        align={['start', 'stretch']}>
        <Indent/>
        <ResultDetails
          links={links}
          className="result-details"
          entity={entity}
        />
        <Layout flex align={['start', 'start']}>
          <DetailsLink
            type="result"
            id={entity.id}>
            <Icon img="details.svg"
              size="small"
              title={_('Show details')}
            />
          </DetailsLink>
        </Layout>
      </TableData>
    </TableRow>
  );
})({
  '&, &:hover': {
    backgroundColor: 'white !important',
  },

  '& .result-details': {
    borderLeft: '2px solid black',
    paddingLeft: '1em',
  },
});

ResultsRowDetails.propTypes = {
  entity: PropTypes.model,
  links: PropTypes.bool,
};

export default createEntitiesTable({
  emptyTitle: _('No results available'),
  footer: createEntitiesFooter({
    span: 8,
    download: 'results.xml',
  }),
  header: withEntitiesHeader(Header, true),
  row: ResultsRow,
  rowDetails: ResultsRowDetails,
});

// vim: set ts=2 sw=2 tw=80:
