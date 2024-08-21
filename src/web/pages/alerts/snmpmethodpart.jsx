/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';
import withPrefix from 'web/utils/withPrefix';

import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';

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
