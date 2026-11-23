/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import TableEntityName from 'web/entities/TableEntityName';

describe('TableEntityName', () => {
  test('keeps keyboard preview activation separate from name navigation', async () => {
    const onClick = testing.fn();
    const {render} = rendererWith({
      capabilities: true,
      router: true,
      showLocation: true,
    });
    const {userEvent, rerender} = render(
      <TableEntityName
        id="1"
        preview={{expanded: false, id: 'preview-1', toggle: onClick}}
        type="target"
      >
        Example
      </TableEntityName>,
    );
    const preview = screen.getByRole('button', {
      name: 'Show preview for Example',
    });
    const link = screen.getByRole('link', {name: 'Example'});
    expect(preview).toHaveTextContent('');
    expect(link).toHaveAttribute('href', '/target/1');
    expect(link).not.toHaveAttribute('aria-expanded');
    expect(link.querySelector('svg')).not.toBeInTheDocument();

    await userEvent.tab();
    expect(preview).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onClick).toHaveBeenLastCalledWith();
    expect(screen.getByTestId('location-pathname')).toHaveTextContent('/');

    rerender(
      <TableEntityName
        id="1"
        preview={{expanded: true, id: 'preview-1', toggle: onClick}}
        type="target"
      >
        Example
      </TableEntityName>,
    );
    expect(preview).toHaveAccessibleName('Hide preview for Example');
    expect(preview).toHaveAttribute('aria-controls', 'preview-1');
    await userEvent.tab();
    expect(link).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByTestId('location-pathname')).toHaveTextContent(
      '/target/1',
    );
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  test('clicking the name does not toggle the preview', async () => {
    const onClick = testing.fn();
    const {render} = rendererWith({
      capabilities: true,
      router: true,
      showLocation: true,
    });
    const {userEvent} = render(
      <TableEntityName
        id="2"
        preview={{expanded: false, toggle: onClick}}
        type="task"
      >
        Example
      </TableEntityName>,
    );
    await userEvent.click(screen.getByRole('link', {name: 'Example'}));
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByTestId('location-pathname')).toHaveTextContent(
      '/task/2',
    );
  });

  test.each([
    {links: false, allowed: true, id: '1'},
    {links: true, allowed: false, id: '1'},
    {links: true, allowed: true, id: ''},
  ])(
    'preserves previews when navigation is unavailable (%j)',
    async ({links, allowed, id}) => {
      const onClick = testing.fn();
      const {render} = rendererWith({
        capabilities: allowed ? true : new Capabilities(),
        router: true,
      });
      const {userEvent} = render(
        <TableEntityName
          id={id}
          links={links}
          preview={{expanded: false, toggle: onClick}}
          type="target"
        >
          Example
        </TableEntityName>,
      );
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.getByText('Example')).toBeVisible();
      expect(screen.getByText('Example')).not.toHaveAttribute('title');
      await userEvent.click(
        screen.getByRole('button', {name: 'Show preview for Example'}),
      );
      expect(onClick).toHaveBeenCalledOnce();
    },
  );

  test('renders a navigation-only name without a preview control', () => {
    const {render} = rendererWith({capabilities: true, router: true});
    render(
      <TableEntityName id="1" type="report">
        Report date
      </TableEntityName>,
    );
    expect(screen.getByRole('link', {name: 'Report date'})).toHaveAttribute(
      'href',
      '/report/1',
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('renders a preview-only label without inventing a details destination', () => {
    const {render} = rendererWith();
    render(
      <TableEntityName
        preview={{expanded: false, toggle: testing.fn()}}
        previewLabel="Certificate"
      >
        <span>Certificate</span>
      </TableEntityName>,
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Show preview for Certificate'}),
    ).toBeVisible();
    expect(screen.getByText('Certificate')).toBeVisible();
  });
});
