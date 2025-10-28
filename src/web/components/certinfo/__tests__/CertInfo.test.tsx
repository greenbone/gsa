/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {screen, rendererWith} from 'web/testing';
import Credential, {type CertificateInfo} from 'gmp/models/credential';
import date from 'gmp/models/date';
import CertInfo from 'web/components/certinfo/CertInfo';
import {setTimezone} from 'web/store/usersettings/actions';

describe('CertInfo tests', () => {
  test('should render cert info with all fields', () => {
    const credential = new Credential({
      id: '5678',
      name: 'Test Credential',
      certificate_info: {
        activationTime: date('2023-01-01T00:00:00Z'),
        expirationTime: date('2024-01-01T00:00:00Z'),
        issuer: 'Test Issuer',
        md5Fingerprint: 'AA:BB:CC:DD:EE:FF',
      },
    });
    const {render, store} = rendererWith({store: true});
    store.dispatch(setTimezone('UTC'));

    render(<CertInfo info={credential.certificate_info as CertificateInfo} />);

    expect(screen.getByTestId('cert-info-table')).toBeInTheDocument();
    expect(screen.getByTestId('cert-info-activation-label')).toHaveTextContent(
      'Activation',
    );
    expect(screen.getByTestId('cert-info-activation-data')).toHaveTextContent(
      'Sun, Jan 1, 2023 12:00 AM Coordinated Universal Time',
    );
    expect(screen.getByTestId('cert-info-expiration-label')).toHaveTextContent(
      'Expiration',
    );
    expect(screen.getByTestId('cert-info-expiration-data')).toHaveTextContent(
      'Mon, Jan 1, 2024 12:00 AM Coordinated Universal Time',
    );
    expect(screen.getByTestId('cert-info-md5-label')).toHaveTextContent(
      'MD5 Fingerprint',
    );
    expect(screen.getByTestId('cert-info-md5-data')).toHaveTextContent(
      'AA:BB:CC:DD:EE:FF',
    );
  });
});
