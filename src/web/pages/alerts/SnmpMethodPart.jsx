/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import FormGroup from 'web/components/form/FormGroup';
import TextField from 'web/components/form/TextField';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import withPrefix from 'web/utils/withPrefix';

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
