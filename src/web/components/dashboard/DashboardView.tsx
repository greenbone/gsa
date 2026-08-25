/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useMemo, useRef} from 'react';
import styled from 'styled-components';
import {DEFAULT_ROW_HEIGHT} from 'gmp/commands/dashboards';
import Logger from 'gmp/log';
import {type FilterType} from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import {
  type DisplayState,
  getDisplay,
  type DisplayComponent,
  type DisplayProps,
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
import useLatestCallback from 'web/hooks/useLatestCallback';
import useTranslation from 'web/hooks/useTranslation';

interface DashboardDisplay extends DashboardDisplayData {
  filterId?: string;
  state?: DisplayState;
}

interface DashboardDisplayProps extends DisplayProps {
  filter?: FilterType;
  notify?: (message: string) => void;
  showFilterSelection?: boolean;
  showFilterString?: boolean;
  onFilterChanged?: (filter: FilterType) => void;
}

interface DashboardRow extends Omit<DashboardRowData, 'items'> {
  items: DashboardDisplay[];
}

interface DashboardViewProps {
  defaultDisplays?: string[][];
  filter?: FilterType;
  id: string;
  maxItemsPerRow?: number;
  maxRows?: number;
  permittedDisplays: string[];
  showFilterSelection?: boolean;
  showFilterString?: boolean;
  notify?: (message: string) => void;
  onFilterChanged?: (filter: FilterType) => void;
  error?: Error;
  isLoading: boolean;
  loadSettings: (id: string, defaults: DashboardSettings) => void;
  saveSettings: (id: string, settings: DashboardSettings) => void;
  setDefaultSettings: (id: string, settings: DashboardSettings) => void;
  settings?: DashboardSettings;
}

export const DEFAULT_MAX_ITEMS_PER_ROW = 4;
export const DEFAULT_MAX_ROWS = 4;

const log = Logger.getLogger('web.components.dashboard');

const RowPlaceHolder = styled.div<{$height: number}>`
  display: flex;
  flex-grow: 1;
  width: 100%;
  height: ${props => props.$height}px;
  justify-content: center;
  align-items: center;
  margin: 15px 0;
`;

const DashboardView = ({
  defaultDisplays,
  error,
  filter,
  id,
  isLoading,
  loadSettings,
  maxItemsPerRow = DEFAULT_MAX_ITEMS_PER_ROW,
  maxRows = DEFAULT_MAX_ROWS,
  notify,
  permittedDisplays,
  saveSettings,
  setDefaultSettings,
  settings,
  showFilterSelection = false,
  showFilterString = false,
  onFilterChanged,
}: DashboardViewProps) => {
  const [_] = useTranslation();
  const callLoadSettings = useLatestCallback(loadSettings);
  const callSetDefaultSettings = useLatestCallback(setDefaultSettings);
  const permittedDisplaysSignature = JSON.stringify(permittedDisplays ?? []);
  const defaultDisplaysSignature = JSON.stringify(defaultDisplays ?? []);

  const stablePermittedDisplaysRef = useRef(permittedDisplays ?? []);
  const permittedDisplaysSignatureRef = useRef(permittedDisplaysSignature);
  const defaultDashboardSettingsRef = useRef(
    convertDefaultDisplays(defaultDisplays),
  );
  const defaultDisplaysSignatureRef = useRef(defaultDisplaysSignature);

  if (permittedDisplaysSignatureRef.current !== permittedDisplaysSignature) {
    stablePermittedDisplaysRef.current = permittedDisplays ?? [];
    permittedDisplaysSignatureRef.current = permittedDisplaysSignature;
  }

  if (defaultDisplaysSignatureRef.current !== defaultDisplaysSignature) {
    defaultDashboardSettingsRef.current =
      convertDefaultDisplays(defaultDisplays);
    defaultDisplaysSignatureRef.current = defaultDisplaysSignature;
  }

  const defaultDashboardSettings = defaultDashboardSettingsRef.current;
  const stablePermittedDisplays = stablePermittedDisplaysRef.current;

  const defaults = useMemo(
    () => ({
      ...defaultDashboardSettings,
      permittedDisplays: stablePermittedDisplays,
      maxItemsPerRow,
      maxRows,
    }),
    [
      defaultDashboardSettings,
      maxItemsPerRow,
      maxRows,
      stablePermittedDisplays,
    ],
  );

  const components = useMemo(() => {
    const mappedComponents: Record<string, DisplayComponent> = {};

    stablePermittedDisplays.forEach((displayId: string) => {
      const display = getDisplay(displayId);

      if (isDefined(display)) {
        mappedComponents[displayId] = display.component;
      } else {
        log.warn('Unknown Dashboard display', displayId);
      }
    });

    return mappedComponents;
  }, [stablePermittedDisplays]);

  const getRowsFromSettings = useCallback(
    (defaultRows?: DashboardRow[]) =>
      getRows(settings, defaultRows) as DashboardRow[],
    [settings],
  );

  useEffect(() => {
    callSetDefaultSettings(id, defaultDashboardSettings);
    callLoadSettings(id, defaults);
  }, [
    callLoadSettings,
    callSetDefaultSettings,
    defaultDashboardSettings,
    defaults,
    id,
  ]);

  const rows = getRowsFromSettings();
  const displaysById = useMemo(() => getDisplaysById(rows ?? []), [rows]);

  const getDisplayComponent = useCallback(
    (displayId: string): DisplayComponent<DashboardDisplayProps> | undefined =>
      components[displayId],
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

      if (rowIndex < 0) return;

      const row = currentRows[rowIndex];
      const rowItems = [...row.items];
      const displayIndex = rowItems.findIndex(item => item.id === displayId);

      if (displayIndex < 0) return;

      rowItems[displayIndex] = {...rowItems[displayIndex], ...displayProps};
      const newRows = [...currentRows];
      newRows[rowIndex] = {...row, items: rowItems};
      updateRows(newRows);
    },
    [getRowsFromSettings, updateRows],
  );

  const handleItemsChange = useCallback(
    (gridItems: SortableGridRow[] = []) => {
      const currentRows = getRowsFromSettings() ?? [];
      const currentDisplaysById = getDisplaysById(currentRows);
      updateRows(
        convertGridItemsToDisplays(
          gridItems as GridItem[],
          currentDisplaysById,
        ),
      );
    },
    [getRowsFromSettings, updateRows],
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
      if (rowIndex < 0) return;

      const newRows = [...currentRows];
      newRows[rowIndex] = {...newRows[rowIndex], height};
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
      updateDisplay(displayId, {
        state: {...currentState, ...stateFunc(currentState)},
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
      <RowPlaceHolder $height={DEFAULT_ROW_HEIGHT}>
        {_('Could not load dashboard settings. Reason: {{error}}', {
          error: error.message,
        })}
      </RowPlaceHolder>
    );
  }

  if (!isDefined(rows) && (isLoading || !isDefined(settings))) {
    const loadingRowCount = Math.max(defaultDisplays?.length ?? 0, 1);
    return (
      <RowPlaceHolder $height={loadingRowCount * DEFAULT_ROW_HEIGHT}>
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
          if (!isDefined(displaySettings)) return null;

          const {displayId: registeredDisplayId, ...displayProps} =
            displaySettings;
          const Component = getDisplayComponent(registeredDisplayId);
          if (!isDefined(Component)) return null;

          const state = getDisplayState(displayId);
          return (
            <Component
              {...displayProps}
              dragHandleRef={dragHandleRef}
              filter={filter}
              height={height}
              id={displayId}
              notify={notify}
              setState={stateFunc =>
                handleSetDisplayState(displayId, stateFunc)
              }
              showFilterSelection={showFilterSelection}
              showFilterString={showFilterString}
              state={state}
              width={width}
              onFilterChanged={onFilterChanged}
              onFilterIdChanged={filterId =>
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

export default DashboardView;
