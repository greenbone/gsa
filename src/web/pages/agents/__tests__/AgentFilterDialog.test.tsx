/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import Filter from 'gmp/models/filter';
import AgentFilterDialog from 'web/pages/agents/AgentFilterDialog';

describe('AgentFilterDialog tests', () => {
  test('should render filter dialog', () => {
    const onFilterChanged = testing.fn();

    const gmp = {
      settings: {token: 'token'},
      filters: {
        get: testing.fn().mockResolvedValue({data: []}),
        create: testing.fn().mockResolvedValue({data: {}}),
      },
    };

    const {render} = rendererWith({gmp});

    render(<AgentFilterDialog onFilterChanged={onFilterChanged} />);

    expect(screen.getByText('Update Filter')).toBeInTheDocument();
  });

  test('should close dialog on close button click', () => {
    const onFilterChanged = testing.fn();
    const onClose = testing.fn();

    const gmp = {
      settings: {token: 'token'},
      filters: {
        get: testing.fn().mockResolvedValue({data: []}),
        create: testing.fn().mockResolvedValue({data: {}}),
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <AgentFilterDialog onClose={onClose} onFilterChanged={onFilterChanged} />,
    );

    const closeButton = screen.getDialogCloseButton();
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  test('should call onFilterChanged when filter is updated', async () => {
    const onFilterChanged = testing.fn();

    const gmp = {
      settings: {token: 'token'},
      filters: {
        get: testing.fn().mockResolvedValue({data: []}),
        create: testing.fn().mockResolvedValue({data: {}}),
      },
    };

    const {render} = rendererWith({gmp});

    render(<AgentFilterDialog onFilterChanged={onFilterChanged} />);

    const updateButton = screen.getDialogSaveButton();
    fireEvent.click(updateButton);

    await wait();

    expect(onFilterChanged).toHaveBeenCalled();
  });

  test('should render with existing filter', () => {
    const onFilterChanged = testing.fn();

    const filter = Filter.fromString('name~test');

    const gmp = {
      settings: {token: 'token'},
      filters: {
        get: testing.fn().mockResolvedValue({data: []}),
        create: testing.fn().mockResolvedValue({data: {}}),
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <AgentFilterDialog filter={filter} onFilterChanged={onFilterChanged} />,
    );

    expect(screen.getByText('Update Filter')).toBeInTheDocument();
  });
});
