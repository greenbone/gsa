/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import Tag from 'gmp/models/tag';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';
import TagDetails from 'web/pages/tags/TagDetails';

describe('TagDetails tests', () => {
  test('should render tag details', () => {
    const tag = new Tag({
      id: 'tag-1',
      name: 'Test Tag',
      value: 'test-value',
      comment: 'Test comment',
      resourceType: 'target',
      active: YES_VALUE,
      resourceCount: 2,
    });

    const {render} = rendererWith({});
    render(<TagDetails entity={tag} />);

    screen.getByText('Value');
    screen.getByText('test-value');
    screen.getByText('Comment');
    screen.getByText('Test comment');
    screen.getByText('Active');
    screen.getByText('Yes');
  });

  test('should render resource type when resources are present', () => {
    const tag = new Tag({
      id: 'tag-1',
      name: 'Test Tag',
      value: 'test-value',
      resourceType: 'target',
      resourceCount: 1,
    });
    // Manually set resources since Tag constructor doesn't support it
    // This property is set during XML parsing in production
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (tag as any).resources = {type: 'target', count: {total: 1}};

    const {render} = rendererWith({});
    render(<TagDetails entity={tag} />);

    screen.getByText('Resource Type');
    screen.getByText('Target');
  });

  test('should not render resource type when resources are not present', () => {
    const tag = new Tag({
      id: 'tag-1',
      name: 'Test Tag',
      value: 'test-value',
      resourceType: 'target',
    });

    const {render} = rendererWith({});
    render(<TagDetails entity={tag} />);

    expect(screen.queryByText('Resource Type')).not.toBeInTheDocument();
  });

  test('should not render comment when it is undefined', () => {
    const tag = new Tag({
      id: 'tag-1',
      name: 'Test Tag',
      value: 'test-value',
      resourceType: 'target',
    });

    const {render} = rendererWith({});
    render(<TagDetails entity={tag} />);

    expect(screen.queryByText('Comment')).not.toBeInTheDocument();
  });

  test('should render tag as disabled when active is false', () => {
    const tag = new Tag({
      id: 'tag-1',
      name: 'Test Tag',
      value: 'test-value',
      active: NO_VALUE,
    });

    const {render} = rendererWith({});
    render(<TagDetails entity={tag} />);

    screen.getByText('Active');
    screen.getByText('No');
  });
});
