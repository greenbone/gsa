/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWithTableBody, screen, fireEvent} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import PortList from 'gmp/models/portlist';
import PortListTableRow from 'web/pages/portlists/PortListTableRow';
import {setUsername} from 'web/store/usersettings/actions';

describe('PortListTableRow tests', () => {
  test('should render port counts', async () => {
    const portList = new PortList({
      id: '1',
      name: 'Test Port List',
      userCapabilities: new EverythingCapabilities(),
      portCount: {
        all: 10,
        tcp: 6,
        udp: 4,
      },
    });
    const {render, store} = rendererWithTableBody({
      capabilities: true,
      store: true,
    });
    store.dispatch(setUsername('foo'));
    render(<PortListTableRow entity={portList} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  test('should render entity name', async () => {
    const portList = new PortList({
      id: '1',
      name: 'Test Port List',
      userCapabilities: new EverythingCapabilities(),
      portCount: {
        all: 10,
        tcp: 6,
        udp: 4,
      },
    });
    const {render, store} = rendererWithTableBody({
      capabilities: true,
      store: true,
    });
    store.dispatch(setUsername('foo'));
    render(<PortListTableRow entity={portList} />);
    expect(screen.getByText('Test Port List')).toBeInTheDocument();
  });

  test('should call onToggleDetailsClick when EntityNameTableData is clicked', async () => {
    const portList = new PortList({
      id: '1',
      name: 'Test Port List',
      userCapabilities: new EverythingCapabilities(),
      portCount: {
        all: 10,
        tcp: 6,
        udp: 4,
      },
    });
    const handleToggle = testing.fn();
    const {render, store} = rendererWithTableBody({
      capabilities: true,
      store: true,
    });
    store.dispatch(setUsername('foo'));
    render(
      <PortListTableRow
        entity={portList}
        onToggleDetailsClick={handleToggle}
      />,
    );

    const details = screen.getByTestId('row-details-toggle');
    fireEvent.click(details);
    expect(handleToggle).toHaveBeenCalledWith(portList, '1');
  });

  test('should render default action', async () => {
    const portList = new PortList({
      id: '1',
      name: 'Test Port List',
      userCapabilities: new EverythingCapabilities(),
      portCount: {
        all: 10,
        tcp: 6,
        udp: 4,
      },
    });
    const handleClone = testing.fn();
    const handleDelete = testing.fn();
    const handleDownload = testing.fn();
    const handleEdit = testing.fn();
    const {render, store} = rendererWithTableBody({
      capabilities: true,
      store: true,
    });
    store.dispatch(setUsername('foo'));
    render(
      <PortListTableRow
        entity={portList}
        onPortListCloneClick={handleClone}
        onPortListDeleteClick={handleDelete}
        onPortListDownloadClick={handleDownload}
        onPortListEditClick={handleEdit}
      />,
    );

    expect(screen.getByRole('button', {name: /delete/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /edit/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /clone/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /export/i})).toBeInTheDocument();
  });
});
