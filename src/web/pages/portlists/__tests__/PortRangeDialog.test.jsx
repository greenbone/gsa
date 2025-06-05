/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import PortRangeDialog from 'web/pages/portlists/PortRangeDialog';
import {changeInputValue, screen, within, fireEvent, render} from 'web/testing';

describe('PortRangeDialog tests', () => {
  test('should render without issues', () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    render(
      <PortRangeDialog portListId="123" onClose={onClose} onSave={onSave} />,
    );

    screen.getByText('New Port Range');
  });

  test('should render with title', () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    render(
      <PortRangeDialog
        portListId="123"
        title="Custom Title"
        onClose={onClose}
        onSave={onSave}
      />,
    );

    screen.getByText('Custom Title');
  });

  test('should call onClose when close button is clicked', () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    render(
      <PortRangeDialog portListId="123" onClose={onClose} onSave={onSave} />,
    );

    const close = screen.getDialogCloseButton();
    fireEvent.click(close);

    expect(onClose).toHaveBeenCalled();
  });

  test('should call onSave when save button is clicked', () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    render(
      <PortRangeDialog portListId="123" onClose={onClose} onSave={onSave} />,
    );

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      portListId: '123',
      portRangeEnd: '',
      portRangeStart: '',
      portType: 'tcp',
    });
  });

  test('should allow to change the port range start and end values', () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    render(
      <PortRangeDialog portListId="123" onClose={onClose} onSave={onSave} />,
    );

    const dialog = within(screen.getDialog());
    const startInput = dialog.getByName('portRangeStart');
    changeInputValue(startInput, '123');
    const endInput = dialog.getByName('portRangeEnd');
    changeInputValue(endInput, '456');

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      portListId: '123',
      portRangeEnd: 456,
      portRangeStart: 123,
      portType: 'tcp',
    });
  });

  test("should allow to change port type to 'udp'", () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    render(
      <PortRangeDialog portListId="123" onClose={onClose} onSave={onSave} />,
    );

    const udpRadio = screen.getByLabelText('UDP');
    fireEvent.click(udpRadio);

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      portListId: '123',
      portRangeEnd: '',
      portRangeStart: '',
      portType: 'udp',
    });
  });
});
