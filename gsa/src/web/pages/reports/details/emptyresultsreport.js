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

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import InfoPanel from 'web/components/panel/infopanel';

import ReportPanel from './reportpanel';
import FilterIcon from 'web/components/icon/filtericon';
import EditIcon from 'web/components/icon/editicon';
import DeleteIcon from 'web/components/icon/deleteicon';

import PropTypes from 'web/utils/proptypes';

const FilterString = styled.span`
  font-style: italic;
  margin-left: 10px;
`;

const EmptyResultsReport = ({
  all,
  filter,
  onFilterAddLogLevelClick,
  onFilterEditClick,
  onFilterDecreaseMinQoDClick,
  onFilterRemoveSeverityClick,
  onFilterRemoveClick,
}) => {
  const levels = filter.get('levels', '');
  const severity = filter.getTerm('severity');
  const min_qod = filter.get('min_qod');
  const has_severity_filter = isDefined(severity) && severity.relation === '>';
  return (
    <Layout flex="column" align={['start', 'stretch']} grow>
      <InfoPanel
        heading={_(
          'The report is empty. The filter does not match any of the ' +
            '{{all}} results.',
          {all},
        )}
      >
        {_('The following filter is currently applied: ')}
        <FilterString>{filter.toFilterString()}</FilterString>
      </InfoPanel>

      <Divider align={['start', 'stretch']} wrap>
        {!levels.includes('g') && (
          <ReportPanel
            icon={props => <FilterIcon {...props} />}
            title={_('Log messages are currently excluded.')}
            onClick={onFilterAddLogLevelClick}
          >
            {_('Include log messages in your filter settings.')}
          </ReportPanel>
        )}

        {has_severity_filter && (
          <ReportPanel
            icon={props => <FilterIcon {...props} />}
            title={_(
              'You are using keywords setting a minimum limit on severity.',
            )}
            onClick={onFilterRemoveSeverityClick}
          >
            {_('Remove the severity limit from your filter settings.')}
          </ReportPanel>
        )}

        {isDefined(min_qod) && min_qod > 30 && (
          <ReportPanel
            icon={props => <FilterIcon {...props} />}
            title={_(
              'There may be results below the currently selected Quality ' +
                'of Detection (QoD).',
            )}
            onClick={onFilterDecreaseMinQoDClick}
          >
            {_(
              'Decrease the minimum QoD in the filter settings to 30 percent ' +
                'to see those results.',
            )}
          </ReportPanel>
        )}

        <ReportPanel
          icon={props => <EditIcon {...props} />}
          title={_('Your filter settings may be too refined.')}
          onClick={onFilterEditClick}
        >
          {_('Adjust and update your filter settings.')}
        </ReportPanel>

        <ReportPanel
          icon={props => <DeleteIcon {...props} />}
          title={_('Your last filter change may be too restrictive.')}
          onClick={onFilterRemoveClick}
        >
          {_('Remove all filter settings.')}
        </ReportPanel>
      </Divider>
    </Layout>
  );
};

EmptyResultsReport.propTypes = {
  all: PropTypes.number.isRequired,
  filter: PropTypes.filter.isRequired,
  onFilterAddLogLevelClick: PropTypes.func.isRequired,
  onFilterDecreaseMinQoDClick: PropTypes.func.isRequired,
  onFilterEditClick: PropTypes.func.isRequired,
  onFilterRemoveClick: PropTypes.func.isRequired,
  onFilterRemoveSeverityClick: PropTypes.func.isRequired,
};

export default EmptyResultsReport;

// vim: set ts=2 sw=2 tw=80:
