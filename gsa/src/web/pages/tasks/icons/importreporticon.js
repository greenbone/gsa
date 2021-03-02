/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import ImportIcon from 'web/components/icon/importicon';
import PropTypes from 'web/utils/proptypes';
import useCapabilities from 'web/utils/useCapabilities';

const ImportReportIcon = ({size, task, onClick}) => {
  const capabilities = useCapabilities();

  if (!task.isContainer() || !capabilities.mayCreate('report')) {
    return null;
  }

  return (
    <ImportIcon
      value={task}
      size={size}
      onClick={onClick}
      alt={_('Import Report')}
      title={_('Import Report')}
    />
  );
};

ImportReportIcon.propTypes = {
  size: PropTypes.iconSize,
  task: PropTypes.model.isRequired,
  onClick: PropTypes.func,
};

export default ImportReportIcon;

// vim: set ts=2 sw=2 tw=80:
