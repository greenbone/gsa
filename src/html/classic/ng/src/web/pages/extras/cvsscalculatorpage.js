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

import SeverityBar from '../../components/bar/severitybar.js';

import HelpIcon from '../../components/icon/helpicon.js';

import FormGroup from '../../components/form/formgroup.js';
import Select2 from '../../components/form/select2.js';
import TextField from '../../components/form/textfield.js';

import Section from '../../components/section/section.js';

import Layout from '../../components/layout/layout.js';

import {
  parse_cvss_base_vector,
  parse_cvss_base_from_vector,
} from 'gmp/parser.js';

import {KeyCode} from 'gmp/utils.js';

import withContext from '../../utils/withContext.js';

import PropTypes from '../../utils/proptypes.js';

const StyledTextField = glamorous(TextField)({
  width: '190px',
});

const StyledSelect2 = glamorous(Select2)({
  '& .select2-container': {
    width: '190px !important',
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
      accessvector: 'LOCAL',
      accesscomplexity: 'LOW',
      confidentiality: 'NONE',
      authentication: 'NONE',
      integrity: 'NONE',
      availability: 'NONE',
      cvss_vector: '',
      cvss_score: 0,
    };

    this.calculateScore = this.calculateScore.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleValueChangeVector = this.handleValueChangeVector.bind(this);
    this.handleCalculate = this.handleCalculate.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleCalculate(new_vector) {
    const {
      accessvector, accesscomplexity, confidentiality,
      authentication, integrity, availability,
    } = this.state;

    const cvss_vector = parse_cvss_base_vector({
                            access_complexity: accesscomplexity,
                            access_vector: accessvector,
                            authentication,
                            availability_impact: availability,
                            confidentiality_impact: confidentiality,
                            integrity_impact: integrity,
                          });
    this.setState({cvss_vector, cvssOutput: cvss_vector});
    this.calculateScore(cvss_vector);
  }

  calculateScore(cvss_vector) {
      const {
        accessvector, accesscomplexity, confidentiality,
        authentication, integrity, availability,
      } = this.state;

    const {gmp} = this.props;
    gmp.cvsscalculator.get({
      access_complexity: accesscomplexity,
      access_vector: accessvector,
      authentication,
      availability_impact: availability,
      confidentiality_impact: confidentiality,
      integrity_impact: integrity,
      cvss_vector,
    }).then(
      response => {
        const cvssData = response.data;
        const {cvss_score} = cvssData;
        this.setState({cvss_score});
      }
    );
  }

  handleValueChange(value, name) {
    this.handleInputChange(value, name);
    this.handleCalculate(1);

  }

  handleInputChange(value, name) {
    this.setState({[name]: value});
  }

  handleValueChangeVector() {
    const cvss_values = parse_cvss_base_from_vector(this.state.cvssOutput);
    this.setState({...cvss_values, cvss_vector: this.state.cvssOutput});
    this.calculateScore(this.state.cvssOutput);
  }

  handleKeyDown(event) {
    const key_code = event.keyCode;
    if (key_code === KeyCode.ENTER) {
      this.handleValueChangeVector();
    }
  }

  render() {
    const {
      accessvector, accesscomplexity, confidentiality, cvssOutput,
      authentication, integrity, availability, cvss_vector, cvss_score,
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
            name="accessvector"
            grow="1"
            value={accessvector}
            onChange={this.handleValueChange}
            >
            <option value="LOCAL">{_('Local')}</option>
            <option value="ADJACENT_NETWORK">{_('Adjacent')}</option>
            <option value="NETWORK">{_('Network')}</option>
          </StyledSelect2>
        </FormGroup>
        <FormGroup title={_('Access Complexity')}>
          <StyledSelect2
            name="accesscomplexity"
            grow="1"
            value={accesscomplexity}
            onChange={this.handleValueChange}
            >
            <option value="LOW">{_('Low')}</option>
            <option value="MEDIUM">{_('Medium')}</option>
            <option value="HIGH">{_('High')}</option>
          </StyledSelect2>
        </FormGroup>
        <FormGroup title={_('Authentication')}>
          <StyledSelect2
            name="authentication"
            grow="1"
            value={authentication}
            onChange={this.handleValueChange}
            >
            <option value="NONE">{_('None')}</option>
            <option value="SINGLE_INSTANCES">{_('Single')}</option>
            <option value="MULTIPLE_INSTANCES">{_('Multiple')}</option>
          </StyledSelect2>
        </FormGroup>
        <FormGroup title={_('Confidentiality')}>
          <StyledSelect2
            name="confidentiality"
            grow="1"
            value={confidentiality}
            onChange={this.handleValueChange}
            >
            <option value="NONE">{_('None')}</option>
            <option value="PARTIAL">{_('Partial')}</option>
            <option value="COMPLETE">{_('Complete')}</option>
          </StyledSelect2>
        </FormGroup>
        <FormGroup title={_('Integrity')}>
          <StyledSelect2
            name="integrity"
            grow="1"
            value={integrity}
            onChange={this.handleValueChange}
            >
            <option value="NONE">{_('None')}</option>
            <option value="PARTIAL">{_('Partial')}</option>
            <option value="COMPLETE">{_('Complete')}</option>
          </StyledSelect2>
        </FormGroup>
        <FormGroup title={_('Availability')}>
          <StyledSelect2
            name="availability"
            grow="1"
            value={availability}
            onChange={this.handleValueChange}
            >
            <option value="NONE">{_('None')}</option>
            <option value="PARTIAL">{_('Partial')}</option>
            <option value="COMPLETE">{_('Complete')}</option>
          </StyledSelect2>
        </FormGroup>
        <h3>{_('From Vector')}:</h3>
        <FormGroup title={_('Vector')}>
          <StyledTextField
            name="cvssOutput"
            value={cvssOutput}
            onChange={this.handleInputChange}
            onBlur={this.handleValueChangeVector}
            onKeyDown={this.handleKeyDown}
          />
        </FormGroup>
        <h3>{_('Results')}:</h3>
        <FormGroup title={_('CVSS-Base-Vector')}>
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

export default withContext({
  gmp: PropTypes.gmp.isRequired,
})(CvssCalculator);
