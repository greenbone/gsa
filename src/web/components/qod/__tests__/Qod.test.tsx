/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import Qod from 'web/components/qod/Qod';

describe('Qod tests', () => {
  test('should render Qod string value', () => {
    render(<Qod value="42" />);
    expect(screen.getByTestId('qod')).toHaveTextContent('42 %');
  });

  test('should render Qod number value', () => {
    render(<Qod value={42} />);
    expect(screen.getByTestId('qod')).toHaveTextContent('42 %');
  });

  test('should prevent linebreaks', () => {
    render(<Qod value={42} />);
    expect(screen.getByTestId('qod')).toHaveStyleRule('white-space', 'nowrap');
  });
});
