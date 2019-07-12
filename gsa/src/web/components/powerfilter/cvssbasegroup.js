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
import Spinner from '../form/spinner.js';
import {parseSeverity} from 'gmp/parser.js';
import RelationSelector from 'web/components/powerfilter/relationselector';

class CvssBaseGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'cvss_base',
      cvss: parseSeverity(props.filter.get('cvss_base')),
      relation: '',
    };

    this.handleRelationChange = this.handleRelationChange.bind(this);
  }

  handleRelationChange(value) {
    this.setState({
      relation: value,
    });
  }

  render() {
    return (
      <div>
        <FormGroup title={_('Severity')}>
          <RelationSelector
            relation={this.state.relation}
            onChange={this.handleRelationChange}
          />
          <h3>{this.state.relation}</h3>
          <Spinner
            type="int"
            min="0"
            max="10"
            name={this.state.name}
            value={this.state.cvss}
            size="5"
            onChange={(
              value = this.state.cvss,
              name = this.state.name,
              relation = this.state.relation,
            ) => this.props.onChange(value, name, relation)}
          />
        </FormGroup>
      </div>
    );
  }
}

CvssBaseGroup.propTypes = {
  filter: PropTypes.filter,
  name: PropTypes.string,
  onChange: PropTypes.func,
};

export default CvssBaseGroup;
