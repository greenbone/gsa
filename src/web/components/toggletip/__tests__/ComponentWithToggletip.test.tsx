/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, render, screen} from 'web/testing';
import TextField from 'web/components/form/TextField';
import ComponentWithToggletip from 'web/components/toggletip/ComponentWithToggletip';

const onChange = testing.fn();

describe('ComponentWithToggletip tests', () => {
  test('should not close toggletip when clicking on the field', () => {
    render(
      <ComponentWithToggletip
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

    // Open the toggletip
    const helpButton = screen.getByRole('button', {name: 'More info'});
    fireEvent.click(helpButton);

    const helpContent = screen.getByText('This is help text');
    expect(helpContent).toBeVisible();

    // Click on the field
    const field = screen.getByDisplayValue('test value');
    expect(field).toBeInTheDocument();

    fireEvent.click(field);

    // Toggletip should still be visible
    expect(helpContent).toBeVisible();
  });

  test('should close toggletip when clicking outside', () => {
    render(
      <ComponentWithToggletip
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

    // Open the toggletip
    const helpButton = screen.getByRole('button', {name: 'More info'});
    fireEvent.click(helpButton);

    const helpContent = screen.getByText('This is help text');
    expect(helpContent).toBeVisible();

    // Click outside (using mousedown on document body)
    fireEvent.mouseDown(document.body);

    // Toggletip should be closed
    expect(helpContent).not.toBeVisible();
  });

  test('should render multiline help content', () => {
    const multilineHelp = 'Line 1\nLine 2\nLine 3';

    render(
      <ComponentWithToggletip
        helpAriaLabel="More info"
        helpContent={multilineHelp}
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

    const helpButton = screen.getByRole('button', {name: 'More info'});
    fireEvent.click(helpButton);

    const helpContent = screen.getByText(/Line 1/);
    expect(helpContent).toBeInTheDocument();
  });

  test('should apply custom data-testid when provided', () => {
    render(
      <ComponentWithToggletip
        dataTestId="custom-help"
        helpAriaLabel="More info"
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

    // The Container element in Toggletip has the data-testid
    // We need to open it first to access it
    const helpButton = screen.getByRole('button', {name: 'More info'});
    fireEvent.click(helpButton);

    const customElement = screen.getByTestId('custom-help');
    expect(customElement).toBeInTheDocument();
  });

  test('should position toggletip according to position prop', () => {
    render(
      <ComponentWithToggletip
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

    const helpButton = screen.getByRole('button', {name: 'More info'});
    fireEvent.click(helpButton);

    const helpContent = screen.getByText('Help text');
    expect(helpContent).toHaveStyle({top: '100%', left: '0'});
  });
});
