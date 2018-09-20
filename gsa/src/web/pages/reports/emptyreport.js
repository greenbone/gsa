/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import {isActive} from 'gmp/models/task';

import PropTypes from '../../utils/proptypes.js';
import withCapabilities from '../../utils/withCapabilities.js';

import Divider from '../../components/layout/divider.js';

import InfoPanel from '../../components/panel/infopanel.js';

import ReportPanel from './reportpanel.js';

const EmptyReport = ({
  capabilities,
  hasTarget = false,
  progress,
  status,
  onTargetEditClick,
}) => {
  const may_edit_target = capabilities.mayEdit('target');
  const isActiveReport = hasTarget && isActive(status);
  return (
    <Divider
      flex="column"
      align={['start', 'stretch']}
      grow
    >
      <InfoPanel
        heading={
          _('The Report is empty. This can happen for the following ' +
            'reasons:')
        }
      />
      <Divider wrap="wrap">
        {!isActiveReport &&
          <ReportPanel
            icon="task.svg"
            title={_('The scan did not collect any results')}
          >
            {_('If the scan got interrupted you can try to re-start the task.')}
          </ReportPanel>
        }
        {isActiveReport && progress === 1 &&
          <ReportPanel
            icon="refresh.svg"
            title={_('The scan just started and no results have arrived yet')}
          >
            {_('Just wait for results to arrive.')}
          </ReportPanel>
        }
        {isActiveReport && progress > 1 &&
          <ReportPanel
            icon="refresh.svg"
            title={
              _('The scan is still running and no results have arrived yet')
            }
          >
            {_('Just wait for results to arrive.')}
          </ReportPanel>
        }
        {progress < 1 && hasTarget &&
          <ReportPanel
            icon="target.svg"
            title={_('The target hosts could be regarded dead')}
            onClick={may_edit_target ? onTargetEditClick : undefined}
          >
            {_('You should change the Alive Test Method of the ' +
               'target for the next scan. However, if the target hosts ' +
               'are indeed dead, the scan duration might increase ' +
               'significantly.')}
          </ReportPanel>
        }
      </Divider>
    </Divider>
  );
};

EmptyReport.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  hasTarget: PropTypes.bool,
  progress: PropTypes.numberOrNumberString,
  status: PropTypes.string.isRequired,
  onTargetEditClick: PropTypes.func.isRequired,
};

export default withCapabilities(EmptyReport);

// vim: set ts=2 sw=2 tw=80:
