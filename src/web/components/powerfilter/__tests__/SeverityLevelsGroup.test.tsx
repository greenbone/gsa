/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen} from 'web/testing';
import Filter from 'gmp/models/filter';
import {
  DEFAULT_SEVERITY_RATING,
  SEVERITY_RATING_CVSS_2,
  SEVERITY_RATING_CVSS_3,
} from 'gmp/utils/severity';
import SeverityLevelsFilterGroup from 'web/components/powerfilter/SeverityLevelsGroup';

describe('SeverityLevelsFilterGroup tests', () => {
  test('should render', () => {
    const gmp = {
      settings: {
        severityRating: DEFAULT_SEVERITY_RATING,
      },
    };
    const {render} = rendererWith({gmp});
    const filter = Filter.fromString('levels=h');
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    const {element} = render(
      <SeverityLevelsFilterGroup
        filter={filter}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    expect(element).toBeVisible();
  });

  test('should call change handler', () => {
    const gmp = {
      settings: {
        severityRating: DEFAULT_SEVERITY_RATING,
      },
    };
    const {render} = rendererWith({gmp});
    const filter = Filter.fromString('levels=');
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    render(
      <SeverityLevelsFilterGroup
        filter={filter}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkbox = screen.getByTestId('severity-filter-high');
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalled();
    expect(handleChange).toHaveBeenCalledWith('h', 'levels');
  });

  test('should check checkbox', () => {
    const gmp = {
      settings: {
        severityRating: DEFAULT_SEVERITY_RATING,
      },
    };
    const {render} = rendererWith({gmp});
    const filter = Filter.fromString('levels=hm');
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    render(
      <SeverityLevelsFilterGroup
        filter={filter}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    expect(screen.getByTestId('severity-filter-high')).toBeChecked();
    expect(screen.getByTestId('severity-filter-medium')).toBeChecked();
    expect(screen.getByTestId('severity-filter-low')).not.toBeChecked();
    expect(screen.getByTestId('severity-filter-log')).not.toBeChecked();
  });

  test('should uncheck checkbox', () => {
    const gmp = {
      settings: {
        severityRating: DEFAULT_SEVERITY_RATING,
      },
    };
    const {render} = rendererWith({gmp});
    const filter1 = Filter.fromString('levels=hm');
    const filter2 = Filter.fromString('levels=m');
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    const {rerender} = render(
      <SeverityLevelsFilterGroup
        filter={filter1}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    expect(screen.getByTestId('severity-filter-high')).toBeChecked();
    expect(screen.getByTestId('severity-filter-medium')).toBeChecked();

    rerender(
      <SeverityLevelsFilterGroup
        filter={filter2}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    expect(screen.getByTestId('severity-filter-high')).not.toBeChecked();
    expect(screen.getByTestId('severity-filter-medium')).toBeChecked();
  });

  test('should be unchecked by default', () => {
    const gmp = {
      settings: {
        severityRating: DEFAULT_SEVERITY_RATING,
      },
    };
    const {render} = rendererWith({gmp});
    const filter = Filter.fromString();
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    render(
      <SeverityLevelsFilterGroup
        filter={filter}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    expect(screen.getByTestId('severity-filter-high')).not.toBeChecked();
    expect(screen.getByTestId('severity-filter-medium')).not.toBeChecked();
    expect(screen.getByTestId('severity-filter-low')).not.toBeChecked();
    expect(screen.getByTestId('severity-filter-log')).not.toBeChecked();
  });

  test('should call remove handler', () => {
    const gmp = {
      settings: {
        severityRating: DEFAULT_SEVERITY_RATING,
      },
    };
    const {render} = rendererWith({gmp});
    const filter = Filter.fromString('levels=h');
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    render(
      <SeverityLevelsFilterGroup
        filter={filter}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    const checkbox = screen.getByTestId('severity-filter-high');
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);

    expect(handleRemove).toHaveBeenCalled();
  });

  test('should not render critical severity', () => {
    const gmp = {
      settings: {
        severityRating: SEVERITY_RATING_CVSS_2,
      },
    };
    const {render} = rendererWith({gmp});
    const filter = Filter.fromString('levels=c');
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    render(
      <SeverityLevelsFilterGroup
        filter={filter}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    expect(
      screen.queryByTestId('severity-filter-critical'),
    ).not.toBeInTheDocument();
  });

  test('should render with critical severity', () => {
    const gmp = {
      settings: {
        severityRating: SEVERITY_RATING_CVSS_3,
      },
    };
    const {render} = rendererWith({gmp});
    const filter = Filter.fromString('levels=c');
    const handleChange = testing.fn();
    const handleRemove = testing.fn();
    render(
      <SeverityLevelsFilterGroup
        filter={filter}
        onChange={handleChange}
        onRemove={handleRemove}
      />,
    );

    expect(screen.getByTestId('severity-filter-critical')).toBeChecked();
    expect(screen.getByTestId('severity-filter-high')).not.toBeChecked();
    expect(screen.getByTestId('severity-filter-medium')).not.toBeChecked();
    expect(screen.getByTestId('severity-filter-low')).not.toBeChecked();
    expect(screen.getByTestId('severity-filter-log')).not.toBeChecked();
  });
});
