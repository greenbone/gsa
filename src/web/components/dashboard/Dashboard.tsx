/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {type ThunkDispatch} from '@reduxjs/toolkit';
import memoize from 'memoize-one';
import {connect} from 'react-redux';
import {type Action} from 'redux';
import styled from 'styled-components';
import {DEFAULT_ROW_HEIGHT} from 'gmp/commands/dashboards';
import Logger from 'gmp/log';
import {isDefined} from 'gmp/utils/identity';
import {excludeObjectProps} from 'gmp/utils/object';
import {
  getDisplay,
  type DisplayComponent,
} from 'web/components/dashboard/registry';
import {
  convertDefaultDisplays,
  convertDisplaysToGridItems,
  convertGridItemsToDisplays,
  filterDisplays,
  getDisplaysById,
  getRows,
  removeDisplay,
  type DashboardDisplay as DashboardDisplayData,
  type DashboardRow as DashboardRowData,
  type DashboardSettings as DashboardSettingsData,
  type GridItem,
} from 'web/components/dashboard/utils';
import ErrorBoundary from 'web/components/error/ErrorBoundary';
import Loading from 'web/components/loading/Loading';
import SortableGrid, {
  type SortableGridRow,
} from 'web/components/sortable/SortableGrid';
import {type SortableItemRenderProps} from 'web/components/sortable/SortableItem';
import {
  loadSettings,
  saveSettings,
  setDashboardSettingDefaults,
} from 'web/store/dashboard/settings/actions';
import DashboardSettingsSelector from 'web/store/dashboard/settings/selectors';
import compose from 'web/utils/compose';
import withGmp, {type WithGmpComponentProps} from 'web/utils/withGmp';
import {
  type WithTranslationComponentProps,
  default as withTranslation,
} from 'web/utils/withTranslation';

interface DashboardDisplayState {
  showLegend?: boolean;
  show3d?: boolean;
}

interface DashboardDisplay extends DashboardDisplayData {
  filterId?: string;
  state?: DashboardDisplayState;
}

interface DashboardRow extends Omit<DashboardRowData, 'items'> {
  items: DashboardDisplay[];
}

interface DashboardSettingsModel extends Omit<DashboardSettingsData, 'rows'> {
  rows?: DashboardRow[];
}

interface DashboardProps
  extends WithTranslationComponentProps, WithGmpComponentProps {
  defaultDisplays?: string[][];
  error?: Error;
  filter?: unknown;
  id: string;
  isLoading: boolean;
  loadSettings: (id: string, defaults: DashboardSettingsModel) => void;
  maxItemsPerRow?: number;
  maxRows?: number;
  notify?: (message: string) => void;
  onFilterChanged?: (filter: unknown) => void;
  permittedDisplays: string[];
  saveSettings: (id: string, settings: DashboardSettingsModel) => void;
  setDefaultSettings: (id: string, settings: DashboardSettingsModel) => void;
  settings?: DashboardSettingsModel;
  showFilterSelection?: boolean;
  showFilterString?: boolean;
  [key: string]: unknown;
}

type DashboardDispatch = ThunkDispatch<
  Record<string, unknown>,
  unknown,
  Action<string>
>;

export const DEFAULT_MAX_ITEMS_PER_ROW = 4;
export const DEFAULT_MAX_ROWS = 4;

const log = Logger.getLogger('web.components.dashboard');

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

class Dashboard extends React.Component<DashboardProps> {
  private components: Record<string, DisplayComponent> = {};

  private getDisplaysById = memoize((rows: DashboardRow[] = []) =>
    getDisplaysById(rows),
  );

  constructor(props: DashboardProps) {
    super(props);

    const {permittedDisplays = []} = this.props;

    permittedDisplays.forEach((displayId: string) => {
      const display = getDisplay(displayId);

      if (isDefined(display)) {
        this.components[displayId] = display.component;
      } else {
        log.warn('Unknown Dashboard display', displayId);
      }
    });
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
    const defaults: DashboardSettingsModel = {
      ...defaultDashboardSettings,
      permittedDisplays,
      maxItemsPerRow,
      maxRows,
    };

    this.props.setDefaultSettings(id, defaultDashboardSettings);
    this.props.loadSettings(id, defaults);
  }

  handleItemsChange = (gridItems: SortableGridRow[] = []) => {
    const rows = this.getRows() ?? [];
    const displaysById = this.getDisplaysById(rows);

    this.updateRows(
      convertGridItemsToDisplays(gridItems as GridItem[], displaysById),
    );
  };

  handleUpdateDisplay = (id: string, props: Partial<DashboardDisplay>) => {
    this.updateDisplay(id, props);
  };

  handleRemoveDisplay = (id: string) => {
    const rows = this.getRows() ?? [];

    this.updateRows(removeDisplay(rows, id));
  };

  handleRowResize = (rowId: string, height: number) => {
    const rows = this.getRows([]) ?? [];

    const rowIndex = rows.findIndex(row => row.id === rowId);
    const row = rows[rowIndex];

    const newRows = [...rows];
    const newRow = {
      ...row,
      height,
    };
    newRows[rowIndex] = newRow;

    this.updateRows(newRows);
  };

  handleSetDisplayState = (
    id: string,
    stateFunc: (
      currentState: DashboardDisplayState | undefined,
    ) => DashboardDisplayState,
  ) => {
    const currentState = this.getDisplayState(id);
    const newState = stateFunc(currentState);

    this.updateDisplayState(id, {
      ...currentState,
      ...newState,
    });
  };

  getRows(defaultRows?: DashboardRow[]) {
    return getRows(this.props.settings, defaultRows) as DashboardRow[];
  }

  getDisplayState(id: string) {
    const rows = this.getRows() ?? [];
    const displaysById = this.getDisplaysById(rows);
    const display = displaysById[id] as DashboardDisplay | undefined;
    return isDefined(display) ? display.state : undefined;
  }

  updateDisplayState(id: string, state: DashboardDisplayState) {
    this.updateDisplay(id, {state});
  }

  updateDisplay(id: string, props: Partial<DashboardDisplay>) {
    const rows = this.getRows() ?? [];

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

  updateRows(rows: DashboardRow[]) {
    this.save({rows});
  }

  save(settings: DashboardSettingsModel) {
    const {id} = this.props;

    this.props.saveSettings(id, settings);
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

    const displaysById = this.getDisplaysById(rows ?? []);

    const getDisplayComponent = (
      displayId: string,
    ): React.ComponentType<Record<string, unknown>> | undefined =>
      this.components[displayId];
    const getDisplaySettings = (id: string) => displaysById[id];
    const isAllowed = (id: string) => {
      const settings = getDisplaySettings(id);
      return (
        isDefined(settings) &&
        isDefined(getDisplayComponent(settings.displayId))
      );
    };

    const other = excludeObjectProps(props, ownPropNames);

    return (
      <ErrorBoundary message={_('An error occurred on this dashboard.')}>
        <SortableGrid
          items={convertDisplaysToGridItems(
            filterDisplays(rows ?? [], isAllowed),
          )}
          maxItemsPerRow={maxItemsPerRow}
          maxRows={maxRows}
          onChange={this.handleItemsChange}
          onRowResize={this.handleRowResize}
        >
          {({id, dragHandleRef, height, width}: SortableItemRenderProps) => {
            const displaySettings = getDisplaySettings(id);
            if (!isDefined(displaySettings)) {
              return null;
            }

            const {displayId, ...displayProps} = displaySettings;
            const Component = getDisplayComponent(displayId);
            if (!isDefined(Component)) {
              return null;
            }

            const state = this.getDisplayState(id);
            return (
              <Component
                {...other}
                {...displayProps}
                dragHandleRef={dragHandleRef}
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
                onRemoveClick={() => this.handleRemoveDisplay(id)}
              />
            );
          }}
        </SortableGrid>
      </ErrorBoundary>
    );
  }
}

export const TranslatedDashboard = withTranslation(Dashboard);

const mapStateToProps = (rootState: unknown, {id}: DashboardProps) => {
  const settingsSelector = DashboardSettingsSelector(rootState);
  const settings = settingsSelector.getById(id) as DashboardSettingsModel;
  const error = settingsSelector.getError(id) as Error | undefined;
  const isLoading = settingsSelector.getIsLoading(id) as boolean;

  return {
    error,
    isLoading,
    settings,
  };
};

const mapDispatchToProps = (
  dispatch: DashboardDispatch,
  {gmp}: DashboardProps,
) => ({
  loadSettings: (id: string, defaults: DashboardSettingsModel) =>
    dispatch(
      loadSettings(gmp)(id, defaults) as Parameters<DashboardDispatch>[0],
    ),
  saveSettings: (id: string, settings: DashboardSettingsModel) =>
    dispatch(
      saveSettings(gmp)(id, settings) as Parameters<DashboardDispatch>[0],
    ),
  setDefaultSettings: (id: string, settings: DashboardSettingsModel) =>
    dispatch(setDashboardSettingDefaults(id, settings)),
});

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(Dashboard);
