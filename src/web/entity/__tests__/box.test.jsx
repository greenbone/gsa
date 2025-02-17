/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Date from 'gmp/models/date';
import {setTimezone} from 'web/store/usersettings/actions';
import {rendererWith} from 'web/utils/testing';

import EntityBox from '../box';

const date1 = Date('2019-01-01T12:00:00Z');
const date2 = Date('2019-02-02T12:00:00Z');

describe('EntityBox component tests', () => {
  test('should render', () => {
    const {render, store} = rendererWith({
      store: true,
    });

    store.dispatch(setTimezone('CET'));

    const {element} = render(
      <EntityBox
        end={date1}
        modified={date2}
        text="foo"
        title="bar"
        toolbox={<div>tool</div>}
      >
        <div>child</div>
      </EntityBox>,
    );
    const title = element.querySelectorAll('h3');
    const divs = element.querySelectorAll('div');
    const table = element.querySelectorAll('table');
    const rows = element.querySelectorAll('tr');
    const pres = element.querySelectorAll('pre');

    expect(title.length).toEqual(1);
    expect(divs.length).toEqual(7);
    expect(table.length).toEqual(1);
    expect(rows.length).toEqual(2);
    expect(pres.length).toEqual(1);

    expect(element).toHaveTextContent('bar');
    expect(element).toHaveTextContent('tool');
    expect(element).toHaveTextContent('foo');
    expect(element).toHaveTextContent('child');
    expect(element).toHaveTextContent(
      'Active untilTue, Jan 1, 2019 1:00 PM CET',
    );
    expect(element).toHaveTextContent('ModifiedSat, Feb 2, 2019 1:00 PM CET');
    expect(element).toHaveStyleRule('width', '400px');
  });
});
