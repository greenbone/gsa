/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ReportOperatingSystemsCommand from 'gmp/commands/report-operating-system';
import {createHttp, createResponse} from 'gmp/commands/testing';

const makeResponse = (operatingSystems: object) =>
  createResponse({
    get_report_operating_systems: {
      get_report_operating_systems_response: {
        operating_systems: operatingSystems,
      },
    },
  });

describe('ReportOperatingSystemsCommand tests', () => {
  test('should fetch and parse multiple OS entities', async () => {
    const response = makeResponse({
      operating_system: [
        {best_os_cpe: 'cpe:/foo/bar', best_os_txt: 'Foo OS', hosts_count: '2'},
        {
          best_os_cpe: 'cpe:/lorem/ipsum',
          best_os_txt: 'Lorem OS',
          hosts_count: '5',
        },
      ],
    });
    const fakeHttp = createHttp(response);
    const cmd = new ReportOperatingSystemsCommand(fakeHttp);

    const result = await cmd.get({report_id: '1234'});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_operating_systems',
        details: 1,
        report_id: '1234',
      },
    });

    expect(result.data).toHaveLength(2);
    expect(result.data[0].cpe).toBe('cpe:/foo/bar');
    expect(result.data[0].name).toBe('Foo OS');
    expect(result.data[0].hosts.count).toBe(2);
    expect(result.data[1].cpe).toBe('cpe:/lorem/ipsum');
    expect(result.data[1].name).toBe('Lorem OS');
    expect(result.data[1].hosts.count).toBe(5);
  });

  test('should fetch and parse a single OS entity (non-array from XML)', async () => {
    const response = makeResponse({
      operating_system: {
        best_os_cpe: 'cpe:/single/os',
        best_os_txt: 'Single OS',
        hosts_count: '3',
      },
    });
    const fakeHttp = createHttp(response);
    const cmd = new ReportOperatingSystemsCommand(fakeHttp);

    const result = await cmd.get({report_id: '1234'});

    expect(result.data).toHaveLength(1);
    expect(result.data[0].cpe).toBe('cpe:/single/os');
    expect(result.data[0].name).toBe('Single OS');
    expect(result.data[0].hosts.count).toBe(3);
  });

  test('should return correct CollectionCounts', async () => {
    const response = makeResponse({
      operating_system: [
        {best_os_cpe: 'cpe:/a', best_os_txt: 'OS A', hosts_count: '1'},
        {best_os_cpe: 'cpe:/b', best_os_txt: 'OS B', hosts_count: '10'},
      ],
    });
    const fakeHttp = createHttp(response);
    const cmd = new ReportOperatingSystemsCommand(fakeHttp);

    const result = await cmd.get({report_id: '1234'});

    expect(result.meta.counts.all).toBe(2);
    expect(result.meta.counts.filtered).toBe(2);
    expect(result.meta.counts.length).toBe(2);
  });

  test('should handle empty operating_systems', async () => {
    const response = makeResponse({});
    const fakeHttp = createHttp(response);
    const cmd = new ReportOperatingSystemsCommand(fakeHttp);

    const result = await cmd.get({report_id: '1234'});

    expect(result.data).toHaveLength(0);
    expect(result.meta.counts.all).toBe(0);
  });

  test('should throw when response wrapper is missing', async () => {
    const response = createResponse({});
    const fakeHttp = createHttp(response);
    const cmd = new ReportOperatingSystemsCommand(fakeHttp);

    await expect(cmd.get({report_id: '1234'})).rejects.toThrow(
      'Invalid response: get_report_operating_systems not found in response',
    );
  });
});
