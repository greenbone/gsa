/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';
import TlsCertificate from 'gmp/models/tlscertificate';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import DetailsPage from 'web/pages/tlscertificates/DetailsPage';
import {entityLoadingActions} from 'web/store/entities/tlscertificates';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const tlsCertificate = TlsCertificate.fromElement({
  _id: '1234',
  owner: {name: 'admin'},
  comment: 'bar',
  certificate: {
    __text: 'abcdefg12345',
    _format: 'DER',
  },
  issuer_dn: 'CN=LoremIpsumIssuer C=Dolor',
  subject_dn: 'CN=LoremIpsumSubject C=Dolor',
  activation_time: '2019-08-10T12:51:27Z',
  creation_time: '2019-07-10T12:51:27Z',
  expiration_time: '2019-09-10T12:51:27Z',
  modification_time: '2019-12-10T12:51:27Z',
  last_seen: '2019-10-10T12:51:27Z',
  serial: '123',
  sha256_fingerprint: '2142',
  md5_fingerprint: '4221',
  valid: 1,
  permissions: {permission: [{name: 'everything'}]},
});

const caps = new Capabilities(['everything']);

const reloadInterval = 1;
const manualUrl = 'test/';

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

const getEntities = testing.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

describe('TLS Certificate DetailsPage tests', () => {
  test('should render full DetailsPage', () => {
    const getTlsCertificate = testing.fn().mockResolvedValue({
      data: tlsCertificate,
    });

    const gmp = {
      tlscertificate: {
        get: getTlsCertificate,
      },
      permissions: {
        get: getEntities,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('1234', tlsCertificate));

    const {baseElement, container} = render(<DetailsPage id="1234" />);

    expect(container).toHaveTextContent(
      'TLS Certificate: CN=LoremIpsumSubject C=Dolor',
    );

    const links = baseElement.querySelectorAll('a');

    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: TLS Certificate Assets',
    );
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-assets.html#managing-tls-certificates',
    );
    expect(screen.getByTestId('list-icon')).toHaveAttribute(
      'title',
      'TLS Certificates List',
    );
    expect(links[1]).toHaveAttribute('href', '/tlscertificates');

    const entityInfo = screen.getByTestId('entity-info');
    expect(entityInfo).toHaveTextContent('1234');
    expect(entityInfo).toHaveTextContent(
      'Wed, Jul 10, 2019 12:51 PM Coordinated Universal Time',
    );
    expect(entityInfo).toHaveTextContent(
      'Tue, Dec 10, 2019 12:51 PM Coordinated Universal Time',
    );
    expect(entityInfo).toHaveTextContent('admin');

    const details = screen.getByTestId('tls-certificate-details-1234');
    expect(details).toHaveTextContent('Subject DNCN=LoremIpsumSubject C=Dolor');
    expect(details).toHaveTextContent('Issuer DNCN=LoremIpsumIssuer C=Dolor');
    expect(details).toHaveTextContent('ValidYes');
    expect(details).toHaveTextContent(
      'ActivatesSat, Aug 10, 2019 12:51 PM Coordinated Universal Time',
    );
    expect(details).toHaveTextContent(
      'ExpiresTue, Sep 10, 2019 12:51 PM Coordinated Universal Time',
    );
    expect(details).toHaveTextContent('SHA-256 Fingerprint2142');
    expect(details).toHaveTextContent('MD5 Fingerprint4221');
  });
});
