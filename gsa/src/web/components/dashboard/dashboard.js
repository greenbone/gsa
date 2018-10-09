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
import 'core-js/fn/object/entries';

import React from 'react';

import {connect} from 'react-redux';

import styled from 'styled-components';

import _ from 'gmp/locale';

import Logger from 'gmp/log';

import {DEFAULT_ROW_HEIGHT} from 'gmp/commands/dashboards';

import {isDefined, hasValue} from 'gmp/utils/identity';
import {debounce} from 'gmp/utils/event';
import {excludeObjectProps} from 'gmp/utils/object';

import {
  loadSettings,
  saveSettings,
  setDashboardSettingDefaults,
} from 'web/store/dashboard/settings/actions';
import DashboardSettings from 'web/store/dashboard/settings/selectors';

import Loading from 'web/components/loading/loading';

import Grid, {
  itemsPropType,
} from 'web/components/sortable/grid';
import {
  convertDefaultContent,
} from 'web/components/sortable/utils';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';
import compose from 'web/utils/compose';

import {getDisplay} from './registry';

const log = Logger.getLogger('web.components.dashboard');

const DEFAULT_MAX_ITEMS_PER_ROW = 4;
const DEFAULT_MAX_ROWS = 4;

const ownPropNames = [
  'defaultContent',
  'gmp',
  'id',
  'isLoading',
  'items',
  'loadSettings',
  'maxItemsPerRow',
  'maxRows',
  'permittedDisplays',
  'saveSettings',
];

const RowPlaceHolder = styled.div`
  display: flex;
  flex-grow: 1;
  height: ${DEFAULT_ROW_HEIGHT};
  justify-content: center;
  align-items: center;
  margin: 15px 0;
`;

const filterItems = (items, allowed) => items.map(row => {
  const {items: rowItems = []} = row;
  return {
    ...row,
    items: rowItems.filter(item => isDefined(allowed[item.name])),
  };
});

export class Dashboard extends React.Component {

  constructor(...args) {
    super(...args);

    const {permittedDisplays = []} = this.props;

    this.components = {};
    permittedDisplays.forEach(name => {
      const display = getDisplay(name);

      if (isDefined(display)) {
        this.components[name] = display.component;
      }
      else {
        log.warn('Unknown Dashboard display', name);
      }
    });

    this.state = {
      items: undefined,
    };

    this.handleItemsChange = this.handleItemsChange.bind(this);
    this.save = debounce(this.save, 500);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // try to synchronize external and internal state
    // update state items only if prop items have changed or
    // prop items are different then already set items
    return prevState.propItems === nextProps.items ||
      prevState.propItems === nextProps.items ?
      null : {
        items: nextProps.items,
        propItems: nextProps.items,
      };
  }

  componentDidMount() {
    const {
      id,
      permittedDisplays,
      defaultContent,
      maxItemsPerRow = DEFAULT_MAX_ITEMS_PER_ROW,
      maxRows = DEFAULT_MAX_ROWS,
    } = this.props;

    const defaults = {
      ...convertDefaultContent(defaultContent),
      permittedDisplays,
      maxItemsPerRow,
      maxRows,
    };

    this.props.setDefaultSettings(id, defaults);
    this.props.loadSettings(id, defaults);
  }

  handleItemsChange(items) {
    this.setState({items});

    this.save(items);
  }

  handleInteraction() {
    const {onInteraction} = this.props;

    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  save(items) {
    const {id} = this.props;

    this.props.saveSettings(id, {rows: items});

    this.handleInteraction();
  }

  render() {
    let {
      items,
    } = this.state;
    const {
      maxItemsPerRow = DEFAULT_MAX_ITEMS_PER_ROW,
      maxRows = DEFAULT_MAX_ROWS,
      isLoading,
      error,
      ...props
    } = this.props;

    if (isDefined(error) && !isLoading) {
      return (
        <RowPlaceHolder>
          {_('Could not load dashboard settings. Reason: {{error}}', {error})}
        </RowPlaceHolder>
      );
    }
    else if (!isDefined(items) && isLoading) {
      return (
        <RowPlaceHolder>
          <Loading />
        </RowPlaceHolder>
      );
    }

    const other = excludeObjectProps(props, ownPropNames);
    items = isDefined(items) ? filterItems(items, this.components) : [];
    return (
      <Grid
        items={items}
        maxItemsPerRow={maxItemsPerRow}
        maxRows={maxRows}
        onChange={this.handleItemsChange}
      >
        {({
          dragHandleProps, id,
          props: itemProps,
          height,
          width,
          remove,
          update,
        }) => {
          const {name, filterId} = itemProps;
          const Component = this.components[name];
          return (
            <Component
              {...other}
              dragHandleProps={dragHandleProps}
              height={height}
              width={width}
              id={id}
              filterId={filterId}
              onChanged={update}
              onInteractive={this.props.onInteraction}
              onRemoveClick={remove}
            />
          );
        }}
      </Grid>
    );
  }
}

Dashboard.propTypes = {
  defaultContent: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
  error: PropTypes.toString,
  filter: PropTypes.filter,
  id: PropTypes.id.isRequired,
  isLoading: PropTypes.bool.isRequired,
  items: itemsPropType,
  loadSettings: PropTypes.func.isRequired,
  maxItemsPerRow: PropTypes.number,
  maxRows: PropTypes.number,
  permittedDisplays: PropTypes.arrayOf(PropTypes.string).isRequired,
  saveSettings: PropTypes.func.isRequired,
  setDefaultSettings: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func,
  onInteraction: PropTypes.func,
};


const mapStateToProps = (rootState, {id}) => {
  const settingsSelector = DashboardSettings(rootState);
  const settings = settingsSelector.getById(id);
  const hasLoaded = settingsSelector.hasSettings(id);
  const defaults = settingsSelector.getDefaultsById(id);
  const error = settingsSelector.getError();

  let items;
  if (hasLoaded && isDefined(settings.rows)) {
    items = settings.rows;
  }
  else if (hasLoaded) {
    items = defaults.rows;
  }
  return {
    error: hasValue(error) ? error : undefined,
    isLoading: settingsSelector.getIsLoading(),
    items,
  };
};

const mapDispatchToProps = (dispatch, {gmp}) => ({
  loadSettings: (id, defaults) =>
    dispatch(loadSettings(gmp)(id, defaults)),
  saveSettings: (id, settings) =>
    dispatch(saveSettings(gmp)(id, settings)),
  setDefaultSettings: (id, settings) =>
    dispatch(setDashboardSettingDefaults(id, settings)),
});

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(Dashboard);

// vim: set ts=2 sw=2 tw=80:
