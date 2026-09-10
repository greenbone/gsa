/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_} from 'gmp/locale/lang';
import {
  DownloadSvgIcon,
  DownloadCsvIcon,
  FilterIcon,
  LegendIcon,
} from 'web/components/icon';
import {type DisplaySetStateFunc} from 'web/components/dashboard/display';

interface DataDisplayIconsState {
  showLegend?: boolean;
}

export interface DataDisplayIconsProps<TState extends DataDisplayIconsState> {
  setState: DisplaySetStateFunc<TState>;
  showCsvDownload?: boolean;
  showSvgDownload?: boolean;
  showFilterSelection?: boolean;
  showToggleLegend?: boolean;
  onDownloadCsvClick?: () => void;
  onDownloadSvgClick?: () => void;
  onSelectFilterClick?: () => void;
}

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
            (state: TState | undefined) =>
              ({showLegend: !state?.showLegend}) as TState,
          );
        }}
      />
    )}
  </>
);

export default DataDisplayIcons;
