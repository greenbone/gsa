/* Copyright (C) 2017-2020 Greenbone Networks GmbH
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
import React, {useState, useEffect} from 'react';

import {connect} from 'react-redux';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {KeyCode} from 'gmp/utils/event';
import {isDefined} from 'gmp/utils/identity';

import {parseCvssBaseVector, parseCvssBaseFromVector} from 'gmp/parser';

import SeverityBar from 'web/components/bar/severitybar';

import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';
import TextField from 'web/components/form/textfield';

import CvssIcon from 'web/components/icon/cvssicon';
import ManualIcon from 'web/components/icon/manualicon';

import Layout from 'web/components/layout/layout';

import Section from 'web/components/section/section';

import {renewSessionTimeout} from 'web/store/usersettings/actions';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

const StyledTextField = styled(TextField)`
  width: 180px;
`;

const ToolBarIcons = () => (
  <ManualIcon
    page="managing-secinfo"
    anchor="cvss"
    size="small"
    title={_('Help: CVSS Base Score Calculator')}
  />
);

const CvssCalculator = ({gmp, onInteraction, ...props}) => {
  const [state, setState] = useState({
    accessVector: 'LOCAL',
    accessComplexity: 'LOW',
    confidentialityImpact: 'NONE',
    authentication: 'NONE',
    integrityImpact: 'NONE',
    availabilityImpact: 'NONE',
    cvssVector: 'AV:L/AC:L/Au:N/C:N/I:N/A:N',
    userVector: 'AV:L/AC:L/Au:N/C:N/I:N/A:N',
    cvssScore: 0,
  });

  useEffect(() => {
    const {location} = props;

    if (
      isDefined(location) &&
      isDefined(location.query) &&
      isDefined(location.query.cvssVector)
    ) {
      const {cvssVector} = location.query;
      setState(vals => ({...vals, cvssVector, userVector: cvssVector}));
      calculateScore(cvssVector);
      handleVectorChange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleVectorChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.userVector]);

  const calculateVector = newVector => {
    const {
      accessVector,
      accessComplexity,
      confidentialityImpact,
      authentication,
      integrityImpact,
      availabilityImpact,
    } = state;

    const cvssVector = parseCvssBaseVector({
      accessComplexity,
      accessVector,
      authentication,
      availabilityImpact,
      confidentialityImpact,
      integrityImpact,
      ...newVector,
    });

    setState(vals => ({
      ...vals,
      ...newVector,
      cvssVector,
      userVector: cvssVector,
    }));

    calculateScore(cvssVector);
  };

  const calculateScore = cvssVector => {
    gmp.cvsscalculator.calculateScoreFromVector(cvssVector).then(response => {
      const {data: cvssScore} = response;
      setState(vals => ({...vals, cvssScore}));
    });
  };

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const handleMetricsChange = (value, name) => {
    handleInteraction();

    calculateVector({[name]: value});
  };

  const handleInputChange = (value, name) => {
    setState(vals => ({...vals, [name]: value}));
  };

  const handleVectorChange = () => {
    const {userVector} = state;

    handleInteraction();

    const cvssValues = parseCvssBaseFromVector(userVector);
    const {
      accessVector,
      accessComplexity,
      confidentialityImpact,
      authentication,
      integrityImpact,
      availabilityImpact,
    } = cvssValues;

    if (
      isDefined(accessVector) &&
      isDefined(accessComplexity) &&
      isDefined(confidentialityImpact) &&
      isDefined(authentication) &&
      isDefined(integrityImpact) &&
      isDefined(availabilityImpact)
    ) {
      /* only override cvss values and vector if user vector has valid input */

      setState(vals => ({...vals, ...cvssValues, cvssVector: userVector}));
      calculateScore(userVector);
    }
  };

  const handleKeyDown = event => {
    const key_code = event.keyCode;
    if (key_code === KeyCode.ENTER) {
      handleVectorChange();
    }
  };

  const {
    accessComplexity,
    accessVector,
    authentication,
    availabilityImpact,
    confidentialityImpact,
    userVector,
    cvssScore,
    cvssVector,
    integrityImpact,
  } = state;

  return (
    <Layout flex="column">
      <span>
        {' '}
        {/* span prevents Toolbar from growing */}
        <ToolBarIcons />
      </span>
      <Section
        img={<CvssIcon size="large" />}
        title={_('CVSSv2 Base Score Calculator')}
      />

      <h3>{_('From Metrics')}:</h3>
      <FormGroup title={_('Access Vector')}>
        <Select
          items={[
            {
              value: 'LOCAL',
              label: _('Local'),
            },
            {
              value: 'ADJACENT_NETWORK',
              label: _('Adjacent'),
            },
            {
              value: 'NETWORK',
              label: _('Network'),
            },
          ]}
          name="accessVector"
          value={accessVector}
          menuPosition="adjust"
          onChange={handleMetricsChange}
        />
      </FormGroup>
      <FormGroup title={_('Access Complexity')}>
        <Select
          items={[
            {
              value: 'LOW',
              label: _('Low'),
            },
            {
              value: 'MEDIUM',
              label: _('Medium'),
            },
            {
              value: 'HIGH',
              label: _('High'),
            },
          ]}
          name="accessComplexity"
          value={accessComplexity}
          menuPosition="adjust"
          onChange={handleMetricsChange}
        />
      </FormGroup>
      <FormGroup title={_('Authentication')}>
        <Select
          items={[
            {
              value: 'NONE',
              label: _('None'),
            },
            {
              value: 'SINGLE_INSTANCE',
              label: _('Single'),
            },
            {
              value: 'MULTIPLE_INSTANCES',
              label: _('Multiple'),
            },
          ]}
          name="authentication"
          value={authentication}
          menuPosition="adjust"
          onChange={handleMetricsChange}
        />
      </FormGroup>
      <FormGroup title={_('Confidentiality')}>
        <Select
          items={[
            {
              value: 'NONE',
              label: _('None'),
            },
            {
              value: 'PARTIAL',
              label: _('Partial'),
            },
            {
              value: 'COMPLETE',
              label: _('Complete'),
            },
          ]}
          name="confidentialityImpact"
          value={confidentialityImpact}
          onChange={handleMetricsChange}
        />
      </FormGroup>
      <FormGroup title={_('Integrity')}>
        <Select
          items={[
            {
              value: 'NONE',
              label: _('None'),
            },
            {
              value: 'PARTIAL',
              label: _('Partial'),
            },
            {
              value: 'COMPLETE',
              label: _('Complete'),
            },
          ]}
          name="integrityImpact"
          value={integrityImpact}
          menuPosition="adjust"
          onChange={handleMetricsChange}
        />
      </FormGroup>
      <FormGroup title={_('Availability')}>
        <Select
          items={[
            {
              value: 'NONE',
              label: _('None'),
            },
            {
              value: 'PARTIAL',
              label: _('Partial'),
            },
            {
              value: 'COMPLETE',
              label: _('Complete'),
            },
          ]}
          name="availabilityImpact"
          value={availabilityImpact}
          menuPosition="adjust"
          onChange={handleMetricsChange}
        />
      </FormGroup>

      <h3>{_('From Vector')}:</h3>
      <FormGroup title={_('Vector')}>
        <StyledTextField
          name="userVector"
          value={userVector}
          onChange={handleInputChange}
          onBlur={handleVectorChange}
          onKeyDown={handleKeyDown}
        />
      </FormGroup>

      <h3>{_('Results')}:</h3>
      <FormGroup title={_('CVSS Base Vector')}>
        <span>{cvssVector}</span>
      </FormGroup>
      <FormGroup title={_('Severity')}>
        <SeverityBar severity={cvssScore} />
      </FormGroup>
    </Layout>
  );
};

CvssCalculator.propTypes = {
  gmp: PropTypes.gmp.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, {gmp}) => ({
  onInteraction: () => dispatch(renewSessionTimeout(gmp)()),
});

export default compose(
  withGmp,
  connect(undefined, mapDispatchToProps),
)(CvssCalculator);

// vim: set ts=2 sw=2 tw=80:
