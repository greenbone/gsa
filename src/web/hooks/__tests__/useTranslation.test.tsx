/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import useTranslation from 'web/hooks/useTranslation';

const TestComponent = () => {
  const [_, i18n_1, ready_1] = useTranslation();
  const {t, i18n, ready} = useTranslation();
  return (
    <div>
      <div data-testid="t1">{_('First Translation')}</div>
      <div data-testid="t2">{t('Second Translation')}</div>
      <div data-testid="r1">{ready_1 ? 'is ready' : 'not ready'}</div>
      <div data-testid="r2">{ready ? 'is ready' : 'not ready'}</div>
      <button
        data-testid="changeLocale1"
        onClick={() => i18n.changeLanguage('en')}
      />
      <button
        data-testid="changeLocale2"
        onClick={() => i18n_1.changeLanguage('en')}
      />
    </div>
  );
};

describe('useTranslation tests', () => {
  test('should render the translations', async () => {
    const {render} = rendererWith();

    render(<TestComponent />);

    const t1 = screen.getByTestId('t1');
    expect(t1).toHaveTextContent('First Translation');
    const t2 = screen.getByTestId('t2');
    expect(t2).toHaveTextContent('Second Translation');
    const r1 = screen.getByTestId('r1');
    expect(r1).toHaveTextContent('is ready');
    const r2 = screen.getByTestId('r2');
    expect(r2).toHaveTextContent('is ready');
    const b1 = screen.getByTestId('changeLocale1');
    fireEvent.click(b1);
    const b2 = screen.getByTestId('changeLocale2');
    fireEvent.click(b2);
  });
});
