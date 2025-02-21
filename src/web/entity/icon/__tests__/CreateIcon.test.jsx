/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Task from 'gmp/models/task';
import CreateIcon from 'web/entity/icon/CreateIcon';
import {rendererWith, fireEvent} from 'web/utils/Testing';
import Theme from 'web/utils/Theme';


describe('Entity CreateIcon component tests', () => {
  test('should render in active state with correct permissions', () => {
    const caps = new Capabilities(['everything']);
    const entity = Task.fromElement({});
    const clickHandler = testing.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(
      <CreateIcon entity={entity} onClick={clickHandler} />,
    );

    expect(caps.mayCreate('task')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).toHaveBeenCalled();
    expect(element).not.toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: 'svg path.gui_icon_class',
    });
    expect(element).not.toHaveStyleRule('color', Theme.inputBorderGray);
  });

  test('should not be rendered if wrong command level permissions are given', () => {
    const caps = new Capabilities(['authenticate']);
    const entity = Task.fromElement({});

    const {render} = rendererWith({capabilities: caps});

    const {queryByTestId} = render(<CreateIcon entity={entity} />);

    expect(queryByTestId('create-icon')).toEqual(null);
    expect(caps.mayCreate('task')).toEqual(false);
  });
});
