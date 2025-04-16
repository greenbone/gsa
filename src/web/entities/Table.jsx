/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {forEach} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {excludeObjectProps} from 'gmp/utils/object';
import React from 'react';
import styled from 'styled-components';
import {FoldState} from 'web/components/folding/Folding';
import FootNote from 'web/components/footnote/Footnote';
import FoldStateIcon from 'web/components/icon/FoldStateIcon';
import Layout from 'web/components/layout/Layout';
import Pagination from 'web/components/pagination/Pagination';
import TableBody from 'web/components/table/Body';
import StripedTable from 'web/components/table/StripedTable';
import PropTypes from 'web/utils/PropTypes';
import withComponentDefaults from 'web/utils/withComponentDefaults';
import withTranslation from 'web/utils/withTranslation';
const exclude_props = [
  'row',
  'header',
  'footer',
  'pagination',
  'emptyTitle',
  'children',
];

const UpdatingStripedTable = styled(StripedTable)`
  opacity: ${props => (props.$isUpdating ? '0.2' : '1.0')};
`;

const DetailsIcon = styled(FoldStateIcon)`
  margin-top: 2px;
  margin-left: 2px;
`;

const TableBox = styled(Layout)`
  margin-top: 10px;
`;

const EmptyTitle = styled(Layout)`
  margin-top: 10px;
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
    const {_} = this.props;

    const {emptyTitle, filter, footnote = true} = this.props;
    const filterstring = isDefined(filter) ? filter.toFilterString() : '';
    return (
      <React.Fragment>
        <EmptyTitle>{`${emptyTitle}`}</EmptyTitle>
        {footnote && (
          <Layout align="space-between">
            <FootNote>
              {_('(Applied filter: {{- filter}})', {filter: filterstring})}
            </FootNote>
          </Layout>
        )}
      </React.Fragment>
    );
  }

  render() {
    const {_} = this.props;

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

    const filterstring = isDefined(filter) ? filter.toFilterString() : '';

    if (entities.length === 0) {
      return this.renderEmpty();
    }

    const rows = [];
    if (isDefined(RowComponent)) {
      forEach(entities, entity => {
        rows.push(
          <RowComponent
            {...other}
            key={entity.id}
            entity={entity}
            onToggleDetailsClick={this.handleToggleShowDetails}
          />,
        );
        if (isDefined(RowDetailsComponent) && details[entity.id]) {
          if (doubleRow) {
            rows.push(
              <TableBody key={'details-' + entity.id}>
                <RowDetailsComponent entity={entity} links={links} />
              </TableBody>,
            );
          } else {
            rows.push(
              <RowDetailsComponent
                key={'details-' + entity.id}
                entity={entity}
                links={links}
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
          counts={entitiesCounts}
          onFirstClick={this.handleFirst}
          onLastClick={this.handleLast}
          onNextClick={this.handleNext}
          onPreviousClick={this.handlePrevious}
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
      <TableBox className="entities-table" flex="column" grow="1">
        {toggleDetailsIcon ? (
          <Layout align="space-between" grow="1">
            {detailsIcon}
            {pagination}
          </Layout>
        ) : (
          pagination
        )}
        <UpdatingStripedTable
          $isUpdating={isUpdating}
          footer={footer}
          header={header}
        >
          {body}
        </UpdatingStripedTable>
        {footnote ? (
          <Layout align="space-between">
            <FootNote>
              {_('(Applied filter: {{- filter}})', {filter: filterstring})}
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
  _: PropTypes.func.isRequired,
};

export const createEntitiesTable = options =>
  withComponentDefaults(options)(withTranslation(EntitiesTable));

export default withTranslation(EntitiesTable);
