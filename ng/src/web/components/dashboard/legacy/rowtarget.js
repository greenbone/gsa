/* Greenbone Security Assistant
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import $ from 'jquery';
import 'jquery-ui';
import 'jquery-ui/ui/effect';
import 'jquery-ui/ui/effects/effect-blind';
import 'jquery-ui/ui/widgets/sortable.js';

import EventNode from './eventnode.js';

class RowTarget extends EventNode {

  constructor(id, position, edit_mode) {
    super();

    id = id + '-' + position + '-add';

    const elem = $('<div/>', {
      class: 'dashboard-add-row',
      id: id,
      css: {
        display: edit_mode ? 'block' : 'none',
      },
    });

    this.id = id;
    this.elem = elem;
    this.edit_mode = edit_mode;

    this.elem.sortable({
      handle: '.chart-head',
      forcePlaceholderSize: true,
      opacity: 0.75,
      tolerance: 'pointer',
      receive: (event, ui) => {
        const display = ui.item.data('display');
        this._trigger('received', [display, position]);
      },
    });
  }

  /**
   * Shows the drop target
   */
  show() {
    this.elem.show({duration: 150});
  }

  /**
   * Hides the drop target
   */
  hide() {
    this.elem.hide({duration: 150});
  }
}

export default RowTarget;

// vim: set ts=2 sw=2 tw=80:
