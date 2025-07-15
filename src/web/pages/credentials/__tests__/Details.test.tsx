/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Credential, {SNMP_CREDENTIAL_TYPE} from 'gmp/models/credential';
import CredentialDetails from 'web/pages/credentials/Details';

const capabilities = new EverythingCapabilities();
const defaultEntity = Credential.fromElement({
  _id: 'c1',
  name: 'test-cred',
  comment: 'Test credential comment',
  type: 'krb5',
  credential_type: 'krb5',
  allow_insecure: 1,
  login: 'testuser',
  realm: 'EXAMPLE.REALM',
  kdcs: {
    kdc: ['kdc1.example.com', 'kdc2.example.com'],
  },
  targets: {
    target: [
      {_id: 't1', name: 'Target One'},
      {_id: 't2', name: 'Target Two'},
    ],
  },
  scanners: {
    scanner: [
      {_id: 's1', name: 'Scanner One'},
      {_id: 's2', name: 'Scanner Two'},
    ],
  },
});

describe('CredentialDetails', () => {
  test('should render basic credential details', () => {
    const {render} = rendererWith({capabilities});
    render(<CredentialDetails entity={defaultEntity} />);
    expect(screen.getByText('Test credential comment')).toBeVisible();
    expect(screen.getByText('Yes')).toBeVisible();
    expect(screen.getByText('testuser')).toBeVisible();
  });

  test('should render realm and kdcs when credential type is KRB5', () => {
    const {render} = rendererWith({capabilities});
    render(<CredentialDetails entity={defaultEntity} />);
    expect(screen.getByText('EXAMPLE.REALM')).toBeVisible();
    expect(screen.getByText('kdc1.example.com')).toBeVisible();
    expect(screen.getByText('kdc2.example.com')).toBeVisible();
  });

  test('should render SNMP fields when credential type is SNMP', () => {
    const entity = Credential.fromElement({
      _id: 'cred-snmp',
      type: SNMP_CREDENTIAL_TYPE,
      comment: 'SNMP cred',
      login: 'snmp-user',
      credential_type: SNMP_CREDENTIAL_TYPE,
    });

    // @ts-expect-error: test override
    entity.auth_algorithm = 'sha1';
    // @ts-expect-error: test override
    entity.privacy = {algorithm: ''};

    const {render} = rendererWith({capabilities});
    render(<CredentialDetails entity={entity} />);
    expect(screen.getByText('sha1')).toBeVisible();
    expect(screen.getByText('None')).toBeVisible();
  });

  test('should render targets and scanners as links', () => {
    const {render} = rendererWith({capabilities});
    render(<CredentialDetails entity={defaultEntity} />);
    expect(screen.getByText('Target One')).toBeVisible();
    expect(screen.getByText('Target Two')).toBeVisible();
    expect(screen.getByText('Scanner One')).toBeVisible();
    expect(screen.getByText('Scanner Two')).toBeVisible();
  });

  test('should fallback safely when optional fields are missing', () => {
    const entity = Credential.fromElement({
      _id: 'c-krb5',
      type: 'krb5',
      comment: 'KRB5 cred',
      login: 'kerbuser',
      realm: undefined,
      kdcs: undefined,
    });
    const {render} = rendererWith({capabilities});
    render(<CredentialDetails entity={entity} />);
    expect(screen.queryByText('Key Distribution Center')).not.toBeNull();
  });
});
