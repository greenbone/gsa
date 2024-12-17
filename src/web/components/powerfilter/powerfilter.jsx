/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */



import _ from 'gmp/locale';
import Filter, {RESET_FILTER} from 'gmp/models/filter';
import {KeyCode} from 'gmp/utils/event';
import {isDefined, isString} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import Select from 'web/components/form/select';
import TextField from 'web/components/form/textfield';
import DeleteIcon from 'web/components/icon/deleteicon';
import EditIcon from 'web/components/icon/editicon';
import ManualIcon from 'web/components/icon/manualicon';
import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';
import withCapabilities from 'web/utils/withCapabilities';
import withGmp from 'web/utils/withGmp';

import RefreshIcon from '../icon/refreshicon';
import ResetIcon from '../icon/reseticon';

const DEFAULT_FILTER_ID = '0';

const Label = styled.label`
  margin-right: 5px;
`;

const LeftDivider = styled(Divider)`
  margin-right: 5px;
`;

const PowerFilterTextField = styled(TextField)`
  width: 30vw;
`;

const getUserFilterString = filter => {
  if (isDefined(filter) && isDefined(filter.toFilterCriteriaString)) {
    return filter.toFilterCriteriaString();
  }
  if (isString(filter)) {
    return filter;
  }
  return '';
};

class PowerFilter extends React.Component {
  constructor(...args) {
    super(...args);

    const {filter} = this.props;

    this.state = {
      filtername: '',
      userFilterString: getUserFilterString(filter),
    };

    this.handleNamedFilterChange = this.handleNamedFilterChange.bind(this);
    this.handleUpdateFilter = this.handleUpdateFilter.bind(this);
    this.handleUserFilterKeyPress = this.handleUserFilterKeyPress.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleRemoveClick = this.handleRemoveClick.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    const {filter} = props;
    const {prevFilter} = state;
    if (filter !== prevFilter) {
      if (
        !isDefined(filter) ||
        (isDefined(filter) && !isDefined(prevFilter)) ||
        (isDefined(filter) && filter.id !== prevFilter.id) ||
        (isDefined(filter) && !filter.equals(prevFilter))
      ) {
        return {
          userFilterString: getUserFilterString(props.filter),
          prevFilter: props.filter,
        };
      }
    }
    return null;
  }

  updateFilter(filter) {
    const {onUpdate} = this.props;

    if (onUpdate) {
      onUpdate(filter);
    }
  }

  updateFromUserFilter() {
    const {filter} = this.props;
    const {userFilterString} = this.state;

    this.updateFilter(Filter.fromString(userFilterString, filter));
  }

  resetUserFilterString() {
    const {filter} = this.props;

    this.setState({
      userFilterString: getUserFilterString(filter),
    });
  }

  handleValueChange(value, name) {
    this.setState({[name]: value});
  }

  handleUpdateFilter() {
    this.updateFromUserFilter();
  }

  handleUserFilterKeyPress(event) {
    if (event.keyCode === KeyCode.ENTER) {
      this.updateFromUserFilter();
    }
  }

  handleNamedFilterChange(value) {
    const {filters, resetFilter = RESET_FILTER} = this.props;

    let filter = filters.find(f => f.id === value);
    if (!isDefined(filter)) {
      filter = resetFilter;
    }
    this.updateFilter(filter);
  }

  handleRemoveClick() {
    const {onRemoveClick} = this.props;

    if (isDefined(onRemoveClick)) {
      onRemoveClick();
    }

    this.resetUserFilterString();
  }

  handleResetClick() {
    const {onResetClick} = this.props;

    if (isDefined(onResetClick)) {
      onResetClick();
    }

    this.resetUserFilterString();
  }

  render() {
    const {userFilterString = ''} = this.state;
    const {
      capabilities,
      filter,
      filters,
      isLoading = false,
      isLoadingFilters,
      onEditClick,
      onRemoveClick,
      onResetClick,
    } = this.props;
    return (
      <Layout
        align={['start', 'stretch']}
        className="powerfilter"
        flex="column"
      >
        <Layout align={['space-between', 'center']}>
          <LeftDivider align={['start', 'center']}>
            <Layout align={['start', 'center']}>
              <Label>
                <b>{_('Filter')}</b>
              </Label>
              <PowerFilterTextField
                data-testid="powerfilter-text"
                maxLength="1000"
                name="userFilterString"
                value={userFilterString}
                onChange={this.handleValueChange}
                onKeyDown={this.handleUserFilterKeyPress}
              />
            </Layout>
            <IconDivider align={['start', 'center']}>
              <RefreshIcon
                data-testid="powerfiler-refresh"
                title={_('Update Filter')}
                onClick={this.handleUpdateFilter}
              />

              {onRemoveClick && (
                <DeleteIcon
                  active={isDefined(filter)}
                  data-testid="powefilter-delete"
                  title={_('Remove Filter')}
                  onClick={
                    isDefined(filter) ? this.handleRemoveClick : undefined
                  }
                />
              )}
              {onResetClick && (
                <ResetIcon
                  active={isDefined(filter)}
                  data-testid="powerfilter-reset"
                  title={_('Reset to Default Filter')}
                  onClick={
                    isDefined(filter) ? this.handleResetClick : undefined
                  }
                />
              )}

              <ManualIcon
                anchor="filtering-the-page-content"
                data-testid="powerfilter-help"
                page="web-interface"
                title={_('Help: Powerfilter')}
              />

              {onEditClick && (
                <EditIcon
                  data-testid="powerfilter-edit"
                  disabled={!isDefined(filter) || isLoading}
                  title={_('Edit Filter')}
                  onClick={isDefined(filter) ? onEditClick : undefined}
                />
              )}
            </IconDivider>
          </LeftDivider>
          {capabilities.mayAccess('filters') && (
            <Select
              data-testid="powefilter-select"
              isLoading={isLoadingFilters}
              items={renderSelectItems(filters, DEFAULT_FILTER_ID)}
              toolTipTitle={_('Loaded filter')}
              value={
                isDefined(filter) && isDefined(filter.id)
                  ? filter.id
                  : DEFAULT_FILTER_ID
              }
              onChange={this.handleNamedFilterChange}
            />
          )}
        </Layout>
      </Layout>
    );
  }
}

PowerFilter.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  createFilterType: PropTypes.string,
  filter: PropTypes.filter,
  filters: PropTypes.array,
  gmp: PropTypes.gmp.isRequired,
  isLoading: PropTypes.bool,
  isLoadingFilters: PropTypes.bool,
  resetFilter: PropTypes.filter,
  onEditClick: PropTypes.func,
  onError: PropTypes.func,
  onFilterCreated: PropTypes.func,
  onRemoveClick: PropTypes.func,
  onResetClick: PropTypes.func,
  onUpdate: PropTypes.func,
};

export default compose(withCapabilities, withGmp)(PowerFilter);

// vim: set ts=2 sw=2 tw=80:
