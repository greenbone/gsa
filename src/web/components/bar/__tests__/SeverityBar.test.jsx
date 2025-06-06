/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {screen, rendererWith} from 'web/testing';
import {
  DEFAULT_SEVERITY_RATING,
  SEVERITY_RATING_CVSS_2,
  SEVERITY_RATING_CVSS_3,
} from 'gmp/utils/severity';
import SeverityBar from 'web/components/bar/SeverityBar';
import Theme from 'web/utils/Theme';

describe('SeverityBar tests', () => {
  test('should render', () => {
    const gmp = {
      settings: {
        severityRating: DEFAULT_SEVERITY_RATING,
      },
    };

    const {render} = rendererWith({gmp});
    const {element} = render(<SeverityBar severity="5.5" />);

    expect(element).toBeVisible();
  });

  test('should render text content with high severity', () => {
    const gmp = {
      settings: {
        severityRating: SEVERITY_RATING_CVSS_2,
      },
    };

    const {render} = rendererWith({gmp});
    const {element} = render(<SeverityBar severity="9.5" />);
    expect(element).toHaveTextContent('9.5 (High)');
  });

  test('should render text content with medium severity', () => {
    const gmp = {
      settings: {
        severityRating: DEFAULT_SEVERITY_RATING,
      },
    };
    const {render} = rendererWith({gmp});
    const {element} = render(<SeverityBar severity="5" />);
    expect(element).toHaveTextContent('5.0 (Medium)');
  });

  test('should render text content with high severity', () => {
    const gmp = {
      settings: {
        severityRating: SEVERITY_RATING_CVSS_2,
      },
    };

    const {render} = rendererWith({gmp});
    const {element} = render(<SeverityBar severity="9" />);
    expect(element).toHaveTextContent('9.0 (High)');
  });

  test('should render text content with critical severity', () => {
    const gmp = {
      settings: {
        severityRating: SEVERITY_RATING_CVSS_3,
      },
    };
    const {render} = rendererWith({gmp});
    const {element} = render(<SeverityBar severity="9" />);
    expect(element).toHaveTextContent('9.0 (Critical)');
  });

  test('should render title with high severity', () => {
    const gmp = {
      settings: {
        severityRating: SEVERITY_RATING_CVSS_2,
      },
    };
    const {render} = rendererWith({gmp});
    render(<SeverityBar severity="9.5" />);
    const progressbarBox = screen.getByTestId('progressbar-box');
    expect(progressbarBox).toHaveAttribute('title', 'High');
  });

  test('should render title with medium severity', () => {
    const gmp = {
      settings: {
        severityRating: DEFAULT_SEVERITY_RATING,
      },
    };
    const {render} = rendererWith({gmp});
    render(<SeverityBar severity="5" />);
    const progressbarBox = screen.getByTestId('progressbar-box');
    expect(progressbarBox).toHaveAttribute('title', 'Medium');
  });

  test('should render title with critical severity', () => {
    const gmp = {
      settings: {
        severityRating: SEVERITY_RATING_CVSS_3,
      },
    };
    const {render} = rendererWith({gmp});
    render(<SeverityBar severity="9" />);
    const progressbarBox = screen.getByTestId('progressbar-box');
    expect(progressbarBox).toHaveAttribute('title', 'Critical');
  });

  test('should allow to overwrite title with toolTip', () => {
    const gmp = {
      settings: {
        severityRating: DEFAULT_SEVERITY_RATING,
      },
    };
    const {render} = rendererWith({gmp});
    const {element} = render(
      <SeverityBar severity="9.5" toolTip="tooltip text" />,
    );
    expect(element).toHaveAttribute('title', 'tooltip text');
  });

  test('should render progress', () => {
    const gmp = {
      settings: {
        severityRating: DEFAULT_SEVERITY_RATING,
      },
    };
    const {render} = rendererWith({gmp});
    render(<SeverityBar severity="9.5" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveStyleRule('width', '95%');
  });

  test('should not render progress > 100', () => {
    const gmp = {
      settings: {
        severityRating: DEFAULT_SEVERITY_RATING,
      },
    };
    const {render} = rendererWith({gmp});
    render(<SeverityBar severity="10.1" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveStyleRule('width', '100%');
  });

  test('should not render progress < 0', () => {
    const gmp = {
      settings: {
        severityRating: DEFAULT_SEVERITY_RATING,
      },
    };
    const {render} = rendererWith({gmp});
    render(<SeverityBar severity="-0.1" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveStyleRule('width', '0%');
  });

  test('should render background with high severity', () => {
    const gmp = {
      settings: {
        severityRating: SEVERITY_RATING_CVSS_2,
      },
    };
    const {render} = rendererWith({gmp});
    render(<SeverityBar severity="9.5" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveStyleRule(
      'background',
      `linear-gradient(90deg, ${Theme.severityClassHigh} 0%, ${Theme.severityClassHigh} 100%)`,
    );
  });

  test('should render background for medium severity', () => {
    const gmp = {
      settings: {
        severityRating: DEFAULT_SEVERITY_RATING,
      },
    };
    const {render} = rendererWith({gmp});
    render(<SeverityBar severity="5" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveStyleRule(
      'background',
      `linear-gradient(90deg, ${Theme.severityClassMedium} 0%, ${Theme.severityClassMedium} 100%)`,
    );
  });

  test('should render background for critical severity', () => {
    const gmp = {
      settings: {
        severityRating: SEVERITY_RATING_CVSS_3,
      },
    };
    const {render} = rendererWith({gmp});
    render(<SeverityBar severity="9" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveStyleRule(
      'background',
      `linear-gradient(90deg, ${Theme.severityClassCritical} 0%, ${Theme.severityClassCritical} 100%)`,
    );
  });

  test('should render without severity prop', () => {
    const gmp = {
      settings: {
        severityRating: DEFAULT_SEVERITY_RATING,
      },
    };
    const {render} = rendererWith({gmp});
    render(<SeverityBar />);
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveStyleRule(
      'background',
      `linear-gradient(90deg, ${Theme.severityClassLow} 0%, ${Theme.severityClassLow} 100%)`,
    );
    expect(progress).toHaveStyleRule('width', '0%');
  });
});
