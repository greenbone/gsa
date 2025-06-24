/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  testing,
} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import {TabProvider, useTab} from 'web/components/tab/TabContext';

describe('TabContext tests', () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = testing.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  test('should set active tab from URL', () => {
    const {render} = rendererWith({showLocation: true, router: true});

    render(
      <TabProvider>
        <div>Test Content</div>
      </TabProvider>,
    );

    const locationPathname = screen.getByTestId('location-pathname');
    expect(locationPathname).toHaveTextContent('/');
  });

  test('should update tab when calling setActiveTab', () => {
    const {render} = rendererWith({showLocation: true, router: true});

    const TestComponent = () => {
      const {activeTab, setActiveTab} = useTab();
      return (
        <div>
          <span data-testid="active-tab">{activeTab}</span>
          <button onClick={() => setActiveTab(1)}>Set Tab 1</button>
        </div>
      );
    };

    render(
      <TabProvider>
        <TestComponent />
      </TabProvider>,
    );

    expect(screen.getByTestId('active-tab')).toHaveTextContent('0');

    fireEvent.click(screen.getByText('Set Tab 1'));

    const locationSearch = screen.getByTestId('location-search');
    expect(locationSearch).toHaveTextContent('?tab=1');
    expect(screen.getByTestId('active-tab')).toHaveTextContent('1');
  });

  test('should reset to tab 0 if active tab is greater than tab count', () => {
    const {render} = rendererWith({showLocation: true, router: true});

    const TestComponent = () => {
      const {activeTab, setActiveTab, setTabCount} = useTab();
      return (
        <div>
          <span data-testid="active-tab">{activeTab}</span>
          <button onClick={() => setTabCount(2)}>Set Tab Count 2</button>
          <button onClick={() => setActiveTab(5)}>Set Tab 5</button>
          <button onClick={() => setTabCount(1)}>Set Tab Count 1</button>
        </div>
      );
    };

    render(
      <TabProvider>
        <TestComponent />
      </TabProvider>,
    );

    fireEvent.click(screen.getByText('Set Tab Count 2'));
    fireEvent.click(screen.getByText('Set Tab 5'));

    expect(screen.getByTestId('active-tab')).toHaveTextContent('0');

    fireEvent.click(screen.getByText('Set Tab Count 1'));
    expect(screen.getByTestId('active-tab')).toHaveTextContent('0');
    const locationSearch = screen.getByTestId('location-search');
    expect(locationSearch).toHaveTextContent('?tab=0');
  });

  test('should throw error when useTab is used outside TabProvider', () => {
    const TestComponent = () => {
      const {activeTab} = useTab();
      return <div>{activeTab}</div>;
    };

    const errorListener = (event: ErrorEvent) => {
      if (event.message?.includes('useTab must be used within a TabProvider')) {
        event.preventDefault();
      }
    };
    window.addEventListener('error', errorListener);

    try {
      expect(() => {
        rendererWith({router: true}).render(<TestComponent />);
      }).toThrow('useTab must be used within a TabProvider');
    } finally {
      window.removeEventListener('error', errorListener);
    }
  });
});
