/* Greenbone Security Assistant
*
* Authors:
* Steffen Waterkamp <steffen.waterkamp@greenbone.net>
*
* Copyright:
* Copyright (C) 2017 Greenbone Networks GmbH
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

import glamorous from 'glamorous';

import _ from 'gmp/locale.js';
import {is_defined, KeyCode} from 'gmp/utils.js';

import {
  parse_cvss_base_vector,
  parse_cvss_base_from_vector,
} from 'gmp/parser.js';

import SeverityBar from '../../components/bar/severitybar.js';

import HelpIcon from '../../components/icon/helpicon.js';

import FormGroup from '../../components/form/formgroup.js';
import Select2 from '../../components/form/select2.js';
import TextField from '../../components/form/textfield.js';

import Section from '../../components/section/section.js';

import Layout from '../../components/layout/layout.js';

import withGmp from '../../utils/withGmp.js';

import PropTypes from '../../utils/proptypes.js';

const StyledTextField = glamorous(TextField)({
  width: '210px',
});

const StyledSelect2 = glamorous(Select2)({
  '& .select2-container': {
    width: '210px !important',
  },
});

const ToolBarIcons = () => (
  <HelpIcon
    page="cvss_calculator"
    title={_('Help: CVSS Base Score Calculator')}
  />
);

class CvssCalculator extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      access_vector: 'LOCAL',
      access_complexity: 'LOW',
      confidentiality_impact: 'NONE',
      authentication: 'NONE',
      integrity_impact: 'NONE',
      availability_impact: 'NONE',
      cvss_vector: '',
      user_cvss_vector: '',
      cvss_score: 0,
    };

    this.calculateScore = this.calculateScore.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleMetricsChange = this.handleMetricsChange.bind(this);
    this.handleVectorChange = this.handleVectorChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  calculateVector() {
    const {
      access_vector,
      access_complexity,
      confidentiality_impact,
      authentication,
      integrity_impact,
      availability_impact,
    } = this.state;

    const cvss_vector = parse_cvss_base_vector({
      access_complexity,
      access_vector,
      authentication,
      availability_impact,
      confidentiality_impact,
      integrity_impact,
    });

    this.setState({cvss_vector, user_vector: cvss_vector});
    this.calculateScore(cvss_vector);
  }

  calculateScore(cvss_vector) {
    const {gmp} = this.props;

    gmp.cvsscalculator.calculateScoreFromVector(cvss_vector).then(response => {
      const {data} = response;
      const {cvss_score} = data;
      this.setState({cvss_score});
    });
  }

  handleMetricsChange(value, name) {
    this.handleInputChange(value, name);
    this.calculateVector();

  }

  handleInputChange(value, name) {
    this.setState({[name]: value});
  }

  handleVectorChange() {
    const {user_vector} = this.state;
    const cvss_values = parse_cvss_base_from_vector(user_vector);
    const {
      access_vector,
      access_complexity,
      confidentiality_impact,
      authentication,
      integrity_impact,
      availability_impact,
    } = cvss_values;

    if (is_defined(access_vector) && is_defined(access_complexity) &&
      is_defined(confidentiality_impact) && is_defined(authentication) &&
      is_defined(integrity_impact) && is_defined(availability_impact)) {

      /* only override cvss values and vector if user vector has valid input */

      this.setState({...cvss_values, cvss_vector: user_vector});
      this.calculateScore(user_vector);
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
      access_complexity,
      access_vector,
      authentication,
      availability_impact,
      confidentiality_impact,
      user_vector,
      cvss_score,
      cvss_vector,
      integrity_impact,
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
          <StyledSelect2
            name="access_vector"
            value={access_vector}
            onChange={this.handleMetricsChange}
            >
            <option value="LOCAL">{_('Local')}</option>
            <option value="ADJACENT_NETWORK">{_('Adjacent')}</option>
            <option value="NETWORK">{_('Network')}</option>
          </StyledSelect2>
        </FormGroup>
        <FormGroup title={_('Access Complexity')}>
          <StyledSelect2
            name="access_complexity"
            value={access_complexity}
            onChange={this.handleMetricsChange}
            >
            <option value="LOW">{_('Low')}</option>
            <option value="MEDIUM">{_('Medium')}</option>
            <option value="HIGH">{_('High')}</option>
          </StyledSelect2>
        </FormGroup>
        <FormGroup title={_('Authentication')}>
          <StyledSelect2
            name="authentication"
            value={authentication}
            onChange={this.handleMetricsChange}
            >
            <option value="NONE">{_('None')}</option>
            <option value="SINGLE_INSTANCES">{_('Single')}</option>
            <option value="MULTIPLE_INSTANCES">{_('Multiple')}</option>
          </StyledSelect2>
        </FormGroup>
        <FormGroup title={_('Confidentiality')}>
          <StyledSelect2
            name="confidentiality_impact"
            value={confidentiality_impact}
            onChange={this.handleMetricsChange}
            >
            <option value="NONE">{_('None')}</option>
            <option value="PARTIAL">{_('Partial')}</option>
            <option value="COMPLETE">{_('Complete')}</option>
          </StyledSelect2>
        </FormGroup>
        <FormGroup title={_('Integrity')}>
          <StyledSelect2
            name="integrity_impact"
            value={integrity_impact}
            onChange={this.handleMetricsChange}
            >
            <option value="NONE">{_('None')}</option>
            <option value="PARTIAL">{_('Partial')}</option>
            <option value="COMPLETE">{_('Complete')}</option>
          </StyledSelect2>
        </FormGroup>
        <FormGroup title={_('Availability')}>
          <StyledSelect2
            name="availability_impact"
            value={availability_impact}
            onChange={this.handleMetricsChange}
            >
            <option value="NONE">{_('None')}</option>
            <option value="PARTIAL">{_('Partial')}</option>
            <option value="COMPLETE">{_('Complete')}</option>
          </StyledSelect2>
        </FormGroup>

        <h3>{_('From Vector')}:</h3>
        <FormGroup title={_('Vector')}>
          <StyledTextField
            name="user_vector"
            value={user_vector}
            onChange={this.handleInputChange}
            onBlur={this.handleVectorChange}
            onKeyDown={this.handleKeyDown}
          />
        </FormGroup>

        <h3>{_('Results')}:</h3>
        <FormGroup title={_('CVSS Base Vector')}>
          <span>{cvss_vector}</span>
        </FormGroup>
        <FormGroup title={_('Severity')}>
          <SeverityBar severity={cvss_score}/>
        </FormGroup>
      </Layout>
    );
  }
}

CvssCalculator.propTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default withGmp(CvssCalculator);
