/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import {type FilterType} from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import FootNote from 'web/components/footnote/Footnote';
import {EditIcon, FilterIcon} from 'web/components/icon';
import Divider from 'web/components/layout/Divider';
import Layout from 'web/components/layout/Layout';
import updatingStyle, {
  type UpdatingStyleProps,
} from 'web/components/layout/updating-style';
import InfoPanel from 'web/components/panel/InfoPanel';
import useTranslation from 'web/hooks/useTranslation';
import ReportPanel from 'web/pages/reports/details/ReportPanel';

interface ThresholdPanelProps {
  entityType: string;
  filter: FilterType;
  isUpdating?: boolean;
  threshold: number;
  onFilterChanged?: (filter: FilterType) => void;
  onFilterEditClick?: () => void;
}

const UpdatingDivider = styled(Divider)<UpdatingStyleProps>`
  ${updatingStyle}
`;

const ThresholdPanel = ({
  entityType,
  filter,
  isUpdating = false,
  threshold,
  onFilterChanged,
  onFilterEditClick,
}: ThresholdPanelProps) => {
  const [_] = useTranslation();
  const levels = filter.get('levels', '') as string | undefined;
  const severity = filter.get('severity', 0) as number;

  const handleRemoveLogLevel = () => {
    if (isDefined(levels) && levels.includes('g')) {
      const newLevels = levels.replace('g', '');
      const levelsFilter = filter.set('levels', newLevels);

      onFilterChanged?.(levelsFilter);
    }
  };

  const handleRemoveLowLevel = () => {
    if (isDefined(levels) && levels.includes('l')) {
      const newLevels = levels.replace('l', '');
      const levelsFilter = filter.set('levels', newLevels);

      onFilterChanged?.(levelsFilter);
    }
  };

  const handleRemoveMediumLevel = () => {
    if (isDefined(levels) && levels.includes('m')) {
      const newLevels = levels.replace('m', '');
      const levelsFilter = filter.set('levels', newLevels);

      onFilterChanged?.(levelsFilter);
    }
  };
  const handleSetMinimumSeverity = () => {
    const severityFilter = filter.set('severity', 7.0, '>');

    onFilterChanged?.(severityFilter);
  };
  return (
    <UpdatingDivider
      grow
      $isUpdating={isUpdating}
      align={['start', 'stretch']}
      flex="column"
    >
      <InfoPanel
        heading={_(
          'The {{entityType}} cannot be displayed in order to maintain ' +
            "the performance within the browser's capabilities. The " +
            'report contains too many results. Please decrease the ' +
            'number of results below the threshold of {{threshold}} ' +
            'by applying a more refined filter.',
          {entityType, threshold},
        )}
      />
      <Divider wrap>
        {isDefined(levels) && levels.includes('g') && (
          <ReportPanel
            icon={<FilterIcon size="large" onClick={handleRemoveLogLevel} />}
            title={_('Results with log messages are currently included.')}
            onClick={handleRemoveLogLevel}
          >
            {_('Filter out log message results.')}
          </ReportPanel>
        )}
        {isDefined(levels) && levels.includes('l') && (
          <ReportPanel
            icon={<FilterIcon size="large" onClick={handleRemoveLowLevel} />}
            title={_('Results with the severity "Low" are currently included.')}
            onClick={handleRemoveLowLevel}
          >
            {_('Filter out results with the severity "Low".')}
          </ReportPanel>
        )}
        {isDefined(levels) && levels.includes('m') && (
          <ReportPanel
            icon={<FilterIcon size="large" onClick={handleRemoveMediumLevel} />}
            title={_(
              'Results with the severity "Medium" are currently included.',
            )}
            onClick={handleRemoveMediumLevel}
          >
            {_('Filter out results with the severity "Medium".')}
          </ReportPanel>
        )}
        {!filter.has('levels') && severity < 7 && (
          <ReportPanel
            icon={
              <FilterIcon size="large" onClick={handleSetMinimumSeverity} />
            }
            title={_("Results aren't filtered by severity.")}
            onClick={handleSetMinimumSeverity}
          >
            {_('Apply a minimum severity of 7.0.')}
          </ReportPanel>
        )}
        <ReportPanel
          icon={<EditIcon size="large" onClick={onFilterEditClick} />}
          title={_('Your filter settings may be too unrefined.')}
          onClick={onFilterEditClick}
        >
          {_('Adjust and update your filter settings.')}
        </ReportPanel>
      </Divider>
      <Layout align="space-between">
        <FootNote>
          {_('(Applied filter: {{- filter}})', {
            filter: filter.simple().toFilterString(),
          })}
        </FootNote>
      </Layout>
    </UpdatingDivider>
  );
};

export default ThresholdPanel;
