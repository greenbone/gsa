/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import SchedulerCronFields from 'web/components/form/SchedulerCronFields';

const MultipleCronEditor = ({
  initialValues,
  onChange,
  disabled = false,
}: {
  initialValues: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
}) => {
  const [value, setValue] = useState(initialValues);
  return (
    <SchedulerCronFields
      activeCronExpressions={initialValues}
      disabled={disabled}
      value={value.map(cron => ({cron, maxDelaySeconds: 0}))}
      onChange={entries => {
        const values = entries.map(({cron}) => cron);
        setValue(values);
        onChange(values);
      }}
    />
  );
};

describe('SchedulerCronFields tests', () => {
  test('shows one heading and shared help for multiple schedule rows', () => {
    const {render} = rendererWith({});
    render(
      <MultipleCronEditor
        initialValues={['0 * * * *', '0 12 * * *']}
        onChange={testing.fn()}
      />,
    );
    expect(screen.getAllByText('Scheduler Options')).toHaveLength(1);
    expect(screen.getByText('Schedule 1')).toBeInTheDocument();
    expect(screen.getByText('Schedule 2')).toBeInTheDocument();
    expect(
      screen.getAllByText(/Choose from the dropdown of common schedules/),
    ).toHaveLength(1);
    expect(screen.queryByText('Remove schedule')).not.toBeInTheDocument();
    expect(screen.queryByText('Add schedule')).not.toBeInTheDocument();
    expect(screen.getByText('Add another schedule')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Remove schedule 1'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Remove schedule 2'}),
    ).toBeInTheDocument();
  });

  test('adds, edits and removes individual schedules', () => {
    const onChange = testing.fn();
    const {render} = rendererWith({});
    render(
      <MultipleCronEditor initialValues={['0 5 * * *']} onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Add schedule'}));
    expect(onChange).toHaveBeenLastCalledWith(['0 5 * * *', '0 * * * *']);
    expect(screen.getByDisplayValue('Every hour')).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue('0 5 * * *'), {
      target: {value: '0 7 * * *'},
    });
    expect(onChange).toHaveBeenLastCalledWith(['0 7 * * *', '0 * * * *']);

    fireEvent.click(screen.getByRole('button', {name: 'Remove schedule 2'}));
    expect(onChange).toHaveBeenLastCalledWith(['0 7 * * *']);
    expect(
      screen.getByRole('button', {name: 'Remove schedule 1'}),
    ).toBeDisabled();
  });

  test('restores the correct custom expression after another row is removed', () => {
    const onChange = testing.fn();
    const {render} = rendererWith({});
    render(
      <MultipleCronEditor
        initialValues={['0 5 * * *', '0 7 * * *']}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Remove schedule 1'}));
    fireEvent.click(screen.getSelectElement());
    fireEvent.click(screen.getByText('Every hour'));
    expect(onChange).toHaveBeenLastCalledWith(['0 * * * *']);

    fireEvent.click(screen.getSelectElement());
    fireEvent.click(screen.getByText('Custom cron expression'));
    expect(onChange).toHaveBeenLastCalledWith(['0 7 * * *']);
    expect(screen.getByDisplayValue('0 7 * * *')).toBeInTheDocument();
  });

  test('allows adding the first schedule to an empty list', () => {
    const onChange = testing.fn();
    const {render} = rendererWith({});
    render(<MultipleCronEditor initialValues={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', {name: 'Add schedule'}));
    expect(onChange).toHaveBeenLastCalledWith(['0 * * * *']);
    expect(screen.getByDisplayValue('Every hour')).toBeInTheDocument();
  });

  test('handles schedules supplied by a parent after mounting', () => {
    const onChange = testing.fn();
    const {render} = rendererWith({});
    const {rerender} = render(
      <SchedulerCronFields
        value={[{cron: '0 5 * * *', maxDelaySeconds: 0}]}
        onChange={onChange}
      />,
    );
    rerender(
      <SchedulerCronFields
        value={[
          {cron: '0 5 * * *', maxDelaySeconds: 0},
          {cron: '0 7 * * *', maxDelaySeconds: 0},
        ]}
        onChange={onChange}
      />,
    );
    expect(screen.getByDisplayValue('0 7 * * *')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Add schedule'}));
    expect(onChange).toHaveBeenLastCalledWith([
      {cron: '0 5 * * *', maxDelaySeconds: 0},
      {cron: '0 7 * * *', maxDelaySeconds: 0},
      {cron: '0 * * * *', maxDelaySeconds: 0},
    ]);
    fireEvent.click(screen.getByRole('button', {name: 'Remove schedule 2'}));
    expect(onChange).toHaveBeenLastCalledWith([
      {cron: '0 5 * * *', maxDelaySeconds: 0},
    ]);
  });

  test('disables all schedule controls', () => {
    const {render} = rendererWith({});
    render(
      <MultipleCronEditor
        disabled
        initialValues={['0 5 * * *', '0 7 * * *']}
        onChange={testing.fn()}
      />,
    );
    screen
      .getAllByRole('button')
      .forEach(button => expect(button).toBeDisabled());
    screen
      .getAllByRole('textbox')
      .forEach(input => expect(input).toBeDisabled());
  });
});
