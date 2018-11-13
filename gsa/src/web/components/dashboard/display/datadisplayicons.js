/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import {_} from 'gmp/locale/lang';

import Icon from 'web/components/icon/icon';

import PropTypes from 'web/utils/proptypes';

export const renderDonutChartIcons = ({
  setState, // eslint-disable-line react/prop-types
  ...iconsProps
}) => (
  <React.Fragment>
    <DataDisplayIcons
      {...iconsProps}
      setState={setState}
    />
    <Icon
      img="2d3d.svg"
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
    {showFilterSelection &&
      <Icon
        img="filter.svg"
        title={_('Select Filter')}
        onClick={onSelectFilterClick}
      />
    }
    {showSvgDownload &&
      <Icon
        img="dl_svg.svg"
        title={_('Download SVG')}
        onClick={onDownloadSvgClick}
      />
    }
    {showCsvDownload &&
      <Icon
        img="dl_csv.svg"
        title={_('Download CSV')}
        onClick={onDownloadCsvClick}
      />
    }
    {showToggleLegend &&
      <Icon
        img="legend.svg"
        title={_('Toggle Legend')}
        onClick={() => setState(({showLegend}) => ({showLegend: !showLegend}))}
      />
    }
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
