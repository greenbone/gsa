/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import {hasValue, isDefined} from 'gmp/utils/identity';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';

import {loadEntities, selector} from 'web/store/entities/filters';

import {UNSET_LABEL, UNSET_VALUE} from 'web/utils/render';
import PropTypes from 'web/utils/proptypes';
import compose from 'web/utils/compose';
import withGmp from 'web/utils/withGmp';

class FilterSelection extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      showDialog: false,
      filter: undefined,
    };

    this.handleCloseDialog = this.handleCloseDialog.bind(this);
    this.handleOpenDialog = this.handleOpenDialog.bind(this);
    this.handleSaveDialog = this.handleSaveDialog.bind(this);
  }

  componentDidMount() {
    this.props.loadFilters();
  }

  closeDialog() {
    this.setState({showDialog: false});
  }

  handleCloseDialog() {
    this.closeDialog();
  }

  handleOpenDialog() {
    this.setState({showDialog: true});
  }

  handleSaveDialog({filterId = UNSET_VALUE}) {
    const {onFilterIdChanged} = this.props;

    this.closeDialog();

    if (isDefined(onFilterIdChanged)) {
      onFilterIdChanged(filterId === UNSET_VALUE ? undefined : filterId);
    }
  }

  render() {
    const {children, filters = [], filterId} = this.props;
    const {showDialog} = this.state;
    const filter = isDefined(filterId)
      ? filters.find(f => f.id === filterId)
      : undefined;
    return (
      <React.Fragment>
        {children({
          filter,
          selectFilter: this.handleOpenDialog,
        })}
        {showDialog && (
          <SaveDialog
            defaultValues={{
              filterId: isDefined(filterId) ? filterId : UNSET_VALUE,
            }}
            title={_('Select Filter')}
            buttonTitle={_('Select')}
            width="500px"
            onClose={this.handleCloseDialog}
            onSave={this.handleSaveDialog}
          >
            {({values, onValueChange}) => (
              <FormGroup title={_('Filter')}>
                <Select
                  items={[
                    {
                      label: UNSET_LABEL,
                      value: UNSET_VALUE,
                    },
                    ...filters.map(f => ({
                      label: f.name,
                      value: f.id,
                    })),
                  ]}
                  value={values.filterId}
                  name="filterId"
                  onChange={onValueChange}
                />
              </FormGroup>
            )}
          </SaveDialog>
        )}
      </React.Fragment>
    );
  }
}

FilterSelection.propTypes = {
  children: PropTypes.func.isRequired,
  filterId: PropTypes.id,
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.id,
      name: PropTypes.string,
    }),
  ),
  filtersFilter: PropTypes.filter.isRequired,
  loadFilters: PropTypes.func.isRequired,
  onFilterIdChanged: PropTypes.func,
};

const mapStateToProps = (state, {filtersFilter}) => {
  if (!isDefined(filtersFilter)) {
    return {
      filters: [],
    };
  }

  const filterSelector = selector(state);
  const filters = filterSelector.getEntities(filtersFilter);
  return {
    filters: hasValue(filters) ? filters : [],
  };
};

const mapDispatchToProps = (dispatch, {gmp, filtersFilter}) => ({
  loadFilters: () => dispatch(loadEntities(gmp)(filtersFilter)),
});

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(FilterSelection);

// vim: set ts=2 sw=2 tw=80:
