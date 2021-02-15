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
import React from 'react';

import {setLocale} from 'gmp/locale/lang';

import Capabilities from 'gmp/capabilities/capabilities';

import Audit from 'gmp/models/audit';

import {
  auditDetailsAudit,
  auditDetailsPolicy,
  auditDetailsSchedule,
} from 'web/graphql/__mocks__/audits';
import {rendererWith, wait} from 'web/utils/testing';

import Details from '../details';
import {createGetScheduleQueryMock} from 'web/graphql/__mocks__/schedules';
import {createGetPolicyQueryMock} from 'web/graphql/__mocks__/policies';

setLocale('en');

describe('Audit Details tests', () => {
  test('should render full audit details', async () => {
    const audit = Audit.fromObject(auditDetailsAudit);
    const caps = new Capabilities(['everything']);

    const [scheduleMock, scheduleResult] = createGetScheduleQueryMock(
      '121314',
      auditDetailsSchedule,
    );
    const [policyMock, policyResult] = createGetPolicyQueryMock(
      '314',
      auditDetailsPolicy,
    );
    const {render} = rendererWith({
      capabilities: caps,
      router: true,
      mocks: [scheduleMock, policyMock],
    });

    const {element, baseElement, getAllByTestId} = render(
      <Details entity={audit} />,
    );

    await wait();

    expect(baseElement).toMatchSnapshot();

    expect(scheduleResult).toHaveBeenCalled();
    expect(policyResult).toHaveBeenCalled();

    const headings = element.querySelectorAll('h2');
    const detailslinks = getAllByTestId('details-link');

    expect(headings[0]).toHaveTextContent('Target');
    expect(detailslinks[0]).toHaveAttribute('href', '/target/5678');
    expect(element).toHaveTextContent('target1');

    expect(headings[1]).toHaveTextContent('Alerts');
    expect(detailslinks[1]).toHaveAttribute('href', '/alert/91011');
    expect(element).toHaveTextContent('alert1');

    expect(headings[2]).toHaveTextContent('Scanner');
    expect(detailslinks[2]).toHaveAttribute('href', '/scanner/1516');
    expect(element).toHaveTextContent('scanner1');
    expect(element).toHaveTextContent('OpenVAS Scanner');

    expect(headings[3]).toHaveTextContent('Assets');

    expect(headings[4]).toHaveTextContent('Scan');
    expect(element).toHaveTextContent('2 minutes');
    expect(element).toHaveTextContent('Do not automatically delete reports');
  });
});
