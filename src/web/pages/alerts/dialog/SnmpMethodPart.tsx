/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import FormGroup from 'web/components/form/FormGroup';
import TextField from 'web/components/form/TextField';
import useTranslation from 'web/hooks/useTranslation';
import addPrefix from 'web/utils/add-prefix';

interface SnmpMethodPartProps {
  prefix?: string;
  snmpAgent?: string;
  snmpCommunity?: string;
  snmpMessage?: string;
  onChange: (value: string, name?: string) => void;
}

const SnmpMethodPart = ({
  prefix: initialPrefix,
  snmpAgent,
  snmpCommunity,
  snmpMessage,
  onChange,
}: SnmpMethodPartProps) => {
  const prefix = addPrefix(initialPrefix);
  const [_] = useTranslation();
  return (
    <>
      <FormGroup>
        <TextField
          name={prefix('snmp_community')}
          title={_('Community')}
          value={snmpCommunity}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup>
        <TextField
          name={prefix('snmp_agent')}
          title={_('Agent')}
          value={snmpAgent}
          onChange={onChange}
        />
      </FormGroup>

      <FormGroup>
        <TextField
          name={prefix('snmp_message')}
          title={_('Message')}
          value={snmpMessage}
          onChange={onChange}
        />
      </FormGroup>
    </>
  );
};

export default SnmpMethodPart;
