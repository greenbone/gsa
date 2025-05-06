/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import DetailsBlock from 'web/entity/Block';
import {render} from 'web/utils/Testing';

describe('Entity Block component tests', () => {
  test('should render', () => {
    const {element} = render(
      <DetailsBlock id="123" title="title">
        <div>child</div>
      </DetailsBlock>,
    );
    const title = element.querySelectorAll('h2');
    const divs = element.querySelectorAll('div');

    expect(title.length).toEqual(1);
    expect(divs.length).toEqual(2);
    expect(element).toHaveTextContent('title');
    expect(element).toHaveTextContent('child');
  });
});
