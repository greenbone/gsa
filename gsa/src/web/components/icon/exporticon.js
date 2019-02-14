/* Copyright (C) 2016-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import SelectionType from 'web/utils/selectiontype';

import withSvgIcon from './withSvgIcon';

import {ReactComponent as Icon} from './svg/export.svg';

const ExportSvgIcon = withSvgIcon()(Icon);

const ExportIcon = ({selectionType, title, ...other}) => {
  let download_title = title;
  if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
    download_title = _('Export page contents');
  } else if (selectionType === SelectionType.SELECTION_USER) {
    download_title = _('Export selection');
  } else if (selectionType === SelectionType.SELECTION_FILTER) {
    download_title = _('Export all filtered');
  }
  return <ExportSvgIcon {...other} title={download_title} />;
};

ExportIcon.propTypes = {
  selectionType: PropTypes.string,
  title: PropTypes.string,
};

export default ExportIcon;

// vim: set ts=2 sw=2 tw=80:
