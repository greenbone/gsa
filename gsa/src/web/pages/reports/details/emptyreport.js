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

import {isActive} from 'gmp/models/task';

import TaskIcon from 'web/components/icon/taskicon';
import RefreshIcon from 'web/components/icon/refreshicon';
import TargetIcon from 'web/components/icon/targeticon';

import Divider from 'web/components/layout/divider';

import InfoPanel from 'web/components/panel/infopanel';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import ReportPanel from './reportpanel';

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
    <Divider flex="column" align={['start', 'stretch']} grow>
      <InfoPanel
        heading={_(
          'The Report is empty. This can happen for the following ' +
            'reasons:',
        )}
      />
      <Divider wrap>
        {!isActiveReport && (
          <ReportPanel
            icon={props => <TaskIcon {...props} />}
            title={_('The scan did not collect any results')}
          >
            {_('If the scan got interrupted you can try to re-start the task.')}
          </ReportPanel>
        )}
        {isActiveReport && progress === 1 && (
          <ReportPanel
            icon={props => <RefreshIcon {...props} />}
            title={_('The scan just started and no results have arrived yet')}
          >
            {_('Just wait for results to arrive.')}
          </ReportPanel>
        )}
        {isActiveReport && progress > 1 && (
          <ReportPanel
            icon={props => <RefreshIcon {...props} />}
            title={_(
              'The scan is still running and no results have arrived yet',
            )}
          >
            {_('Just wait for results to arrive.')}
          </ReportPanel>
        )}
        {progress < 1 && hasTarget && (
          <ReportPanel
            icon={props => <TargetIcon {...props} />}
            title={_('The target hosts could be regarded dead')}
            onClick={may_edit_target ? onTargetEditClick : undefined}
          >
            {_(
              'You should change the Alive Test Method of the ' +
                'target for the next scan. However, if the target hosts ' +
                'are indeed dead, the scan duration might increase ' +
                'significantly.',
            )}
          </ReportPanel>
        )}
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
