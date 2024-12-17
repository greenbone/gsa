/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import ImportIcon from 'web/components/icon/importicon';
import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';


const ImportReportIcon = ({capabilities, size, task, onClick}) => {
  if (!task.isContainer() || !capabilities.mayCreate('report')) {
    return null;
  }

  return (
    <ImportIcon
      alt={_('Import Report')}
      size={size}
      title={_('Import Report')}
      value={task}
      onClick={onClick}
    />
  );
};

ImportReportIcon.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  size: PropTypes.iconSize,
  task: PropTypes.model.isRequired,
  onClick: PropTypes.func,
};

export default withCapabilities(ImportReportIcon);

// vim: set ts=2 sw=2 tw=80:
