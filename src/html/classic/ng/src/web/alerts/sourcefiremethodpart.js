/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import _ from '../../locale.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';
import {withPrefix} from '../render.js';

import Spinner from '../form/spinner.js';
import FormGroup from '../form/formgroup.js';
import TextField from '../form/textfield.js';
import FileField from '../form/filefield.js';

const SourcefireMethodPart = ({
    prefix,
    defenseCenterIp,
    defenseCenterPort,
    onChange,
  }) => {
  return (
    <Layout
      flex="column"
      box
      grow="1">
      <FormGroup title={_('Defense Center IP')}>
        <TextField
          size="30"
          maxLength="40"
          name={prefix + 'defense_center_ip'}
          value={defenseCenterIp}
          onChange={onChange}/>
      </FormGroup>

      <FormGroup title={_('Defense Center Port')}>
        <Spinner
          name={prefix + 'defense_center_port'}
          value={defenseCenterPort}
          onChange={onChange}
          type="int"
          max="65535"
          min="0"/>
      </FormGroup>

      <FormGroup title={_('PKCS12 file')}>
        <FileField
          name={prefix + 'pkcs12'}
          onChange={onChange}/>
      </FormGroup>
    </Layout>
  );
};

SourcefireMethodPart.propTypes = {
  prefix: React.PropTypes.string,
  defenseCenterIp: React.PropTypes.string.isRequired,
  defenseCenterPort: PropTypes.number.isRequired,
  onChange: React.PropTypes.func,
};

export default withPrefix(SourcefireMethodPart);

// vim: set ts=2 sw=2 tw=80:
