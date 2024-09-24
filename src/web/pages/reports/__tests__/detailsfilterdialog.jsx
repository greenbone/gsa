/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import React from 'react';

import Capabilities from 'gmp/capabilities/capabilities';

import Filter from 'gmp/models/filter';

import {rendererWith, within} from 'web/utils/testing';

import FilterDialog from 'web/pages/reports/detailsfilterdialog';

const caps = new Capabilities(['everything']);

const manualUrl = 'test/';

describe('Details Filter Dialog for Audit report', () => {
  test('should render compliance levels filter group', () => {
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

    const {baseElement, getByText, getByLabelText, getByTestId} = render(
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
    const dialogTitle = getByText('Update Filter');
    expect(dialogTitle).toBeInTheDocument();

    const formGroups = baseElement.querySelectorAll(
      '[class*="mantine-Text-root"]',
    );

    expect(formGroups[0]).toHaveTextContent('Filter');
    expect(formGroups[1]).toHaveTextContent('QoD');
    expect(formGroups[2]).toHaveTextContent('Compliance');

    const filterGroup = getByTestId('compliance-levels-filter-group');
    const {queryAllByRole} = within(filterGroup);

    const yesCheckbox = getByTestId('compliance-state-Yes');
    const noCheckbox = getByTestId('compliance-state-No');
    const incompleteCheckbox = getByTestId('compliance-state-Incomplete');
    const undefinedCheckbox = getByTestId('compliance-state-Undefined');

    expect(yesCheckbox).toHaveTextContent('Yes');
    expect(noCheckbox).toHaveTextContent('No');
    expect(incompleteCheckbox).toHaveTextContent('Incomplete');
    expect(undefinedCheckbox).toHaveTextContent('Undefined');

    const checkboxes = queryAllByRole('checkbox');
    expect(checkboxes).toHaveLength(4);
    expect(formGroups[3]).toHaveTextContent('Solution Type');
    expect(formGroups[4]).toHaveTextContent('Vulnerability');
    expect(formGroups[5]).toHaveTextContent('Host (IP)');
    expect(formGroups[6]).toHaveTextContent('Location (eg. port/protocol)');
    expect(formGroups[7]).toHaveTextContent('First result');
    expect(formGroups[8]).toHaveTextContent('Results per page');

    const onlyShowHostsCheckbox = getByLabelText(
      'Only show hosts that have results',
    );
    expect(onlyShowHostsCheckbox).toBeInTheDocument();

    const cancelButton = getByText('Cancel');
    const updateButton = getByText('Update');
    expect(cancelButton).toBeInTheDocument();
    expect(updateButton).toBeInTheDocument();
  });

  test('should render severity levels filter group', () => {
    const onFilterChanged = testing.fn();
    const onFilterCreated = testing.fn();
    const onCloseClick = testing.fn();

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

    const {getByText, baseElement, getByLabelText, getByTestId} = render(
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

    const dialogTitle = getByText('Update Filter');
    expect(dialogTitle).toBeInTheDocument();

    const formGroups = baseElement.querySelectorAll(
      '[class*="mantine-Text-root"]',
    );

    expect(formGroups[0]).toHaveTextContent('Filter');
    expect(formGroups[1]).toHaveTextContent('Apply Overrides');
    expect(formGroups[2]).toHaveTextContent('QoD');
    expect(formGroups[3]).toHaveTextContent('Severity (Class)');

    const filterGroup = getByTestId('severity-levels-filter-group');

    const {queryAllByRole} = within(filterGroup);

    const highCheckbox = getByTestId('severity-class-High');
    const mediumCheckbox = getByTestId('severity-class-Medium');
    const lowCheckbox = getByTestId('severity-class-Low');
    const logCheckbox = getByTestId('severity-class-Log');
    const falsePositiveCheckbox = getByTestId('severity-class-False-Positive');

    expect(highCheckbox).toHaveTextContent('High');
    expect(mediumCheckbox).toHaveTextContent('Medium');
    expect(lowCheckbox).toHaveTextContent('Low');
    expect(logCheckbox).toHaveTextContent('Log');
    expect(falsePositiveCheckbox).toHaveTextContent('False Pos.');

    const checkboxes = queryAllByRole('checkbox');
    expect(checkboxes).toHaveLength(5);

    expect(formGroups[4]).toHaveTextContent('Severity');
    expect(formGroups[5]).toHaveTextContent('Solution Type');
    expect(formGroups[6]).toHaveTextContent('Vulnerability');
    expect(formGroups[7]).toHaveTextContent('Host (IP)');
    expect(formGroups[8]).toHaveTextContent('Location (eg. port/protocol)');
    expect(formGroups[9]).toHaveTextContent('First result');
    expect(formGroups[10]).toHaveTextContent('Results per page');

    const onlyShowHostsCheckbox = getByLabelText(
      'Only show hosts that have results',
    );
    expect(onlyShowHostsCheckbox).toBeInTheDocument();

    const cancelButton = getByText('Cancel');
    const updateButton = getByText('Update');
    expect(cancelButton).toBeInTheDocument();
    expect(updateButton).toBeInTheDocument();
  });
});
