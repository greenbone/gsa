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
