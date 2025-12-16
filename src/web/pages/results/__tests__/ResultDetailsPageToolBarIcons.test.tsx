/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Result from 'gmp/models/result';
import ResultDetailsPageToolBarIcons from 'web/pages/results/ResultDetailsPageToolBarIcons';

const manualUrl = 'test/';
const enableEPSS = true;

const result = Result.fromElement({
  _id: '12345',
  name: 'foo',
  owner: {name: 'admin'},
  comment: 'bar',
  creation_time: '2019-06-02T12:00:00Z',
  modification_time: '2019-06-03T11:00:00Z',
  host: {__text: '109.876.54.321'},
  port: '80/tcp',
  nvt: {
    _oid: '1.3.6.1.4.1.25623.1.12345',
    type: 'nvt',
    name: 'nvt1',
    tags: 'cvss_base_vector=AV:N/AC:M/Au:N/C:P/I:N/A:N|summary=This is a mock result|insight=This is just a test|affected=Affects test cases only|impact=No real impact|solution=Keep writing tests|vuldetect=This is the detection method|solution_type=Mitigation',
    epss: {
      max_severity: {
        score: 0.8765,
        percentile: 80.0,
        cve: {
          _id: 'CVE-2019-1234',
          severity: 5.0,
        },
      },
      max_epss: {
        score: 0.9876,
        percentile: 90.0,
        cve: {
          _id: 'CVE-2020-5678',
          severity: 2.0,
        },
      },
    },
    solution: {
      _type: 'Mitigation',
      __text: 'Keep writing tests',
    },
  },
  description: 'This is a result description',
  threat: 'Medium',
  severity: 5.0,
  qod: {value: 80},
  task: {_id: '314', name: 'task 1'},
  report: {_id: '159'},
  tickets: {
    ticket: [{_id: '265'}],
  },
  scan_nvt_version: '2019-02-14T07:33:50Z',
  notes: {
    note: [
      {
        _id: '358',
        text: 'TestNote',
        modification_time: '2021-03-11T13:00:32Z',
        active: 1,
      },
    ],
  },
  overrides: {
    override: [
      {
        _id: '979',
        text: 'TestOverride',
        modification_time: '2021-03-12T13:00:32Z',
        severity: 5.0,
        new_severity: 6.0,
        active: 1,
      },
    ],
  },
});

describe('ResultDetailsPageToolBarIcons tests', () => {
  test('should render', () => {
    const handleNoteCreateClick = testing.fn();
    const handleOverrideCreateClick = testing.fn();
    const handleResultDownloadClick = testing.fn();
    const handleTicketCreateClick = testing.fn();
    const gmp = {settings: {manualUrl, enableEPSS}};
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <ResultDetailsPageToolBarIcons
        entity={result}
        onNoteCreateClick={handleNoteCreateClick}
        onOverrideCreateClick={handleOverrideCreateClick}
        onResultDownloadClick={handleResultDownloadClick}
        onTicketCreateClick={handleTicketCreateClick}
      />,
    );

    expect(screen.getByTitle('Help: Results')).toBeInTheDocument();
    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/reports.html#displaying-all-existing-results',
    );

    expect(screen.getByTitle('Results List')).toBeInTheDocument();
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/results',
    );

    expect(screen.getByTitle('Export Result as XML')).toBeInTheDocument();
    expect(screen.getByTitle('Add new Note')).toBeInTheDocument();
    expect(screen.getByTitle('Add new Override')).toBeInTheDocument();
    expect(screen.getByTitle('Create new Ticket')).toBeInTheDocument();
    expect(
      screen.getByTitle('Corresponding Task (task 1)'),
    ).toBeInTheDocument();
    expect(screen.getByTitle('Corresponding Report')).toBeInTheDocument();
    expect(screen.getByTitle('Corresponding Tickets')).toBeInTheDocument();
  });

  test('should call click handlers', () => {
    const handleNoteCreateClick = testing.fn();
    const handleOverrideCreateClick = testing.fn();
    const handleResultDownloadClick = testing.fn();
    const handleTicketCreateClick = testing.fn();
    const gmp = {settings: {manualUrl, enableEPSS}};
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <ResultDetailsPageToolBarIcons
        entity={result}
        onNoteCreateClick={handleNoteCreateClick}
        onOverrideCreateClick={handleOverrideCreateClick}
        onResultDownloadClick={handleResultDownloadClick}
        onTicketCreateClick={handleTicketCreateClick}
      />,
    );

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Result as XML');
    fireEvent.click(exportIcon);
    expect(handleResultDownloadClick).toHaveBeenCalledWith(result);

    const newNoteIcon = screen.getByTestId('new-note-icon');
    expect(newNoteIcon).toHaveAttribute('title', 'Add new Note');
    fireEvent.click(newNoteIcon);

    const newOverrideIcon = screen.getByTestId('new-override-icon');
    expect(newOverrideIcon).toHaveAttribute('title', 'Add new Override');
    fireEvent.click(newOverrideIcon);
    expect(handleOverrideCreateClick).toHaveBeenCalledWith(result);

    const newTicketIcon = screen.getByTestId('new-ticket-icon');
    expect(newTicketIcon).toHaveAttribute('title', 'Create new Ticket');
    fireEvent.click(newTicketIcon);
    expect(handleTicketCreateClick).toHaveBeenCalledWith(result);
  });

  test('should not show icons without permission', () => {
    const wrongCapabilities = new Capabilities(['get_results']);

    const handleNoteCreateClick = testing.fn();
    const handleOverrideCreateClick = testing.fn();
    const handleResultDownloadClick = testing.fn();
    const handleTicketCreateClick = testing.fn();
    const gmp = {settings: {manualUrl}};
    const {render} = rendererWith({
      gmp,
      capabilities: wrongCapabilities,
      router: true,
    });

    render(
      <ResultDetailsPageToolBarIcons
        entity={result}
        onNoteCreateClick={handleNoteCreateClick}
        onOverrideCreateClick={handleOverrideCreateClick}
        onResultDownloadClick={handleResultDownloadClick}
        onTicketCreateClick={handleTicketCreateClick}
      />,
    );

    expect(screen.getByTitle('Export Result as XML')).toBeInTheDocument();
    expect(screen.queryByTitle('Add new Note')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Add new Override')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Create new Ticket')).not.toBeInTheDocument();
    expect(
      screen.queryByTitle('Corresponding Task (task 1)'),
    ).not.toBeInTheDocument();
    expect(screen.queryByTitle('Corresponding Report')).not.toBeInTheDocument();
    expect(
      screen.queryByTitle('Corresponding Tickets'),
    ).not.toBeInTheDocument();
  });
});
