/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {screen, rendererWith} from 'web/testing';
import Model from 'gmp/models/model';
import {YES_VALUE} from 'gmp/parser';
import EntityLink from 'web/entity/Link';

describe('EntityLink component tests', () => {
  test('should render', () => {
    const entity = Model.fromElement(
      {
        _id: '123',
        name: 'bar',
      },
      'task',
    );

    const {render} = rendererWith({capabilities: true, router: true});
    render(<EntityLink entity={entity} />);

    const a = screen.getByTestId('details-link');
    expect(a.getAttribute('href')).toEqual('/task/123');
  });

  test('should render with text only', () => {
    const entity = Model.fromElement(
      {
        _id: '123',
        name: 'bar',
      },
      'task',
    );

    const {render} = rendererWith({capabilities: true, router: true});
    const {element} = render(<EntityLink entity={entity} textOnly={true} />);

    const a = element.querySelector('a');

    expect(a).toBe(null);
    expect(element).toHaveTextContent('bar');
  });

  test('should link to trashcan', () => {
    const entity = Model.fromElement(
      {
        _id: '123',
        name: 'bar',
        trash: YES_VALUE,
      },
      'task',
    );

    const {render} = rendererWith({capabilities: true, router: true});
    const {element} = render(<EntityLink entity={entity} />);

    const a = element.querySelector('a') as HTMLAnchorElement;

    expect(a.getAttribute('href')).toEqual('/trashcan#task');
    expect(element).toHaveTextContent('bar (in Trashcan)');
  });

  test('should only show text when wrong capabilities are given', () => {
    const entity = Model.fromElement(
      {
        _id: '123',
        name: 'bar',
      },
      'task',
    );

    const {render} = rendererWith({
      capabilities: false,
      router: true,
    });
    const {element} = render(<EntityLink entity={entity} />);

    const a = element.querySelector('a');

    expect(a).toBe(null);
    expect(element).toHaveTextContent('bar');
  });

  test('should indicate orphaned status', () => {
    const entity = Model.fromElement(
      {
        _id: '123',
        name: 'bar',
        // @ts-expect-error
        deleted: YES_VALUE,
      },
      'task',
    );

    const {render} = rendererWith({
      capabilities: true,
      router: true,
    });
    const {element} = render(<EntityLink entity={entity} />);

    const a = element.querySelector('a');

    expect(a).toBe(null);
    expect(element).toHaveTextContent('Orphan');
  });
});
