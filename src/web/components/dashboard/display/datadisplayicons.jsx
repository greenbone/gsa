/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {_} from 'gmp/locale/lang';

import DownloadCsvIcon from 'web/components/icon/downloadcsvicon';
import DownloadSvgIcon from 'web/components/icon/downloadsvgicon';
import FilterIcon from 'web/components/icon/filtericon';
import LegendIcon from 'web/components/icon/legendicon';
import Toggle3dIcon from 'web/components/icon/toggle3dicon';

import PropTypes from 'web/utils/proptypes';

export const renderDonutChartIcons = ({
  setState, // eslint-disable-line react/prop-types
  ...iconsProps
}) => (
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

// vim: set ts=2 sw=2 tw=80:
