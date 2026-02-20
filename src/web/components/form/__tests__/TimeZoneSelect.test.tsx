/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {openSelectElement, screen, fireEvent, rendererWith} from 'web/testing';
import Response from 'gmp/http/response';
import timezones from 'gmp/time-zones';
import TimezoneSelect from 'web/components/form/TimeZoneSelect';

describe('TimezoneSelect tests', () => {
  test('should render', () => {
    const gmp = {
      settings: {token: 'token'},
      timezones: {
        get: testing.fn().mockResolvedValue(new Response(timezones)),
      },
    };
    const {render} = rendererWith({gmp});
    const {element} = render(<TimezoneSelect />);

    expect(element).toBeInTheDocument();
  });

  test('should render all timezones in selection', async () => {
    const gmp = {
      settings: {token: 'token'},
      timezones: {
        get: testing.fn().mockResolvedValue(new Response(timezones)),
      },
    };
    const {render} = rendererWith({gmp});
    render(<TimezoneSelect />);

    await openSelectElement();

    expect(screen.getSelectItemElements().length).toEqual(timezones.length);
  });

  test('should call onChange handler', async () => {
    const handler = testing.fn();
    const gmp = {
      settings: {token: 'token'},
      timezones: {
        get: testing.fn().mockResolvedValue(new Response(timezones)),
      },
    };
    const {render} = rendererWith({gmp});
    render(<TimezoneSelect onChange={handler} />);

    await openSelectElement();

    const items = screen.getSelectItemElements();
    fireEvent.click(items[1]);

    expect(handler).toHaveBeenCalledWith(timezones[1], undefined);
  });

  test('should call onChange handler with name', async () => {
    const handler = testing.fn();
    const gmp = {
      settings: {token: 'token'},
      timezones: {
        get: testing.fn().mockResolvedValue(new Response(timezones)),
      },
    };
    const {render} = rendererWith({gmp});
    render(<TimezoneSelect name="foo" onChange={handler} />);

    await openSelectElement();

    const items = screen.getSelectItemElements();
    fireEvent.click(items[1]);

    expect(handler).toHaveBeenCalledWith(timezones[1], 'foo');
  });

  test('should render selected value', () => {
    const timezone = timezones[1];
    const gmp = {
      settings: {token: 'token'},
      timezones: {
        get: testing.fn().mockResolvedValue(new Response(timezones)),
      },
    };
    const {render} = rendererWith({gmp});
    render(<TimezoneSelect value={timezone} />);

    const input = screen.getSelectElement();
    expect(input).toHaveValue(timezone);
  });
});
