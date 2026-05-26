/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import date, {duration} from 'gmp/models/date';
import Event from 'gmp/models/event';
import Schedule from 'gmp/models/schedule';
import {createSession} from 'gmp/testing';
import Button from 'web/components/form/Button';
import ScheduleComponent from 'web/pages/schedules/ScheduleComponent';

const createGmp = ({
  currentSettings = testing.fn().mockResolvedValue({}),
} = {}) => ({
  session: createSession({timezone: 'UTC'}),
  user: {currentSettings},
});

describe('ScheduleComponent tests', () => {
  test('should render', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    render(
      <ScheduleComponent>
        {() => <Button data-testid="button" />}
      </ScheduleComponent>,
    );

    expect(screen.getByTestId('button')).toBeInTheDocument();
  });

  test('should open New Schedule dialog', async () => {
    const gmp = createGmp();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
    });

    render(
      <ScheduleComponent>
        {({create}) => <Button data-testid="button" onClick={() => create()} />}
      </ScheduleComponent>,
    );

    const button = screen.getByTestId('button');

    fireEvent.click(button);

    const dialog = screen.getDialog();
    expect(dialog).toBeInTheDocument();

    const dialogTile = screen.getDialogTitle();
    expect(dialogTile).toHaveTextContent('New Schedule');
  });

  test('should open new schedule dialog', async () => {
    const gmp = createGmp();

    const {render} = rendererWith({
      gmp,
      capabilities: true,
    });

    render(
      <ScheduleComponent>
        {({create}) => <Button data-testid="button" onClick={create} />}
      </ScheduleComponent>,
    );

    const button = screen.getByTestId('button');

    fireEvent.click(button);

    const dialog = screen.getDialog();
    expect(dialog).toBeInTheDocument();

    const dialogTile = screen.getDialogTitle();
    expect(dialogTile).toHaveTextContent('New Schedule');
  });

  test('should open edit schedule dialog', async () => {
    const gmp = createGmp();
    const schedule = new Schedule({
      id: '1',
      name: 'Test Schedule',
      comment: 'This is a test schedule',
      timezone: 'CET',
      event: Event.fromData(
        {
          startDate: date('2024-01-01T12:00:00Z'),
          duration: duration({seconds: 3600}),
          freq: 'WEEKLY',
        },
        'CET',
      ),
    });

    const {render} = rendererWith({
      gmp,
      capabilities: true,
    });

    render(
      <ScheduleComponent>
        {({edit}) => (
          <Button data-testid="button" onClick={() => edit(schedule)} />
        )}
      </ScheduleComponent>,
    );

    const button = screen.getByTestId('button');

    fireEvent.click(button);

    const dialog = screen.getDialog();
    expect(dialog).toBeInTheDocument();

    const dialogTile = screen.getDialogTitle();
    expect(dialogTile).toHaveTextContent('Edit Schedule Test Schedule');

    expect(screen.getByRole('textbox', {name: 'Name'})).toHaveValue(
      'Test Schedule',
    );
    expect(screen.getByRole('textbox', {name: 'Comment'})).toHaveValue(
      'This is a test schedule',
    );
  });
});
