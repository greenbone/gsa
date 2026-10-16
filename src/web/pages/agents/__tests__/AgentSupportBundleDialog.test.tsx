/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {closeDialog, fireEvent, render, screen, within} from 'web/testing';
import AgentSupportBundleDialog from 'web/pages/agents/AgentSupportBundleDialog';

describe('AgentSupportBundleDialog tests', () => {
  test('should default to an encrypted, non-anonymized download', () => {
    const onDownload = testing.fn();
    render(
      <AgentSupportBundleDialog
        onClose={testing.fn()}
        onDownload={onDownload}
      />,
    );

    expect(screen.getDialogTitle()).toHaveTextContent(
      'Download Agent Support Bundle',
    );
    expect(
      screen.getByRole('radio', {name: 'Encrypted support bundle'}),
    ).toBeChecked();
    expect(
      screen.getByRole('radio', {name: 'Non-anonymized support bundle'}),
    ).toBeChecked();
    expect(onDownload).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', {name: 'Download'}));
    expect(onDownload).toHaveBeenCalledWith(true, false);
  });

  test.each([
    {encryption: true, anonymized: false},
    {encryption: false, anonymized: false},
    {encryption: true, anonymized: true},
    {encryption: false, anonymized: true},
  ])(
    'should submit encryption=$encryption and anonymized=$anonymized independently',
    ({encryption, anonymized}) => {
      const onDownload = testing.fn();
      const onClose = testing.fn();
      render(
        <AgentSupportBundleDialog onClose={onClose} onDownload={onDownload} />,
      );

      const encryptionGroup = within(
        screen.getByRole('radiogroup', {name: 'Encryption'}),
      );
      const anonymizedGroup = within(
        screen.getByRole('radiogroup', {name: 'Anonymized operation'}),
      );
      expect(encryptionGroup.getAllByRole('radio')).toHaveLength(2);
      expect(anonymizedGroup.getAllByRole('radio')).toHaveLength(2);

      // Change both options before selecting the requested combination.
      fireEvent.click(
        encryptionGroup.getByRole('radio', {name: 'Plain support bundle'}),
      );
      fireEvent.click(
        anonymizedGroup.getByRole('radio', {name: 'Anonymized support bundle'}),
      );
      fireEvent.click(
        encryptionGroup.getByRole('radio', {
          name: encryption
            ? 'Encrypted support bundle'
            : 'Plain support bundle',
        }),
      );
      fireEvent.click(
        anonymizedGroup.getByRole('radio', {
          name: anonymized
            ? 'Anonymized support bundle'
            : 'Non-anonymized support bundle',
        }),
      );

      expect(
        encryptionGroup.getByRole('radio', {name: 'Encrypted support bundle'}),
      ).toHaveProperty('checked', encryption);
      expect(
        anonymizedGroup.getByRole('radio', {name: 'Anonymized support bundle'}),
      ).toHaveProperty('checked', anonymized);
      fireEvent.click(screen.getByRole('button', {name: 'Download'}));

      expect(onDownload).toHaveBeenCalledExactlyOnceWith(
        encryption,
        anonymized,
      );
      expect(onClose).not.toHaveBeenCalled();
    },
  );

  test.each(['cancel', 'close'])(
    'should dismiss via %s without downloading',
    action => {
      const onClose = testing.fn();
      const onDownload = testing.fn();
      render(
        <AgentSupportBundleDialog onClose={onClose} onDownload={onDownload} />,
      );

      if (action === 'cancel') {
        fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));
      } else {
        closeDialog();
      }

      expect(onClose).toHaveBeenCalledOnce();
      expect(onDownload).not.toHaveBeenCalled();
    },
  );

  test('should prevent repeated downloads while loading', () => {
    const onDownload = testing.fn();
    render(
      <AgentSupportBundleDialog
        loading
        onClose={testing.fn()}
        onDownload={onDownload}
      />,
    );

    const downloadButton = screen.getByRole('button', {name: 'Download'});
    expect(downloadButton).toBeDisabled();
    fireEvent.click(downloadButton);
    expect(onDownload).not.toHaveBeenCalled();
  });
});
