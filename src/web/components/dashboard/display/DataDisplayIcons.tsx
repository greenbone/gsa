/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_} from 'gmp/locale/lang';
import React from 'react';
import {
  DownloadSvgIcon,
  DownloadCsvIcon,
  FilterIcon,
  LegendIcon,
  Toggle3dIcon,
} from 'web/components/icon/icons';
interface DataDisplayIconsState {
  showLegend?: boolean;
}

interface DataDisplayIconsProps<S extends DataDisplayIconsState> {
  setState: (func: StateFunc<S>) => S;
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

type StateFunc<S> = (state: S) => S;

export const renderDonutChartIcons = <S extends DonutChartState>({
  setState,
  ...iconsProps
}: DataDisplayIconsProps<S>): React.ReactNode => (
  <>
    <DataDisplayIcons {...iconsProps} setState={setState} />
    <Toggle3dIcon
      title={_('Toggle 2D/3D view')}
      onClick={() => {
        setState(({show3d}: S) => ({show3d: !show3d}) as S);
      }}
    />
  </>
);

const DataDisplayIcons = <S extends DataDisplayIconsState>({
  setState,
  showCsvDownload = true,
  showSvgDownload = true,
  showFilterSelection = true,
  showToggleLegend = true,
  onDownloadCsvClick,
  onDownloadSvgClick,
  onSelectFilterClick,
}: DataDisplayIconsProps<S>) => (
  <React.Fragment>
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
          setState(({showLegend}: S) => ({showLegend: !showLegend}) as S);
        }}
      />
    )}
  </React.Fragment>
);

export default DataDisplayIcons;
