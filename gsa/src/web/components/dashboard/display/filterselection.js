/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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
import 'core-js/library/fn/array/find';

import React from 'react';

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import {hasValue, is_defined} from 'gmp/utils/identity';

import SaveDialog from '../../dialog/savedialog';

import FormGroup from '../../form/formgroup';
import Select from '../../form/select';

import MenuEntry from '../../menu/menuentry';

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

  handleCloseDialog() {
    this.setState({showDialog: false});
  }

  handleOpenDialog() {
    this.setState({showDialog: true});
  }

  handleSaveDialog({filterId}) {
    const {onChanged} = this.props;
    this.setState({showDialog: false});

    if (is_defined(onChanged)) {
      onChanged({
        filterId: is_defined(filterId) && filterId !== UNSET_VALUE ?
          filterId : undefined,
      });
    }
  }

  render() {
    const {
      children,
      filters = [],
      filterId,
    } = this.props;
    const {showDialog} = this.state;
    const filterSelectionMenuEntry = (
      <MenuEntry
        key="filter-selection"
        onClick={this.handleOpenDialog}
      >
        {_('Select Filter')}
      </MenuEntry>
    );
    const filter = is_defined(filterId) ?
      filters.find(f => f.id === filterId) : undefined;
    return (
      <React.Fragment>
        {children({
          filter,
          filterSelectionMenuEntry,
        })}
        {showDialog &&
          <SaveDialog
            defaultValues={{
              filterId: is_defined(filterId) ? filterId : UNSET_VALUE,
            }}
            title={_('Select Filter')}
            buttonTitle={_('Select')}
            width="500px"
            onClose={this.handleCloseDialog}
            onSave={this.handleSaveDialog}
          >
            {({values, onValueChange}) => (
              <FormGroup
                title={_('Filter')}
              >
                <Select
                  items={[{
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
        }
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
    })
  ),
  filtersFilter: PropTypes.filter.isRequired,
  loadFilters: PropTypes.func.isRequired,
  onChanged: PropTypes.func,
};

const mapStateToProps = (state, {filtersFilter}) => {
  if (!is_defined(filtersFilter)) {
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
  loadFilters: () => dispatch(loadEntities({gmp, filter: filtersFilter})),
});

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(FilterSelection);

// vim: set ts=2 sw=2 tw=80:
