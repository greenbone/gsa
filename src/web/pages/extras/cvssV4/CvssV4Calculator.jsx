/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import PropTypes from 'prop-types';
import {useState, useEffect, useMemo} from 'react';
import _ from 'gmp/locale';

import {cvssConfigData} from 'web/pages/extras/cvssV4/cvssConfig';
import {
  expectedMetricOptionsOrdered,
  processVector,
  calculateScoreSafely,
  removeUnusedMetrics,
} from 'gmp/parser/cvssV4';

import useUserSessionTimeout from 'web/hooks/useUserSessionTimeout';
import FormGroup from 'web/components/form/formgroup';
import Layout from 'web/components/layout/layout';
import Section from 'web/components/section/section';
import CvssIcon from 'web/components/icon/cvssicon';
import SeverityBar from 'web/components/bar/severitybar';
import styled from 'styled-components';
import TextField from 'web/components/form/textfield';
import MetricsGroups from 'web/pages/extras/cvssV4/MetricsGroups';
import {useSearchParams} from 'react-router-dom';

const StyledTextField = styled(TextField)`
  width: 180px;
`;

const cvssV4Prefix = 'CVSS:4.0/';

const CvssV4Calculator = () => {
  const [searchParams] = useSearchParams();

  const initialState = useMemo(() => {
    return expectedMetricOptionsOrdered.reduce((obj, item) => {
      obj[item[0]] = item[1];
      return obj;
    }, {});
  }, []);

  const [selectedOptions, setSelectedOptions] = useState(initialState);

  const [inputCVSSVector, setInputCVSSVector] = useState(
    `${cvssV4Prefix}${removeUnusedMetrics(selectedOptions)}`,
  );

  const [, renewSession] = useUserSessionTimeout();

  const cvssVector = `${cvssV4Prefix}${removeUnusedMetrics(selectedOptions)}`;

  useEffect(() => {
    const cvssVectorParam = searchParams.get('cvssVector');
    if (cvssVectorParam?.includes(cvssV4Prefix)) {
      const newOptions = processVector(cvssVectorParam);
      setSelectedOptions({...initialState, ...newOptions});
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleInputCVSSVectorChange = value => {
    setInputCVSSVector(value);

    const newOptions = processVector(value);
    setSelectedOptions({...initialState, ...newOptions});

    renewSession();
  };

  const handleOptionChange = (value, name) => {
    const newOptions = {...selectedOptions, [name]: value};

    setInputCVSSVector(`${cvssV4Prefix}${removeUnusedMetrics(newOptions)}`);
    setSelectedOptions(newOptions);

    renewSession();
  };

  const cvssScore = calculateScoreSafely(cvssVector);

  return (
    <Layout flex="column" grow>
      <Section
        img={<CvssIcon size="large" />}
        title={_('CVSSv4 Score Calculator')}
      />
      <h3>{_('From Metrics')}:</h3>
      <MetricsGroups
        cvssConfigData={cvssConfigData}
        selectedOptions={selectedOptions}
        handleOptionChange={handleOptionChange}
      />
      <h3>{_('From Vector')}:</h3>
      <FormGroup title={`CVSS 4.0 ${_('Vector')}`}>
        <StyledTextField
          name="cvssVectorInput"
          value={inputCVSSVector}
          onChange={handleInputCVSSVectorChange}
        />
      </FormGroup>

      <h3>{_('Results')}:</h3>
      <FormGroup title={`${_('CVSS Base Vector')}`}>
        <span>{cvssVector}</span>
      </FormGroup>
      <FormGroup title={_('Severity')}>
        <SeverityBar severity={cvssScore} />
      </FormGroup>
    </Layout>
  );
};

CvssV4Calculator.propTypes = {
  location: PropTypes.object.isRequired,
};

export default CvssV4Calculator;
