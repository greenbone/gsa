/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  changeInputValue,
  getDialog,
  getDialogCloseButton,
  getDialogSaveButton,
} from 'web/components/testing';
import PortRangeDialog from 'web/pages/portlists/PortRangeDialog';
import {screen, fireEvent, getByName, render} from 'web/utils/Testing';

describe('PortRangeDialog tests', () => {
  test('should render without issues', () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    render(<PortRangeDialog id="123" onClose={onClose} onSave={onSave} />);

    screen.getByText('New Port Range');
  });

  test('should render with title', () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    render(
      <PortRangeDialog
        id="123"
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

    render(<PortRangeDialog id="123" onClose={onClose} onSave={onSave} />);

    const close = getDialogCloseButton();
    fireEvent.click(close);

    expect(onClose).toHaveBeenCalled();
  });

  test('should call onSave when save button is clicked', () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    render(<PortRangeDialog id="123" onClose={onClose} onSave={onSave} />);

    const save = getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      id: '123',
      port_range_end: '',
      port_range_start: '',
      port_type: 'tcp',
    });
  });

  test('should allow to change the port range start and end values', () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    render(<PortRangeDialog id="123" onClose={onClose} onSave={onSave} />);

    const dialog = getDialog();
    const startInput = getByName(dialog, 'port_range_start');
    changeInputValue(startInput, '123');
    const endInput = getByName(dialog, 'port_range_end');
    changeInputValue(endInput, '456');

    const save = getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      id: '123',
      port_range_end: 456,
      port_range_start: 123,
      port_type: 'tcp',
    });
  });

  test("should allow to change port type to 'udp'", () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    render(<PortRangeDialog id="123" onClose={onClose} onSave={onSave} />);

    const udpRadio = screen.getByLabelText('UDP');
    fireEvent.click(udpRadio);

    const save = getDialogSaveButton();
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledWith({
      id: '123',
      port_range_end: '',
      port_range_start: '',
      port_type: 'udp',
    });
  });
});
