/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {setLocale} from 'web/store/usersettings/actions';
import {rendererWith, fireEvent, screen} from 'web/utils/testing';

import LanguageSwitch from 'web/components/structure/languageswitch';

const mockSaveSetting = testing.fn();
const mockSetLocale = testing.fn();

const gmp = {
  user: {
    saveSetting: () => mockSaveSetting(),
  },
  setLocale: () => mockSetLocale(),
};

describe('LanguageSwitch', () => {
  test('should switch language and update settings', async () => {
    const {render, store} = rendererWith({store: true, gmp});
    store.dispatch(setLocale('en'));
    const {getByRole} = render(<LanguageSwitch />);

    const button = getByRole('button', {name: 'Switch language to German'});

    fireEvent.click(button);

    expect(screen.getByTitle('Switch language to English')).toBeVisible();
  });
});
