/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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
import React from 'react';

import _ from 'gmp/locale';

import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';

import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';
import withPrefix from 'web/utils/withPrefix';

const SnmpMethodPart = ({
  prefix,
  snmpAgent,
  snmpCommunity,
  snmpMessage,
  onChange,
}) => {
  return (
    <Layout flex="column" grow="1">
      <FormGroup title={_('Community')}>
        <TextField
          size="30"
          name={prefix + 'snmp_community'}
          value={snmpCommunity}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Agent')}>
        <TextField
          size="30"
          name={prefix + 'snmp_agent'}
          value={snmpAgent}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Message')}>
        <TextField
          size="30"
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
