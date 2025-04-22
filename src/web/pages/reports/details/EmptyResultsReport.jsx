/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import {DeleteIcon, EditIcon, FilterIcon} from 'web/components/icon';
import Divider from 'web/components/layout/Divider';
import Layout from 'web/components/layout/Layout';
import InfoPanel from 'web/components/panel/InfoPanel';
import useTranslation from 'web/hooks/useTranslation';
import ReportPanel from 'web/pages/reports/details/ReportPanel';
import PropTypes from 'web/utils/PropTypes';
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
  const [_] = useTranslation();
  const levels = filter.get('levels', '');
  const severity = filter.getTerm('severity');
  const min_qod = filter.get('min_qod');
  const has_severity_filter = isDefined(severity) && severity.relation === '>';
  return (
    <Layout grow align={['start', 'stretch']} flex="column">
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

      <Divider wrap align={['start', 'stretch']}>
        {!levels.includes('g') && isDefined(onFilterAddLogLevelClick) && (
          <ReportPanel
            icon={props => <FilterIcon {...props} />}
            title={_('Log messages are currently excluded.')}
            onClick={onFilterAddLogLevelClick}
          >
            {_('Include log messages in your filter settings.')}
          </ReportPanel>
        )}

        {has_severity_filter && isDefined(onFilterRemoveSeverityClick) && (
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
  onFilterAddLogLevelClick: PropTypes.func,
  onFilterDecreaseMinQoDClick: PropTypes.func.isRequired,
  onFilterEditClick: PropTypes.func.isRequired,
  onFilterRemoveClick: PropTypes.func.isRequired,
  onFilterRemoveSeverityClick: PropTypes.func,
};

export default EmptyResultsReport;
