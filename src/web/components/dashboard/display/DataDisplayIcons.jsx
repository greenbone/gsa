/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_} from 'gmp/locale/lang';
import React from 'react';
import DownloadCsvIcon from 'web/components/icon/DownloadCsvIcon';
import DownloadSvgIcon from 'web/components/icon/DownloadSvgIcon';
import FilterIcon from 'web/components/icon/FilterIcon';
import LegendIcon from 'web/components/icon/LegendIcon';
import Toggle3dIcon from 'web/components/icon/Toggle3dIcon';
import PropTypes from 'web/utils/PropTypes';

export const renderDonutChartIcons = ({setState, ...iconsProps}) => (
  <React.Fragment>
    <DataDisplayIcons {...iconsProps} setState={setState} />
    <Toggle3dIcon
      title={_('Toggle 2D/3D view')}
      onClick={() => setState(({show3d}) => ({show3d: !show3d}))}
    />
  </React.Fragment>
);

const DataDisplayIcons = ({
  setState,
  showCsvDownload = true,
  showSvgDownload = true,
  showFilterSelection = true,
  showToggleLegend = true,
  onDownloadCsvClick,
  onDownloadSvgClick,
  onSelectFilterClick,
}) => (
  <React.Fragment>
    {showFilterSelection && (
      <FilterIcon title={_('Select Filter')} onClick={onSelectFilterClick} />
    )}
    {showSvgDownload && <DownloadSvgIcon onClick={onDownloadSvgClick} />}
    {showCsvDownload && <DownloadCsvIcon onClick={onDownloadCsvClick} />}
    {showToggleLegend && (
      <LegendIcon
        title={_('Toggle Legend')}
        onClick={() => setState(({showLegend}) => ({showLegend: !showLegend}))}
      />
    )}
  </React.Fragment>
);

DataDisplayIcons.propTypes = {
  setState: PropTypes.func,
  showCsvDownload: PropTypes.bool,
  showFilterSelection: PropTypes.bool,
  showSvgDownload: PropTypes.bool,
  showToggleLegend: PropTypes.bool,
  onDownloadCsvClick: PropTypes.func,
  onDownloadSvgClick: PropTypes.func,
  onSelectFilterClick: PropTypes.func,
};

export default DataDisplayIcons;
