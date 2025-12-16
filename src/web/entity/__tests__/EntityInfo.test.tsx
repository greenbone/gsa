/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import Model from 'gmp/models/model';
import EntityInfo from 'web/entity/EntityInfo';
import {setTimezone} from 'web/store/usersettings/actions';

describe('EntityInfo component tests', () => {
  test('should render with existing owner', () => {
    const entity = Model.fromElement({
      _id: '123',
      owner: {
        name: 'owner',
      },
      creation_time: '2019-01-01T12:00:00Z',
      modification_time: '2019-02-02T12:00:00Z',
    });

    const {render, store} = rendererWith({store: true});

    store.dispatch(setTimezone('UTC'));

    render(<EntityInfo entity={entity} />);

    expect(screen.getByRole('row', {name: /ID:/})).toHaveTextContent('ID:123');
    expect(screen.getByRole('row', {name: /Created:/})).toHaveTextContent(
      'Created:Tue, Jan 1, 2019 12:00 PM Coordinated Universal Time',
    );
    expect(screen.getByRole('row', {name: /Modified:/})).toHaveTextContent(
      'Modified:Sat, Feb 2, 2019 12:00 PM Coordinated Universal Time',
    );
    expect(screen.getByRole('row', {name: /Owner:/})).toHaveTextContent(
      'Owner:owner',
    );
  });

  test('should render without specific owner', () => {
    const entity = Model.fromElement({
      _id: '123',
      creation_time: '2019-01-01T12:00:00Z',
      modification_time: '2019-02-02T12:00:00Z',
    });

    const {render, store} = rendererWith({store: true});

    store.dispatch(setTimezone('UTC'));

    render(<EntityInfo entity={entity} />);

    expect(screen.getByRole('row', {name: /ID:/})).toHaveTextContent('ID:123');
    expect(screen.getByRole('row', {name: /Created:/})).toHaveTextContent(
      'Created:Tue, Jan 1, 2019 12:00 PM Coordinated Universal Time',
    );
    expect(screen.getByRole('row', {name: /Modified:/})).toHaveTextContent(
      'Modified:Sat, Feb 2, 2019 12:00 PM Coordinated Universal Time',
    );
    expect(screen.getByRole('row', {name: /Owner:/})).toHaveTextContent(
      'Owner:(Global Object)',
    );
  });
});
