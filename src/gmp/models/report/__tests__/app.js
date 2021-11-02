/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
import App from '../app';

describe('App tests', () => {
  test('should initialize hosts', () => {
    const app1 = new App();

    expect(app1.hosts).toBeDefined();
    expect(app1.hosts.hostsByIp).toBeDefined();
    expect(app1.hosts.count).toEqual(0);

    const app2 = App.fromElement();

    expect(app2.hosts).toBeDefined();
    expect(app2.hosts.hostsByIp).toBeDefined();
    expect(app2.hosts.count).toEqual(0);
  });

  test('should initialize occurrences', () => {
    const app1 = new App();

    expect(app1.occurrences).toBeDefined();
    expect(app1.occurrences.details).toEqual(0);
    expect(app1.occurrences.total).toEqual(0);
    expect(app1.occurrences.withoutDetails).toEqual(0);

    const app2 = App.fromElement();
    expect(app2.occurrences).toBeDefined();
    expect(app2.occurrences.details).toEqual(0);
    expect(app2.occurrences.total).toEqual(0);
    expect(app2.occurrences.withoutDetails).toEqual(0);
  });

  test('should parse cpe', () => {
    const app = App.fromElement({value: 'foo'});

    expect(app.id).toEqual('foo');
    expect(app.name).toEqual('foo');
  });

  test('should parse severity', () => {
    const app = App.fromElement({severity: '5.5'});

    expect(app.severity).toEqual(5.5);
  });

  test('should add hosts', () => {
    const app = App.fromElement();

    expect(app.hosts).toBeDefined();
    expect(app.hosts.hostsByIp).toEqual({});
    expect(app.hosts.count).toEqual(0);

    const host = {name: 'foo', ip: '1.2.3.4'};
    app.addHost(host);

    expect(app.hosts.hostsByIp['1.2.3.4']).toEqual(host);
    expect(app.hosts.count).toEqual(1);
  });

  test('should allow to add occurrence with details', () => {
    const app = App.fromElement();

    expect(app.occurrences).toBeDefined();
    expect(app.occurrences.details).toEqual(0);
    expect(app.occurrences.total).toEqual(0);
    expect(app.occurrences.withoutDetails).toEqual(0);

    app.addOccurence(5);

    expect(app.occurrences.details).toEqual(5);
    expect(app.occurrences.total).toEqual(5);
    expect(app.occurrences.withoutDetails).toEqual(0);
  });

  test('should allow to add occurrence without details', () => {
    const app = App.fromElement();

    expect(app.occurrences).toBeDefined();
    expect(app.occurrences.details).toEqual(0);
    expect(app.occurrences.total).toEqual(0);
    expect(app.occurrences.withoutDetails).toEqual(0);

    app.addOccurence();

    expect(app.occurrences.details).toEqual(0);
    expect(app.occurrences.total).toEqual(1);
    expect(app.occurrences.withoutDetails).toEqual(1);
  });
});
