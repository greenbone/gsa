/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWithTableBody, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Nvt from 'gmp/models/nvt';
import Override from 'gmp/models/override';
import {createSession} from 'gmp/testing';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {shorten} from 'gmp/utils/string';
import OverrideRow from 'web/pages/overrides/OverrideTableRow';
import SelectionType from 'web/utils/SelectionType';

const createGmp = () => ({
  session: createSession(),
  settings: {
    severityRating: SEVERITY_RATING_CVSS_3,
  },
});

const overrideText = 'A'.repeat(61);

const createOverride = ({
  id,
  hosts,
  inUse = false,
  text,
}: {
  id: string;
  hosts: string[];
  inUse?: boolean;
  text: string;
}) =>
  new Override({
    id,
    active: 1,
    hosts,
    inUse,
    newSeverity: 7,
    nvt: new Nvt({
      id: 'nvt-1',
      oid: '1.3.6.1.4.1',
      name: 'Test NVT',
    }),
    owner: {name: 'username'},
    port: '22/tcp',
    severity: 0.1,
    text,
    userCapabilities: new Capabilities(['everything']),
  });

const override = createOverride({
  id: '314',
  hosts: [
    'host-one.example.invalid',
    'host-two.example.invalid',
    'host-three.example.invalid',
  ],
  text: overrideText,
});

const overrideInUse = createOverride({
  id: '315',
  hosts: ['host-one.example.invalid'],
  inUse: true,
  text: 'Override in use',
});

describe('OverrideRow tests', () => {
  test('should render override row with default actions', () => {
    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });

    const {element} = render(
      <OverrideRow
        entity={override}
        onOverrideCloneClick={testing.fn()}
        onOverrideDeleteClick={testing.fn()}
        onOverrideDownloadClick={testing.fn()}
        onOverrideEditClick={testing.fn()}
        onToggleDetailsClick={testing.fn()}
      />,
    );

    expect(element).toBeInTheDocument();
    expect(screen.getByText(shorten(overrideText))).toBeInTheDocument();
    expect(screen.getByText('Test NVT')).toBeInTheDocument();

    const hosts = override.hosts ?? [];
    const hostsText = hosts.join(', ');
    const hostsElement = screen.getByText(shorten(hostsText));
    expect(hostsElement).toBeInTheDocument();
    expect(hostsElement).toHaveAttribute('title', hostsText);

    const port = screen.getByText(shorten(override.port));
    expect(port).toBeInTheDocument();
    expect(port).toHaveAttribute('title', override.port);

    expect(screen.getByText('> 0.0')).toBeInTheDocument();
    expect(screen.getByText('yes')).toBeInTheDocument();

    expect(screen.getByTitle('Move Override to trashcan')).toBeInTheDocument();
    expect(screen.getByTitle('Edit Override')).toBeInTheDocument();
    expect(screen.getByTitle('Clone Override')).toBeInTheDocument();
    expect(screen.getByTitle('Export Override')).toBeInTheDocument();
  });

  test('should call row and action click handlers', () => {
    const handleOverrideClone = testing.fn();
    const handleOverrideDelete = testing.fn();
    const handleOverrideDownload = testing.fn();
    const handleOverrideEdit = testing.fn();
    const handleToggleDetailsClick = testing.fn();

    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });

    render(
      <OverrideRow
        entity={override}
        onOverrideCloneClick={handleOverrideClone}
        onOverrideDeleteClick={handleOverrideDelete}
        onOverrideDownloadClick={handleOverrideDownload}
        onOverrideEditClick={handleOverrideEdit}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    fireEvent.click(screen.getByTestId('row-details-toggle'));
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    fireEvent.click(screen.getByTitle('Move Override to trashcan'));
    expect(handleOverrideDelete).toHaveBeenCalledWith(override);

    fireEvent.click(screen.getByTitle('Edit Override'));
    expect(handleOverrideEdit).toHaveBeenCalledWith(override);

    fireEvent.click(screen.getByTitle('Clone Override'));
    expect(handleOverrideClone).toHaveBeenCalledWith(override);

    fireEvent.click(screen.getByTitle('Export Override'));
    expect(handleOverrideDownload).toHaveBeenCalledWith(override);
  });

  test('should render entity selection in user selection mode', () => {
    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });

    render(
      <OverrideRow
        entity={override}
        selectionType={SelectionType.SELECTION_USER}
        onOverrideCloneClick={testing.fn()}
        onOverrideDeleteClick={testing.fn()}
        onOverrideDownloadClick={testing.fn()}
        onOverrideEditClick={testing.fn()}
        onToggleDetailsClick={testing.fn()}
      />,
    );

    expect(screen.getByTestId('entity-selection-314')).toBeInTheDocument();
    expect(
      screen.queryByTitle('Move Override to trashcan'),
    ).not.toBeInTheDocument();
    expect(screen.queryByTitle('Edit Override')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Clone Override')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Export Override')).not.toBeInTheDocument();
  });

  test('should disable delete action when override is in use', () => {
    const handleOverrideClone = testing.fn();
    const handleOverrideDelete = testing.fn();
    const handleOverrideDownload = testing.fn();
    const handleOverrideEdit = testing.fn();

    const {render} = rendererWithTableBody({
      capabilities: true,
      gmp: createGmp(),
    });

    render(
      <OverrideRow
        entity={overrideInUse}
        onOverrideCloneClick={handleOverrideClone}
        onOverrideDeleteClick={handleOverrideDelete}
        onOverrideDownloadClick={handleOverrideDownload}
        onOverrideEditClick={handleOverrideEdit}
        onToggleDetailsClick={testing.fn()}
      />,
    );

    const deleteIcon = screen.getByTitle('Override is still in use');
    fireEvent.click(deleteIcon);
    expect(handleOverrideDelete).not.toHaveBeenCalled();

    const editIcon = screen.getByTitle('Edit Override');
    fireEvent.click(editIcon);
    expect(handleOverrideEdit).toHaveBeenCalledWith(overrideInUse);
  });
});
