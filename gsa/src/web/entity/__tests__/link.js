/* Copyright (C) 2020-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import Capabilities from 'gmp/capabilities/capabilities';

import Model from 'gmp/model';

import {YES_VALUE} from 'gmp/parser';

import {rendererWith} from 'web/utils/testing';

import EntityLink from '../link';

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
    const {getByTestId} = render(<EntityLink entity={entity} />);

    const a = getByTestId('details-link');

    expect(a.getAttribute('href')).toEqual('/foo/123');
  });

  test('should render with text only', () => {
    const entity = Model.fromElement({
      _id: '123',
      entityType: 'foo',
      name: 'bar',
    });

    const {render} = rendererWith({capabilities: caps, router: true});
    const {element} = render(<EntityLink textOnly={true} entity={entity} />);

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
  test('should indicate orphaned status for hyperion entities', () => {
    const entity = Model.fromObject({
      id: '123',
      entityType: 'alert',
      name: 'bar',
      deleted: true,
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

// vim: set ts=2 sw=2 tw=80:
