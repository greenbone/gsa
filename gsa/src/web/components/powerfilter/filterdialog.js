/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import logger from 'gmp/log';

import {isDefined} from 'gmp/utils/identity';

import Filter from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import Dialog from '../dialog/dialog';
import DialogContent from '../dialog/content';
import DialogTitle from '../dialog/title';
import DialogFooter from '../dialog/twobuttonfooter';
import ScrollableContent from '../dialog/scrollablecontent';

const log = logger.getLogger('web.powerfilter.filterDialog');

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
    const {
      createFilterType,
      gmp,
      onError,
      onFilterCreated,
    } = this.props;

    gmp.filter.create({
      term: filter.toFilterString(),
      type: createFilterType,
      name: filterName,
    }).then(response => {
      const {data: result} = response;
      // load new filter
      return gmp.filter.get(result);
    }).then(response => {
      const {data: f} = response;
      this.setState({filterName: ''});

      if (onFilterCreated) {
        onFilterCreated(f);
      }
    }).catch(err => {
      if (isDefined(onError)) {
        onError(err);
      }
      else {
        log.error(err);
      }
    });
  }

  handleSave() {
    let {
      filter,
      filterName = '',
      filterstring,
      saveNamedFilter,
    } = this.state;
    const {onFilterChanged, onCloseClick} = this.props;

    filter = Filter.fromString(filterstring, filter);

    if (saveNamedFilter) {
      if (filterName.trim().length > 0) {
        this.createFilter(filter);
      }
      else {
        this.setState({filterNameValid: false});
        return;
      }
    }

    if (onFilterChanged && !filter.equals(this.orig_filter)) {
      onFilterChanged(filter);
    }


    if (isDefined(onCloseClick)) {
      onCloseClick();
    }
  }

  handleFilterChange(filter) {
    this.setState({filter});
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
    const {children, onCloseClick} = this.props;
    const {
      filter,
      filterName,
      filterNameValid,
      filterstring,
      saveNamedFilter,
    } = this.state;

    if (!isDefined(filter)) {
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
              {children({
                ...this.props,
                filterstring: filterstring,
                filterName: filterName,
                filterNameValid: filterNameValid,
                filter: filter,
                saveNamedFilter,
                onFilterChange: this.handleFilterChange,
                onFilterValueChange: this.onFilterValueChange,
                onFilterStringChange: this.onFilterStringChange,
                onSortOrderChange: this.onSortOrderChange,
                onSortByChange: this.onSortByChange,
                onValueChange: this.onValueChange,
              })}
            </ScrollableContent>

            <DialogFooter
              rightButtonTitle={_('Update')}
              onLeftButtonClick={close}
              onRightButtonClick={this.handleSave}
            />
          </DialogContent>
        )}
      </Dialog>
    );
  }
};

FilterDialog.propTypes = {
  children: PropTypes.func.isRequired,
  filter: PropTypes.filter,
  gmp: PropTypes.gmp.isRequired,
  onCloseClick: PropTypes.func,
  onFilterChanged: PropTypes.func,
};

export default withGmp(FilterDialog);

// vim: set ts=2 sw=2 tw=80:
