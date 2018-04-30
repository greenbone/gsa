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

import _ from 'gmp/locale.js';
import {is_defined} from 'gmp/utils';

import Filter from 'gmp/models/filter.js';

import PropTypes from '../../utils/proptypes.js';

import Dialog from '../dialog/dialog.js';
import DialogContent from '../dialog/content.js';
import DialogTitle from '../dialog/title.js';
import DialogFooter from '../dialog/footer.js';
import ScrollableContent from '../dialog/scrollablecontent.js';

const withFilterDialog = (options = {}) => FilterDialogComponent => {

  class FilterDialogWrapper extends React.Component {

    constructor(...args) {
      super(...args);

      this.state = this.setFilter(this.props.filter);

      this.handleSave = this.handleSave.bind(this);
      this.onFilterValueChange = this.onFilterValueChange.bind(this);
      this.onFilterStringChange = this.onFilterStringChange.bind(this);
      this.onSortByChange = this.onSortByChange.bind(this);
      this.onSortOrderChange = this.onSortOrderChange.bind(this);
      this.onValueChange = this.onValueChange.bind(this);
    }

    setFilter(filter) {
      if (!is_defined(filter)) {
        return {};
      }

      this.orig_filter = filter;

      return {
        filter: filter.copy(),
        filterstring: filter.toFilterCriteriaString(),
      };
    }

    handleSave() {
      let {filter, filterstring} = this.state;
      const {onFilterChanged, onCloseClick} = this.props;

      filter = Filter.fromString(filterstring, filter);

      if (onFilterChanged && !filter.equals(this.orig_filter)) {
        onFilterChanged(filter);
      }

      if (is_defined(onCloseClick)) {
        onCloseClick();
      }
    }

    onFilterValueChange(value, name, relation = '=') {
      const {filter} = this.state;

      filter.set(name, value, relation);

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
      const {onCloseClick} = this.props;
      const {filter, filterstring} = this.state;

      if (!is_defined(filter)) {
        return null;
      }

      return (
        <Dialog
          width="800px"
          onClose={onCloseClick}
        >
          {({
            close,
            moveProps,
            heightProps,
          }) => (
            <DialogContent>
              <DialogTitle
                title={_('Update Filter')}
                onCloseClick={close}
                {...moveProps}
              />

              <ScrollableContent {...heightProps}>
                <FilterDialogComponent
                  {...options}
                  {...this.props}
                  onFilterValueChange={this.onFilterValueChange}
                  onFilterStringChange={this.onFilterStringChange}
                  onSortOrderChange={this.onSortOrderChange}
                  onSortByChange={this.onSortByChange}
                  onValueChange={this.onValueChange}
                  filterstring={filterstring}
                  filter={filter}
                />
              </ScrollableContent>

              <DialogFooter
                title={_('Update')}
                onClick={this.handleSave}
              />
            </DialogContent>
          )}
        </Dialog>
      );
    }
  };

  FilterDialogWrapper.propTypes = {
    filter: PropTypes.filter,
    onCloseClick: PropTypes.func,
    onFilterChanged: PropTypes.func,
  };

  return FilterDialogWrapper;
};

export default withFilterDialog;

// vim: set ts=2 sw=2 tw=80:
