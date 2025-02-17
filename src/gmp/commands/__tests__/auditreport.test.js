/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {AuditReportCommand} from 'gmp/commands/auditreports';
import {createHttp, createEntityResponse} from 'gmp/commands/testing';

describe('AuditReportCommand tests', () => {
  test('should request single audit report', () => {
    const response = createEntityResponse('report', {_id: 'foo'});
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new AuditReportCommand(fakeHttp);
    return cmd.get({id: 'foo'}).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_report',
          report_id: 'foo',
          ignore_pagination: 1,
          details: 1,
          lean: 1,
        },
      });

      const {data} = resp;
      expect(data.id).toEqual('foo');
    });
  });
});
