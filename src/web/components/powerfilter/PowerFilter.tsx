/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import Capabilities from 'gmp/capabilities/capabilities';
import Gmp from 'gmp/gmp';
import Filter, {RESET_FILTER} from 'gmp/models/filter';
import {isFilter} from 'gmp/models/filter/utils';
import {KeyEvent} from 'gmp/utils/event';
import {isDefined, isString} from 'gmp/utils/identity';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import {EditIcon, RefreshIcon, ResetIcon} from 'web/components/icon';
import DeleteIcon from 'web/components/icon/DeleteIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import compose from 'web/utils/Compose';
import {RenderSelectItemProps, renderSelectItems} from 'web/utils/Render';
import withCapabilities from 'web/utils/withCapabilities';
import withGmp from 'web/utils/withGmp';
import withTranslation from 'web/utils/withTranslation';

interface PowerFilterState {
  userFilterString: string;
  prevFilter?: Filter;
}

interface PowerFilterProps {
  capabilities: Capabilities;
  createFilterType?: string;
  filter?: Filter;
  filters?: Filter[];
  isLoading?: boolean;
  isLoadingFilters?: boolean;
  resetFilter?: Filter;
  gmp: Gmp;
  _: (key: string) => string;
  onEditClick?: () => void;
  onUpdate?: (filter: Filter) => void;
  onRemoveClick?: () => void;
  onResetClick?: () => void;
}

const DEFAULT_FILTER_ID = '0';

const Label = styled.label`
  margin-right: 5px;
`;

const LeftDivider = styled(Divider)`
  margin-right: 5px;
`;

const PowerFilterTextField = styled(TextField<string>)`
  width: 30vw;
`;

const getUserFilterString = (filter?: Filter | string) => {
  if (isFilter(filter)) {
    return filter.toFilterCriteriaString();
  }
  if (isString(filter)) {
    return filter;
  }
  return '';
};

class PowerFilter extends React.Component<PowerFilterProps, PowerFilterState> {
  constructor(props: PowerFilterProps) {
    super(props);

    const {filter} = this.props;

    this.state = {
      userFilterString: getUserFilterString(filter),
    };

    this.handleNamedFilterChange = this.handleNamedFilterChange.bind(this);
    this.handleUpdateFilter = this.handleUpdateFilter.bind(this);
    this.handleUserFilterKeyPress = this.handleUserFilterKeyPress.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleRemoveClick = this.handleRemoveClick.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
  }

  static getDerivedStateFromProps(
    props: PowerFilterProps,
    state: PowerFilterState,
  ) {
    const {filter} = props;
    const {prevFilter} = state;
    if (filter !== prevFilter) {
      if (
        !isDefined(filter) ||
        (isDefined(filter) && !isDefined(prevFilter)) ||
        (isDefined(filter) && filter.id !== prevFilter?.id) ||
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

  updateFilter(filter: Filter) {
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

  handleValueChange(value: string, name?: string) {
    // @ts-expect-error
    this.setState({[name]: value});
  }

  handleUpdateFilter() {
    this.updateFromUserFilter();
  }

  handleUserFilterKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === KeyEvent.ENTER) {
      this.updateFromUserFilter();
    }
  }

  handleNamedFilterChange(value: string) {
    const {filters = [], resetFilter = RESET_FILTER} = this.props;

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
    const {_} = this.props;

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
                maxLength={1000}
                name="userFilterString"
                value={userFilterString}
                onChange={this.handleValueChange}
                onKeyDown={this.handleUserFilterKeyPress}
              />
            </Layout>
            <IconDivider align={['start', 'center']}>
              <RefreshIcon
                data-testid="powerfilter-refresh"
                title={_('Update Filter')}
                onClick={this.handleUpdateFilter}
              />

              {onRemoveClick && (
                <DeleteIcon
                  active={isDefined(filter)}
                  data-testid="powerfilter-delete"
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
          {capabilities.mayAccess('filter') && (
            <Select
              data-testid="powerfilter-select"
              isLoading={isLoadingFilters}
              items={renderSelectItems(
                filters as RenderSelectItemProps[],
                DEFAULT_FILTER_ID,
              )}
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

export default compose(withTranslation, withCapabilities, withGmp)(PowerFilter);
