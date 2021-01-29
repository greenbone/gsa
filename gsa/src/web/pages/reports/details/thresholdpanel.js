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

import Divider from 'web/components/layout/divider';

import InfoPanel from 'web/components/panel/infopanel';

import FilterIcon from 'web/components/icon/filtericon';

import EditIcon from 'web/components/icon/editicon';
import FootNote from 'web/components/footnote/footnote';
import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';

import ReportPanel from './reportpanel';

const UpdatingDivider = styled(({isUpdating, ...props}) => (
  <Divider {...props} />
))`
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
      flex="column"
      align={['start', 'stretch']}
      grow
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
