/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import CollectionCounts from 'gmp/collection/collectioncounts';
import Filter from 'gmp/models/filter';
import TlsCertificate from 'gmp/models/task';
import {
  queryPowerFilter,
  getSelectElement,
  queryTextInputs,
} from 'web/components/testing';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import TlsCertificatePage from 'web/pages/tlscertificates/ListPage';
import {entitiesLoadingActions} from 'web/store/entities/tasks';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';
import {rendererWith, screen, wait} from 'web/utils/Testing';

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
  expiration_time: '2019-09-10T12:51:27Z',
  last_seen: '2019-10-10T12:51:27Z',
  serial: '123',
  sha256_fingerprint: '2142',
  md5_fingerprint: '4221',
  permissions: {permission: [{name: 'everything'}]},
});

const reloadInterval = 1;
const manualUrl = 'test/';

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

const getFilters = testing.fn().mockReturnValue(
  Promise.resolve({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
);

const getDashboardSetting = testing.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const getUserSetting = testing.fn().mockResolvedValue({
  filter: null,
});

const getAggregates = testing.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const getTlsCertificates = testing.fn().mockResolvedValue({
  data: [tlsCertificate],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

describe('TlsCertificatePage tests', () => {
  test('should render full TlsCertificatePage', async () => {
    const gmp = {
      tlscertificates: {
        get: getTlsCertificates,
        getAll: getTlsCertificates,
        getTimeStatusAggregates: getAggregates,
        getModifiedAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      dashboard: {
        getSetting: getDashboardSetting,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {currentSettings, getSetting: getUserSetting},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success(
        'tlscertificate',
        defaultSettingfilter,
      ),
    );

    const counts = new CollectionCounts({
      first: 1,
      all: 1,
      filtered: 1,
      length: 1,
      rows: 10,
    });
    const filter = Filter.fromString('first=1 rows=10');
    const loadedFilter = Filter.fromString('first=1 rows=10');
    store.dispatch(
      entitiesLoadingActions.success(
        [tlsCertificate],
        filter,
        loadedFilter,
        counts,
      ),
    );

    const {baseElement} = render(<TlsCertificatePage />);

    await wait();

    const display = screen.getAllByTestId('grid-item');
    const header = baseElement.querySelectorAll('th');
    const row = baseElement.querySelectorAll('tr');
    const powerFilter = queryPowerFilter();
    const select = getSelectElement(powerFilter);
    const inputs = queryTextInputs(powerFilter);

    // Toolbar Icon
    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: TLS Certificate Assets',
    );

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    screen.getAllByTitle('Update Filter');
    screen.getAllByTitle('Remove Filter');
    screen.getAllByTitle('Reset to Default Filter');
    screen.getAllByTitle('Help: Powerfilter');
    screen.getAllByTitle('Edit Filter');
    expect(select).toHaveAttribute('title', 'Loaded filter');
    expect(select).toHaveValue('--');

    // Dashboard
    screen.getAllByTitle('Add new Dashboard Display');
    screen.getAllByTitle('Reset to Defaults');
    expect(display[0]).toHaveTextContent(
      'TLS Certificates by Status (Total: 1)',
    );
    expect(display[1]).toHaveTextContent(
      'TLS Certificates by Modification Time (Total: 0)',
    );

    // Table
    expect(header[0]).toHaveTextContent('Subject DN');
    expect(header[1]).toHaveTextContent('Serial');
    expect(header[2]).toHaveTextContent('Activates');
    expect(header[3]).toHaveTextContent('Expires');
    expect(header[4]).toHaveTextContent('Last seen');
    expect(header[5]).toHaveTextContent('Actions');

    expect(row[1]).toHaveTextContent('123');
    // TODO the following expects don't work as they should. The row only shows
    // the serial but not the issuerDn or timestamps

    // expect(row[1]).toHaveTextContent('CN=LoremIpsum C=Dolor');
    // expect(row[1]).toHaveTextContent('Sat, Aug 10, 2019 12:51 PM UTC');
    // expect(row[1]).toHaveTextContent('Tue, Sep 10, 2019 12:51 PM UTC');
    // expect(row[1]).toHaveTextContent('Thu, Oct 10, 2019 12:51 PM UTC');

    screen.getAllByTitle('Delete TLS Certificate');
    screen.getAllByTitle('Download TLS Certificate');
    screen.getAllByTitle('Export TLS Certificate as XML');
    screen.getAllByTitle('Add tag to page contents');
    screen.getAllByTitle('Delete page contents');
    screen.getAllByTitle('Export page contents');
  });
});
