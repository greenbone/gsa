/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import React from 'react';
import {getMockAuditReport} from 'web/pages/reports/__mocks__/MockAuditReport';
import AuditRow from 'web/pages/reports/AuditReportRow';
import {setTimezone} from 'web/store/usersettings/actions';
import {rendererWithTable, screen} from 'web/testing';

describe('Audit report row', () => {
  test('should render row for Audit report', () => {
    const {entity} = getMockAuditReport();
    const onReportDeleteClick = testing.fn();
    const onReportDeltaSelect = testing.fn();

    const {render, store} = rendererWithTable({
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));

    const {baseElement} = render(
      <AuditRow
        entity={entity}
        onReportDeleteClick={onReportDeleteClick}
        onReportDeltaSelect={onReportDeltaSelect}
      />,
    );

    const bars = screen.getAllByTestId('progressbar-box');
    const links = baseElement.querySelectorAll('a');
    const rows = baseElement.querySelectorAll('tr');

    expect(links[0]).toHaveAttribute('href', '/auditreport/1234');
    expect(rows[0]).toHaveTextContent('Mon, Jun 3, 2019 1:00 PM');
    expect(bars[0]).toHaveAttribute('title', 'Done');
    expect(bars[0]).toHaveTextContent('Done');
    expect(rows[0]).toHaveTextContent('foo');
    expect(links[1]).toHaveAttribute('href', '/task/314');
    expect(bars[1]).toHaveAttribute('title', 'No');
    expect(bars[1]).toHaveTextContent('No');
    expect(rows[0]).toHaveTextContent('321'); // yes: 3, no: 2, incomplete: 1
  });
});
