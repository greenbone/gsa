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

import _ from 'gmp/locale';

import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';
import withPrefix from '../../utils/withPrefix.js';

import FormGroup from '../../components/form/formgroup.js';
import TextField from '../../components/form/textfield.js';

const SnmpMethodPart = ({
    prefix,
    snmpAgent,
    snmpCommunity,
    snmpMessage,
    onChange,
  }) => {
  return (
    <Layout
      flex="column"
      grow="1"
      box
    >
      <FormGroup title={_('Community')}>
        <TextField
          size="30"
          maxLength="301"
          name={prefix + 'snmp_community'}
          value={snmpCommunity}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Agent')}>
        <TextField
          size="30"
          maxLength="301"
          name={prefix + 'snmp_agent'}
          value={snmpAgent}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Message')}>
        <TextField
          size="30"
          maxLength="301"
          name={prefix + 'snmp_message'}
          value={snmpMessage}
          onChange={onChange}
        />
      </FormGroup>
    </Layout>
  );
};

SnmpMethodPart.propTypes = {
  prefix: PropTypes.string,
  snmpAgent: PropTypes.string,
  snmpCommunity: PropTypes.string,
  snmpMessage: PropTypes.string,
  onChange: PropTypes.func,
};


export default withPrefix(SnmpMethodPart);

// vim: set ts=2 sw=2 tw=80:
