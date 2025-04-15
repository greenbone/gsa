/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import useTranslation from 'src/web/hooks/useTranslation';
import {ImportIcon} from 'web/components/icon';
import PropTypes from 'web/utils/PropTypes';
import withCapabilities from 'web/utils/withCapabilities';
const ImportReportIcon = ({capabilities, size, task, onClick}) => {
  const [_] = useTranslation();
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
