/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type ScanConfigPreference,
  type ScanConfigPreferenceValue,
} from 'gmp/models/scan-config';
import {NO_VALUE, parseYesNo, YES_VALUE, type YesNo} from 'gmp/parser';
import {FoldState} from 'web/components/folding/Folding';
import TextField from 'web/components/form/TextField';
import YesNoRadio from 'web/components/form/YesNoRadio';
import Layout from 'web/components/layout/Layout';
import Section from 'web/components/section/Section';
import Table from 'web/components/table/StripedTable';
import TableBody from 'web/components/table/TableBody';
import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import {renderYesNo} from 'web/utils/Render';

interface SetValueAction {
  type: 'setValue';
  newState: Record<string, ScanConfigPreferenceValue>;
}

interface ScanConfigScannerPreferencesProps {
  preferences?: ScanConfigPreference[];
  values?: Record<string, ScanConfigPreferenceValue>;
  onValuesChange: (action: SetValueAction) => void;
}

interface ScanConfigScannerPreferenceProps {
  defaultValue?: ScanConfigPreferenceValue;
  displayName: string;
  name: string;
  value: ScanConfigPreferenceValue;
  onPreferenceChange?: (value: ScanConfigPreferenceValue, name: string) => void;
}

const ScanConfigScannerPreference = ({
  displayName,
  defaultValue,
  name,
  value,
  onPreferenceChange,
}: ScanConfigScannerPreferenceProps) => {
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
            <YesNoRadio
              convert={parseYesNo}
              name={name}
              noValue={NO_VALUE}
              value={value as YesNo}
              yesValue={YES_VALUE}
              onChange={
                onPreferenceChange as (value: YesNo, name?: string) => void
              }
            />
          </Layout>
        ) : (
          <TextField
            name={name}
            value={value as string}
            onChange={
              onPreferenceChange as (value: string, name?: string) => void
            }
          />
        )}
      </TableData>
      <TableData>
        {isRadio ? renderYesNo(defaultValue as YesNo) : defaultValue}
      </TableData>
    </TableRow>
  );
};

const ScanConfigScannerPreferences = ({
  preferences = [],
  values = {},
  onValuesChange,
}: ScanConfigScannerPreferencesProps) => {
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
            <ScanConfigScannerPreference
              key={pref.name}
              defaultValue={pref.default}
              displayName={pref.hr_name as string}
              name={pref.name as string}
              value={values[pref.name as string]}
              onPreferenceChange={(value, name) =>
                onValuesChange({
                  type: 'setValue',
                  newState: {[name as string]: value},
                })
              }
            />
          ))}
        </TableBody>
      </Table>
    </Section>
  );
};

export default ScanConfigScannerPreferences;
