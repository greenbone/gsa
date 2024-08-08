/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import ImportIcon from 'web/components/icon/importicon';

const ImportReportIcon = ({capabilities, size, task, onClick}) => {
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
  capabilities: PropTypes.capabilities.isRequired,
  size: PropTypes.iconSize,
  task: PropTypes.model.isRequired,
  onClick: PropTypes.func,
};

export default withCapabilities(ImportReportIcon);

// vim: set ts=2 sw=2 tw=80:
