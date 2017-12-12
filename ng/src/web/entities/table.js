/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';
import {is_defined, for_each, exclude_object_props} from 'gmp/utils.js';

import FootNote from '../components/footnote/footnote.js';

import Layout from '../components/layout/layout.js';

import Pagination from '../components/pagination/pagination.js';

import TableBody from '../components/table/body.js';
import StripedTable from '../components/table/stripedtable.js';

import PropTypes from '../utils/proptypes.js';

import withComponentDefaults from '../utils/withComponentDefaults.js';

const exclude_props = [
  'row',
  'header',
  'footer',
  'pagination',
  'emptyTitle',
  'children',
];

const UpdatingStripedTable = glamorous(StripedTable)(
  ({updating}) => {
    return {
      opacity: updating ? '0.2' : '1.0',
    };
  },
);

class EntitiesTable extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      details: {},
    };

    this.handleToggleShowDetails = this.handleToggleShowDetails.bind(this);
  }

  handleToggleShowDetails(value, name) {
    const {details} = this.state;

    details[name] = !details[name];

    this.setState({details});
  }

  render() {
    const {props} = this;
    const {details} = this.state;
    const {
      emptyTitle,
      entities,
      entitiesCounts,
      filter,
      footnote = true,
      updating,
    } = props;

    if (!is_defined(entities)) {
      return null;
    }

    const RowComponent = props.row;
    const RowDetailsComponent = props.rowDetails;
    const HeaderComponent = props.header;
    const FooterComponent = props.footer;
    const PaginationComponent = is_defined(props.pagination) ?
      props.pagination : Pagination;
    const BodyComponent = is_defined(props.body) ? props.body : TableBody;

    const other = exclude_object_props(props, exclude_props);

    const filterstring = is_defined(filter) ? filter.toFilterString() : '';

    if (entities.length === 0) {
      return <div className="entities-table">{emptyTitle}</div>;
    }

    const rows = [];
    if (RowComponent) {
      for_each(entities, entity => {
        rows.push(
          <RowComponent
            {...other}
            onToggleDetailsClick={this.handleToggleShowDetails}
            key={entity.id}
            entity={entity}/>
        );
        if (RowDetailsComponent && details[entity.id]) {
          rows.push(
            <RowDetailsComponent
              links={props.links}
              key={'details-' + entity.id}
              entity={entity}
            />
          );
        }
      });
    }

    let pagination;
    if (PaginationComponent) {
      pagination = (
        <PaginationComponent
          {...other}
          counts={entitiesCounts}
        />
      );
    }

    let header;
    if (HeaderComponent) {
      header = (
        <HeaderComponent {...other}/>
      );
    }

    let footer;
    if (FooterComponent) {
      footer = (
        <FooterComponent {...other}/>
      );
    }

    let body;
    if (BodyComponent) {
      body = (
        <BodyComponent>
          {rows}
        </BodyComponent>
      );
    }
    else {
      body = rows;
    }

    return (
      <Layout
        flex="column"
        grow="1"
        className="entities-table">
        {pagination}
        <UpdatingStripedTable
          header={header}
          footer={footer}
          updating={updating}
        >
          {body}
        </UpdatingStripedTable>
        {footnote ?
          <Layout flex align="space-between">
            <FootNote>
              {_('(Applied filter: {{filter}})', {filter: filterstring})}
            </FootNote>
            {pagination}
          </Layout> :
          pagination
        }
      </Layout>
    );
  }
}

EntitiesTable.propTypes = {
  body: PropTypes.componentOrFalse,
  emptyTitle: PropTypes.string,
  entities: PropTypes.array,
  entitiesCounts: PropTypes.counts,
  filter: PropTypes.filter,
  footer: PropTypes.componentOrFalse,
  footnote: PropTypes.bool,
  header: PropTypes.componentOrFalse,
  pagination: PropTypes.componentOrFalse,
  row: PropTypes.component.isRequired,
  onFirstClick: PropTypes.func,
  onLastClick: PropTypes.func,
  onNextClick: PropTypes.func,
  onPreviousClick: PropTypes.func,
  onSortChange: PropTypes.func,
};

export const createEntitiesTable = options =>
  withComponentDefaults(options)(EntitiesTable);


export default EntitiesTable;

// vim: set ts=2 sw=2 tw=80:
