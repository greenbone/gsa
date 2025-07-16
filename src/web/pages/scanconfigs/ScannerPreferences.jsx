/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {parseInt} from 'gmp/parser';
import {FoldState} from 'web/components/folding/Folding';
import TextField from 'web/components/form/TextField';
import YesNoRadio from 'web/components/form/YesNoRadio';
import Layout from 'web/components/layout/Layout';
import Section from 'web/components/section/Section';
import TableBody from 'web/components/table/Body';
import TableData from 'web/components/table/Data';
import TableHeader from 'web/components/table/Header';
import Table from 'web/components/table/StripedTable';
import TableHead from 'web/components/table/TableHead';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const ScannerPreference = ({
  displayName,
  defaultValue,
  name,
  value,
  onPreferenceChange,
}) => {
  const isRadio =
    name === 'ping_hosts' ||
    name === 'reverse_lookup' ||
    name === 'unscanned_closed' ||
    name === 'nasl_no_signature_check' ||
    name === 'reverse_lookup' ||
    name === 'unscanned_closed_udp' ||
    name === 'auto_enable_dependencies' ||
    name === 'kb_dont_replay_attacks' ||
    name === 'kb_dont_replay_denials' ||
    name === 'kb_dont_replay_info_gathering' ||
    name === 'kb_dont_replay_scanners' ||
    name === 'kb_restore' ||
    name === 'log_whole_attack' ||
    name === 'test_empty_vhost' ||
    name === 'only_test_hosts_whose_kb_we_dont_have' ||
    name === 'only_test_hosts_whose_kb_we_have' ||
    name === 'optimize_test' ||
    name === 'safe_checks' ||
    name === 'save_knowledge_base' ||
    name === 'silent_dependencies' ||
    name === 'slice_network_addresses' ||
    name === 'drop_privileges' ||
    name === 'network_scan' ||
    name === 'report_host_details';
  return (
    <TableRow>
      <TableData>{displayName}</TableData>
      <TableData>
        {isRadio ? (
          <Layout>
            <YesNoRadio // booleans are now 1 and 0 and not yes/no.
              convert={parseInt}
              name={name}
              noValue={0}
              value={value}
              yesValue={1}
              onChange={onPreferenceChange}
            />
          </Layout>
        ) : (
          <TextField name={name} value={value} onChange={onPreferenceChange} />
        )}
      </TableData>
      <TableData>{defaultValue}</TableData>
    </TableRow>
  );
};

ScannerPreference.propTypes = {
  defaultValue: PropTypes.any,
  displayName: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  onPreferenceChange: PropTypes.func,
};

const ScannerPreferences = ({
  preferences = [],
  values = {},
  onValuesChange,
}) => {
  const [_] = useTranslation();
  return (
    <Section
      foldable
      data-testid="scanner-preferences-section"
      initialFoldState={FoldState.FOLDED}
      title={_('Edit Scanner Preferences ({{counts}})', {
        counts: preferences.length,
      })}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{_('Name')}</TableHead>
            <TableHead>{_('New Value')}</TableHead>
            <TableHead>{_('Default Value')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {preferences.map(pref => (
            <ScannerPreference
              key={pref.name}
              defaultValue={pref.default}
              displayName={pref.hr_name}
              name={pref.name}
              value={values[pref.name]}
              onPreferenceChange={(value, name) =>
                onValuesChange({type: 'setValue', newState: {[name]: value}})
              }
            />
          ))}
        </TableBody>
      </Table>
    </Section>
  );
};

export const ScannerPreferencePropType = PropTypes.shape({
  default: PropTypes.any,
  hr_name: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.any,
});

ScannerPreferences.propTypes = {
  preferences: PropTypes.arrayOf(ScannerPreferencePropType),
  values: PropTypes.object,
  onValuesChange: PropTypes.func.isRequired,
};

export default ScannerPreferences;
