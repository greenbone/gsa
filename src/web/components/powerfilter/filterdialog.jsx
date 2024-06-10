/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import Filter from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import SaveDialog from '../dialog/savedialog';

class FilterDialog extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = this.setFilter(this.props.filter);

    this.handleSave = this.handleSave.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.onFilterValueChange = this.onFilterValueChange.bind(this);
    this.onFilterStringChange = this.onFilterStringChange.bind(this);
    this.onSortByChange = this.onSortByChange.bind(this);
    this.onSortOrderChange = this.onSortOrderChange.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
    this.onSearchTermChange = this.onSearchTermChange.bind(this);
  }

  setFilter(filter) {
    if (!isDefined(filter)) {
      return {};
    }

    this.orig_filter = filter;

    return {
      filter: filter.copy(),
      filterstring: filter.toFilterCriteriaString(),
    };
  }

  createFilter(filter) {
    const {filterName = ''} = this.state;
    const {createFilterType, gmp, onFilterCreated} = this.props;

    return gmp.filter
      .create({
        term: filter.toFilterString(),
        type: createFilterType,
        name: filterName,
      })
      .then(response => {
        const {data} = response;
        // load new filter
        return gmp.filter.get(data);
      })
      .then(response => {
        const {data: f} = response;

        if (onFilterCreated) {
          onFilterCreated(f);
        }
      });
  }

  handleSave() {
    const {filter, filterName = '', filterstring, saveNamedFilter} = this.state;
    const {onFilterChanged, onCloseClick} = this.props;
    const newFilter = Filter.fromString(filterstring);
    filter.mergeKeywords(newFilter);

    if (saveNamedFilter) {
      if (filterName.trim().length > 0) {
        return this.createFilter(filter).then(onCloseClick);
      }
      return Promise.reject(
        new Error(_('Please insert a name for the new filter')),
      );
    }

    if (onFilterChanged && !filter.equals(this.orig_filter)) {
      onFilterChanged(filter);
    }

    if (isDefined(onCloseClick)) {
      onCloseClick();
    }
    return Promise.resolve();
  }

  handleFilterChange(filter) {
    this.setState({filter});
  }

  onFilterValueChange(value, name, relation = '=') {
    const {filter} = this.state;

    filter.set(name, value, relation);

    this.setState({filter});
  }

  onSearchTermChange(value, name, relation = '~') {
    const {filter} = this.state;
    filter.set(name, `"${value}"`, relation);

    this.setState({filter});
  }

  onFilterStringChange(value) {
    this.setState({filterstring: value});
  }

  onValueChange(value, name) {
    this.setState({[name]: value});
  }

  onSortByChange(value) {
    const {filter} = this.state;

    filter.setSortBy(value);

    this.setState({filter});
  }

  onSortOrderChange(value) {
    const {filter} = this.state;

    filter.setSortOrder(value);

    this.setState({filter});
  }

  render() {
    const {children, onCloseClick} = this.props;
    const {filter, filterName, filterstring, saveNamedFilter} = this.state;

    if (!isDefined(filter)) {
      return null;
    }

    return (
      <SaveDialog
        buttonTitle={_('Update')}
        title={_('Update Filter')}
        width="800px"
        onClose={onCloseClick}
        onSave={this.handleSave}
      >
        {() =>
          children({
            ...this.props,
            filterstring: filterstring,
            filterName: filterName,
            filter: filter,
            saveNamedFilter,
            onFilterChange: this.handleFilterChange,
            onFilterValueChange: this.onFilterValueChange,
            onSearchTermChange: this.onSearchTermChange,
            onFilterStringChange: this.onFilterStringChange,
            onSortOrderChange: this.onSortOrderChange,
            onSortByChange: this.onSortByChange,
            onValueChange: this.onValueChange,
          })
        }
      </SaveDialog>
    );
  }
}

FilterDialog.propTypes = {
  children: PropTypes.func.isRequired,
  createFilterType: PropTypes.string.isRequired,
  filter: PropTypes.filter,
  gmp: PropTypes.gmp.isRequired,
  onCloseClick: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
  onFilterCreated: PropTypes.func.isRequired,
};

export default withGmp(FilterDialog);

// vim: set ts=2 sw=2 tw=80:
