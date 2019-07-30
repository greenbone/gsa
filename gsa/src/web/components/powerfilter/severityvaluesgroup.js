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
import React, {useState} from 'react';

import PropTypes from 'web/utils/proptypes.js';

import FormGroup from 'web/components/form/formgroup.js';
import {parseSeverity} from 'gmp/parser.js';
import RelationSelector from 'web/components/powerfilter/relationselector';
import NumberField from 'web/components/form/numberfield';
import Divider from '../layout/divider';

const SeverityValuesGroup = ({filter, name, title, onChange}) => {
  const [rel, setRel] = useState('=');
  const severity = parseSeverity(filter.get(name));
  const keyword = name;

  return (
    <FormGroup title={title}>
      <Divider>
        <RelationSelector relation={rel} onChange={newRel => setRel(newRel)} />
        <NumberField
          name={keyword}
          type="int"
          min={0}
          max={10}
          value={severity}
          size="5"
          // eslint-disable-next-line no-shadow
          onChange={(value = severity, name = keyword) =>
            onChange(value, name, rel)
          }
        />
      </Divider>
    </FormGroup>
  );
};

SeverityValuesGroup.propTypes = {
  filter: PropTypes.filter,
  name: PropTypes.string,
  title: PropTypes.string,
  onChange: PropTypes.func,
};

export default SeverityValuesGroup;
