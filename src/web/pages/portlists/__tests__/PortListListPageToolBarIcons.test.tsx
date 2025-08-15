/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import PortListListPageToolBarIcons from 'web/pages/portlists/PortListListPageToolBarIcons';

const gmp = {
  settings: {
    manualUrl: 'https://example.com/manual',
  },
};

describe('PortListListPageToolBarIcons tests', () => {
  test('should render ManualIcon', () => {
    const {render} = rendererWith({capabilities: true, gmp});
    render(<PortListListPageToolBarIcons />);

    expect(screen.getByTitle('Help: Port Lists')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Help Icon'})).toHaveAttribute(
      'href',
      'https://example.com/manual/en/scanning.html#creating-and-managing-port-lists',
    );
  });

  test('should allow to create new port list when the user has create capabilities', () => {
    const handleCreate = testing.fn();
    const {render} = rendererWith({capabilities: true, gmp});
    render(
      <PortListListPageToolBarIcons onPortListCreateClick={handleCreate} />,
    );

    const newIcon = screen.getByTitle('New Port List');
    expect(newIcon).toBeInTheDocument();

    fireEvent.click(newIcon);
    expect(handleCreate).toHaveBeenCalledTimes(1);
  });

  test('should not render the NewIcon when the user lacks create capabilities', () => {
    const handleCreate = testing.fn();
    const {render} = rendererWith({capabilities: new Capabilities(), gmp});
    render(
      <PortListListPageToolBarIcons onPortListCreateClick={handleCreate} />,
    );

    expect(screen.queryByTitle('New Port List')).not.toBeInTheDocument();
  });

  test('should allow to import port list', () => {
    const handleImport = testing.fn();
    const {render} = rendererWith({capabilities: new Capabilities(), gmp});
    render(
      <PortListListPageToolBarIcons onPortListImportClick={handleImport} />,
    );

    const uploadIcon = screen.getByTitle('Import Port List');
    expect(uploadIcon).toBeInTheDocument();

    fireEvent.click(uploadIcon);
    expect(handleImport).toHaveBeenCalledTimes(1);
  });
});
