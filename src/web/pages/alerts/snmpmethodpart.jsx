/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import PropTypes from 'web/utils/proptypes';
import withPrefix from 'web/utils/withPrefix';

import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';

import useTranslation from 'web/hooks/useTranslation';

const SnmpMethodPart = ({
  prefix,
  snmpAgent,
  snmpCommunity,
  snmpMessage,
  onChange,
}) => {
  const [_] = useTranslation();
  return (
    <>
      <FormGroup title={_('Community')}>
        <TextField
          name={prefix + 'snmp_community'}
          value={snmpCommunity}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Agent')}>
        <TextField
          name={prefix + 'snmp_agent'}
          value={snmpAgent}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup title={_('Message')}>
        <TextField
          name={prefix + 'snmp_message'}
          value={snmpMessage}
          onChange={onChange}
        />
      </FormGroup>
    </>
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
