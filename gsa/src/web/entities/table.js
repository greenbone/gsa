/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {forEach} from 'gmp/utils/array';
import {excludeObjectProps} from 'gmp/utils/object';

import FootNote from 'web/components/footnote/footnote';

import {FoldState} from 'web/components/folding/folding';

import FoldIcon from 'web/components/icon/foldstateicon';

import Layout from 'web/components/layout/layout';

import Pagination from 'web/components/pagination/pagination';

import TableBody from 'web/components/table/body';
import StripedTable from 'web/components/table/stripedtable';

import PropTypes from 'web/utils/proptypes';

import withComponentDefaults from 'web/utils/withComponentDefaults';

const exclude_props = [
  'row',
  'header',
  'footer',
  'pagination',
  'emptyTitle',
  'children',
];

const UpdatingStripedTable = styled(StripedTable)`
  opacity: ${props => (props.isUpdating ? '0.2' : '1.0')};
`;

const DetailsIcon = styled(FoldIcon)`
  margin-top: 2px;
  margin-left: 2px;
`;

const TableBox = styled(Layout)`
  margin-top: 20px;
`;

const EmptyTitle = styled(Layout)`
  margin-top: 20px;
  margin-bottom: 20px;
`;

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
      forEach(entities, entity => (details[entity.id] = true));
    } else {
      forEach(entities, entity => (details[entity.id] = false));
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

  renderEmpty() {
    const {emptyTitle, filter, footnote = true} = this.props;
    const filterString = isDefined(filter) ? filter.toFilterString() : '';
    return (
      <React.Fragment>
        <EmptyTitle>{`${emptyTitle}`}</EmptyTitle>
        {footnote && (
          <Layout align="space-between">
            <FootNote>
              {_('(Applied filter: {{- filter}})', {filter: filterString})}
            </FootNote>
          </Layout>
        )}
      </React.Fragment>
    );
  }

  render() {
    const {details, allToggled} = this.state;
    const {
      doubleRow = false,
      entities,
      entitiesCounts,
      filter,
      footnote = true,
      toggleDetailsIcon = true,
      isUpdating = false,
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

    if (!isDefined(entities)) {
      return null;
    }

    const other = excludeObjectProps(this.props, exclude_props);

    const filterString = isDefined(filter) ? filter.toFilterString() : '';

    if (entities.length === 0) {
      return this.renderEmpty();
    }

    const rows = [];
    if (isDefined(RowComponent)) {
      forEach(entities, entity => {
        rows.push(
          <RowComponent
            {...other}
            onToggleDetailsClick={this.handleToggleShowDetails}
            key={entity.id}
            entity={entity}
          />,
        );
        if (isDefined(RowDetailsComponent) && details[entity.id]) {
          if (doubleRow) {
            rows.push(
              <TableBody key={'details-' + entity.id}>
                <RowDetailsComponent links={links} entity={entity} />
              </TableBody>,
            );
          } else {
            rows.push(
              <RowDetailsComponent
                links={links}
                key={'details-' + entity.id}
                entity={entity}
              />,
            );
          }
        }
      });
    }

    const pagination =
      PaginationComponent === false ? undefined : (
        <PaginationComponent
          {...other}
          onFirstClick={this.handleFirst}
          onLastClick={this.handleLast}
          onNextClick={this.handleNext}
          onPreviousClick={this.handlePrevious}
          counts={entitiesCounts}
        />
      );

    const header =
      !isDefined(HeaderComponent) || HeaderComponent === false ? undefined : (
        <HeaderComponent
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          {...other}
        />
      );

    const footer =
      !isDefined(FooterComponent) || FooterComponent === false ? undefined : (
        <FooterComponent {...other} />
      );

    const body =
      BodyComponent === false ? rows : <BodyComponent>{rows}</BodyComponent>;

    const detailsIcon = (
      <DetailsIcon
        foldState={allToggled ? FoldState.UNFOLDED : FoldState.FOLDED}
        title={allToggled ? _('Fold all details') : _('Unfold all details')}
        onClick={this.handleToggleAllDetails}
      />
    );

    return (
      <TableBox
        flex="column"
        grow="1"
        className="entities-table"
        data-testid="entities-table"
      >
        {toggleDetailsIcon ? (
          <Layout align="space-between" grow="1">
            {detailsIcon}
            {pagination}
          </Layout>
        ) : (
          pagination
        )}
        <UpdatingStripedTable
          header={header}
          footer={footer}
          isUpdating={isUpdating}
        >
          {body}
        </UpdatingStripedTable>
        {footnote ? (
          <Layout align="space-between">
            <FootNote>
              {_('(Applied filter: {{- filter}})', {filter: filterString})}
            </FootNote>
            {pagination}
          </Layout>
        ) : (
          pagination
        )}
      </TableBox>
    );
  }
}

EntitiesTable.propTypes = {
  body: PropTypes.componentOrFalse,
  doubleRow: PropTypes.bool,
  emptyTitle: PropTypes.toString,
  entities: PropTypes.array,
  entitiesCounts: PropTypes.counts,
  filter: PropTypes.filter,
  footer: PropTypes.componentOrFalse,
  footnote: PropTypes.bool,
  header: PropTypes.componentOrFalse,
  isUpdating: PropTypes.bool,
  links: PropTypes.bool,
  pagination: PropTypes.componentOrFalse,
  row: PropTypes.component.isRequired,
  rowDetails: PropTypes.component,
  sortBy: PropTypes.string,
  sortDir: PropTypes.string,
  toggleDetailsIcon: PropTypes.bool,
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
