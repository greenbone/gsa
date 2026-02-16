/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, screen} from 'web/testing';
import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import ComponentWithInfoTip from 'web/components/info-tip/ComponentWithInfoTip';

const onChange = testing.fn();

describe('ComponentWithInfoTip tests', () => {
  test('should render with info tip', () => {
    render(
      <ComponentWithInfoTip
        helpAriaLabel="More info"
        helpContent="This is help text"
        slot={
          <TextField
            name="test"
            title="Test Field"
            value="test value"
            onChange={onChange}
          />
        }
      />,
    );

    expect(screen.getByLabelText('More info')).toBeInTheDocument();
  });

  test('should render Info icon from shared library', () => {
    render(
      <ComponentWithInfoTip
        helpAriaLabel="More info"
        helpContent="This is help text"
        slot={
          <TextField
            name="test"
            title="Test Field"
            value="test value"
            onChange={onChange}
          />
        }
      />,
    );

    expect(screen.getByLabelText('More info')).toBeInTheDocument();
  });

  test('should position info tip according to position prop', () => {
    render(
      <ComponentWithInfoTip
        helpAriaLabel="More info"
        helpContent="Help text"
        position="bottom"
        slot={
          <TextField
            name="test"
            title="Test Field"
            value="test value"
            onChange={onChange}
          />
        }
      />,
    );

    expect(screen.getByLabelText('More info')).toBeInTheDocument();
  });

  test('should work with FormGroup component', () => {
    const items = [
      {label: 'Option 1', value: '1'},
      {label: 'Option 2', value: '2'},
    ];

    render(
      <ComponentWithInfoTip
        helpAriaLabel="More info about form group"
        helpContent="This is help for the form group"
        slot={
          <FormGroup title="Test Form Group">
            <Select
              items={items}
              name="testSelect"
              value="1"
              onChange={onChange}
            />
          </FormGroup>
        }
      />,
    );

    expect(screen.getByText('Test Form Group')).toBeInTheDocument();

    expect(
      screen.getByLabelText('More info about form group'),
    ).toBeInTheDocument();
  });

  test('should use default aria-label when not provided', () => {
    render(
      <ComponentWithInfoTip
        helpContent="Help text"
        slot={
          <TextField
            name="test"
            title="Test Field"
            value="test value"
            onChange={onChange}
          />
        }
      />,
    );

    expect(screen.getByLabelText('More info')).toBeInTheDocument();
  });
});
