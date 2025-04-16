/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {DEFAULT_ROW_HEIGHT} from 'gmp/commands/dashboards';
import Logger from 'gmp/log';
import {isDefined} from 'gmp/utils/identity';
import {excludeObjectProps} from 'gmp/utils/object';
import memoize from 'memoize-one';
import React from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import {getDisplay} from 'web/components/dashboard/Registry';
import {
  convertDefaultDisplays,
  convertDisplaysToGridItems,
  convertGridItemsToDisplays,
  filterDisplays,
  getDisplaysById,
  removeDisplay,
  getRows,
} from 'web/components/dashboard/Utils';
import ErrorBoundary from 'web/components/error/ErrorBoundary';
import Loading from 'web/components/loading/Loading';
import Grid from 'web/components/sortable/Grid';
import {
  loadSettings,
  saveSettings,
  setDashboardSettingDefaults,
} from 'web/store/dashboard/settings/actions';
import DashboardSettings from 'web/store/dashboard/settings/selectors';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import withGmp from 'web/utils/withGmp';
import withTranslation from 'web/utils/withTranslation';

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

class Dashboard extends React.Component {
  constructor(...args) {
    super(...args);

    const {permittedDisplays = []} = this.props;

    this.components = {};
    permittedDisplays.forEach(displayId => {
      const display = getDisplay(displayId);

      if (isDefined(display)) {
        this.components[displayId] = display.component;
      } else {
        log.warn('Unknown Dashboard display', displayId);
      }
    });

    this.handleItemsChange = this.handleItemsChange.bind(this);
    this.handleRowResize = this.handleRowResize.bind(this);
    this.handleUpdateDisplay = this.handleUpdateDisplay.bind(this);
    this.handleRemoveDisplay = this.handleRemoveDisplay.bind(this);

    this.getDisplaysById = memoize(rows => getDisplaysById(rows));
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

    const displaysById = this.getDisplaysById(rows);

    this.updateRows(convertGridItemsToDisplays(gridItems, displaysById));
  }

  handleUpdateDisplay(id, props) {
    this.updateDisplay(id, props);
  }

  handleRemoveDisplay(id) {
    const rows = this.getRows();

    this.updateRows(removeDisplay(rows, id));
  }

  handleRowResize(rowId, height) {
    const rows = this.getRows([]);

    const rowIndex = rows.findIndex(row => row.id === rowId);
    const row = rows[rowIndex];

    const newRows = [...rows];
    const newRow = {
      ...row,
      height,
    };
    newRows[rowIndex] = newRow;

    this.updateRows(newRows);
  }

  handleInteraction() {
    const {onInteraction} = this.props;

    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  handleSetDisplayState(id, stateFunc) {
    const currentState = this.getDisplayState(id);
    const newState = stateFunc(currentState);

    this.updateDisplayState(id, {
      ...currentState,
      ...newState,
    });
  }

  getRows(defaultRows) {
    return getRows(this.props.settings, defaultRows);
  }

  getDisplayState(id) {
    const rows = this.getRows();
    const displaysById = this.getDisplaysById(rows);
    const display = displaysById[id];
    return isDefined(display) ? display.state : undefined;
  }

  updateDisplayState(id, state) {
    this.updateDisplay(id, {state});
  }

  updateDisplay(id, props) {
    const rows = this.getRows();

    const rowIndex = rows.findIndex(row =>
      row.items.some(item => item.id === id),
    );

    const row = rows[rowIndex];

    const rowItems = [...row.items];

    const displayIndex = rowItems.findIndex(i => i.id === id);

    const newDisplay = {
      ...rowItems[displayIndex],
      ...props,
    };

    rowItems[displayIndex] = newDisplay;

    const newRows = [...rows];
    const newRow = {
      ...row,
      items: rowItems,
    };

    newRows[rowIndex] = newRow;

    this.updateRows(newRows);
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
    const {_} = this.props;

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

    const displaysById = this.getDisplaysById(rows);

    const getDisplayComponent = displayId => this.components[displayId];
    const getDisplaySettings = id => displaysById[id];
    const isAllowed = id => {
      const settings = getDisplaySettings(id);
      return (
        isDefined(settings) &&
        isDefined(getDisplayComponent(settings.displayId))
      );
    };

    const other = excludeObjectProps(props, ownPropNames);

    return (
      <ErrorBoundary message={_('An error occurred on this dashboard.')}>
        <Grid
          items={convertDisplaysToGridItems(filterDisplays(rows, isAllowed))}
          maxItemsPerRow={maxItemsPerRow}
          maxRows={maxRows}
          onChange={this.handleItemsChange}
          onRowResize={this.handleRowResize}
        >
          {({id, dragHandleProps, height, width}) => {
            const {displayId, ...displayProps} = getDisplaySettings(id);
            const Component = getDisplayComponent(displayId);
            const state = this.getDisplayState(id);
            return (
              <Component
                {...other}
                {...displayProps}
                dragHandleProps={dragHandleProps}
                height={height}
                id={id}
                setState={stateFunc =>
                  this.handleSetDisplayState(id, stateFunc)
                }
                state={state}
                width={width}
                onFilterIdChanged={filterId =>
                  this.handleUpdateDisplay(id, {filterId})
                }
                onInteractive={this.props.onInteraction}
                onRemoveClick={() => this.handleRemoveDisplay(id)}
              />
            );
          }}
        </Grid>
      </ErrorBoundary>
    );
  }
}

export const TranslatedDashboard = withTranslation(Dashboard);

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
  _: PropTypes.func.isRequired,
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
  loadSettings: (id, defaults) => dispatch(loadSettings(gmp)(id, defaults)),
  saveSettings: (id, settings) => dispatch(saveSettings(gmp)(id, settings)),
  setDefaultSettings: (id, settings) =>
    dispatch(setDashboardSettingDefaults(id, settings)),
});

export default compose(withTranslation, withGmp, connect(mapStateToProps, mapDispatchToProps))(Dashboard);
