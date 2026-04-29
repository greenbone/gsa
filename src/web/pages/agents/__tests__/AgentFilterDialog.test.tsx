/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import Filter from 'gmp/models/filter';
import AgentFilterDialog from 'web/pages/agents/AgentFilterDialog';

const createGmp = ({
  get = testing.fn().mockResolvedValue({data: []}),
  create = testing.fn().mockResolvedValue({data: {}}),
} = {}) => ({
  settings: {session: {token: 'token'}},
  filters: {
    get,
    create,
  },
});

describe('AgentFilterDialog tests', () => {
  test('should render filter dialog', () => {
    const onFilterChanged = testing.fn();

    const gmp = createGmp();

    const {render} = rendererWith({gmp, capabilities: true});

    render(<AgentFilterDialog onFilterChanged={onFilterChanged} />);

    expect(screen.getByText('Update Filter')).toBeInTheDocument();
  });

  test('should close dialog on close button click', () => {
    const onFilterChanged = testing.fn();
    const onClose = testing.fn();

    const gmp = createGmp();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <AgentFilterDialog onClose={onClose} onFilterChanged={onFilterChanged} />,
    );

    const closeButton = screen.getDialogCloseButton();
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  test('should call onFilterChanged when filter is updated', async () => {
    const onFilterChanged = testing.fn();

    const gmp = createGmp();

    const {render} = rendererWith({gmp, capabilities: true});

    render(<AgentFilterDialog onFilterChanged={onFilterChanged} />);

    const updateButton = screen.getDialogSaveButton();
    fireEvent.click(updateButton);

    await wait();

    expect(onFilterChanged).toHaveBeenCalled();
  });

  test('should render with existing filter', () => {
    const onFilterChanged = testing.fn();

    const filter = Filter.fromString('name~test');

    const gmp = createGmp();

    const {render} = rendererWith({gmp, capabilities: true});

    render(
      <AgentFilterDialog filter={filter} onFilterChanged={onFilterChanged} />,
    );

    expect(screen.getByText('Update Filter')).toBeInTheDocument();
  });
});
