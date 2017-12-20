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
import 'core-js/fn/object/values';

import $ from 'jquery';
import 'jquery-ui';
import 'jquery-ui/ui/effect';
import 'jquery-ui/ui/widgets/resizable.js';
import 'jquery-ui/ui/widgets/sortable.js';

import {is_defined, is_object, is_array} from 'gmp/utils.js';
import Logger from 'gmp/log.js';

import EventNode from './eventnode.js';
import DashboardDisplay from './display.js';

const log = Logger.getLogger('web.dashboard.legacy.');

const MAX_PER_ROW = 4;

class DashboardRow extends EventNode {

  constructor(id, config, controller_factories, filters, width, edit_mode,
    dashboard_opts) {

    const elem = $('<div/>', {
      class: 'dashboard-row',
      id,
    });

    super(elem);

    this.elem = elem;
    this.id = id;
    this.controller_factories = controller_factories;
    this.filters = filters;
    this.height = config.height;
    this.prev_height = this.height;
    this.width = width;
    this.dashboard_opts = dashboard_opts;
    this.displays = {};
    this.display_count_offset = 0;
    this.edit_mode = edit_mode;
    this.sort_start = false; // indicator if display sorting started in this row
    this.max_per_row = is_defined(dashboard_opts.max_per_row) ?
      dashboard_opts.max_per_row : MAX_PER_ROW;
    this.last_display_index = 0;

    this.setConfig(config);

    this.init();
  }

  /**
   * Initializes the dashboard row.
   */
  init() {
    this.elem.css('height', this.height);

    this.config.data.forEach(config => {
      this.createNewDisplay(config, this.config.data.length);
    });

    this._updateCssClasses();
  }

  /**
   * Creates a new DashboardDisplay and adds it to this row
   *
   * @param {Object} config         Initial config for the new display
   * @param {Number} display_count  Expected number of displays in this row (optional)
   *
   * @return This row
   */
  createNewDisplay(config, display_count) {
    const display = new DashboardDisplay(this._getNextDisplayId(), config,
      this.controller_factories, this.filters, this.edit_mode, this.height,
      this._getDisplayWidth(display_count), this.dashboard_opts);
    this.addDisplay(display);
    return this;
  }

  /**
   * Adds a display to the dashboard row. Triggers display_added event.
   *
   * @param {DashboardDisplay} display  The display to add.
   *
   * @return This row
   */
  addDisplay(display) {
    this.elem.append(display.elem);
    this.registerDisplay(display);
    this._updateCssClasses();
    this._trigger('display_added', [display, this]);
    return this;
  }

  /**
   * Adds a display to the dashboard row. Triggers display_removed event.
   *
   * @param {DashboardDisplay} display  The display to remove.
   *
   * @return This row
   */
  removeDisplay(display) {
    this.unregisterDisplay(display);
    this._updateCssClasses();
    this._trigger('display_removed', [display, this]);
    return this;
  }

  /**
   * Gets a display of the dashboard row by id.
   *
   * @param {String} id  The id of the display to get.
   *
   * @return The requested display.
   */
  getDisplay(id) {
    return this.displays[id];
  }

  /**
   * Counts the number of displays in the row.
   *
   * @return The number of displays.
   */
  getNumDisplays() {
    return Object.keys(this.displays).length;
  }

  /**
   * Registers a display in the dashboard row and adds event listeners to the
   * display.
   *
   * @param {DashboardDisplay} display  The display to register.
   *
   * @return This row
   */
  registerDisplay(display) {
    this.displays[display.id] = display;

    display.on('removed', (event, disp) => {
      this.removeDisplay(disp);
      this.resize();
    });

    display.on('controller_changed', (event, disp) => {
      this._trigger('display_controller_changed', [disp, this]);
    });
    display.on('filter_changed', (event, disp) => {
      this._trigger('display_filter_changed', [disp, this]);
    });
    return this;
  }

  /**
   * Unregisters a display from the dashboard row.
   *
   * @param {DashboardDisplay} display  The display to register.
   *
   * @return This row
   */
  unregisterDisplay(display) {
    delete this.displays[display.id];
    return this;
  }

  /**
   * Iterate over each display in order of occurrence
   *
   * @param {Function} callback A callback function as following function(display)
   */
  forEachDisplayOrdered(callback) {
    this.elem.find('.dashboard-display').each(function() {
      callback($(this).data('display'));
    });
  }

  /**
   * Returns an array of configs from the ones of the displays.
   *
   * @return The config objects of all displays
   */
  getConfig() {
    const configs = [];
    this.forEachDisplayOrdered(display => {
      configs.push(display.getConfig());
    });

    return {
      type: 'row',
      height: this.getHeight(),
      data: configs,
    };
  }

  setConfig(config) {
    if (!is_object(config)) {
      config = {};
    }
    if (!is_array(config.data)) {
      config.data = [];
    }
    if (!is_defined(config.height)) {
      config.height = 280;
    }
    else if (config.height < 150) {
      config.height = 150;
    }

    this.config = config;

    return this;
  }

  /**
   * Start edit mode for the row
   *
   * @return This row
   */
  startEdit() {
    for (const display_id in this.displays) {
      this.displays[display_id].startEdit();
    }

    this.edit_mode = true;

    this.elem.resizable({
      handles: 's',
      minHeight: 150,
      grid: [10, 10],
      resize: (event, ui) => {
        this.resize(ui.size.height);
        this._trigger('resize', this);
      },
      stop: (event, ui) => {
        this._trigger('resized', this);
      },
    });

    this.elem.sortable({
      handle: '.chart-head',
      connectWith: '.dashboard-row:not(".full"), .dashboard-add-row',
      placeholder: 'dashboard-placeholder',
      forcePlaceholderSize: true,
      opacity: 0.75,
      tolerance: 'pointer',
      start: (event, ui) => {
        log.debug('sorting start ' + this.id);
        this.sort_start = true;
        this.display_count_offset = 0;
        this._updateCssClasses();
        this._trigger('reorder', this);
      },
      stop: (event, ui) => {
        log.debug('sorting stop ' + this.id);
        this.sort_start = false;
        this.display_count_offset = 0;
        this._updateCssClasses();
        this._trigger('reorderd', this);
      },
      remove: (event, ui) => {
        log.debug('sorting removed ' + this.id);
        const display = ui.item.data('display');
        this.removeDisplay(display);
        this.resize();
      },
      over: (event, ui) => {
        log.debug('sorting over ' + this.id);
        if (!this.sort_start) {
          this.display_count_offset = 1;
        }
        this._updateCssClasses();
        this.resize();
      },
      out: (event, ui) => {
        log.debug('sorting out ' + this.id);
        if (!this.sort_start) {
          this.display_count_offset = 0;
        }
        this._updateCssClasses();
        this.resize();
      },
      receive: (event, ui) => {
        log.debug('sorting received ' + this.id);
        const display = ui.item.data('display');
        this.display_count_offset = 0;
        this.addDisplay(display);
        this.resize();
      },
    });
    return this;
  }

  /**
   * End editing mode of this row and its displays
   *
   * @return This row
   */
  stopEdit() {
    for (const display of Object.values(this.displays)) {
      display.stopEdit();
    }
    this.edit_mode = false;
    this.elem.resizable('destroy');
    this.elem.sortable('destroy');
    return this;
  }

  /**
   * Resize this row and its displays
   *
   * @param {Number} height New height to set (optional)
   * @param {Number} width  New width to set (optional)
   *
   * @return This Row
   */
  resize(height, width) {
    log.debug('resize row ' + this.id, height, width);

    if (is_defined(width)) {
      this.width = width;
    }
    if (is_defined(height)) {
      this.height = height;
    }

    this.elem.css('width', width);
    this.elem.css('height', height);

    for (const display of Object.values(this.displays)) {
      display.resize(this.height, this._getDisplayWidth());
    }
    return this;
  }

  /**
   * Remove this row. Triggers removed event afterwards.
   *
   * @return This row.
   */
  remove() {
    this.elem.hide('blind', {}, 250, () => {
      this.elem.remove();
      this._trigger('removed', this);
    });
    return this;
  }

  /**
   * Gets the height of the dashboard row.
   *
   * @return The current height of the row
   */
  getHeight() {
    return this.elem[0].clientHeight;
  }

  /**
   * Rebuild displays from controllers and filter string
   *
   * @param {Object} config  Configs to use for this row and its displays.
   *
   * @return This row
   */
  update(config) {
    log.debug('Updating row ' + this.id, config);

    this.setConfig(config);

    const displays = [];

    this.forEachDisplayOrdered(display => {
      displays.push(display);
    });

    this.config.data.forEach((conf, index) => {
      if (index <= displays.length - 1) {
        displays[index].update(conf);
      }
      else {
        this.createNewDisplay(conf);
      }
    });

    if (displays.length > this.config.data.length) {
      displays.slice(this.config.data.length).forEach(d => d.remove());
    }

    this._updateCssClasses();
    this.resize(this.config.height);

    return this;
  }

  reload() {
    log.debug('reload row', this.id);

    this.forEachDisplayOrdered(display => display.reload());
  }

  /**
   * Returns the width for one in the row
   *
   * @param {Number} count Expect count displays in this row to calculate the width for
   *
   * @return The width for one display in this row in pixels
   */
  _getDisplayWidth(count) {
    if (!is_defined(count)) {
      count = this.getNumDisplays() + this.display_count_offset;
    }
    if (count <= 0) {
      count = 1;
    }

    /* 4 == 2 Pixels for left and right border + some safety space */
    return Math.floor((this.width - 4) / count);
  }

  /**
   * Update css classes of this row
   *
   * @param {Number} count Expect count displays in this row to calculate the width for
   *
   * @return This row
   */
  _updateCssClasses(count) {
    for (let i = 0; i <= this.max_per_row; i++) {
      this.elem.removeClass('num-displays-' + i);
    }

    this.elem.addClass('num-displays-' + (this.getNumDisplays() +
      this.display_count_offset));

    if (this.getNumDisplays() >= this.max_per_row) {
      this.elem.addClass('full');
    }
    else {
      this.elem.removeClass('full');
    }

    return this;
  }

  /**
   * Return an ID for a new display
   *
   * @return New ID as a string
   */
  _getNextDisplayId() {
    return this.id + '-box-' + ++this.last_display_index;
  }
}

export default DashboardRow;

// vim: set ts=2 sw=2 tw=80:
