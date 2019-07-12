/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import _ from 'gmp/locale';

import PropTypes from '../../utils/proptypes.js';

import FormGroup from '../form/formgroup.js';
import {parseSeverity} from 'gmp/parser.js';
import RelationSelector from 'web/components/powerfilter/relationselector';
import NumberField from 'web/components/form/numberfield';

const FILTER_TITLE = {
  cvss_base: 'Severity',
};

class SeverityValuesGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterVal: parseSeverity(props.filter.get(this.props.name)),
      relation: '=',
    };

    this.handleRelationChange = this.handleRelationChange.bind(this);
  }

  handleRelationChange(value) {
    this.setState({
      relation: value,
    });
  }

  render() {
    const formTitle = FILTER_TITLE[this.props.name];
    return (
      <div>
        <FormGroup title={_(formTitle)}>
          <RelationSelector
            relation={this.state.relation}
            onChange={this.handleRelationChange}
          />
          <NumberField
            type="int"
            min="0"
            max="10"
            value={this.state.filterVal}
            size="5"
            onChange={(
              value = this.state.filterVal,
              name = this.props.name,
              relation = this.state.relation,
            ) => this.props.onChange(value, name, relation)}
          />
        </FormGroup>
      </div>
    );
  }
}

SeverityValuesGroup.propTypes = {
  filter: PropTypes.filter,
  name: PropTypes.string,
  onChange: PropTypes.func,
};

export default SeverityValuesGroup;
