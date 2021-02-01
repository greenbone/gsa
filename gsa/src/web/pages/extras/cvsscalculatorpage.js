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
import React, {useState, useEffect} from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {
  parseCvssV2BaseVector,
  parseCvssV3BaseVector,
  parseCvssV2BaseFromVector,
  parseCvssV3BaseFromVector,
} from 'gmp/parser/cvss';

import {KeyCode} from 'gmp/utils/event';
import {isDefined} from 'gmp/utils/identity';

import SeverityBar from 'web/components/bar/severitybar';

import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';
import TextField from 'web/components/form/textfield';

import CvssIcon from 'web/components/icon/cvssicon';
import ManualIcon from 'web/components/icon/manualicon';

import Layout from 'web/components/layout/layout';
import Divider from 'web/components/layout/divider';

import Section from 'web/components/section/section';

import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

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

/* CVSS v2 .... */

const CvssV2Calculator = props => {
  const [, renewSession] = useUserSessionTimeout();

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
      if (!cvssVector.includes('CVSS:3')) {
        setState(vals => ({...vals, cvssVector, userVector: cvssVector}));
        handleVectorChange();
      }
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

    const [cvssVector, cvssScore] = parseCvssV2BaseVector({
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
      cvssScore: cvssScore,
    }));
  };

  const handleMetricsChange = (value, name) => {
    renewSession();

    calculateVector({[name]: value});
  };

  const handleInputChange = (value, name) => {
    setState(vals => ({...vals, [name]: value}));
  };

  const handleVectorChange = () => {
    const {userVector} = state;

    renewSession();

    const {
      accessVector,
      accessComplexity,
      authentication,
      confidentialityImpact,
      integrityImpact,
      availabilityImpact,
      cvssScore,
    } = parseCvssV2BaseFromVector(userVector);

    if (
      isDefined(accessVector) &&
      isDefined(accessComplexity) &&
      isDefined(authentication) &&
      isDefined(confidentialityImpact) &&
      isDefined(integrityImpact) &&
      isDefined(availabilityImpact) &&
      isDefined(cvssScore)
    ) {
      /* only override cvss values and vector if user vector has valid input */
      setState(vals => ({
        ...vals,
        accessVector,
        accessComplexity,
        authentication,
        confidentialityImpact,
        integrityImpact,
        availabilityImpact,
        cvssVector: userVector,
        cvssScore,
      }));
    }
  };

  const handleKeyDown = event => {
    const key_code = event.keyCode;
    if (key_code === KeyCode.ENTER) {
      handleVectorChange();
    }
  };

  const {
    accessVector,
    accessComplexity,
    authentication,
    confidentialityImpact,
    availabilityImpact,
    integrityImpact,
    userVector,
    cvssScore,
    cvssVector,
  } = state;

  return (
    <Layout flex="column" grow>
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

/* CVSS v3 .... */

const CvssV3Calculator = props => {
  const [, renewSession] = useUserSessionTimeout();

  const [state, setState] = useState({
    attackVector: 'NETWORK',
    attackComplexity: 'LOW',
    privilegesRequired: 'NONE',
    userInteraction: 'NONE',
    scope: 'UNCHANGED',
    authentication: 'NONE',
    integrityImpact: 'NONE',
    availabilityImpact: 'NONE',
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N',
    userVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N',
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
      if (cvssVector.includes('CVSS:3')) {
        setState(vals => ({...vals, cvssVector, userVector: cvssVector}));
        handleVectorChange();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleVectorChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.userVector]);

  const calculateVector = newVector => {
    const {
      attackVector,
      attackComplexity,
      privilegesRequired,
      userInteraction,
      scope,
      confidentialityImpact,
      integrityImpact,
      availabilityImpact,
    } = state;

    const [cvssVector, cvssScore] = parseCvssV3BaseVector({
      attackVector,
      attackComplexity,
      privilegesRequired,
      userInteraction,
      scope,
      confidentialityImpact,
      integrityImpact,
      availabilityImpact,
      ...newVector,
    });

    setState(vals => ({
      ...vals,
      ...newVector,
      cvssVector,
      userVector: cvssVector,
      cvssScore: cvssScore,
    }));
  };

  const handleMetricsChange = (value, name) => {
    renewSession();

    calculateVector({[name]: value});
  };

  const handleInputChange = (value, name) => {
    setState(vals => ({...vals, [name]: value}));
  };

  const handleVectorChange = () => {
    const {userVector} = state;

    renewSession();

    const {
      attackVector,
      attackComplexity,
      privilegesRequired,
      userInteraction,
      scope,
      confidentialityImpact,
      integrityImpact,
      availabilityImpact,
      cvssScore,
    } = parseCvssV3BaseFromVector(userVector);

    if (
      isDefined(attackVector) &&
      isDefined(attackComplexity) &&
      isDefined(privilegesRequired) &&
      isDefined(userInteraction) &&
      isDefined(scope) &&
      isDefined(confidentialityImpact) &&
      isDefined(integrityImpact) &&
      isDefined(availabilityImpact) &&
      isDefined(cvssScore)
    ) {
      /* only override cvss values and vector if user vector has valid input */

      setState(vals => ({
        ...vals,
        attackVector,
        attackComplexity,
        privilegesRequired,
        userInteraction,
        scope,
        confidentialityImpact,
        integrityImpact,
        availabilityImpact,
        cvssVector: userVector,
        cvssScore,
      }));
    }
  };

  const handleKeyDown = event => {
    const key_code = event.keyCode;
    if (key_code === KeyCode.ENTER) {
      handleVectorChange();
    }
  };

  const {
    attackVector,
    attackComplexity,
    privilegesRequired,
    userInteraction,
    scope,
    availabilityImpact,
    confidentialityImpact,
    userVector,
    cvssScore,
    cvssVector,
    integrityImpact,
  } = state;

  return (
    <Layout flex="column" grow>
      <Section
        img={<CvssIcon size="large" />}
        title={_('CVSSv3 Base Score Calculator')}
      />
      <h3>{_('From Metrics')}:</h3>
      <FormGroup title={_('Attack Vector')}>
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
            {
              value: 'PHYSICAL',
              label: _('Physical'),
            },
          ]}
          name="attackVector"
          value={attackVector}
          menuPosition="adjust"
          onChange={handleMetricsChange}
        />
      </FormGroup>
      <FormGroup title={_('Attack Complexity')}>
        <Select
          items={[
            {
              value: 'LOW',
              label: _('Low'),
            },
            {
              value: 'HIGH',
              label: _('High'),
            },
          ]}
          name="attackComplexity"
          value={attackComplexity}
          menuPosition="adjust"
          onChange={handleMetricsChange}
        />
      </FormGroup>
      <FormGroup title={_('Privileges Required')}>
        <Select
          items={[
            {
              value: 'NONE',
              label: _('None'),
            },
            {
              value: 'LOW',
              label: _('Low'),
            },
            {
              value: 'HIGH',
              label: _('High'),
            },
          ]}
          name="privilegesRequired"
          value={privilegesRequired}
          menuPosition="adjust"
          onChange={handleMetricsChange}
        />
      </FormGroup>
      <FormGroup title={_('User Interaction')}>
        <Select
          items={[
            {
              value: 'NONE',
              label: _('None'),
            },
            {
              value: 'REQUIRED',
              label: _('Required'),
            },
          ]}
          name="userInteraction"
          value={userInteraction}
          menuPosition="adjust"
          onChange={handleMetricsChange}
        />
      </FormGroup>
      <FormGroup title={_('Scope')}>
        <Select
          items={[
            {
              value: 'UNCHANGED',
              label: _('Unchanged'),
            },
            {
              value: 'CHANGED',
              label: _('Changed'),
            },
          ]}
          name="scope"
          value={scope}
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
              value: 'LOW',
              label: _('Low'),
            },
            {
              value: 'HIGH',
              label: _('High'),
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
              value: 'LOW',
              label: _('Low'),
            },
            {
              value: 'HIGH',
              label: _('High'),
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
              value: 'LOW',
              label: _('Low'),
            },
            {
              value: 'HIGH',
              label: _('High'),
            },
          ]}
          name="availabilityImpact"
          value={availabilityImpact}
          menuPosition="adjust"
          onChange={handleMetricsChange}
        />
      </FormGroup>

      <h3>{_('From Vector')}:</h3>
      <FormGroup title={_('CVSS v3.1 Vector')}>
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

const CvssCalculator = props => (
  <Layout flex="column">
    <ToolBarIcons />
    <Divider margin="20px" flex="row" align={['center', 'start']} grow>
      <CvssV2Calculator {...props} />
      <CvssV3Calculator {...props} />
    </Divider>
  </Layout>
);

export default CvssCalculator;

// vim: set ts=2 sw=2 tw=80:
