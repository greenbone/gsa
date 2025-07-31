/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, screen} from 'web/testing';
import i18n from 'i18next';
import _ from 'gmp/locale';

import withTranslation, {
  WithTranslationComponentProps,
} from 'web/utils/withTranslation';

interface MockComponentProps extends WithTranslationComponentProps {
  someProp: string;
}

describe('withTranslation HOC', () => {
  test('should render the wrapped component with translation props', () => {
    const MockComponent = testing.fn(({_}: MockComponentProps) => (
      <div>{_('Tasks')}</div>
    ));
    const WrappedComponent = withTranslation<MockComponentProps>(MockComponent);

    render(<WrappedComponent someProp="test" />);

    expect(MockComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        _,
        i18n,
        someProp: 'test',
      }),
      {},
    );
    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });
});
