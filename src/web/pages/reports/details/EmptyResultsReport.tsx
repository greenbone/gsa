/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import BaseFilter from 'gmp/models/filter/base-filter';
import type FilterType from 'gmp/models/filter/filter-type';
import {isDefined} from 'gmp/utils/identity';
import {CircleXDeleteIcon, EditIcon, FilterIcon} from 'web/components/icon';
import Divider from 'web/components/layout/Divider';
import Layout from 'web/components/layout/Layout';
import InfoPanel from 'web/components/panel/InfoPanel';
import useTranslation from 'web/hooks/useTranslation';
import ReportPanel from 'web/pages/reports/details/ReportPanel';

interface EmptyResultsReportProps {
  all: number;
  filter?: FilterType;
  onFilterAddLogLevelClick?: () => void;
  onFilterEditClick?: () => void;
  onFilterDecreaseMinQoDClick?: () => void;
  onFilterRemoveSeverityClick?: () => void;
  onFilterRemoveClick?: () => void;
}

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
}: EmptyResultsReportProps) => {
  const [_] = useTranslation();
  filter = filter ?? new BaseFilter();
  const levels = filter.get('levels', '') as string | undefined;
  const severity = filter.getTerm('severity');
  const minQod = filter.get('min_qod') as number | undefined;
  const hasSeverityFilter = isDefined(severity) && severity.relation === '>';
  return (
    <Layout grow align={['start', 'stretch']} flex="column">
      <InfoPanel
        heading={_(
          'The report is empty. The filter does not match any of the ' +
            '{{all}} results.',
          {all},
        )}
      >
        <>
          {_('The following filter is currently applied: ')}
          <FilterString>{filter.toFilterString()}</FilterString>
        </>
      </InfoPanel>

      <Divider wrap align={['start', 'stretch']}>
        {isDefined(levels) &&
          !levels.includes('g') &&
          isDefined(onFilterAddLogLevelClick) && (
            <ReportPanel
              icon={
                <FilterIcon size="large" onClick={onFilterAddLogLevelClick} />
              }
              title={_('Log messages are currently excluded.')}
              onClick={onFilterAddLogLevelClick}
            >
              {_('Include log messages in your filter settings.')}
            </ReportPanel>
          )}

        {hasSeverityFilter && isDefined(onFilterRemoveSeverityClick) && (
          <ReportPanel
            icon={
              <FilterIcon size="large" onClick={onFilterRemoveSeverityClick} />
            }
            title={_(
              'You are using keywords setting a minimum limit on severity.',
            )}
            onClick={onFilterRemoveSeverityClick}
          >
            {_('Remove the severity limit from your filter settings.')}
          </ReportPanel>
        )}

        {isDefined(minQod) && minQod > 30 && (
          <ReportPanel
            icon={
              <FilterIcon size="large" onClick={onFilterDecreaseMinQoDClick} />
            }
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
          icon={<EditIcon size="large" onClick={onFilterEditClick} />}
          title={_('Your filter settings may be too refined.')}
          onClick={onFilterEditClick}
        >
          {_('Adjust and update your filter settings.')}
        </ReportPanel>

        <ReportPanel
          icon={
            <CircleXDeleteIcon size="large" onClick={onFilterRemoveClick} />
          }
          title={_('Your last filter change may be too restrictive.')}
          onClick={onFilterRemoveClick}
        >
          {_('Remove all filter settings.')}
        </ReportPanel>
      </Divider>
    </Layout>
  );
};

export default EmptyResultsReport;
