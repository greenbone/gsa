/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ProtocolDocLink from 'web/components/link/ProtocolDocLink';
import {rendererWith} from 'web/utils/Testing';

describe('ProtocolDocLink tests', () => {
  test('should render ProtocolDocLink', () => {
    const gmp = {
      settings: {
        protocolDocUrl: 'http://foo.bar',
      },
    };

    const {render} = rendererWith({gmp});
    const {element} = render(<ProtocolDocLink title="Foo" />);

    expect(element).toHaveAttribute('title', 'Foo');
    expect(element).toHaveAttribute('href', 'http://foo.bar');
    expect(element).toHaveAttribute('target', '_blank');
    expect(element).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
