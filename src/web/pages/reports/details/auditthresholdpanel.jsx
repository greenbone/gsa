/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import FootNote from 'web/components/footnote/footnote';
import EditIcon from 'web/components/icon/editicon';
import FilterIcon from 'web/components/icon/filtericon';
import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';
import InfoPanel from 'web/components/panel/infopanel';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';

import ReportPanel from './reportpanel';


const UpdatingDivider = styled(({isUpdating, ...props}) => (
  <Divider {...props} />
))`
  opacity: ${props => (props.isUpdating ? '0.2' : '1.0')};
`;

const AuditThresholdPanel = ({
  entityType,
  filter,
  isUpdating = false,
  threshold,
  onFilterChanged,
  onFilterEditClick,
}) => {
  const [_] = useTranslation();
  
  const compliance = filter.get('compliance_levels', '');

  const handleRemoveComplianceYes = () => {
    if (compliance.includes('y')) {
      const newCompliance = compliance.replace('y', '');
      const lfilter = filter.copy();
      lfilter.set('compliance_levels', newCompliance);

      onFilterChanged(lfilter);
    }
  };

  const handleRemoveComplianceUndefined = () => {
    if (compliance.includes('u')) {
      const newCompliance = compliance.replace('u', '');
      const lfilter = filter.copy();
      lfilter.set('compliance_levels', newCompliance);

      onFilterChanged(lfilter);
    }
  };

  const handleRemoveComplianceIncomplete = () => {
    if (compliance.includes('i')) {
      const newCompliance = compliance.replace('i', '');
      const lfilter = filter.copy();
      lfilter.set('compliance_levels', newCompliance);

      onFilterChanged(lfilter);
    }
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
        {compliance.includes('y') && (
          <ReportPanel
            icon={props => <FilterIcon {...props} />}
            title={_('Results with compliance "Yes" are currently included.')}
            onClick={handleRemoveComplianceYes}
          >
            {_('Filter out results with compliance "Yes".')}
          </ReportPanel>
        )}
        {compliance.includes('u') && (
          <ReportPanel
            icon={props => <FilterIcon {...props} />}
            title={_(
              'Results with compliance "Undefined" are currently included.',
            )}
            onClick={handleRemoveComplianceUndefined}
          >
            {_('Filter out results with compliance "Undefined".')}
          </ReportPanel>
        )}
        {compliance.includes('i') && (
          <ReportPanel
            icon={props => <FilterIcon {...props} />}
            title={_(
              'Results with compliance "Incomplete" are currently included.',
            )}
            onClick={handleRemoveComplianceIncomplete}
          >
            {_('Filter out results with compliance "Incomplete".')}
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

AuditThresholdPanel.propTypes = {
  entityType: PropTypes.string.isRequired,
  filter: PropTypes.filter.isRequired,
  isUpdating: PropTypes.bool,
  threshold: PropTypes.number.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
  onFilterEditClick: PropTypes.func.isRequired,
};

export default AuditThresholdPanel;
