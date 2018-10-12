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
import {
  convertDefaultDisplays,
  convertDisplaysToGridItems,
  convertGridItemsToDisplays,
  filterDisplays,
  getDisplaysById,
  removeDisplay,
} from 'web/components/dashboard/utils';

import Loading from 'web/components/loading/loading';

import Grid from 'web/components/sortable/grid';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';
import compose from 'web/utils/compose';

import {getDisplay} from './registry';
import {getRows} from './utils';

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
    const rows = this.getRows();

    const displaysById = getDisplaysById(rows);

    this.updateRows(convertGridItemsToDisplays(gridItems, displaysById));
  }

  handleUpdateDisplay(id, props) {
    const rows = this.getRows();

    const rowIndex = rows.findIndex(
      row => row.items.some(item => item.id === id));

    const row = rows[rowIndex];

    const rowItems = [
      ...row.items,
    ];

    const displayIndex = rowItems.findIndex(i => i.id === id);

    rowItems[displayIndex] = {
      ...rowItems[displayIndex],
      ...props,
    };

    const newRows = [...rows];
    newRows[rowIndex] = {
      ...row,
      rows: rowItems,
    };

    this.updateRows(newRows);
  }

  handleRemoveDisplay(id) {
    const rows = this.getRows();

    this.updateRows(removeDisplay(rows, id));
  }

  handleRowResize(rowId, height) {
    const rows = this.getRows([]);

    const rowIndex = rows.findIndex(row => row.id === rowId);
    const row = rows[rowIndex];

    const newRows = [
      ...rows,
    ];
    newRows[rowIndex] = {
      ...row,
      height,
    };

    this.updateRows(newRows);
  }

  getRows(defaultRows) {
    return getRows(this.props.settings, defaultRows);
  }

  handleInteraction() {
    const {onInteraction} = this.props;

    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  updateRows(rows) {
    this.save({rows});
  }

  save(settings) {
    const {id} = this.props;

    this.props.saveSettings(id, settings);

    this.handleInteraction();
  }

  render() {
    const {
      error,
      isLoading,
      maxItemsPerRow = DEFAULT_MAX_ITEMS_PER_ROW,
      maxRows = DEFAULT_MAX_ROWS,
      ...props
    } = this.props;
    const rows = this.getRows();

    if (isDefined(error) && !isLoading) {
      return (
        <RowPlaceHolder>
          {_('Could not load dashboard settings. Reason: {{error}}', {error})}
        </RowPlaceHolder>
      );
    }
    else if (!isDefined(rows) && isLoading) {
      return (
        <RowPlaceHolder>
          <Loading />
        </RowPlaceHolder>
      );
    }

    const displaysById = getDisplaysById(rows);

    const getDisplayComponent = displayId => this.components[displayId];
    const getDisplaySettings = id => displaysById[id];
    const isAllowed = id => {
      const settings = getDisplaySettings(id);
      return isDefined(settings) &&
        isDefined(getDisplayComponent(settings.displayId));
    };

    const other = excludeObjectProps(props, ownPropNames);

    return (
      <Grid
        items={convertDisplaysToGridItems(filterDisplays(rows, isAllowed))}
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
  loadSettings: PropTypes.func.isRequired,
  maxItemsPerRow: PropTypes.number,
  maxRows: PropTypes.number,
  permittedDisplays: PropTypes.arrayOf(PropTypes.string).isRequired,
  saveSettings: PropTypes.func.isRequired,
  setDefaultSettings: PropTypes.func.isRequired,
  settings: PropTypes.shape({
    rows: PropTypes.arrayOf(rowPropType),
  }),
  onFilterChanged: PropTypes.func,
  onInteraction: PropTypes.func,
};


const mapStateToProps = (rootState, {id}) => {
  const settingsSelector = DashboardSettings(rootState);
  const settings = settingsSelector.getById(id);
  const error = settingsSelector.getError(id);
  const isLoading = settingsSelector.getIsLoading(id);
  return {
    error,
    isLoading,
    settings,
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
