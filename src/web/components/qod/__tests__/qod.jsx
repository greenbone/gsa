/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import Qod from 'web/components/qod/qod';

import {render} from 'web/utils/testing';

describe('Qod tests', () => {
  test('should render Qod value', () => {
    const {element} = render(<Qod value="42" />);
    const {element: element2} = render(<Qod value={42} />);

    expect(element).toMatchSnapshot();
    expect(element2).toMatchSnapshot();
  });

  test('should prevent linebreaks', () => {
    const {element} = render(<Qod value="42" />);

    expect(element).toHaveStyleRule('white-space', 'nowrap');
  });
});

// vim: set ts=2 sw=2 tw=80:
