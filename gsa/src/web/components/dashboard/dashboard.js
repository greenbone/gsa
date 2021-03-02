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

import React, {useEffect} from 'react';

import {connect} from 'react-redux';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {DEFAULT_ROW_HEIGHT} from 'gmp/commands/dashboards';

import Logger from 'gmp/log';

import {isDefined} from 'gmp/utils/identity';
import {excludeObjectProps} from 'gmp/utils/object';
import {
  convertDefaultDisplays,
  convertDisplaysToGridItems,
  convertGridItemsToDisplays,
  filterDisplays,
  getDisplaysById,
  removeDisplay,
} from 'web/components/dashboard/utils';

import ErrorBoundary from 'web/components/error/errorboundary';

import Loading from 'web/components/loading/loading';

import Grid from 'web/components/sortable/grid';

import {
  loadSettings as loadSettingsAction,
  saveSettings as saveSettingsAction,
  setDashboardSettingDefaults,
} from 'web/store/dashboard/settings/actions';
import DashboardSettings from 'web/store/dashboard/settings/selectors';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';
import compose from 'web/utils/compose';

import {getDisplay} from './registry';
import {getRows as getRowsUtil} from './utils';

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

export const Dashboard = ({
  error,
  id,
  isLoading,
  settings,
  permittedDisplays = [],
  defaultDisplays,
  maxItemsPerRow = DEFAULT_MAX_ITEMS_PER_ROW,
  maxRows = DEFAULT_MAX_ROWS,
  loadSettings,
  saveSettings,
  setDefaultSettings,
  onInteraction,
  ...props
}) => {
  const components = {};
  permittedDisplays.forEach(displayId => {
    const display = getDisplay(displayId);

    if (isDefined(display)) {
      components[displayId] = display.component;
    } else {
      log.warn('Unknown Dashboard display', displayId);
    }
  });

  useEffect(() => {
    const defaultDashboardSettings = convertDefaultDisplays(defaultDisplays);
    const defaults = {
      ...defaultDashboardSettings,
      permittedDisplays,
      maxItemsPerRow,
      maxRows,
    };

    setDefaultSettings(id, defaultDashboardSettings);
    loadSettings(id, defaults);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleItemsChange = (gridItems = []) => {
    const rows = getRows();

    const displaysById = getDisplaysById(rows);

    updateRows(convertGridItemsToDisplays(gridItems, displaysById));
  };

  const handleUpdateDisplay = (displayId, args) => {
    updateDisplay(displayId, args);
  };

  const handleRemoveDisplay = displayId => {
    const rows = getRows();

    updateRows(removeDisplay(rows, displayId));
  };

  const handleRowResize = (rowId, height) => {
    const rows = getRows([]);

    const rowIndex = rows.findIndex(row => row.id === rowId);
    const row = rows[rowIndex];

    const newRows = [...rows];
    const newRow = {
      ...row,
      height,
    };
    newRows[rowIndex] = newRow;

    updateRows(newRows);
  };

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const handleSetDisplayState = (displayId, stateFunc) => {
    const currentState = getDisplayState(displayId);
    const newState = stateFunc(currentState);

    updateDisplayState(displayId, {
      ...currentState,
      ...newState,
    });
  };

  const getRows = defaultRows => {
    return getRowsUtil(settings, defaultRows);
  };

  const getDisplayState = displayId => {
    const rows = getRows();
    const displaysById = getDisplaysById(rows);
    const display = displaysById[displayId];
    return isDefined(display) ? display.state : undefined;
  };

  const updateDisplayState = (displayId, state) => {
    updateDisplay(displayId, {state});
  };

  const updateDisplay = (displayId, args) => {
    const rows = getRows();

    const rowIndex = rows.findIndex(row =>
      row.items.some(item => item.id === displayId),
    );

    const row = rows[rowIndex];

    const rowItems = [...row.items];

    const displayIndex = rowItems.findIndex(i => i.id === displayId);

    const newDisplay = {
      ...rowItems[displayIndex],
      ...args,
    };

    rowItems[displayIndex] = newDisplay;

    const newRows = [...rows];
    const newRow = {
      ...row,
      items: rowItems,
    };

    newRows[rowIndex] = newRow;

    updateRows(newRows);
  };

  const updateRows = rows => {
    save({rows});
  };

  const save = dashboardSettings => {
    saveSettings(id, dashboardSettings);

    handleInteraction();
  };

  let rows;

  if (isDefined(settings)) {
    rows = settings.rows;
  } else {
    rows = getRows();
  }
  if (isDefined(error) && !isLoading && !isDefined(settings)) {
    return (
      <RowPlaceHolder>
        {_('Could not load dashboard settings. Reason: {{error}}', {
          error: error.message,
        })}
      </RowPlaceHolder>
    );
  } else if (!isDefined(rows) && isLoading) {
    return (
      <RowPlaceHolder>
        <Loading />
      </RowPlaceHolder>
    );
  }

  const displaysById = getDisplaysById(rows);

  const getDisplayComponent = displayId => components[displayId];
  const getDisplaySettings = displayId => displaysById[displayId];
  const isAllowed = displayId => {
    const displaySettings = getDisplaySettings(displayId);
    return (
      isDefined(displaySettings) &&
      isDefined(getDisplayComponent(displaySettings.displayId))
    );
  };

  const other = excludeObjectProps(props, ownPropNames);

  return (
    <ErrorBoundary message={_('An error occurred on this dashboard.')}>
      <Grid
        items={convertDisplaysToGridItems(filterDisplays(rows, isAllowed))}
        maxItemsPerRow={maxItemsPerRow}
        maxRows={maxRows}
        onChange={handleItemsChange}
        onRowResize={handleRowResize}
      >
        {({id: itemId, dragHandleProps, height, width}) => {
          const {displayId, ...displayProps} = getDisplaySettings(itemId);
          const Component = getDisplayComponent(displayId);
          const state = getDisplayState(itemId);
          return (
            <Component
              {...other}
              {...displayProps}
              dragHandleProps={dragHandleProps}
              height={height}
              width={width}
              id={itemId}
              state={state}
              setState={stateFunc => handleSetDisplayState(itemId, stateFunc)}
              onFilterIdChanged={filterId =>
                handleUpdateDisplay(itemId, {filterId})
              }
              onInteractive={props.onInteraction}
              onRemoveClick={() => handleRemoveDisplay(itemId)}
            />
          );
        }}
      </Grid>
    </ErrorBoundary>
  );
};

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
    dispatch(loadSettingsAction(gmp)(id, defaults)),
  saveSettings: (id, settings) =>
    dispatch(saveSettingsAction(gmp)(id, settings)),
  setDefaultSettings: (id, settings) =>
    dispatch(setDashboardSettingDefaults(id, settings)),
});

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(Dashboard);

// vim: set ts=2 sw=2 tw=80:
