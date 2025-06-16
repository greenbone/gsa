/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {screen, rendererWith} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Model from 'gmp/models/model';
import {YES_VALUE} from 'gmp/parser';
import EntityLink from 'web/entity/Link';

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_config']);

describe('EntityLink component tests', () => {
  test('should render', () => {
    const entity = Model.fromElement({
      _id: '123',
      entityType: 'foo',
      name: 'bar',
    });

    const {render} = rendererWith({capabilities: caps, router: true});
    render(<EntityLink entity={entity} />);

    const a = screen.getByTestId('details-link');
    expect(a.getAttribute('href')).toEqual('/foo/123');
  });

  test('should render with text only', () => {
    const entity = Model.fromElement({
      _id: '123',
      entityType: 'foo',
      name: 'bar',
    });

    const {render} = rendererWith({capabilities: caps, router: true});
    const {element} = render(<EntityLink entity={entity} textOnly={true} />);

    const a = element.querySelector('a');

    expect(a).toBe(null);
    expect(element).toHaveTextContent('bar');
  });

  test('should link to trashcan', () => {
    const entity = Model.fromElement({
      _id: '123',
      entityType: 'foo',
      name: 'bar',
      trash: YES_VALUE,
    });

    const {render} = rendererWith({capabilities: caps, router: true});
    const {element} = render(<EntityLink entity={entity} />);

    const a = element.querySelector('a');

    expect(a.getAttribute('href')).toEqual('/trashcan#foo');
    expect(element).toHaveTextContent('bar (in Trashcan)');
  });

  test('should only show text when wrong capabilities are given', () => {
    const entity = Model.fromElement({
      _id: '123',
      entityType: 'foo',
      name: 'bar',
    });

    const {render} = rendererWith({
      capabilities: wrongCaps,
      router: true,
    });
    const {element} = render(<EntityLink entity={entity} />);

    const a = element.querySelector('a');

    expect(a).toBe(null);
    expect(element).toHaveTextContent('bar');
  });

  test('should indicate orphaned status', () => {
    const entity = Model.fromElement({
      _id: '123',
      entityType: 'foo',
      name: 'bar',
      deleted: YES_VALUE,
    });

    const {render} = rendererWith({
      capabilities: caps,
      router: true,
    });
    const {element} = render(<EntityLink entity={entity} />);

    const a = element.querySelector('a');

    expect(a).toBe(null);
    expect(element).toHaveTextContent('Orphan');
  });
});
