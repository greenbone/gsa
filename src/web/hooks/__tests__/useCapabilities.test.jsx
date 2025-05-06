/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import useCapabilities from 'web/hooks/useCapabilities';
import {rendererWith} from 'web/utils/Testing';

const TestUseCapabilities = () => {
  const capabilities = useCapabilities();
  if (capabilities.mayCreate('task')) {
    return <span>May create a task</span>;
  }
  return <span>Not allowed to create a task</span>;
};

describe('useCapabilities tests', () => {
  test('should be allowed to create a task', () => {
    const capabilities = new Capabilities(['create_task']);
    const {render} = rendererWith({capabilities});

    const {element} = render(<TestUseCapabilities />);

    expect(element).toHaveTextContent(/^May create a task$/);
  });

  test('should not be allowed to create a task', () => {
    const capabilities = new Capabilities();
    const {render} = rendererWith({capabilities});

    const {element} = render(<TestUseCapabilities />);

    expect(element).toHaveTextContent(/^Not allowed to create a task$/);
  });
});
