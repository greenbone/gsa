/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ReportHostsCommand from 'gmp/commands/report-hosts';
import {createHttp, createEntityResponse} from 'gmp/commands/testing';

describe('ReportHostsCommand tests', () => {
  test('should request report hosts with default options', async () => {
    const response = createEntityResponse('get_report_hosts_response', {
      host: {
        ip: '127.0.0.1',
      },
      report_host_count: {
        __text: 1,
        filtered: 1,
        page: 0,
      },
    });
    const fakeHttp = createHttp(response);

    const cmd = new ReportHostsCommand(fakeHttp);
    await cmd.get({id: 'foo'});

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_hosts',
        report_id: 'foo',
        filter: undefined,
        lean: 1,
        ignore_pagination: 1,
        details: 1,
      },
    });
  });

  test('should request report hosts with provided options', async () => {
    const response = createEntityResponse('get_report_hosts_response', {
      host: {
        ip: '127.0.0.1',
      },
      report_host_count: {
        __text: 1,
        filtered: 1,
        page: 0,
      },
    });
    const fakeHttp = createHttp(response);

    const cmd = new ReportHostsCommand(fakeHttp);
    await cmd.get(
      {id: 'foo'},
      {
        filter: 'rows=10 first=1',
        lean: false,
        ignorePagination: false,
        details: false,
      },
    );

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_hosts',
        report_id: 'foo',
        filter: 'rows=10 first=1',
        lean: 0,
        ignore_pagination: 0,
        details: 0,
      },
    });
  });

  test('should forward additional entity params and options', async () => {
    const response = createEntityResponse('get_report_hosts_response', {
      host: {
        ip: '127.0.0.1',
      },
      report_host_count: {
        __text: 1,
        filtered: 1,
        page: 0,
      },
    });
    const fakeHttp = createHttp(response);

    const cmd = new ReportHostsCommand(fakeHttp);
    await cmd.get(
      {
        id: 'foo',
        extraParam: 'bar',
      } as never,
      {
        filter: 'rows=5',
        extraOption: 'baz',
      },
    );

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_report_hosts',
        report_id: 'foo',
        filter: 'rows=5',
        lean: 1,
        ignore_pagination: 1,
        details: 1,
        extraParam: 'bar',
        extraOption: 'baz',
      },
    });
  });

  test('getElementFromRoot should return report hosts response element', () => {
    const fakeHttp = createHttp(
      createEntityResponse('get_report_hosts_response'),
    );
    const cmd = new ReportHostsCommand(fakeHttp);

    const element = cmd.getElementFromRoot({
      get_report_hosts: {
        get_report_hosts_response: {
          _status: '200',
          _status_text: 'OK',
        },
      },
    } as never);

    expect(element).toEqual({
      _status: '200',
      _status_text: 'OK',
    });
  });
});
