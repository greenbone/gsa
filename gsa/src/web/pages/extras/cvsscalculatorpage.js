/* Greenbone Security Assistant
*
* Authors:
* Steffen Waterkamp <steffen.waterkamp@greenbone.net>
*
* Copyright:
* Copyright (C) 2017 - 2018 Greenbone Networks GmbH
*
* This program is free software; you can redistribute it and/or
* modify it under the terms of the GNU General Public License
* as published by the Free Software Foundation; either version 2
* of the License, or (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program; if not, write to the Free Software
* Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
*/
import React from 'react';

import {connect} from 'react-redux';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {KeyCode} from 'gmp/utils/event';
import {isDefined} from 'gmp/utils/identity';

import {
  parseCvssBaseVector,
  parseCvssBaseFromVector,
} from 'gmp/parser';

import SeverityBar from 'web/components/bar/severitybar';

import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';
import TextField from 'web/components/form/textfield';

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
    page="vulnerabilitymanagement"
    anchor="cvss"
    size="medium"
    title={_('Help: CVSS Base Score Calculator')}
  />
);

class CvssCalculator extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      accessVector: 'LOCAL',
      accessComplexity: 'LOW',
      confidentialityImpact: 'NONE',
      authentication: 'NONE',
      integrityImpact: 'NONE',
      availabilityImpact: 'NONE',
      cvssVector: '',
      userVector: '',
      cvssScore: 0,
    };

    this.calculateScore = this.calculateScore.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleMetricsChange = this.handleMetricsChange.bind(this);
    this.handleVectorChange = this.handleVectorChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    const {location} = this.props;

    if (isDefined(location) && isDefined(location.query) &&
      isDefined(location.query.cvssVector)) {
      const {cvssVector} = location.query;
      this.setState({cvssVector, userVector: cvssVector});
      this.calculateScore(cvssVector);
    }
  }

  calculateVector(newVector) {
    const {
      accessVector,
      accessComplexity,
      confidentialityImpact,
      authentication,
      integrityImpact,
      availabilityImpact,
    } = this.state;

    const cvssVector = parseCvssBaseVector({
      accessComplexity,
      accessVector,
      authentication,
      availabilityImpact,
      confidentialityImpact,
      integrityImpact,
      ...newVector,
    });

    this.setState({
      ...newVector,
      cvssVector,
      userVector: cvssVector,
    });

    this.calculateScore(cvssVector);
  }

  calculateScore(cvssVector) {
    const {gmp} = this.props;

    gmp.cvsscalculator.calculateScoreFromVector(cvssVector).then(response => {
      const {data: cvssScore} = response;
      this.setState({cvssScore});
    });
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  handleMetricsChange(value, name) {
    this.handleInteraction();

    this.calculateVector({[name]: value});
  }

  handleInputChange(value, name) {
    this.setState({[name]: value});
  }

  handleVectorChange() {
    const {userVector} = this.state;

    this.handleInteraction();

    const cvssValues = parseCvssBaseFromVector(userVector);
    const {
      accessVector,
      accessComplexity,
      confidentialityImpact,
      authentication,
      integrityImpact,
      availabilityImpact,
    } = cvssValues;

    if (isDefined(accessVector) && isDefined(accessComplexity) &&
      isDefined(confidentialityImpact) && isDefined(authentication) &&
      isDefined(integrityImpact) && isDefined(availabilityImpact)) {

      /* only override cvss values and vector if user vector has valid input */

      this.setState({...cvssValues, cvssVector: userVector});
      this.calculateScore(userVector);
    }
  }

  handleKeyDown(event) {
    const key_code = event.keyCode;
    if (key_code === KeyCode.ENTER) {
      this.handleVectorChange();
    }
  }

  render() {
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
    } = this.state;
    return (
      <Layout flex="column">
        <ToolBarIcons/>
        <Section
          img="cvss_calculator.svg"
          title={_('CVSS Base Score Calculator')}
        />

        <h3>{_('From Metrics')}:</h3>
        <FormGroup title={_('Access Vector')}>
          <Select
            name="accessVector"
            value={accessVector}
            menuPosition="adjust"
            onChange={this.handleMetricsChange}
          >
            <option value="LOCAL">{_('Local')}</option>
            <option value="ADJACENT_NETWORK">{_('Adjacent')}</option>
            <option value="NETWORK">{_('Network')}</option>
          </Select>
        </FormGroup>
        <FormGroup title={_('Access Complexity')}>
          <Select
            name="accessComplexity"
            value={accessComplexity}
            menuPosition="adjust"
            onChange={this.handleMetricsChange}
          >
            <option value="LOW">{_('Low')}</option>
            <option value="MEDIUM">{_('Medium')}</option>
            <option value="HIGH">{_('High')}</option>
          </Select>
        </FormGroup>
        <FormGroup title={_('Authentication')}>
          <Select
            name="authentication"
            value={authentication}
            menuPosition="adjust"
            onChange={this.handleMetricsChange}
          >
            <option value="NONE">{_('None')}</option>
            <option value="SINGLE_INSTANCES">{_('Single')}</option>
            <option value="MULTIPLE_INSTANCES">{_('Multiple')}</option>
          </Select>
        </FormGroup>
        <FormGroup title={_('Confidentiality')}>
          <Select
            name="confidentialityImpact"
            value={confidentialityImpact}
            onChange={this.handleMetricsChange}
          >
            <option value="NONE">{_('None')}</option>
            <option value="PARTIAL">{_('Partial')}</option>
            <option value="COMPLETE">{_('Complete')}</option>
          </Select>
        </FormGroup>
        <FormGroup title={_('Integrity')}>
          <Select
            name="integrityImpact"
            value={integrityImpact}
            menuPosition="adjust"
            onChange={this.handleMetricsChange}
          >
            <option value="NONE">{_('None')}</option>
            <option value="PARTIAL">{_('Partial')}</option>
            <option value="COMPLETE">{_('Complete')}</option>
          </Select>
        </FormGroup>
        <FormGroup title={_('Availability')}>
          <Select
            name="availabilityImpact"
            value={availabilityImpact}
            menuPosition="adjust"
            onChange={this.handleMetricsChange}
          >
            <option value="NONE">{_('None')}</option>
            <option value="PARTIAL">{_('Partial')}</option>
            <option value="COMPLETE">{_('Complete')}</option>
          </Select>
        </FormGroup>

        <h3>{_('From Vector')}:</h3>
        <FormGroup title={_('Vector')}>
          <StyledTextField
            name="userVector"
            value={userVector}
            onChange={this.handleInputChange}
            onBlur={this.handleVectorChange}
            onKeyDown={this.handleKeyDown}
          />
        </FormGroup>

        <h3>{_('Results')}:</h3>
        <FormGroup title={_('CVSS Base Vector')}>
          <span>{cvssVector}</span>
        </FormGroup>
        <FormGroup title={_('Severity')}>
          <SeverityBar severity={cvssScore}/>
        </FormGroup>
      </Layout>
    );
  }
}

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
