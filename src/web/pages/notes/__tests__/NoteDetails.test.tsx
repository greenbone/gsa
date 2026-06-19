/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Model from 'gmp/models/model';
import Note from 'gmp/models/note';
import {createSession} from 'gmp/testing';
import NoteDetails from 'web/pages/notes/NoteDetails';

const createGmp = () => ({
  session: createSession(),
});

describe('NoteDetails tests', () => {
  test('should render full note details', () => {
    const note = new Note({
      id: 'note-id',
      active: 1,
      hosts: ['127.0.0.1', '192.168.0.1'],
      port: '443/tcp',
      severity: 5,
      task: new Model({id: 'task-id', name: 'task x'}, 'task'),
      result: new Model({id: 'result-id', name: 'result x'}, 'result'),
      text: 'note text',
      writable: 1,
      userCapabilities: new Capabilities(['everything']),
    });

    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(),
      router: true,
    });

    render(<NoteDetails entity={note} />);

    const headings = screen.getAllByRole('heading', {level: 2});
    expect(headings[0]).toHaveTextContent('Application');
    expect(headings[1]).toHaveTextContent('Appearance');

    const hostsLabel = screen.getByText('Hosts');
    const hostsRow = hostsLabel.closest('tr');
    expect(hostsRow).toHaveTextContent('127.0.0.1');
    expect(hostsRow).toHaveTextContent('192.168.0.1');

    const portLabel = screen.getByText('Port');
    const portRow = portLabel.closest('tr');
    expect(portRow).toHaveTextContent('443/tcp');

    const severityLabel = screen.getByText('Severity');
    const severityRow = severityLabel.closest('tr');
    expect(severityRow).toHaveTextContent('> 0.0');

    const detailsLinks = screen.getAllByTestId('details-link');
    expect(detailsLinks[0]).toHaveAttribute('href', '/task/task-id');
    expect(detailsLinks[0]).toHaveTextContent('task x');
    expect(detailsLinks[1]).toHaveAttribute('href', '/result/result-id');
    expect(detailsLinks[1]).toHaveTextContent('result x');

    expect(screen.getByTestId('note-box')).toHaveTextContent('note text');
  });

  test('should render orphan and fallback values for inactive note', () => {
    const note = new Note({
      id: 'orphan-note-id',
      active: 0,
      hosts: [],
      orphan: 1,
      text: 'orphan note text',
      writable: 1,
      userCapabilities: new Capabilities(['everything']),
    });

    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(),
      router: true,
    });

    render(<NoteDetails entity={note} />);

    expect(
      screen.getByRole('heading', {name: 'Appearance when active'}),
    ).toBeInTheDocument();

    const hostsLabel = screen.getByText('Hosts');
    const hostsRow = hostsLabel.closest('tr');
    expect(hostsRow).toHaveTextContent('Any');

    const portLabel = screen.getByText('Port');
    const portRow = portLabel.closest('tr');
    expect(portRow).toHaveTextContent('Any');

    const severityLabel = screen.getByText('Severity');
    const severityRow = severityLabel.closest('tr');
    expect(severityRow).toHaveTextContent('Any');

    const orphanLabels = screen.getAllByText('Orphan');
    expect(orphanLabels).toHaveLength(2);

    expect(screen.getByTestId('note-box')).toHaveTextContent(
      'orphan note text',
    );
  });
});
