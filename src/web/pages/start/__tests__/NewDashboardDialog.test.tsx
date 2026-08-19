/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  fireEvent,
  getSelectItemElementsForSelect,
  openSelectElement,
  render,
  screen,
} from 'web/testing';
import NewDashboardDialog, {
  DEFAULT_DISPLAYS,
} from 'web/pages/start/NewDashboardDialog';

interface AdditionalDisplayChoice {
  label: string;
  value: Array<unknown>;
}

const renderDialog = (
  additionalDisplayChoices: AdditionalDisplayChoice[] = [],
) => {
  const onClose = testing.fn();
  const onSave = testing.fn();

  render(
    <NewDashboardDialog
      additionalDisplayChoices={additionalDisplayChoices}
      onClose={onClose}
      onSave={onSave}
    />,
  );

  return {onClose, onSave};
};

describe('NewDashboardDialog', () => {
  test('should render default title and display selection', () => {
    renderDialog();

    expect(screen.getDialogTitle()).toHaveTextContent('Add new Dashboard');
    expect(
      screen.getByRole('textbox', {name: 'Dashboard Title'}),
    ).toBeInTheDocument();
    expect(screen.getSelectElement()).toHaveValue('Default');
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  test('should save a dashboard with the default displays', () => {
    const {onSave} = renderDialog();

    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith({
      title: 'Unnamed',
      defaultDisplays: DEFAULT_DISPLAYS,
    });
  });

  test('should save a dashboard with a selected additional display choice', async () => {
    const additionalDisplayChoices = [
      {label: 'Existing Dashboard', value: [['existing-display']]},
    ];
    const {onSave} = renderDialog(additionalDisplayChoices);

    const select = screen.getSelectElement();
    await openSelectElement(select);
    const displayChoices = await getSelectItemElementsForSelect(select);
    const existingDashboardChoice = displayChoices.find(item =>
      item.textContent?.includes('Existing Dashboard'),
    ) as HTMLElement;
    expect(existingDashboardChoice).toBeDefined();
    fireEvent.click(existingDashboardChoice);
    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith({
      title: 'Unnamed',
      defaultDisplays: [['existing-display']],
    });
  });

  test('should close without saving when cancel is clicked', () => {
    const {onClose, onSave} = renderDialog();

    fireEvent.click(screen.getDialogCloseButton());

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });
});
