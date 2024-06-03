/* Copyright (C) 2024 Greenbone AG
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

import PropTypes from 'prop-types';
import {useState, useEffect, useMemo} from 'react';
import _ from 'gmp/locale';

import {
  cvssConfigData,
  expectedMetricOptionsOrdered,
} from 'web/pages/extras/cvssV4Point0/cvssConfig';

import {
  processVector,
  calculateScoreSafely,
  removeUnusedMetrics,
} from './utils';

import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';
import FormGroup from 'web/components/form/formgroup';
import Layout from 'web/components/layout/layout';
import Section from 'web/components/section/section';
import CvssIcon from 'web/components/icon/cvssicon';
import SeverityBar from 'web/components/bar/severitybar';
import styled from 'styled-components';
import TextField from 'web/components/form/textfield';
import MetricsGroups from 'web/pages/extras/cvssV4Point0/MetricsGroups';

const StyledTextField = styled(TextField)`
  width: 180px;
`;

const CVSS4Point0 = 'CVSS:4.0/';

const CvssV4Point0Calculator = ({location}) => {
  const initialState = useMemo(() => {
    return expectedMetricOptionsOrdered.reduce((obj, item) => {
      obj[item[0]] = item[1];
      return obj;
    }, {});
  }, []);

  const [selectedOptions, setSelectedOptions] = useState(initialState);

  const [inputCVSSVector, setInputCVSSVector] = useState(
    `${CVSS4Point0}${removeUnusedMetrics(selectedOptions)}`,
  );

  const [, renewSession] = useUserSessionTimeout();

  const cvssVector = `${CVSS4Point0}${removeUnusedMetrics(selectedOptions)}`;

  useEffect(() => {
    if (location?.query?.cvssVector?.includes(CVSS4Point0)) {
      const newOptions = processVector(location.query.cvssVector);
      setSelectedOptions({...initialState, ...newOptions});
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const handleInputCVSSVectorChange = value => {
    setInputCVSSVector(value);

    const newOptions = processVector(value);
    setSelectedOptions({...initialState, ...newOptions});

    renewSession();
  };

  const handleOptionChange = (value, name) => {
    const newOptions = {...selectedOptions, [name]: value};

    setInputCVSSVector(`${CVSS4Point0}${removeUnusedMetrics(newOptions)}`);
    setSelectedOptions(newOptions);

    renewSession();
  };

  const cvssScore = calculateScoreSafely(cvssVector);

  return (
    <Layout flex="column" grow>
      <Section
        img={<CvssIcon size="large" />}
        title={_('CVSSv4 Base Score Calculator')}
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

CvssV4Point0Calculator.propTypes = {
  location: PropTypes.object.isRequired,
};

export default CvssV4Point0Calculator;
