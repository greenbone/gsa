/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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
import {parseInt} from 'gmp/parser';

import {FoldState} from 'web/components/folding/folding';

import TextField from 'web/components/form/textfield';
import YesNoRadio from 'web/components/form/yesnoradio';

import Layout from 'web/components/layout/layout';

import Section from 'web/components/section/section';

import Table from 'web/components/table/stripedtable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHeader from 'web/components/table/header';
import TableHead from 'web/components/table/head';
import TableRow from 'web/components/table/row';

import PropTypes from 'web/utils/proptypes';
import {updateState} from 'web/utils/stateReducer';

const ScannerPreference = ({
  displayName,
  defaultValue,
  name,
  value,
  onPreferenceChange,
}) => {
  const is_radio =
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
        {is_radio ? (
          <Layout>
            <YesNoRadio // booleans are now 1 and 0 and not yes/no.
              yesValue={1}
              noValue={0}
              name={name}
              value={parseInt(value)} // scanner preferences are "1" and "0" and should be preconverted for the right radio button to be checked.
              convert={parseInt}
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
  return (
    <Section
      foldable
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
              displayName={pref.hrName}
              name={pref.name}
              value={values[pref.name]}
              onPreferenceChange={(value, name) =>
                onValuesChange(updateState({[name]: value}))
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
  hrName: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.any,
});

ScannerPreferences.propTypes = {
  preferences: PropTypes.arrayOf(ScannerPreferencePropType),
  values: PropTypes.object,
  onValuesChange: PropTypes.func.isRequired,
};

export default ScannerPreferences;
