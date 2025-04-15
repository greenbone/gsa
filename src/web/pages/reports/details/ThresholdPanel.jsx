/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import useTranslation from 'src/web/hooks/useTranslation';
import styled from 'styled-components';
import FootNote from 'web/components/footnote/Footnote';
import {EditIcon, FilterIcon} from 'web/components/icon';
import Divider from 'web/components/layout/Divider';
import Layout from 'web/components/layout/Layout';
import InfoPanel from 'web/components/panel/InfoPanel';
import ReportPanel from 'web/pages/reports/details/ReportPanel';
import PropTypes from 'web/utils/PropTypes';
const UpdatingDivider = styled(({isUpdating, ...props}) => {
  const [_] = useTranslation();
  return (<Divider {...props} />);
})`
  opacity: ${props => (props.isUpdating ? '0.2' : '1.0')};
`;

const ThresholdPanel = ({
  entityType,
  filter,
  isUpdating = false,
  threshold,
  onFilterChanged,
  onFilterEditClick,
}) => {
  const [_] = useTranslation();
  const levels = filter.get('levels', '');
  const severity = filter.get('severity', 0);

  const handleRemoveLogLevel = () => {
    if (levels.includes('g')) {
      const newLevels = levels.replace('g', '');
      const lfilter = filter.copy();
      lfilter.set('levels', newLevels);

      onFilterChanged(lfilter);
    }
  };

  const handleRemoveLowLevel = () => {
    if (levels.includes('l')) {
      const newLevels = levels.replace('l', '');
      const lfilter = filter.copy();
      lfilter.set('levels', newLevels);

      onFilterChanged(lfilter);
    }
  };

  const handleRemoveMediumLevel = () => {
    if (levels.includes('m')) {
      const newLevels = levels.replace('m', '');
      const lfilter = filter.copy();
      lfilter.set('levels', newLevels);

      onFilterChanged(lfilter);
    }
  };
  const handleSetMinimumSeverity = () => {
    const lfilter = filter.copy();
    lfilter.set('severity', 7.0, '>');

    onFilterChanged(lfilter);
  };
  return (
    <UpdatingDivider
      grow
      align={['start', 'stretch']}
      flex="column"
      isUpdating={isUpdating}
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
        {levels.includes('g') && (
          <ReportPanel
            icon={props => <FilterIcon {...props} />}
            title={_('Results with log messages are currently included.')}
            onClick={handleRemoveLogLevel}
          >
            {_('Filter out log message results.')}
          </ReportPanel>
        )}
        {levels.includes('l') && (
          <ReportPanel
            icon={props => <FilterIcon {...props} />}
            title={_('Results with the severity "Low" are currently included.')}
            onClick={handleRemoveLowLevel}
          >
            {_('Filter out results with the severity "Low".')}
          </ReportPanel>
        )}
        {levels.includes('m') && (
          <ReportPanel
            icon={props => <FilterIcon {...props} />}
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
            icon={props => <FilterIcon {...props} />}
            title={_("Results aren't filtered by severity.")}
            onClick={handleSetMinimumSeverity}
          >
            {_('Apply a minimum severity of 7.0.')}
          </ReportPanel>
        )}
        <ReportPanel
          icon={props => <EditIcon {...props} />}
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

ThresholdPanel.propTypes = {
  entityType: PropTypes.string.isRequired,
  filter: PropTypes.filter.isRequired,
  isUpdating: PropTypes.bool,
  threshold: PropTypes.number.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
  onFilterEditClick: PropTypes.func.isRequired,
};

export default ThresholdPanel;
