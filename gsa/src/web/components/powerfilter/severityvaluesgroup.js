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

import PropTypes from 'web/utils/proptypes.js';

import FormGroup from 'web/components/form/formgroup.js';
import {parseSeverity} from 'gmp/parser.js';
import RelationSelector from 'web/components/powerfilter/relationselector';
import NumberField from 'web/components/form/numberfield';

class SeverityValuesGroup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      relation: '=',
    };

    this.handleRelationChange = this.handleRelationChange.bind(this);
  }

  handleRelationChange(rel) {
    this.setState({
      relation: rel,
    });
    const severity = parseSeverity(this.props.filter.get(this.props.name));
    const keyword = this.props.name;

    this.props.onChange(severity, keyword, rel);
  }

  render() {
    const severity = parseSeverity(this.props.filter.get(this.props.name));
    const newRelation = this.state.relation;
    const keyword = this.props.name;
    return (
      <div>
        <FormGroup title={this.props.title}>
          <RelationSelector
            relation={newRelation}
            onChange={this.handleRelationChange}
          />
          <NumberField
            name={this.props.name}
            type="int"
            min={0}
            max={10}
            value={severity}
            size="5"
            onChange={(value = severity, name = keyword) =>
              this.props.onChange(value, name, newRelation)
            }
          />
        </FormGroup>
      </div>
    );
  }
}

SeverityValuesGroup.propTypes = {
  filter: PropTypes.filter,
  name: PropTypes.string,
  title: PropTypes.string,
  onChange: PropTypes.func,
};

export default SeverityValuesGroup;
