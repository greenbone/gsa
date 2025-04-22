/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  expectedMetricOptionsOrdered,
  processVector,
  calculateScoreSafely,
  removeUnusedMetrics,
} from 'gmp/parser/cvssV4';
import {useState, useEffect, useMemo} from 'react';
import {useSearchParams} from 'react-router';
import styled from 'styled-components';
import SeverityBar from 'web/components/bar/SeverityBar';
import FormGroup from 'web/components/form/FormGroup';
import TextField from 'web/components/form/TextField';
import {CvssIcon} from 'web/components/icon';
import Layout from 'web/components/layout/Layout';
import Section from 'web/components/section/Section';
import useTranslation from 'web/hooks/useTranslation';
import useUserSessionTimeout from 'web/hooks/useUserSessionTimeout';
import {createCvssConfigData} from 'web/pages/extras/cvssV4/cvssConfig';
import MetricsGroups from 'web/pages/extras/cvssV4/MetricsGroups';
const StyledTextField = styled(TextField)`
  width: 180px;
`;

const cvssV4Prefix = 'CVSS:4.0/';

const CvssV4Calculator = () => {
  const [_] = useTranslation();
  const [searchParams] = useSearchParams();

  const cvssConfigData = useMemo(() => createCvssConfigData(_), [_]);

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
    <Layout basis={'50%'} flex="column">
      <Section
        img={<CvssIcon size="large" />}
        title={_('CVSSv4 Score Calculator')}
      />
      <h3>{_('From Metrics')}:</h3>
      <MetricsGroups
        cvssConfigData={cvssConfigData}
        handleOptionChange={handleOptionChange}
        selectedOptions={selectedOptions}
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

export default CvssV4Calculator;
