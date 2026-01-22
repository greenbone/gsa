/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import dayjs from 'dayjs';
import AgentDialog from 'web/pages/agents/AgentDialog';
const onSave = testing.fn();
const onClose = testing.fn();

describe('AgentDialog tests', () => {
  test('should render without issues and close', () => {
    const {render} = rendererWith({});

    render(<AgentDialog onClose={onClose} onSave={onSave} />);

    expect(screen.getByText('Edit Agent Details')).toBeInTheDocument();

    const close = screen.getDialogCloseButton();
    fireEvent.click(close);

    expect(onClose).toHaveBeenCalled();
  });

  test('should call onSave with default values', async () => {
    const {render} = rendererWith({});

    render(<AgentDialog onClose={onClose} onSave={onSave} />);

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    await wait();

    expect(onSave).toHaveBeenCalledWith({
      comment: undefined,
      id: undefined,
      intervalInSeconds: 300,
      ipAddress: '',
      name: 'Unnamed',
      port: 0,
      schedulerCronExpression: '0 */12 * * *',
      updateToLatest: false,
      useAdvancedCron: false,
    });
  });

  test('should render edit dialog with existing values', () => {
    const {render} = rendererWith({});

    render(
      <AgentDialog
        comment="Test comment"
        intervalInSeconds={600}
        name="Test Agent"
        port={4442}
        title="Edit Agent"
        onClose={onClose}
        onSave={onSave}
      />,
    );

    expect(screen.getByText('Edit Agent')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Agent')).toBeInTheDocument();
    expect(screen.getByDisplayValue('4442')).toBeInTheDocument();
    expect(screen.getByDisplayValue('600')).toBeInTheDocument();
  });

  test('should handle form field changes', async () => {
    const {render} = rendererWith({});

    render(<AgentDialog onClose={onClose} onSave={onSave} />);

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    await wait();

    expect(onSave).toHaveBeenCalledWith({
      comment: undefined,
      id: undefined,
      intervalInSeconds: 300,
      ipAddress: '',
      name: 'Unnamed',
      port: 0,
      schedulerCronExpression: '0 */12 * * *',
      updateToLatest: false,
      useAdvancedCron: false,
    });
  });

  test('should render status information when provided', () => {
    const {render} = rendererWith({});

    render(
      <AgentDialog
        configurationUpdated={dayjs('2026-01-01T09:00:00.000Z')}
        heartbeatReceived={dayjs('2026-01-01T09:55:00.000Z')}
        lastContact={dayjs('2026-01-01T10:00:00.000Z')}
        name="Test Agent"
        status="authorized"
        title="Edit Agent"
        onClose={onClose}
        onSave={onSave}
      />,
    );

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Last Contact')).toBeInTheDocument();
    expect(screen.getByText('Heartbeat received')).toBeInTheDocument();
    expect(
      screen.getByText('Configuration updated/System scan completed'),
    ).toBeInTheDocument();
  });

  test('should show status section', () => {
    const {render} = rendererWith({});

    render(<AgentDialog onClose={onClose} onSave={onSave} />);

    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  test('should render updateToLatest checkbox with false as default', () => {
    const onSave = testing.fn();
    const onClose = testing.fn();

    const {render} = rendererWith({});

    render(<AgentDialog onClose={onClose} onSave={onSave} />);

    expect(screen.getByText('Automatic Update Settings')).toBeInTheDocument();
    expect(screen.getByText('Enable automatic updates')).toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox', {
      name: 'Enable automatic updates',
    });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  test('should render updateToLatest checkbox with true when provided', () => {
    const {render} = rendererWith({});

    render(
      <AgentDialog updateToLatest={true} onClose={onClose} onSave={onSave} />,
    );

    const checkbox = screen.getByRole('checkbox', {
      name: 'Enable automatic updates',
    });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();
  });

  test('should handle updateToLatest checkbox change and include it in onSave', async () => {
    const {render} = rendererWith({});

    render(<AgentDialog onClose={onClose} onSave={onSave} />);

    const checkbox = screen.getByRole('checkbox', {
      name: 'Enable automatic updates',
    });

    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    await wait();

    expect(onSave).toHaveBeenCalledWith({
      comment: undefined,
      id: undefined,
      intervalInSeconds: 300,
      ipAddress: '',
      name: 'Unnamed',
      port: 0,
      schedulerCronExpression: '0 */12 * * *',
      useAdvancedCron: false,
      updateToLatest: true,
    });
  });

  test('should maintain updateToLatest value from props and save correctly', async () => {
    const {render} = rendererWith({});

    render(
      <AgentDialog
        name="Test Agent"
        updateToLatest={true}
        onClose={onClose}
        onSave={onSave}
      />,
    );

    const checkbox = screen.getByRole('checkbox', {
      name: 'Enable automatic updates',
    });
    expect(checkbox).toBeChecked();

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    await wait();

    expect(onSave).toHaveBeenCalledWith({
      comment: undefined,
      id: undefined,
      intervalInSeconds: 300,
      ipAddress: '',
      name: 'Test Agent',
      port: 0,
      schedulerCronExpression: '0 */12 * * *',
      useAdvancedCron: false,
      updateToLatest: true,
    });
  });
});
