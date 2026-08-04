/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useMemo} from 'react';
import {type ThunkDispatch} from '@reduxjs/toolkit';
import memoize from 'memoize-one';
import {connect} from 'react-redux';
import {type Action} from 'redux';
import styled from 'styled-components';
import {DEFAULT_ROW_HEIGHT} from 'gmp/commands/dashboards';
import type Gmp from 'gmp/gmp';
import Logger from 'gmp/log';
import type QueryFilter from 'gmp/models/filter/query-filter';
import {isDefined} from 'gmp/utils/identity';
import {excludeObjectProps} from 'gmp/utils/object';
import {
  type DisplayState,
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
  type DashboardSettings,
  type GridItem,
} from 'web/components/dashboard/utils';
import ErrorBoundary from 'web/components/error/ErrorBoundary';
import Loading from 'web/components/loading/Loading';
import SortableGrid, {
  type SortableGridRow,
} from 'web/components/sortable/SortableGrid';
import {type SortableItemRenderProps} from 'web/components/sortable/SortableItem';
import useTranslation from 'web/hooks/useTranslation';
import {
  loadSettings,
  saveSettings,
  setDashboardSettingDefaults,
} from 'web/store/dashboard/settings/actions';
import DashboardSettingsSelector from 'web/store/dashboard/settings/selectors';
import compose from 'web/utils/compose';
import withGmp from 'web/utils/withGmp';

interface DashboardDisplay extends DashboardDisplayData {
  filterId?: string;
  state?: DisplayState;
}

interface DashboardRow extends Omit<DashboardRowData, 'items'> {
  items: DashboardDisplay[];
}

interface DashboardProps {
  defaultDisplays?: string[][];
  error?: Error;
  filter?: QueryFilter;
  id: string;
  isLoading: boolean;
  loadSettings: (id: string, defaults: DashboardSettings) => void;
  maxItemsPerRow?: number;
  maxRows?: number;
  notify?: (message: string) => void;
  onFilterChanged?: (filter: QueryFilter) => void;
  permittedDisplays: string[];
  saveSettings: (id: string, settings: DashboardSettings) => void;
  setDefaultSettings: (id: string, settings: DashboardSettings) => void;
  settings?: DashboardSettings;
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

export const Dashboard = ({
  defaultDisplays,
  error,
  id,
  isLoading,
  loadSettings,
  maxItemsPerRow = DEFAULT_MAX_ITEMS_PER_ROW,
  maxRows = DEFAULT_MAX_ROWS,
  permittedDisplays,
  saveSettings,
  setDefaultSettings,
  settings,
  ...otherProps
}: DashboardProps) => {
  const [_] = useTranslation();
  const components = useMemo(() => {
    const mappedComponents: Record<string, DisplayComponent> = {};

    (permittedDisplays ?? []).forEach((displayId: string) => {
      const display = getDisplay(displayId);

      if (isDefined(display)) {
        mappedComponents[displayId] = display.component;
      } else {
        log.warn('Unknown Dashboard display', displayId);
      }
    });

    return mappedComponents;
  }, [permittedDisplays]);

  const getDisplaysByIdMemoized = useMemo(
    () => memoize((rows: DashboardRow[] = []) => getDisplaysById(rows)),
    [],
  );

  const getRowsFromSettings = useCallback(
    (defaultRows?: DashboardRow[]) =>
      getRows(settings, defaultRows) as DashboardRow[],
    [settings],
  );

  useEffect(() => {
    const defaultDashboardSettings = convertDefaultDisplays(defaultDisplays);
    const defaults: DashboardSettings = {
      ...defaultDashboardSettings,
      permittedDisplays,
      maxItemsPerRow,
      maxRows,
    };

    setDefaultSettings(id, defaultDashboardSettings);
    loadSettings(id, defaults);
  }, [
    defaultDisplays,
    id,
    loadSettings,
    maxItemsPerRow,
    maxRows,
    permittedDisplays,
    setDefaultSettings,
  ]);

  const rows = getRowsFromSettings();
  const displaysById = getDisplaysByIdMemoized(rows ?? []);

  const getDisplayComponent = useCallback(
    (displayId: string): DisplayComponent | undefined => components[displayId],
    [components],
  );

  const getDisplayState = useCallback(
    (displayId: string) => {
      const display = displaysById[displayId] as DashboardDisplay | undefined;
      return isDefined(display) ? display.state : undefined;
    },
    [displaysById],
  );

  const updateRows = useCallback(
    (nextRows: DashboardRow[]) => {
      saveSettings(id, {rows: nextRows});
    },
    [id, saveSettings],
  );

  const updateDisplay = useCallback(
    (displayId: string, displayProps: Partial<DashboardDisplay>) => {
      const currentRows = getRowsFromSettings() ?? [];

      const rowIndex = currentRows.findIndex(row =>
        row.items.some(item => item.id === displayId),
      );

      if (rowIndex < 0) {
        return;
      }

      const row = currentRows[rowIndex];
      const rowItems = [...row.items];
      const displayIndex = rowItems.findIndex(item => item.id === displayId);

      if (displayIndex < 0) {
        return;
      }

      rowItems[displayIndex] = {
        ...rowItems[displayIndex],
        ...displayProps,
      };

      const newRows = [...currentRows];
      newRows[rowIndex] = {
        ...row,
        items: rowItems,
      };

      updateRows(newRows);
    },
    [getRowsFromSettings, updateRows],
  );

  const handleItemsChange = useCallback(
    (gridItems: SortableGridRow[] = []) => {
      const currentRows = getRowsFromSettings() ?? [];
      const currentDisplaysById = getDisplaysByIdMemoized(currentRows);

      updateRows(
        convertGridItemsToDisplays(
          gridItems as GridItem[],
          currentDisplaysById,
        ),
      );
    },
    [getDisplaysByIdMemoized, getRowsFromSettings, updateRows],
  );

  const handleRemoveDisplay = useCallback(
    (displayId: string) => {
      const currentRows = getRowsFromSettings() ?? [];
      updateRows(removeDisplay(currentRows, displayId));
    },
    [getRowsFromSettings, updateRows],
  );

  const handleRowResize = useCallback(
    (rowId: string, height: number) => {
      const currentRows = getRowsFromSettings([]) ?? [];
      const rowIndex = currentRows.findIndex(row => row.id === rowId);

      if (rowIndex < 0) {
        return;
      }

      const newRows = [...currentRows];
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        height,
      };

      updateRows(newRows);
    },
    [getRowsFromSettings, updateRows],
  );

  const handleSetDisplayState = useCallback(
    (
      displayId: string,
      stateFunc: (currentState: DisplayState | undefined) => DisplayState,
    ) => {
      const currentState = getDisplayState(displayId);
      const newState = stateFunc(currentState);

      updateDisplay(displayId, {
        state: {
          ...currentState,
          ...newState,
        },
      });
    },
    [getDisplayState, updateDisplay],
  );

  const handleUpdateDisplay = useCallback(
    (displayId: string, displayProps: Partial<DashboardDisplay>) => {
      updateDisplay(displayId, displayProps);
    },
    [updateDisplay],
  );

  if (isDefined(error) && !isLoading) {
    return (
      <RowPlaceHolder>
        {_('Could not load dashboard settings. Reason: {{error}}', {
          error: error.message,
        })}
      </RowPlaceHolder>
    );
  }

  if (!isDefined(rows) && isLoading) {
    return (
      <RowPlaceHolder>
        <Loading />
      </RowPlaceHolder>
    );
  }

  const getDisplaySettings = (displayId: string) => displaysById[displayId];
  const isAllowed = (displayId: string) => {
    const displaySettings = getDisplaySettings(displayId);
    return (
      isDefined(displaySettings) &&
      isDefined(getDisplayComponent(displaySettings.displayId))
    );
  };

  const other = excludeObjectProps(otherProps, ownPropNames);

  return (
    <ErrorBoundary message={_('An error occurred on this dashboard.')}>
      <SortableGrid
        items={convertDisplaysToGridItems(
          filterDisplays(rows ?? [], isAllowed),
        )}
        maxItemsPerRow={maxItemsPerRow}
        maxRows={maxRows}
        onChange={handleItemsChange}
        onRowResize={handleRowResize}
      >
        {({
          id: displayId,
          dragHandleRef,
          height,
          width,
        }: SortableItemRenderProps) => {
          const displaySettings = getDisplaySettings(displayId);
          if (!isDefined(displaySettings)) {
            return null;
          }

          const {displayId: registeredDisplayId, ...displayProps} =
            displaySettings;
          const Component = getDisplayComponent(registeredDisplayId);
          if (!isDefined(Component)) {
            return null;
          }

          const state = getDisplayState(displayId);

          return (
            <Component
              {...other}
              {...displayProps}
              dragHandleRef={dragHandleRef}
              height={height}
              id={displayId}
              setState={stateFunc =>
                handleSetDisplayState(displayId, stateFunc)
              }
              state={state}
              width={width}
              onFilterIdChanged={(filterId: string) =>
                handleUpdateDisplay(displayId, {filterId})
              }
              onRemoveClick={() => handleRemoveDisplay(displayId)}
            />
          );
        }}
      </SortableGrid>
    </ErrorBoundary>
  );
};

const mapStateToProps = (rootState: unknown, {id}: DashboardProps) => {
  const settingsSelector = DashboardSettingsSelector(rootState);
  const settings = settingsSelector.getById(id) as
    DashboardSettings | undefined;
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
  {gmp}: {gmp: Gmp},
) => ({
  loadSettings: (id: string, defaults: DashboardSettings) =>
    dispatch(loadSettings(gmp)(id, defaults)),
  saveSettings: (id: string, settings: DashboardSettings) =>
    dispatch(saveSettings(gmp)(id, settings)),
  setDefaultSettings: (id: string, settings: DashboardSettings) =>
    dispatch(setDashboardSettingDefaults(id, settings)),
});

export default compose(
  withGmp,
  // @ts-expect-error connect types don't match with the component props
  connect(mapStateToProps, mapDispatchToProps),
)(Dashboard);
