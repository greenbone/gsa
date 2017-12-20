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
import 'core-js/fn/object/keys';
import 'core-js/fn/object/values';

import $ from 'jquery';
import d3 from 'd3';

import _ from 'gmp/locale.js';
import Logger from 'gmp/log.js';
import {is_array, is_defined, is_object, is_string} from 'gmp/utils.js';
import {parse_int} from 'gmp/parser.js';

import {
  create_hostname,
  EMPTY_FILTER,
} from './helper.js';
import RowTarget from './rowtarget.js';
import DashboardRow from './row.js';

const log = Logger.getLogger('web.dashboard.legacy.dashboard');

const MAX_DISPLAYS = 8;

/**
 * Splits string by #
 *
 * @param {String} row_string The string containing all rows
 *
 * @returns {Array} An array of rows
 */
const split_rows = row_string =>
  is_string(row_string) ? row_string.split('#') : [];

const split_elements = elements_string =>
is_string(elements_string) ? elements_string.split('|') : [];

const create_display_config_from_strings = (
  controllers_string,
  filters_string,
) => ({
  type: 'chart',
  name: controllers_string,
  filt_id: filters_string,
});

function create_row_config_from_strings(controllers_string,
    filters_string, height) {
  const controllers = split_elements(controllers_string);
  const filters = split_elements(filters_string);
  const configs = [];

  controllers.forEach(function(name, i) {
    const filter = i < filters.length ? filters[i] : '';
    configs.push(create_display_config_from_strings(name, filter));
  });
  return {
    type: 'row',
    height: height,
    data: configs,
  };
}

class Dashboard {

  constructor(id, config, dashboard_opts) {
    this.id = id;
    this.rows = {};
    this.width = -1;
    this.height = -1;
    this.total_displays = 0;
    this.last_row_index = 0;
    // Maximum number of displays
    this.max_displays = MAX_DISPLAYS;
    this.dashboard_opts = dashboard_opts;
    this.edit_mode = false;
    this.config_pref_id = '';
    this.default_controller_string = 'by-cvss';
    this.default_filter_string = '';
    this.controller_factories = {};
    this.filters = [EMPTY_FILTER];
    this.reordering = false; // indicator if the dashboard rows are currently reordered

    this.setConfig(config);

    this._configUnchanged();
  }

  /**
   * Initializes a Dashboard.
   */
  init() {
    this.elem = $('#' + this.id);

    if (this.dashboard_opts) {
      if (this.dashboard_opts.config_pref_id) {
        this.config_pref_id = this.dashboard_opts.config_pref_id;
      }
      if (this.dashboard_opts.default_controller_string) {
        this.default_controller_string =
          this.dashboard_opts.default_controller_string;
      }
      if (this.dashboard_opts.default_filter_string) {
        this.default_filter_string = this.dashboard_opts.default_filter_string;
      }
      if (this.dashboard_opts.max_displays) {
        this.max_displays = this.dashboard_opts.max_displays;
      }
      if (this.dashboard_opts.dashboard_controls) {
        this.dashboard_controls = this.dashboard_opts.dashboard_controls;
      }
      if (this.dashboard_opts.default_controllers_string) {
        this.default_controllers_string =
          this.dashboard_opts.default_controllers_string;
      }
      if (this.dashboard_opts.default_filters_string) {
        this.default_filters_string =
          this.dashboard_opts.default_filters_string;
      }
      if (this.dashboard_opts.default_heights_string) {
        this.default_heights_string =
          this.dashboard_opts.default_heights_string + '';
      }
    }

    // Initialize DOM elements
    if (this.dashboard_controls) {
      const container = $('<div/>', {
        class: 'dashboard-actions',
      }).appendTo($(this.dashboard_controls));

      this.start_edit_button = $('<a/>', {
        class: 'icon icon-sm',
        on: {
          click: () => this.startEdit(),
        },
      })
        .append($('<img/>', {
          src: '/img/edit.svg',
          alt: _('Edit Dashboard'),
          title: _('Edit Dashboard'),
        }))
        .appendTo(container);

      this.new_display_button = $('<a/>', {
        class: 'icon icon-sm',
        on: {
          click: () => this.newDisplay(),
        },
      })
        .append($('<img/>', {
          src: '/img/new.svg',
          alt: _('Add new Chart'),
          title: _('Add new Chart'),
        }))
        .appendTo(container);

      this.new_display_button.hide();

      this.reset_defaults_button = $('<a/>', {
        class: 'icon icon-sm',
        on: {
          click: () => this.resetEdit(),
        },
      })
        .append($('<img/>', {
          src: '/img/first.svg',
          alt: _('Reset to defaults'),
          title: _('Reset to defaults'),
        }))
        .appendTo(container);

      this.reset_defaults_button.hide();

      this.cancel_edit_button = $('<a/>', {
        class: 'icon icon-sm',
        on: {
          click: () => this.cancelEdit(),
        },
      })
        .append($('<img/>', {
          src: '/img/delete.svg',
          alt: _('Cancel Editing'),
          title: _('Cancel Editing'),
        }))
        .appendTo(container);
      this.cancel_edit_button.hide();
      this.stop_edit_button = $('<a/>', {
        class: 'icon icon-sm',
        on: {
          click: () => this.saveEdit(),
        },
      })
        .append($('<img/>', {
          src: '/img/indicator_operation_ok.svg',
          alt: _('Save Changes'),
          title: _('Save Changes'),
        }))
        .appendTo(container);

      this.stop_edit_button.hide();
    }

    this.width = this.elem[0].clientWidth;

    $(window).on('load', () => {
      // Window resize
      $(window).on('resize', () => this._onWindowResized());
    });

    const received = (event, display, position) =>
      this.addToNewRow(display, position);

    // add drop targets for new rows
    this.top_target = new RowTarget(this.id, 'top', this.edit_mode);
    this.top_target.on('received', received);
    this.elem.prepend(this.top_target.elem);

    this.bottom_target = new RowTarget(this.id, 'bottom', this.edit_mode);
    this.bottom_target.on('received', received);
    this.elem.append(this.bottom_target.elem);

    this.token = window.gmp.token; // FIXME token should be configurable
  }

  /**
   * Starts the edit mode of the dashboard.
   *
   * @return This dashboard
   */
  startEdit() {
    if (this.edit_mode) {
      return this;
    }

    this.edit_mode = true;
    this.top_target.show();
    this.bottom_target.show();
    this.elem.addClass('edit');

    for (const row of Object.values(this.rows)) {
      row.startEdit();
    }

    if (this.dashboard_controls) {
      this.start_edit_button.hide();
      this.stop_edit_button.show();
      this.cancel_edit_button.show();
      this.reset_defaults_button.show();

      if (this.canAddDisplay()) {
        this.new_display_button.show();
      }
    }

    $(window).on('keydown', event => {
      if (event.which === 27) {
        this.cancelEdit();
        event.preventDefault();
      }
    });

    return this;
  }

  /**
   * Stops the edit mode of the dashboard.
   *
   * @return This dashboard
   */
  stopEdit() {
    if (!this.edit_mode) {
      return this;
    }

    this.top_target.hide();
    this.bottom_target.hide();
    this.edit_mode = false;
    this.elem.removeClass('edit');

    for (const row of Object.values(this.rows)) {
      row.stopEdit();
    }

    if (this.dashboard_controls) {
      this.start_edit_button.show();
      this.stop_edit_button.hide();
      this.cancel_edit_button.hide();
      this.new_display_button.hide();
      this.reset_defaults_button.hide();
    }

    $(window).off('keydown'); // remove event listener
    return this;
  }

  /**
   * Stops the edit mode of the dashboard and saves the changes
   *
   * @return This dashboard
   */
  saveEdit() {
    if (!this.edit_mode) {
      return;
    }

    this.stopEdit();
    this.save();
    return this;
  }

  /**
   * Stops the edit mode of the dashboard and discards the changes
   *
   * @return This dashboard
   */
  cancelEdit() {
    if (!this.edit_mode) {
      return;
    }

    this.stopEdit();

    if (this.hasChanged()) {
      // reset displays
      this.updateDisplaysFromConfig();
      this._configUnchanged();
    }
    return this;
  }

  /**
   * Stops the edit mode of the dashboard and resets to the default values
   *
   * @return This dashboard
   */
  resetEdit() {
    if (!this.edit_mode) {
      return;
    }

    this.updateDisplaysFromDefaultStrings();
    this._configChanged();
    return this;
  }

  /**
   * Tests if a display can be added to the dashboard.
   *
   * @return true if there is room for a new display, false otherwise.
   */
  canAddDisplay() {
    return this.total_displays < this.max_displays;
  }

  /**
   * Gets the last row of the dashboard that is not full.
   *
   * @return The row if there is one, null otherwise.
   */
  getLastNotFullRow() {
    const lastFreeRowElem = this.elem.find('.dashboard-row:not(".full")')
      .last();

    if (lastFreeRowElem.length === 0) {
      return null;
    }

    return this.rows[lastFreeRowElem.attr('id')];
  }

  /**
   * Adds a new display to the dashboard if the maximum number is
   * not reached yet.
   *
   *  @return This dashboard
   */
  newDisplay() {
    if (!this.canAddDisplay()) {
      log.error('Maximum number of displays reached');
      return this;
    }

    let row = this.getLastNotFullRow();
    if (!row) {
      row = this.addNewRow({position: 'bottom'});
    }

    const config = create_display_config_from_strings(
      this.default_controller_string, this.default_filter_string);

    row.createNewDisplay(config);
    row.resize();

    if (!this.canAddDisplay()) {
      this.new_display_button.hide();
    }
    return this;
  }

  /**
   * Creates a new dashboard row and adds a display to it.
   *
   * @param {DashboardDisplay} display  The display to add.
   * @param {Number}           position The position of the new row.
   *
   * @return This Dashboard
   */
  addToNewRow(display, position) {
    const new_row = this.addNewRow({position: position});
    new_row.addDisplay(display);
    new_row.resize();
    return this;
  }

  /**
   * Creates a new dashboard row and adds it to the dashboard.
   *
   * @param {Object} options An object containing options for the new row.
   *
   * @return The created new row
   */
  addNewRow({config, position} = {}) {
    if (!is_defined(config)) {
      config = {
        type: 'row',
        data: [],
      };
    }

    const row = new DashboardRow(this.getNextRowId(), config,
      this.controller_factories, this.filters, this.width, this.edit_mode,
      this.dashboard_opts);

    this.total_displays += row.getNumDisplays();

    this.registerRow(row);

    if (is_defined(position) && position === 'top') {
      this.elem.prepend(row.elem);
      this.elem.prepend(this.top_target.elem);
    }
    else {
      this.elem.append(row.elem);
      this.elem.append(this.bottom_target.elem);
    }
    if (this.edit_mode) {
      row.startEdit();
    }

    return row;
  }

  /**
   * Gets a display in the dashboard using the id.
   *
   * @param {String} display_id  The id of the display to get.
   *
   * @return The requested display or undefined if not found
   */
  getDisplay(display_id) {
    for (const row of Object.values(this.rows)) {
      const display = row.getDisplay(display_id);
      if (is_defined(display)) {
        return display;
      }
    }
    return undefined;
  }

  /**
   * Gets a row of the dashboard by its id.
   *
   * @param {String} row_id  The id of the row to get.
   *
   * @return  The requested row.
   */
  getRow(row_id) {
    return this.rows[row_id];
  }

  /**
   * Returns the number of rows in this dashboard
   *
   * @return The number of rows
   */
  getNumRows() {
    return Object.keys(this.rows).length;
  }

  /**
   * Registers a row in the dashboard and adds event listeners to the row.
   *
   * @param {DisplayRow} row  The row to register.
   *
   * @return This Dashboard
   */
  registerRow(row) {
    this.rows[row.id] = row;

    row.on('display_removed', (event, display) => {
      log.debug('on display removed', this.reordering);

      this.total_displays -= 1;
      this._removeEmptyRows(); // triggers row removed if empty
      this._configChanged();

      if (this.dashboard_controls && this.edit_mode && this.canAddDisplay()) {
        this.new_display_button.show();
      }
    });

    row.on('display_added', (event, display) => {
      log.debug('on display added');

      this.total_displays += 1;
      this._configChanged();
    });

    row.on('display_filter_changed', (event, display) => {
      log.debug('on display filter changed');
      this._configChanged();
    });
    row.on('display_controller_changed', (event, display) => {
      log.debug('on display controller changed');
      this._configChanged();
    });

    row.on('resized', () => {
      log.debug('on resized');
      this._configChanged();
    });

    row.on('reorder', () => {
      log.debug('on reorder');
    });

    row.on('reorderd', () => {
      log.debug('on reordered');
      this._removeEmptyRows();
      this.reordering = false;
      this._configChanged();
    });

    row.on('removed', (event, r) => {
      log.debug('on removed');
      this.unregisterRow(r);
    });
    return this;
  }

  /**
   * Unregisters a row in the dashboard.
   *
   * @param {DisplayRow} row  The row to unregister.
   *
   * @return This dashboard
   */
  unregisterRow(row) {
    delete this.rows[row.id];
    this._configChanged();
    return this;
  }

  /**
   * Generates a new id for a row.
   *
   * @return  The generated id.
   */
  getNextRowId() {
    this.last_row_index++;
    return this.id + '-row-' + this.last_row_index;
  }

  /**
   * Returns the newly created config from all rows
   *
   * @return An array of row configs
   */
  getConfig() {
    const config = [];
    this.forEachRowOrdered(row => config.push(row.getConfig()));

    return {
      version: 1,
      data: config,
    };
  }

  /**
   * Set the current config
   *
   * @param {Object} config  New config to set
   *
   * @return This dashboard
   */
  setConfig(config) {
    this.config = config;
    return this;
  }

  saveConfig() {
    this.config = this.getConfig();

    const json_config = JSON.stringify(this.config);

    if (this.config_pref_request) {
      this.config_pref_request.abort();
    }

    this.config_pref_request = d3.xhr(create_hostname() + '/omp');
    this.config_pref_request.on('beforesend', request => {
      request.withCredentials = true;
    });

    const form_data = new FormData();
    form_data.append('chart_preference_id', this.config_pref_id);
    form_data.append('chart_preference_value', json_config);
    form_data.append('token', this.token);
    form_data.append('cmd', 'save_chart_preference');

    log.debug('saving dashboard config', json_config);

    this.config_pref_request.post(form_data);

    if (this.onConfigSaved) {
      this.onConfigSaved(this.config);
    }

    this._configUnchanged();
    return this;
  }

  /**
   * Updates the filter, controllers and heights string and saves it to the
   * user's settings if they have changed or force is set to true
   *
   * @param {Boolean} force Set to true to force saving
   *
   * @return  This dashboard
   */
  save(force) {
    if (force || this.hasConfigChanged()) {
      this.saveConfig();
    }
    return this;
  }

  /**
   * Adds a filter to a dashboard.
   *
   * @param {String} filter_id     UUID of the filter.
   * @param {String} filter_name   Name of the filter.
   * @param {String} filter_term   Term of the filter.
   * @param {String} filter_type   Type of the filter (e.g. Task, SecInfo, ...).
   *
   * @return  This dashboard
   */
  addFilter(filter_id, filter_name, filter_term, filter_type) {
    this.filters.push({
      id: filter_id,
      name: filter_name,
      term: filter_term,
      type: filter_type,
    });
    return this;
  }

  /**
   * Adds a controller factory to a dashboard.
   *
   * @param {String}   factory_name Name of the factory
   * @param {Function} factory_func Factory function
   *
   * @return  This dashboard
   */
  addControllerFactory(factory_name, factory_func) {
    this.controller_factories[factory_name] = factory_func;
    return this;
  }

  /**
   * Iterate over all rows in the order of their occurrence
   *
   * @param {Function} callback A callback function as following function(row)
   */
  forEachRowOrdered(callback) {
    if (!is_defined(this.elem)) {
      return;
    }

    const self = this;

    this.elem.find('.dashboard-row').each(function() {
      const id = $(this).attr('id');
      const row = self.getRow(id);

      if (!is_defined(row)) {
        log.error('Row ' + id + ' not found when iteratring of each ' +
          'displayed rows');
        return;
      }
      callback(row);
    });
  }

  initDisplays() {
    log.debug('Init displays', this.config);

    if (is_object(this.config) && is_array(this.config.data)) {
      return this.initDisplaysFromConfig();
    }
    return this.initDisplaysFromStrings();
  }

  initDisplaysFromConfig() {
    log.debug('Init displays from config', this.config);

    this.config.data.forEach(config => this.addNewRow({config}));
    return this;
  }

  /**
   * Initializes the Displays with the values in the default displays string.
   *
   * @return  This dashboard
   */
  initDisplaysFromStrings() {
    log.debug('Init displays from string', this.default_controllers_string,
      this.default_filters_string, this.default_heights_string);

    const row_controllers_string_list = split_rows(
      this.default_controllers_string);

    const row_filters_string_list = split_rows(this.default_filters_string);
    const row_heights_list = split_rows(this.default_heights_string);

    for (const index in row_controllers_string_list) {
      const height = parse_int(row_heights_list[index]);
      const config = create_row_config_from_strings(
        row_controllers_string_list[index], row_filters_string_list[index],
        height
      );

      this.addNewRow({config});
    }

    this.config = this.getConfig(); // create js config to have a always valid config
    this._onWindowResized();
    return this;
  }

  /**
   * Rebuilds the displays (and rows) from config
   *
   * @return This dashboard
   */
  updateDisplaysFromConfig() {
    log.debug('Update displays from config', this.config);

    const rows = [];

    this.forEachRowOrdered(row => rows.push(row));

    this.config.data.forEach((config, index) => {
      if (index <= rows.length - 1) {
        rows[index].update(config);
      }
      else {
        this.addNewRow({config: config});
      }
    });

    if (rows.length > this.config.data.length) {
      rows.slice(this.config.data.length).forEach(row =>
        row.remove()
      );
    }
    return this;
  }

  /**
   * Rebuilds the displays (and rows) from default controllers, filters and
   * heights strings
   *
   * @return This dashboard
   */
  updateDisplaysFromDefaultStrings() {
    this._updateDisplaysFromStrings(this.default_controllers_string,
      this.default_filters_string, this.default_heights_string);
    return this;
  }

  /**
   * Returns true if any config of the rows has changed
   *
   * @return true if a config of a row has changed
   */
  hasConfigChanged() {
    return this.config_changed;
  }

  /**
   * Returns true if a filter, controller or height has changed
   *
   * @return true if a filter, controller of height of a row has changed
   */
  hasChanged() {
    return this.hasConfigChanged();
  }

  /**
   * Resizes the dashboard and its rows
   *
   * @param {Number}  height             the new height if defined (optional)
   * @param {Number}  width              the new width if defined (optional)
   * @param {Boolean} adjust_row_heights update the height of the rows to fit in the
   *                                     dashboard
   *
   * @return This dashboard
   */
  resize(height, width, adjust_row_heights) {
    log.debug('resize dashboard', height, width);

    if (is_defined(width)) {
      this.width = width;
    }

    if (is_defined(height)) {
      this.height = height;
    }

    const row_height = adjust_row_heights ?
      this.height / this.getNumRows() : undefined;

    for (const row of Object.values(this.rows)) {
      row.resize(row_height, this.width);
    }
    return this;
  }

  reload() {
    log.debug('reload dashboard');

    this.forEachRowOrdered(row => row.reload());
  }

  /**
   * Checks whether a row has displays and removes it if not
   *
   * @return This dashboard
   */
  _removeEmptyRows() {
    for (const row of Object.values(this.rows)) {
      if (row.getNumDisplays() === 0) {
        row.remove();
      }
    }
    return this;
  }

  /**
   * Event listener to act an resized window
   */
  _onWindowResized() {
    const [dom_elem] = this.elem;

    if (this.width === dom_elem.clientWidth) {
      return;
    }

    this.resize(dom_elem.clientHeight, dom_elem.clientWidth);
  }

  /**
   * Marks filters, controllers and heights as changed
   *
   * @return This Dashboard
   */
  _configChanged() {
    this.config_changed = true;
    return this;
  }

  /**
   * Marks filters, controllers and heights as unchanged
   *
   * @return This Dashboard
   */
  _configUnchanged() {
    this.config_changed = false;
    return this;
  }

  /**
   * (Re-)build the rows and displays from provided controllers, filters and
   * heights strings. Within these strings rows are separated by '#' and
   * displays by '|'
   *
   * @param {String} controllers_string Contains the chart names to be used for the
   *                                    displays
   * @param {String} filters_string     Filters to use for the displays
   * @param {String} heights_string     Heights for the rows
   *
   * @return This Dashboard
   */
  _updateDisplaysFromStrings(controllers_string, filters_string,
      heights_string) {
    const controllers_string_list = split_rows(controllers_string);
    const filters_string_list = split_rows(filters_string);
    const heights_list = split_rows(heights_string);

    log.debug('Update displays from strings', controllers_string,
      filters_string, heights_string);

    const rows = [];
    this.forEachRowOrdered(row => rows.push(row));

    controllers_string_list.forEach((controller_string, index) => {
      const height = parse_int(heights_list[index]);
      const config = create_row_config_from_strings(controller_string,
        filters_string_list[index], height);

      if (index <= rows.length - 1) {
        rows[index].update(config);
      }
      else {
        this.addNewRow({config: config});
      }
    });

    if (rows.length > controllers_string_list.length) {
      rows.slice(controllers_string_list.length).forEach(
        row => row.remove()
      );
    }
    return this;
  }
}

export default Dashboard;

// vim: set ts=2 sw=2 tw=80:
