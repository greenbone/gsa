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

import FoldIcon from '../components/icon/foldicon.js';

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

const DetailsIcon = glamorous(FoldIcon)({
  marginTop: '2px',
  marginLeft: '2px',
});

class EntitiesTable extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      details: {},
      allToggled: false,
    };

    this.handleToggleAllDetails = this.handleToggleAllDetails.bind(this);
    this.handleFirst = this.handleFirst.bind(this);
    this.handleLast = this.handleLast.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleToggleShowDetails = this.handleToggleShowDetails.bind(this);
  }

  handleToggleShowDetails(value, name) {
    const {details} = this.state;

    details[name] = !details[name];

    this.setState({details});
  }

  handleToggleAllDetails(untoggle = false) {
    const {entities} = this.props;
    let {details, allToggled} = this.state;

    allToggled = !allToggled;

    if (untoggle) {
      allToggled = false;
    }

    if (allToggled) {
      for_each(entities, entity => details[entity.id] = true);
    }
    else {
      for_each(entities, entity => details[entity.id] = false);
    }
    this.setState({details, allToggled});
  }

  handleFirst(...args) {
    this.props.onFirstClick(...args);
    this.handleToggleAllDetails(true);
  }

  handleLast(...args) {
    this.props.onLastClick(...args);
    this.handleToggleAllDetails(true);
  }

  handleNext(...args) {
    this.props.onNextClick(...args);
    this.handleToggleAllDetails(true);
  }

  handlePrevious(...args) {
    this.props.onPreviousClick(...args);
    this.handleToggleAllDetails(true);
  }

  render() {
    const {details} = this.state;
    const {
      emptyTitle,
      entities,
      entitiesCounts,
      filter,
      footnote = true,
      toggleDetailsIcon = true,
      updating,
      sortBy: currentSortBy,
      sortDir: currentSortDir,
      links,
      row: RowComponent,
      rowDetails: RowDetailsComponent,
      header: HeaderComponent,
      footer: FooterComponent,
      pagination: PaginationComponent = Pagination,
      body: BodyComponent = TableBody,
    } = this.props;

    if (!is_defined(entities)) {
      return null;
    }

    const other = exclude_object_props(this.props, exclude_props);

    const filterstring = is_defined(filter) ? filter.toFilterString() : '';

    if (entities.length === 0) {
      return <div className="entities-table">{emptyTitle}</div>;
    }

    const rows = [];
    if (is_defined(RowComponent)) {
      for_each(entities, entity => {
        rows.push(
          <RowComponent
            {...other}
            onToggleDetailsClick={this.handleToggleShowDetails}
            key={entity.id}
            entity={entity}
          />
        );
        if (is_defined(RowDetailsComponent) && details[entity.id]) {
          rows.push(
            <RowDetailsComponent
              links={links}
              key={'details-' + entity.id}
              entity={entity}
            />
          );
        }
      });
    }

    const pagination = is_defined(PaginationComponent) ? (
      <PaginationComponent
        {...other}
        onFirstClick={this.handleFirst}
        onLastClick={this.handleLast}
        onNextClick={this.handleNext}
        onPreviousClick={this.handlePrevious}
        counts={entitiesCounts}
      />
    ) : undefined;

    const header = is_defined(HeaderComponent) ? (
      <HeaderComponent
        currentSortBy={currentSortBy}
        currentSortDir={currentSortDir}
        {...other}
      />
    ) : undefined;

    const footer = is_defined(FooterComponent) ? (
      <FooterComponent {...other} />
    ) : undefined;

    const body = is_defined(BodyComponent) ? (
      <BodyComponent>
        {rows}
      </BodyComponent>
    ) : rows;

    const foldState = this.state.allToggled ? 'UNFOLDED' : 'FOLDED';
    const detailsIcon = (
      <DetailsIcon
        foldState={foldState}
        title={_('Toggle All Details')}
        onClick={this.handleToggleAllDetails}
      />
    );

    return (
      <Layout
        flex="column"
        grow="1"
        className="entities-table">
        {toggleDetailsIcon ?
          <Layout align="space-between" grow="1">
            {detailsIcon}
            {pagination}
          </Layout> :
          pagination
        }
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
  links: PropTypes.bool,
  pagination: PropTypes.componentOrFalse,
  row: PropTypes.component.isRequired,
  rowDetails: PropTypes.component,
  sortBy: PropTypes.string,
  sortDir: PropTypes.string,
  toggleDetailsIcon: PropTypes.bool,
  updating: PropTypes.bool,
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
