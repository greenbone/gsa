/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState, useEffect} from 'react';
import {useSearchParams} from 'react-router';
import styled from 'styled-components';
import {
  parseCvssV2BaseVector,
  parseCvssV3BaseVector,
  parseCvssV2BaseFromVector,
  parseCvssV3BaseFromVector,
} from 'gmp/parser/cvss';
import {KeyCode} from 'gmp/utils/event';
import {isDefined} from 'gmp/utils/identity';
import SeverityBar from 'web/components/bar/SeverityBar';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import {CvssIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import Layout from 'web/components/layout/Layout';
import Section from 'web/components/section/Section';
import useTranslation from 'web/hooks/useTranslation';
import useUserSessionTimeout from 'web/hooks/useUserSessionTimeout';
import CvssV4Calculator from 'web/pages/extras/cvssV4/CvssV4Calculator';
const StyledTextField = styled(TextField)`
  width: 180px;
`;

const ToolBarIcons = () => {
  const [_] = useTranslation();

  return (
    <ManualIcon
      anchor="cvss"
      page="managing-secinfo"
      size="small"
      title={_('Help: CVSS Base Score Calculator')}
    />
  );
};

/* CVSS v2 .... */

const CvssV2Calculator = () => {
  const [_] = useTranslation();
  const [, renewSession] = useUserSessionTimeout();
  const [searchParams] = useSearchParams();

  const [state, setState] = useState({
    accessVector: 'Local',
    accessComplexity: 'Low',
    confidentialityImpact: 'None',
    authentication: 'None',
    integrityImpact: 'None',
    availabilityImpact: 'None',
    cvssVector: 'AV:L/AC:L/Au:N/C:N/I:N/A:N',
    userVector: 'AV:L/AC:L/Au:N/C:N/I:N/A:N',
    cvssScore: 0,
  });

  useEffect(() => {
    const cvssVector = searchParams.get('cvssVector');

    if (
      cvssVector &&
      !cvssVector.includes('CVSS:3') &&
      !cvssVector.includes('CVSS:4')
    ) {
      setState(vals => ({...vals, cvssVector, userVector: cvssVector}));
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
    <Layout grow flex="column">
      <Section
        img={<CvssIcon size="large" />}
        title={_('CVSSv2 Base Score Calculator')}
      />
      <h3>{_('From Metrics')}:</h3>
      <FormGroup title={_('Access Vector')}>
        <Select
          items={[
            {
              value: 'Local',
              label: _('Local'),
            },
            {
              value: 'Adjacent',
              label: _('Adjacent'),
            },
            {
              value: 'Network',
              label: _('Network'),
            },
          ]}
          name="accessVector"
          value={accessVector}
          onChange={handleMetricsChange}
        />
      </FormGroup>
      <FormGroup title={_('Access Complexity')}>
        <Select
          items={[
            {
              value: 'Low',
              label: _('Low'),
            },
            {
              value: 'Medium',
              label: _('Medium'),
            },
            {
              value: 'High',
              label: _('High'),
            },
          ]}
          name="accessComplexity"
          value={accessComplexity}
          onChange={handleMetricsChange}
        />
      </FormGroup>
      <FormGroup title={_('Authentication')}>
        <Select
          items={[
            {
              value: 'None',
              label: _('None'),
            },
            {
              value: 'Single',
              label: _('Single'),
            },
            {
              value: 'Multiple',
              label: _('Multiple'),
            },
          ]}
          name="authentication"
          value={authentication}
          onChange={handleMetricsChange}
        />
      </FormGroup>
      <FormGroup title={_('Confidentiality')}>
        <Select
          items={[
            {
              value: 'None',
              label: _('None'),
            },
            {
              value: 'Partial',
              label: _('Partial'),
            },
            {
              value: 'Complete',
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
              value: 'None',
              label: _('None'),
            },
            {
              value: 'Partial',
              label: _('Partial'),
            },
            {
              value: 'Complete',
              label: _('Complete'),
            },
          ]}
          name="integrityImpact"
          value={integrityImpact}
          onChange={handleMetricsChange}
        />
      </FormGroup>
      <FormGroup title={_('Availability')}>
        <Select
          items={[
            {
              value: 'None',
              label: _('None'),
            },
            {
              value: 'Partial',
              label: _('Partial'),
            },
            {
              value: 'Complete',
              label: _('Complete'),
            },
          ]}
          name="availabilityImpact"
          value={availabilityImpact}
          onChange={handleMetricsChange}
        />
      </FormGroup>

      <h3>{_('From Vector')}:</h3>
      <FormGroup title={_('Vector')}>
        <StyledTextField
          name="userVector"
          value={userVector}
          onBlur={handleVectorChange}
          onChange={handleInputChange}
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

const CvssV3Calculator = () => {
  const [_] = useTranslation();
  const [, renewSession] = useUserSessionTimeout();
  const [searchParams] = useSearchParams();

  const [state, setState] = useState({
    attackVector: 'Network',
    attackComplexity: 'Low',
    privilegesRequired: 'None',
    userInteraction: 'None',
    scope: 'Unchanged',
    confidentialityImpact: 'None',
    integrityImpact: 'None',
    availabilityImpact: 'None',
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N',
    userVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N',
    cvssScore: 0,
  });

  useEffect(() => {
    const cvssVector = searchParams.get('cvssVector');

    if (cvssVector?.includes('CVSS:3')) {
      setState(vals => ({...vals, cvssVector, userVector: cvssVector}));
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
    <Layout grow flex="column">
      <Section
        img={<CvssIcon size="large" />}
        title={_('CVSSv3 Base Score Calculator')}
      />
      <h3>{_('From Metrics')}:</h3>
      <FormGroup title={_('Attack Vector')}>
        <Select
          items={[
            {
              value: 'Local',
              label: _('Local'),
            },
            {
              value: 'Adjacent',
              label: _('Adjacent'),
            },
            {
              value: 'Network',
              label: _('Network'),
            },
            {
              value: 'Physical',
              label: _('Physical'),
            },
          ]}
          name="attackVector"
          value={attackVector}
          onChange={handleMetricsChange}
        />
      </FormGroup>
      <FormGroup title={_('Attack Complexity')}>
        <Select
          items={[
            {
              value: 'Low',
              label: _('Low'),
            },
            {
              value: 'High',
              label: _('High'),
            },
          ]}
          name="attackComplexity"
          value={attackComplexity}
          onChange={handleMetricsChange}
        />
      </FormGroup>
      <FormGroup title={_('Privileges Required')}>
        <Select
          items={[
            {
              value: 'None',
              label: _('None'),
            },
            {
              value: 'Low',
              label: _('Low'),
            },
            {
              value: 'High',
              label: _('High'),
            },
          ]}
          name="privilegesRequired"
          value={privilegesRequired}
          onChange={handleMetricsChange}
        />
      </FormGroup>
      <FormGroup title={_('User Interaction')}>
        <Select
          items={[
            {
              value: 'None',
              label: _('None'),
            },
            {
              value: 'Required',
              label: _('Required'),
            },
          ]}
          name="userInteraction"
          value={userInteraction}
          onChange={handleMetricsChange}
        />
      </FormGroup>
      <FormGroup title={_('Scope')}>
        <Select
          items={[
            {
              value: 'Unchanged',
              label: _('Unchanged'),
            },
            {
              value: 'Changed',
              label: _('Changed'),
            },
          ]}
          name="scope"
          value={scope}
          onChange={handleMetricsChange}
        />
      </FormGroup>
      <FormGroup title={_('Confidentiality')}>
        <Select
          items={[
            {
              value: 'None',
              label: _('None'),
            },
            {
              value: 'Low',
              label: _('Low'),
            },
            {
              value: 'High',
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
              value: 'None',
              label: _('None'),
            },
            {
              value: 'Low',
              label: _('Low'),
            },
            {
              value: 'High',
              label: _('High'),
            },
          ]}
          name="integrityImpact"
          value={integrityImpact}
          onChange={handleMetricsChange}
        />
      </FormGroup>
      <FormGroup title={_('Availability')}>
        <Select
          items={[
            {
              value: 'None',
              label: _('None'),
            },
            {
              value: 'Low',
              label: _('Low'),
            },
            {
              value: 'High',
              label: _('High'),
            },
          ]}
          name="availabilityImpact"
          value={availabilityImpact}
          onChange={handleMetricsChange}
        />
      </FormGroup>

      <h3>{_('From Vector')}:</h3>
      <FormGroup title={_('CVSS v3.1 Vector')}>
        <StyledTextField
          name="userVector"
          value={userVector}
          onBlur={handleVectorChange}
          onChange={handleInputChange}
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

const CvssCalculator = props => {
  return (
    <Layout flex="column">
      <span>
        {/* span prevents Toolbar from growing */}
        <ToolBarIcons />
      </span>
      <Divider
        grow
        wrap
        align={['flex-start', 'start']}
        flex="row"
        margin="20px"
      >
        <Layout grow flex="1">
          <CvssV2Calculator {...props} />
        </Layout>
        <Layout grow flex="1">
          <CvssV3Calculator {...props} />
        </Layout>
        <Layout grow flex="1">
          <CvssV4Calculator />
        </Layout>
      </Divider>
    </Layout>
  );
};

export default CvssCalculator;
