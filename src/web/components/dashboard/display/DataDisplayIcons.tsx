/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_} from 'gmp/locale/lang';
import {
  DownloadSvgIcon,
  DownloadCsvIcon,
  FilterIcon,
  LegendIcon,
} from 'web/components/icon';

interface DataDisplayIconsState {
  showLegend?: boolean;
}

export interface DataDisplayIconsProps<TState extends DataDisplayIconsState> {
  setState: (func: StateFunc<TState>) => TState;
  showCsvDownload?: boolean;
  showSvgDownload?: boolean;
  showFilterSelection?: boolean;
  showToggleLegend?: boolean;
  onDownloadCsvClick?: () => void;
  onDownloadSvgClick?: () => void;
  onSelectFilterClick?: () => void;
}

interface DonutChartState extends DataDisplayIconsState {
  show3d: boolean;
}

type StateFunc<TState> = (state: TState) => TState;

export const renderDonutChartIcons = <TState extends DonutChartState>({
  setState,
  ...iconsProps
}: DataDisplayIconsProps<TState>): React.ReactNode => (
  <DataDisplayIcons {...iconsProps} setState={setState} />
);

const DataDisplayIcons = <TState extends DataDisplayIconsState>({
  setState,
  showCsvDownload = true,
  showSvgDownload = true,
  showFilterSelection = true,
  showToggleLegend = true,
  onDownloadCsvClick,
  onDownloadSvgClick,
  onSelectFilterClick,
}: DataDisplayIconsProps<TState>) => (
  <>
    {showFilterSelection && (
      <FilterIcon title={_('Select Filter')} onClick={onSelectFilterClick} />
    )}
    {showSvgDownload && (
      <DownloadSvgIcon title={_('Download SVG')} onClick={onDownloadSvgClick} />
    )}
    {showCsvDownload && (
      <DownloadCsvIcon title={_('Download CSV')} onClick={onDownloadCsvClick} />
    )}
    {showToggleLegend && (
      <LegendIcon
        title={_('Toggle Legend')}
        onClick={() => {
          setState(
            ({showLegend}: TState) => ({showLegend: !showLegend}) as TState,
          );
        }}
      />
    )}
  </>
);

export default DataDisplayIcons;
