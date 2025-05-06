/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {hasValue, isDefined} from 'gmp/utils/identity';
import React from 'react';
import {connect} from 'react-redux';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import {loadEntities, selector} from 'web/store/entities/filters';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import {UNSET_LABEL, UNSET_VALUE} from 'web/utils/Render';
import withGmp from 'web/utils/withGmp';
import withTranslation from 'web/utils/withTranslation';

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
    const {_} = this.props;

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
            buttonTitle={_('Select')}
            defaultValues={{
              filterId: isDefined(filterId) ? filterId : UNSET_VALUE,
            }}
            title={_('Select Filter')}
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
                  name="filterId"
                  value={values.filterId}
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
  _: PropTypes.func.isRequired,
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
  withTranslation,
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(FilterSelection);
