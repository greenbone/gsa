/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, within} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Filter from 'gmp/models/filter';
import ReportDetailsFilterDialog from 'web/pages/reports/ReportDetailsFilterDialog';

const caps = new Capabilities(['everything']);

const manualUrl = 'test/';

describe('Details Filter Dialog for Audit report', () => {
  test('should render compliance levels filter group', () => {
    const onFilterChanged = testing.fn();
    const onFilterCreated = testing.fn();
    const onClose = testing.fn();

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

    render(
      <ReportDetailsFilterDialog
        audit={true}
        delta={false}
        filter={filter}
        onClose={onClose}
        onFilterChanged={onFilterChanged}
        onFilterCreated={onFilterCreated}
      />,
    );
    const dialogTitle = screen.getByText('Update Filter');
    expect(dialogTitle).toBeInTheDocument();

    expect(screen.getByText('Filter')).toBeInTheDocument();
    expect(screen.getByText('QoD')).toBeInTheDocument();
    expect(screen.getByText('Compliance')).toBeInTheDocument();

    const filterGroup = screen.getByTestId('compliance-levels-filter-group');
    const {queryAllByRole} = within(filterGroup);

    const yesCheckbox = screen.getByTestId('compliance-state-yes');
    const noCheckbox = screen.getByTestId('compliance-state-no');
    const incompleteCheckbox = screen.getByTestId(
      'compliance-state-incomplete',
    );
    const undefinedCheckbox = screen.getByTestId('compliance-state-undefined');

    expect(yesCheckbox).toHaveTextContent('Yes');
    expect(noCheckbox).toHaveTextContent('No');
    expect(incompleteCheckbox).toHaveTextContent('Incomplete');
    expect(undefinedCheckbox).toHaveTextContent('Undefined');

    const checkboxes = queryAllByRole('checkbox');
    expect(checkboxes).toHaveLength(4);
    expect(screen.getByText('Solution Type')).toBeInTheDocument();
    expect(screen.getByText('Vulnerability')).toBeInTheDocument();
    expect(screen.getByText('Host (IP)')).toBeInTheDocument();
    expect(
      screen.getByText('Location (eg. port/protocol)'),
    ).toBeInTheDocument();
    expect(screen.getByText('First result')).toBeInTheDocument();
    expect(screen.getByText('Results per page')).toBeInTheDocument();

    const onlyShowHostsCheckbox = screen.getByLabelText(
      'Only show hosts that have results',
    );
    expect(onlyShowHostsCheckbox).toBeInTheDocument();

    const cancelButton = screen.getByText('Cancel');
    const updateButton = screen.getByText('Update');
    expect(cancelButton).toBeInTheDocument();
    expect(updateButton).toBeInTheDocument();
  });

  test('should render severity levels filter group', () => {
    const onFilterChanged = testing.fn();
    const onFilterCreated = testing.fn();
    const onClose = testing.fn();

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

    render(
      <ReportDetailsFilterDialog
        audit={false}
        delta={false}
        filter={filter}
        onClose={onClose}
        onFilterChanged={onFilterChanged}
        onFilterCreated={onFilterCreated}
      />,
    );

    const dialogTitle = screen.getByText('Update Filter');
    expect(dialogTitle).toBeInTheDocument();

    expect(screen.getByText('Filter')).toBeInTheDocument();
    expect(screen.getByText('Apply Overrides')).toBeInTheDocument();
    expect(screen.getByText('QoD')).toBeInTheDocument();
    expect(screen.getByText('Severity (Class)')).toBeInTheDocument();

    const filterGroup = screen.getByTestId('severity-levels-filter-group');

    const {queryAllByRole} = within(filterGroup);

    const highCheckbox = screen.getByTestId('severity-class-High');
    const mediumCheckbox = screen.getByTestId('severity-class-Medium');
    const lowCheckbox = screen.getByTestId('severity-class-Low');
    const logCheckbox = screen.getByTestId('severity-class-Log');
    const falsePositiveCheckbox = screen.getByTestId(
      'severity-class-False-Positive',
    );

    expect(highCheckbox).toHaveTextContent('High');
    expect(mediumCheckbox).toHaveTextContent('Medium');
    expect(lowCheckbox).toHaveTextContent('Low');
    expect(logCheckbox).toHaveTextContent('Log');
    expect(falsePositiveCheckbox).toHaveTextContent('False Pos.');

    const checkboxes = queryAllByRole('checkbox');
    expect(checkboxes).toHaveLength(5);

    expect(screen.getByText('Severity')).toBeInTheDocument();
    expect(screen.getByText('Solution Type')).toBeInTheDocument();
    expect(screen.getByText('Vulnerability')).toBeInTheDocument();
    expect(screen.getByText('Host (IP)')).toBeInTheDocument();
    expect(
      screen.getByText('Location (eg. port/protocol)'),
    ).toBeInTheDocument();
    expect(screen.getByText('First result')).toBeInTheDocument();
    expect(screen.getByText('Results per page')).toBeInTheDocument();

    const onlyShowHostsCheckbox = screen.getByLabelText(
      'Only show hosts that have results',
    );
    expect(onlyShowHostsCheckbox).toBeInTheDocument();

    const cancelButton = screen.getByText('Cancel');
    const updateButton = screen.getByText('Update');
    expect(cancelButton).toBeInTheDocument();
    expect(updateButton).toBeInTheDocument();
  });

  test('toggling result_hosts_only and clicking Update propagates the change', () => {
    const onFilterChanged = testing.fn();
    const onFilterCreated = testing.fn();
    const onClose = testing.fn();

    const filter = Filter.fromString(
      'levels=hml rows=100 min_qod=70 first=1 sort-reverse=severity result_hosts_only=0',
    );

    const gmp = {settings: {manualUrl, reportResultsThreshold: 10}};
    const {render} = rendererWith({gmp, capabilities: caps});

    render(
      <ReportDetailsFilterDialog
        audit={false}
        delta={false}
        filter={filter}
        onClose={onClose}
        onFilterChanged={onFilterChanged}
        onFilterCreated={onFilterCreated}
      />,
    );

    const cb = screen.getByRole('checkbox', {
      name: 'Only show hosts that have results',
    });

    // starts unchecked because filter explicitly sets 0
    expect(cb).not.toBeChecked();

    // set checked
    fireEvent.click(cb);
    expect(cb).toBeChecked();

    // save
    fireEvent.click(screen.getByText('Update'));

    expect(onFilterChanged).toHaveBeenCalled();

    const updatedFilter = onFilterChanged.mock.calls[0][0];
    expect(Number(updatedFilter.get('result_hosts_only'))).toBe(1);
  });

  test('unchecking result_hosts_only and clicking Update sets it to 0', () => {
    const onFilterChanged = testing.fn();
    const onFilterCreated = testing.fn();
    const onClose = testing.fn();

    const filter = Filter.fromString(
      'levels=hml rows=100 min_qod=70 first=1 sort-reverse=severity result_hosts_only=1',
    );

    const gmp = {settings: {manualUrl, reportResultsThreshold: 10}};
    const {render} = rendererWith({gmp, capabilities: caps});

    render(
      <ReportDetailsFilterDialog
        audit={false}
        delta={false}
        filter={filter}
        onClose={onClose}
        onFilterChanged={onFilterChanged}
        onFilterCreated={onFilterCreated}
      />,
    );

    const cb = screen.getByRole('checkbox', {
      name: 'Only show hosts that have results',
    });

    expect(cb).toBeChecked();

    fireEvent.click(cb);
    expect(cb).not.toBeChecked();

    fireEvent.click(screen.getByText('Update'));

    const updatedFilter = onFilterChanged.mock.calls[0][0];
    expect(Number(updatedFilter.get('result_hosts_only'))).toBe(0);
  });
});
