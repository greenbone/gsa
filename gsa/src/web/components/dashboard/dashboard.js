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
import 'core-js/fn/array/find-index';
import 'core-js/fn/object/entries';

import React from 'react';

import {connect} from 'react-redux';

import styled from 'styled-components';

import _ from 'gmp/locale';

import Logger from 'gmp/log';

import {DEFAULT_ROW_HEIGHT} from 'gmp/commands/dashboards';

import {isDefined} from 'gmp/utils/identity';
import {excludeObjectProps} from 'gmp/utils/object';

import {
  loadSettings,
  saveSettings,
  setDashboardSettingDefaults,
} from 'web/store/dashboard/settings/actions';
import DashboardSettings from 'web/store/dashboard/settings/selectors';

import Loading from 'web/components/loading/loading';

import Grid from 'web/components/sortable/grid';
import {
  convertDefaultDisplays,
  updateRow,
  removeItem,
} from 'web/components/sortable/utils';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';
import compose from 'web/utils/compose';

import {getDisplay} from './registry';

const log = Logger.getLogger('web.components.dashboard');

const DEFAULT_MAX_ITEMS_PER_ROW = 4;
const DEFAULT_MAX_ROWS = 4;

const ownPropNames = [
  'defaultDisplays',
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

const filterItems = (items = [], isAllowed) => items.map(row => {
  const {items: rowItems = []} = row;
  return {
    ...row,
    items: rowItems.filter(({id}) => isAllowed(id)),
  };
});

const getDisplaysById = (items = []) => {
  const displaysById = {};
  items.forEach(row => row.items.forEach(setting => {
    displaysById[setting.id] = setting;
  }));
  return displaysById;
};

const getGridItems = (items = []) => items.map(row => ({
  ...row,
  items: row.items.map(display => display.id),
}));

export class Dashboard extends React.Component {

  constructor(...args) {
    super(...args);

    const {permittedDisplays = []} = this.props;

    this.components = {};
    permittedDisplays.forEach(displayId => {
      const display = getDisplay(displayId);

      if (isDefined(display)) {
        this.components[displayId] = display.component;
      }
      else {
        log.warn('Unknown Dashboard display', displayId);
      }
    });

    this.state = {
      items: undefined,
    };

    this.handleItemsChange = this.handleItemsChange.bind(this);
    this.handleRowResize = this.handleRowResize.bind(this);
    this.handleUpdateDisplay = this.handleUpdateDisplay.bind(this);
    this.handleRemoveDisplay = this.handleRemoveDisplay.bind(this);
  }

  componentDidMount() {
    const {
      id,
      permittedDisplays,
      defaultDisplays,
      maxItemsPerRow = DEFAULT_MAX_ITEMS_PER_ROW,
      maxRows = DEFAULT_MAX_ROWS,
    } = this.props;

    const defaultDashboardSettings = convertDefaultDisplays(defaultDisplays);
    const defaults = {
      ...defaultDashboardSettings,
      permittedDisplays,
      maxItemsPerRow,
      maxRows,
    };

    this.props.setDefaultSettings(id, defaultDashboardSettings);
    this.props.loadSettings(id, defaults);
  }

  handleItemsChange(gridItems = []) {
    const {items} = this.props;

    const displaysById = getDisplaysById(items);

    this.update({
      items: gridItems.map(row => ({
        ...row,
        items: row.items.map(id => displaysById[id]),
      })),
    });
  }

  handleUpdateDisplay(id, props) {
    const {items} = this.props;

    const rowIndex = items.findIndex(
      row => row.items.some(item => item.id === id));

    const row = items[rowIndex];

    const rowItems = [
      ...row.items,
    ];

    const itemIndex = rowItems.findIndex(i => i.id === id);

    rowItems[itemIndex] = {
      ...rowItems[itemIndex],
      ...props,
    };

    const rows = [...items];
    rows[rowIndex] = updateRow(row, {items: rowItems});

    this.update({items: rows});
  }

  handleRemoveDisplay(id) {
    const {items} = this.props;

    this.update({items: removeItem(items, id)});
  }

  handleRowResize(rowId, height) {
    const {items = []} = this.props;

    const rowIndex = items.findIndex(row => row.id === rowId);
    const row = items[rowIndex];

    const newItems = [
      ...items,
    ];
    newItems[rowIndex] = updateRow(row, {height});

    this.update({items: newItems});
  }

  handleInteraction() {
    const {onInteraction} = this.props;

    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  update({items}) {
    this.setState({items});

    this.save(items);
  }

  save(items) {
    const {id} = this.props;

    this.props.saveSettings(id, {rows: items});

    this.handleInteraction();
  }

  render() {
    let {
      items,
    } = this.props;
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

    const displaysById = getDisplaysById(items);

    const getDisplayComponent = displayId => this.components[displayId];
    const getDisplaySettings = id => displaysById[id];
    const isAllowed = id => {
      const settings = getDisplaySettings(id);
      return isDefined(settings) &&
        isDefined(getDisplayComponent(settings.displayId));
    };

    const other = excludeObjectProps(props, ownPropNames);

    items = filterItems(items, isAllowed);
    return (
      <Grid
        items={getGridItems(items)}
        maxItemsPerRow={maxItemsPerRow}
        maxRows={maxRows}
        onChange={this.handleItemsChange}
        onRowResize={this.handleRowResize}
      >
        {({
          id,
          dragHandleProps,
          height,
          width,
        }) => {
          const {displayId, ...displayProps} = getDisplaySettings(id);
          const Component = getDisplayComponent(displayId);
          return (
            <Component
              {...other}
              {...displayProps}
              dragHandleProps={dragHandleProps}
              height={height}
              width={width}
              id={id}
              onFilterIdChanged={
                filterId => this.handleUpdateDisplay(id, {filterId})}
              onInteractive={this.props.onInteraction}
              onRemoveClick={() => this.handleRemoveDisplay(id)}
            />
          );
        }}
      </Grid>
    );
  }
}

const itemPropType = PropTypes.shape({
  id: PropTypes.id.isRequired,
  displayId: PropTypes.string.isRequired,
});

const rowPropType = PropTypes.shape({
  id: PropTypes.id.isRequired,
  items: PropTypes.arrayOf(itemPropType).isRequired,
  height: PropTypes.number,
});

Dashboard.propTypes = {
  defaultDisplays: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
  error: PropTypes.toString,
  filter: PropTypes.filter,
  id: PropTypes.id.isRequired,
  isLoading: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(rowPropType),
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
  const error = settingsSelector.getError(id);

  let items;
  if (hasLoaded && isDefined(settings.rows)) {
    items = settings.rows;
  }
  else if (hasLoaded) {
    items = defaults.rows;
  }
  return {
    error,
    isLoading: settingsSelector.getIsLoading(id),
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
