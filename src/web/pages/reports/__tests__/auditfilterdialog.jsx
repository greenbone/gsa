/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import React from 'react';

import Capabilities from 'gmp/capabilities/capabilities';

import Filter from 'gmp/models/filter';

import {rendererWith} from 'web/utils/testing';

import AuditReportFilter from 'web/pages/reports/auditfilterdialog';

const caps = new Capabilities(['everything']);

const manualUrl = 'test/';

describe('Filter Dialog for Audit report', () => {
  test('should render filter with compliance level group', () => {
    const onFilterChanged = testing.fn();
    const onFilterCreated = testing.fn();
    const onCloseClick = testing.fn();

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

    const {baseElement, getByLabelText} = render(
      <AuditReportFilter
        filter={filter}
        delta={false}
        onFilterChanged={onFilterChanged}
        onCloseClick={onCloseClick}
        createFilterType="result"
        onFilterCreated={onFilterCreated}
      />,
    );

    const formGroups = baseElement.querySelectorAll(
      '[class*="mantine-Text-root"]',
    );

    expect(formGroups[0]).toHaveTextContent('Filter');
    expect(formGroups[1]).toHaveTextContent('Compliance');
    expect(formGroups[2]).toHaveTextContent('QoD');
    expect(formGroups[3]).toHaveTextContent('From Task (name)');
    expect(formGroups[4]).toHaveTextContent('First result');
    expect(formGroups[5]).toHaveTextContent('Results per page');
    expect(formGroups[6]).toHaveTextContent('Sort by');

    const ascendingRadio = getByLabelText('Ascending');
    const descendingRadio = getByLabelText('Descending');

    expect(ascendingRadio).toBeInTheDocument();
    expect(descendingRadio).toBeInTheDocument();

    expect(ascendingRadio).toBeChecked();
    expect(descendingRadio).not.toBeChecked();
  });
});
