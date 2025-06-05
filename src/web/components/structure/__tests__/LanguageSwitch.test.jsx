/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import LanguageSwitch from 'web/components/structure/LanguageSwitch';
import {rendererWith, fireEvent, screen} from 'web/testing';

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

    const button = screen.getByRole('button', {
      name: 'Switch language to German',
    });

    fireEvent.click(button);

    expect(mockSetLanguage).toHaveBeenCalledWith('de');
  });

  test('should show English option when current language is German', async () => {
    const mockSetLanguage = testing.fn().mockResolvedValue(undefined);

    const {render} = rendererWith({
      language: {
        language: 'de',
        setLanguage: mockSetLanguage,
      },
    });

    render(<LanguageSwitch />);

    expect(screen.getByTitle('Switch language to English')).toBeInTheDocument();
  });
});
