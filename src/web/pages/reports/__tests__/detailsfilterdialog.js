/* Copyright (C) 2024 Greenbone AG
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

import Capabilities from 'gmp/capabilities/capabilities';
import {setLocale} from 'gmp/locale/lang';

import Filter from 'gmp/models/filter';

import {rendererWith} from 'web/utils/testing';

import FilterDialog from 'web/pages/reports/detailsfilterdialog';

setLocale('en');

const caps = new Capabilities(['everything']);

const manualUrl = 'test/';

describe('Details Filter Dialog for Audit report', () => {
  test('should render compliance levels filter group', () => {
    const onFilterChanged = jest.fn();
    const onFilterCreated = jest.fn();
    const onCloseClick = jest.fn();

    const filter = Filter.fromString(
      'apply_overrides=0 levels=hmlg rows=100 min_qod=70 first=1 sort=compliant',
    );

    const gmp = {
      settings: {manualUrl, reportResultsThreshold: 10},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
    });

    const {getAllByTestId} = render(
      <FilterDialog
        audit={true}
        filter={filter}
        delta={false}
        onFilterChanged={onFilterChanged}
        onCloseClick={onCloseClick}
        createFilterType="result"
        onFilterCreated={onFilterCreated}
      />,
    );

    const formgroups = getAllByTestId('formgroup-title');
    const content = getAllByTestId('formgroup-content');

    expect(formgroups[0]).toHaveTextContent('Filter');
    expect(formgroups[1]).toHaveTextContent(
      'Only show hosts that have results',
    );
    expect(formgroups[2]).toHaveTextContent('QoD');
    expect(formgroups[3]).toHaveTextContent('Compliance');
    expect(content[3]).toHaveTextContent('YesNoIncompleteUndefined');
    expect(formgroups[4]).toHaveTextContent('Solution Type');
    expect(formgroups[5]).toHaveTextContent('Vulnerability');
    expect(formgroups[6]).toHaveTextContent('Host (IP)');
    expect(formgroups[7]).toHaveTextContent('Location (eg. port/protocol)');
    expect(formgroups[8]).toHaveTextContent('First result');
    expect(formgroups[9]).toHaveTextContent('Results per page');
  });

  test('should render severity levels filter group', () => {
    const onFilterChanged = jest.fn();
    const onFilterCreated = jest.fn();
    const onCloseClick = jest.fn();

    const filter = Filter.fromString(
      'apply_overrides=0 levels=hmlg rows=100 min_qod=70 first=1 sort=severity',
    );

    const gmp = {
      settings: {manualUrl, reportResultsThreshold: 10},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
    });

    const {getAllByTestId} = render(
      <FilterDialog
        audit={false}
        filter={filter}
        delta={false}
        onFilterChanged={onFilterChanged}
        onCloseClick={onCloseClick}
        createFilterType="result"
        onFilterCreated={onFilterCreated}
      />,
    );

    const formgroups = getAllByTestId('formgroup-title');
    const content = getAllByTestId('formgroup-content');

    expect(formgroups[0]).toHaveTextContent('Filter');
    expect(formgroups[1]).toHaveTextContent('Apply Overrides');
    expect(formgroups[2]).toHaveTextContent(
      'Only show hosts that have results',
    );
    expect(formgroups[3]).toHaveTextContent('QoD');
    expect(formgroups[4]).toHaveTextContent('Severity (Class)');
    expect(content[4]).toHaveTextContent('HighMediumLowLogFalse Pos.');
    expect(formgroups[5]).toHaveTextContent('Severity');
    expect(formgroups[6]).toHaveTextContent('Solution Type');
    expect(formgroups[7]).toHaveTextContent('Vulnerability');
    expect(formgroups[8]).toHaveTextContent('Host (IP)');
    expect(formgroups[9]).toHaveTextContent('Location (eg. port/protocol)');
    expect(formgroups[10]).toHaveTextContent('First result');
    expect(formgroups[11]).toHaveTextContent('Results per page');
  });
});
