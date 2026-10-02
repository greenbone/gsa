/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen, waitFor} from 'web/testing';
import LanguageSwitch from 'web/components/structure/LanguageSwitch';

describe('LanguageSwitch', () => {
  test('should switch language and update settings', async () => {
    const mockSetLanguage = testing.fn().mockResolvedValue(undefined);

    const {render} = rendererWith({
      language: {
        language: 'en',
        setLanguage: mockSetLanguage,
      },
    });

    render(<LanguageSwitch />);

    const button = screen.getByRole('button', {name: 'Select language'});

    fireEvent.click(button);
    await waitFor(() => {
      expect(
        screen.getByRole('menuitem', {hidden: true, name: 'Deutsch'}),
      ).toBeInTheDocument();
    });
    fireEvent.click(
      screen.getByRole('menuitem', {hidden: true, name: 'Deutsch'}),
    );

    expect(mockSetLanguage).toHaveBeenCalledWith('de');
  });

  test('should disable the trigger while changing language', async () => {
    let resolveLanguageChange: () => void = () => undefined;
    const mockSetLanguage = testing.fn(
      () =>
        new Promise<void>(resolve => {
          resolveLanguageChange = resolve;
        }),
    );

    const {render} = rendererWith({
      language: {
        language: 'en',
        setLanguage: mockSetLanguage,
      },
    });

    render(<LanguageSwitch />);
    fireEvent.click(screen.getByRole('button', {name: 'Select language'}));
    const germanMenuItem = await screen.findByRole('menuitem', {
      hidden: true,
      name: 'Deutsch',
    });
    fireEvent.click(germanMenuItem);

    await waitFor(() => {
      expect(
        screen.getByRole('button', {name: 'Select language'}),
      ).toBeDisabled();
    });

    resolveLanguageChange();
  });

  test('should show all language options', async () => {
    const {render} = rendererWith({
      language: {
        language: 'de',
        setLanguage: testing.fn(),
      },
    });

    render(<LanguageSwitch />);
    fireEvent.click(screen.getByRole('button', {name: 'Select language'}));

    await waitFor(() => {
      expect(screen.getAllByRole('menuitem', {hidden: true})).toHaveLength(6);
    });
  });

  test.each(['ja', 'zh_CN', 'zh_TW', 'it'])(
    'should show the selected %s language flag',
    language => {
      const {render} = rendererWith({
        language: {
          language,
          setLanguage: testing.fn(),
        },
      });

      render(<LanguageSwitch />);

      expect(
        screen.getByTestId(`language-flag-${language}`),
      ).toBeInTheDocument();
    },
  );
});
