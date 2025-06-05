/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Model from 'gmp/model';
import Date from 'gmp/models/date';
import EntityInfo from 'web/entity/EntityInfo';
import {setTimezone} from 'web/store/usersettings/actions';
import {rendererWith} from 'web/testing';

const date = Date('2019-01-01T12:00:00Z');
const date2 = Date('2019-02-02T12:00:00Z');

describe('EntityInfo component tests', () => {
  test('should render with existing owner', () => {
    const entity = Model.fromElement({
      _id: '123',
      owner: {
        name: 'owner',
      },
      creation_time: date,
      modification_time: date2,
    });

    const {render, store} = rendererWith({store: true});

    store.dispatch(setTimezone('UTC'));

    const {element} = render(<EntityInfo entity={entity} />);

    const divs = element.querySelectorAll('div');
    const span = element.querySelectorAll('span');

    expect(divs.length).toEqual(7);
    expect(span.length).toEqual(1);
    expect(element).toHaveTextContent('ID:123');
    expect(element).toHaveTextContent(
      'Created:Tue, Jan 1, 2019 12:00 PM Coordinated Universal Time',
    );
    expect(element).toHaveTextContent(
      'Modified:Sat, Feb 2, 2019 12:00 PM Coordinated Universal Time',
    );
    expect(element).toHaveTextContent('Owner:owner');
  });

  test('should render without specific owner', () => {
    const entity = Model.fromElement({
      _id: '123',
      creation_time: date,
      modification_time: date2,
    });

    const {render, store} = rendererWith({store: true});

    store.dispatch(setTimezone('UTC'));

    const {element} = render(<EntityInfo entity={entity} />);

    const divs = element.querySelectorAll('div');
    const span = element.querySelectorAll('span');
    const italic = element.querySelectorAll('i');

    expect(divs.length).toEqual(7);
    expect(span.length).toEqual(0);
    expect(italic.length).toEqual(1);
    expect(element).toHaveTextContent('ID:123');
    expect(element).toHaveTextContent(
      'Created:Tue, Jan 1, 2019 12:00 PM Coordinated Universal Time',
    );
    expect(element).toHaveTextContent(
      'Modified:Sat, Feb 2, 2019 12:00 PM Coordinated Universal Time',
    );
    expect(element).toHaveTextContent('Owner:(Global Object)');
  });
});
