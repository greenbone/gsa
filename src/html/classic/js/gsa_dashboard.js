/*
 * Greenbone Security Assistant
 * $Id$
 * Description: JavaScript classes for dashboards in GSA.
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

(function(global, window, document, gsa, d3, $, console, promise) {
  'use strict';

  if (!gsa.is_defined(gsa.charts)) {
    gsa.charts = {};
  }
  var gch = gsa.charts;

  gch.Dashboard = Dashboard;
  gch.DataSource = DataSource;
  gch.Promise = promise;

  var MAX_PER_ROW = 4;
  var MAX_DISPLAYS = 8;

  var log = gsa.log;

  var EMPTY_FILTER = {id: '', name: '--', term: '', type: null};

  function EventNode(event_node) {
    this.event_node = event_node ? event_node : $('<span/>');
  }

  /**
   * Register an event callback for a specific event triggered by this node
   *
   * @param event_name The name of the triggered event
   * @param callabck   Function to be called when the event is triggered
   *
   * @return This node
   */
  EventNode.prototype.on = function(event_name, callback) {
    this.event_node.on(event_name, callback);
    return this;
  };

  /**
   * Trigger event
   *
   * @param event_name The name of the triggered event
   *
   * @return This node
   */
  EventNode.prototype._trigger = function(event_name, data) {
    this.event_node.trigger(event_name, data);
    return this;
  };

  /* Drop target class for new dashboard displays */

  /**
   * Constructor for Dashboard "New Row" drop target.
   *
   * @constructor
   *
   * @param id         The id of the dashboard.
   * @param position   Where to add the row to the dashboard.
   * @param edit_mode  Whether to create the target in edit mode.
   */
  function RowTarget(id, position, edit_mode) {
    var self = this;

    this.id = id + '-' + position + '-add';
    this.edit_mode = edit_mode;
    this.elem = $('<div/>', {
      'class': 'dashboard-add-row',
      id: this.id,
      css: {
        'display': this.edit_mode ? 'block' : 'none',
      },
    });

    EventNode.call(this, this.elem);

    this.elem.sortable({
      handle: '.chart-head',
      forcePlaceholderSize: true,
      opacity: 0.75,
      tolerance: 'pointer',
      receive: function(event, ui) {
        var display = ui.item.data('display');
        self._trigger('received', [display, position]);
      },
    });
  }

  gsa.derive(RowTarget, EventNode);

  /**
   * Shows the drop target
   */
  RowTarget.prototype.show = function() {
    this.elem.show('blind', {}, 150);
  };

  /**
   * Hides the drop target
   */
  RowTarget.prototype.hide = function() {
    this.elem.hide('blind', {}, 150);
  };

  /* Dashboard class */

  /**
   * Constructor for a Dashboard
   *
   * @constructor
   *
   * @param id             The id of the dashboard and its container element
   * @param config         Names of the controllers for the displays
   * @param dashboard_opts Optional parameters for the dashboard and its
   *                       components.
   */
  function Dashboard(id, config, dashboard_opts) {
    this.id = id;
    this.elem = $('#' + id);
    this.rows = {};
    this.width = -1;
    this.height = -1;
    this.total_displays = 0;
    this.last_row_index = 0;
    // Maximum number of displays
    this.max_displays = MAX_DISPLAYS;
    this.dashboard_opts = dashboard_opts;
    // Maximum number of displays per row
    this.max_per_row = MAX_PER_ROW;

    this.edit_mode = false;

    this.config = config;
    this.config_pref_id = '';
    this.prev_config = config ? JSON.stringify(config) : '';

    this.default_controller_string = 'by-cvss';

    this.default_filter_string = '';

    this.controller_factories = {};
    this.filters = [EMPTY_FILTER];

    this.reordering = false; // indicator if the dashboard rows are currently reorderd

    this._configUnchanged();

    this.init();
  }

  /**
   * Initializes a Dashboard.
   */
  Dashboard.prototype.init = function() {
    var self = this;

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
      if (this.dashboard_opts.max_per_row) {
        this.max_per_row = this.dashboard_opts.max_per_row;
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
      var container = $('<div/>', {
        class: 'dashboard-actions',
      }).appendTo($(this.dashboard_controls));

      this.start_edit_button = $('<a/>', {
        href: 'javascript:void(0);',
        class: 'icon icon-sm',
        on: {
          click: function() {self.startEdit();},
        },
      })
      .append($('<img/>', {
        src: 'img/edit.svg',
        alt: gsa._('Edit Dashboard'),
        title: gsa._('Edit Dashboard'),
      }))
      .appendTo(container);

      this.new_display_button = $('<a/>', {
        href: 'javascript:void(0);',
        class: 'icon icon-sm',
        on: {
          click: function() {self.newDisplay();},
        }
      })
      .append($('<img/>', {
        src: 'img/new.svg',
        alt: gsa._('Add new Chart'),
        title: gsa._('Add new Chart'),
      }))
      .appendTo(container);

      this.new_display_button.hide();

      this.reset_defaults_button = $('<a/>', {
        href: 'javascript:void(0);',
        class: 'icon icon-sm',
        on: {
          click: function() {self.resetEdit();},
        },
      })
      .append($('<img/>', {
        src: 'img/first.svg',
        alt: gsa._('Reset to defaults'),
        title: gsa._('Reset to defaults'),
      }))
      .appendTo(container);

      this.reset_defaults_button.hide();

      this.cancel_edit_button = $('<a/>', {
        href: 'javascript:void(0);',
        class: 'icon icon-sm',
        on: {
          click: function() {self.cancelEdit();},
        },
      })
      .append($('<img/>', {
        src: 'img/delete.svg',
        alt: gsa._('Cancel Editing'),
        title: gsa._('Cancel Editing'),
      }))
      .appendTo(container);

      this.cancel_edit_button.hide();

      this.stop_edit_button = $('<a/>', {
        href: 'javascript:void(0);',
        class: 'icon icon-sm',
        on: {
          click: function() {self.saveEdit();},
        }
      })
      .append($('<img/>', {
        src: 'img/indicator_operation_ok.svg',
        alt: gsa._('Save Changes'),
        title: gsa._('Save Changes'),
      }))
      .appendTo(container);

      this.stop_edit_button.hide();
    }

    this.width = this.elem[0].clientWidth;

    $(window).on('load', function() {
      // Window resize
      $(window).on('resize', function() {
        self._onWindowResized();
      });
    });

    function received(event, display, position) {
      self.addToNewRow(display, position);
    }

    // add drop targets for new rows
    this.top_target = new RowTarget(this.id, 'top', this.edit_mode);
    this.top_target.on('received', received);
    this.elem.prepend(this.top_target.elem);
    this.bottom_target = new RowTarget(this.id, 'bottom', this.edit_mode);
    this.bottom_target.on('received', received);
    this.elem.append(this.bottom_target.elem);
  };

  /**
   * Starts the edit mode of the dashboard.
   *
   * @return This dashboard
   */
  Dashboard.prototype.startEdit = function() {
    var self = this;

    if (this.edit_mode) {
      return;
    }
    this.edit_mode = true;

    this.top_target.show();
    this.bottom_target.show();

    this.elem.addClass('edit');

    for (var item in this.rows) {
      this.rows[item].startEdit();
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

    $(window).on('keydown', function(event) {
      if (event.which === 27) { // escape has been pressed
        self.cancelEdit();
        event.preventDefault();
      }
    });
    gsa.stop_auto_refresh();

    return this;
  };

  /**
   * Stops the edit mode of the dashboard.
   *
   * @return This dashboard
   */
  Dashboard.prototype.stopEdit = function() {
    if (!this.edit_mode) {
      return;
    }

    this.top_target.hide();
    this.bottom_target.hide();

    this.edit_mode = false;
    this.elem.removeClass('edit');

    for (var item in this.rows) {
      this.rows[item].stopEdit();
    }

    if (this.dashboard_controls) {
      this.start_edit_button.show();
      this.stop_edit_button.hide();
      this.cancel_edit_button.hide();
      this.new_display_button.hide();
      this.reset_defaults_button.hide();
    }

    $(window).off('keydown'); // remove event listener
    gsa.start_auto_refresh();

    return this;
  };

  /**
   * Stops the edit mode of the dashboard and saves the changes
   *
   * @return This dashboard
   */
  Dashboard.prototype.saveEdit = function() {
    if (!this.edit_mode) {
      return;
    }

    this.stopEdit();
    this.save();
  };

  /**
   * Stops the edit mode of the dashboard and discards the changes
   *
   * @return This dashboard
   */
  Dashboard.prototype.cancelEdit = function() {
    if (!this.edit_mode) {
      return;
    }

    this.stopEdit();

    if (this.hasChanged()) {
      // reset displays
      this.updateDisplaysFromConfig();
      this._configUnchanged();
    }
  };

  /**
   * Stops the edit mode of the dashboard and resets to the default values
   *
   * @return This dashboard
   */
  Dashboard.prototype.resetEdit = function() {
    if (!this.edit_mode) {
      return;
    }

    this.updateDisplaysFromDefaultStrings();
    this._configChanged();
  };

  /**
   * Tests if a display can be added to the dashboard.
   *
   * @return true if there is room for a new display, false otherwise.
   */
  Dashboard.prototype.canAddDisplay = function() {
    return this.total_displays < this.max_displays;
  };

  /**
   * Gets the last row of the dashboard that is not full.
   *
   * @return The row if there is one, null otherwise.
   */
  Dashboard.prototype.getLastNotFullRow = function() {
    var lastFreeRowElem = this.elem.find('.dashboard-row:not(".full")').last();
    if (lastFreeRowElem.length === 0) {
      return null;
    }
    return this.rows[lastFreeRowElem.attr('id')];
  };

  /**
   * Adds a new display to the dashboard if the maximum number is
   * not reached yet.
   *
   *  @return This dashboard
   */
  Dashboard.prototype.newDisplay = function() {
    if (!this.canAddDisplay()) {
      log.error('Maximum number of displays reached');
      return;
    }

    var row = this.getLastNotFullRow();
    if (!row) {
      row = this.addNewRow({position: 'bottom'});
    }

    var config = create_display_config_from_strings(
        this.default_controller_string, this.default_filter_string);
    row.createNewDisplay(config);
    row.resize();

    if (!this.canAddDisplay()) {
      this.new_display_button.hide();
    }

    return this;
  };

  /**
   * Createsa a new dashboard row and adds a display to it.
   *
   * @param displayd    The display to add.
   * @param position    The position of the new row.
   *
   * @return This Dashboard
   */
  Dashboard.prototype.addToNewRow = function(display, position) {
    var new_row = this.addNewRow({position: position});
    new_row.addDisplay(display);
    new_row.resize();

    return this;
  };

  /**
   * Creates a new dashboard row and adds it to the dashboard.
   *
   * @param options An object containing options for the new row.
   *
   * @return The created new row
   */
  Dashboard.prototype.addNewRow = function(options) {
    if (!gsa.is_defined(options)) {
      options = {};
    }
    if (!gsa.is_defined(options.config)) {
      options.config = {
        type: 'row',
        data: [],
      };
    }

    var row = new DashboardRow(this.getNextRowId(), options.config,
        this.controller_factories, this.filters,
        this.width, this.edit_mode, this.dashboard_opts);

    this.total_displays += row.getNumDisplays();

    this.registerRow(row);

    if (gsa.is_defined(options.position) && options.position === 'top') {
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
  };

  /**
   * Gets a display in the dashboard using the id.
   *
   * @param display_id  The id of the display to get.
   *
   * @return The requested display or undefined if not found
   */
  Dashboard.prototype.getDisplay = function(display_id) {
    for (var item in this.rows) {
      var display = this.rows[item].getDisplay(display_id);
      if (gsa.is_defined(display)) {
        return display;
      }
    }
    return undefined;
  };

  /**
   * Gets a row of the dashboard by its id.
   *
   * @param row_id  The id of the row to get.
   *
   * @return  The requested row.
   */
  Dashboard.prototype.getRow = function(row_id) {
    return this.rows[row_id];
  };

  /**
   * Returns the number of rows in this dashboard
   *
   * @return The number of rows
   */
  Dashboard.prototype.getNumRows = function() {
    var count = 0;

    for (var key in this.rows) {
      if (this.rows.hasOwnProperty(key)) {
        count += 1;
      }
    }

    return count;
  };

  /**
   * Registers a row in the dashboard and adds event listeners to the row.
   *
   * @param row  The row to register.
   *
   * @return This Dashboard
   */
  Dashboard.prototype.registerRow = function(row) {
    var self = this;

    this.rows[row.id] = row;

    row.on('display_removed', function(event, display) {
      log.debug('on display removed', self.reordering);
      self.total_displays -= 1;
      self._removeEmptyRows(); // triggers row removed if empty
      self._configChanged();

      if (self.dashboard_controls && self.edit_mode && self.canAddDisplay()) {
        self.new_display_button.show();
      }
    });
    row.on('display_added', function(event, display) {
      log.debug('on display added');
      self.total_displays += 1;
      self._configChanged();
    });
    row.on('display_filter_changed', function(event, display) {
      log.debug('on display filter changed');
      self._configChanged();
    });
    row.on('display_controller_changed', function(event, display) {
      log.debug('on display controller changed');
      self._configChanged();
    });
    row.on('resized', function(event, row) {
      log.debug('on resized');
      self._configChanged();
    });
    row.on('reorder', function(event, row) {
      log.debug('on reorder');
    });
    row.on('reorderd', function(event, row) {
      log.debug('on reordered');
      self._removeEmptyRows();
      self.reordering = false;
      self._configChanged();
    });
    row.on('removed', function(event, row) {
      log.debug('on removed');
      self.unregisterRow(row);
    });

    return this;
  };

  /**
   * Unregisters a row in the dashboard.
   *
   * @param row  The row to unregister.
   *
   * @return This dashboard
   */
  Dashboard.prototype.unregisterRow = function(row) {
    delete this.rows[row.id];
    this._configChanged();
    return this;
  };

  /**
   * Generates a new id for a row.
   *
   * @return  The generated id.
   */
  Dashboard.prototype.getNextRowId = function() {
    this.last_row_index++;
    return this.id + '-row-' + this.last_row_index;
  };

  /**
   * Returns the newly created config from all rows
   *
   * @return An array of row configs
   */
  Dashboard.prototype.getConfig = function() {
    var config = [];
    this.forEachRowOrdered(function(row) {
      config.push(row.getConfig());
    });
    return {
      version: 1,
      data: config,
    };
  };

  Dashboard.prototype.saveConfig = function() {
    this.config = this.getConfig();

    var json_config = JSON.stringify(this.config);

    if (json_config !== this.prev_config) {
      if (this.config_pref_request) {
        this.config_pref_request.abort();
      }

      this.config_pref_request = d3.xhr('/omp');

      var form_data = new FormData();
      form_data.append('chart_preference_id', this.config_pref_id);
      form_data.append('chart_preference_value', json_config);
      form_data.append('token', gsa.gsa_token);
      form_data.append('cmd', 'save_chart_preference');

      log.debug('saving dashboard config', json_config);

      this.config_pref_request.post(form_data);

      this.prev_config = json_config;
    }
    this._configUnchanged();
    return this;
  };

  /**
   * Updates the filter, controllers and heights string and saves ithem to the
   * user's settings if they have changed or force is set to true
   *
   * @param force Set to true to force saving
   *
   * @return  This dashboard
   */
  Dashboard.prototype.save = function(force) {
    if (force || this.hasConfigChanged()) {
      this.saveConfig();
    }
    return this;
  };

  /**
   * Adds a filter to a dashboard.
   *
   * @param filter_id     UUID of the filter.
   * @param filter_name   Name of the filter.
   * @param filter_term   Term of the filter.
   * @param filter_type   Type of the filter (e.g. Task, SecInfo, ...).
   *
   * @return  This dashboard
   */
  Dashboard.prototype.addFilter = function(filter_id, filter_name,
      filter_term, filter_type) {
    this.filters.push({
      id: filter_id,
      name: filter_name,
      term: filter_term,
      type: filter_type
    });
    return this;
  };

  /**
   * Adds a controller factory to a dashboard.
   *
   * @return  This dashboard
   */
  Dashboard.prototype.addControllerFactory = function(factory_name,
      factory_func) {
    this.controller_factories[factory_name] = factory_func;
    return this;
  };

  /**
   * Iterate over all rows in the order of their occurence
   *
   * @param callback A callback function as following function(row)
   */
  Dashboard.prototype.forEachRowOrdered = function(callback) {
    var self = this;
    this.elem.find('.dashboard-row').each(function() {
      var id = $(this).attr('id');
      var row = self.getRow(id);

      if (!gsa.is_defined(row)) {
        log.error('Row ' + id + ' not found when iteratring of each ' +
            'displayed rows');
        return;
      }

      callback(row);
    });
  };

  Dashboard.prototype.initDisplays = function() {
    if (gsa.is_object(this.config) && gsa.is_array(this.config.data)) {
      return this.initDisplaysFromConfig();
    }
    return this.initDisplaysFromStrings();
  };

  Dashboard.prototype.initDisplaysFromConfig = function() {
    var self = this;

    log.debug('Init displays from config', this.config);

    this.config.data.forEach(function(config, index) {
      self.addNewRow({config: config});
    });
    return this;
  };

  /**
   * Initializes the Displays with the values in the defailt displays string.
   *
   * @return  This dashboard
   */
  Dashboard.prototype.initDisplaysFromStrings = function() {

    log.debug('Init displays from string', this.default_controllers_string,
        this.default_filters_string, this.default_heights_string);

    var row_controllers_string_list = split_rows(
        this.default_controllers_string);
    var row_filters_string_list = split_rows(this.default_filters_string);
    var row_heights_list = split_rows(this.heights_string);

    for (var index in row_controllers_string_list) {
      var height = gsa.parse_int(row_heights_list[index]);
      var config = create_row_config_from_strings(
          row_controllers_string_list[index], row_filters_string_list[index],
          height);

      this.addNewRow({config: config});
    }
    this._onWindowResized();
    return this;
  };

  /**
   * Rebuilds the displays (and rows) from config
   *
   * @return This dashboard
   */
  Dashboard.prototype.updateDisplaysFromConfig = function() {
    var self = this;

    log.debug('Update displays from config', this.config);

    var rows = [];
    self.forEachRowOrdered(function(row) {
      rows.push(row);
    });

    this.config.data.forEach(function(config, index) {
      if (index <= rows.length - 1) {
        rows[index].update(config);
      }
      else {
        self.addNewRow({config: config});
      }
    });

    if (rows.length > this.config.data.length) {
      rows.slice(this.config.data.length).forEach(function(row) {
        row.remove();
      });
    }
    return this;
  };

  /**
   * Rebuilds the displays (and rows) from default controllers, filters and
   * heights strings
   *
   * @return This dashboard
   */
  Dashboard.prototype.updateDisplaysFromDefaultStrings = function() {
    this._updateDisplaysFromStrings(this.default_controllers_string,
        this.default_filters_string, this.default_heights_string);
    return this;
  };

  /**
   * Returns true if any config of the rows has changed
   *
   * @return true if a config of a row has changed
   */
  Dashboard.prototype.hasConfigChanged = function() {
    return this.config_changed;
  };

  /**
   * Returns true if a filter, controller or height has changed
   *
   * @return true if a filter, controller of height of a row has changed
   */
  Dashboard.prototype.hasChanged = function() {
    return this.hasConfigChanged();
  };

  /**
   * Resizes the dashboard and its rows
   *
   * @param height             the new height if defined (optional)
   * @param width              the new width if defined (optional)
   * @param adjust_row_heights update the height of the rows to fit in the
   *                           dashboard
   *
   * @return This dashboard
   */
  Dashboard.prototype.resize = function(height, width, adjust_row_heights) {
    log.debug('resize dashboard', height, width);

    var row_height;

    if (gsa.is_defined(width)) {
      this.width = width;
    }
    if (gsa.is_defined(height)) {
      this.height = height;
    }
    if (adjust_row_heights) {
      row_height = this.height / this.getNumRows();
    }

    for (var item in this.rows) {
      this.rows[item].resize(row_height, this.width);
    }
    return;
  };

  /**
   * Checks wether a row has displays and removes it if not
   *
   * @return This dashboard
   */
  Dashboard.prototype._removeEmptyRows = function() {
    for (var item in this.rows) {
      var row = this.rows[item];
      if (row.getNumDisplays() === 0) {
        row.remove();
      }
    }
    return this;
  };

  /**
   * Event listener to act an resized window
   */
  Dashboard.prototype._onWindowResized = function() {
    var dom_elem = this.elem[0];
    if (this.width === dom_elem.clientWidth) {
      return;
    }

    this.resize(dom_elem.clientHeight, dom_elem.clientWidth);
  };

  /**
   * Marks filters, controllers and heights as changed
   *
   * @return This Dashboard
   */
  Dashboard.prototype._configChanged = function() {
    this.config_changed = true;
    return this;
  };

  /**
   * Marks filters, controllers and heights as unchanged
   *
   * @return This Dashboard
   */
  Dashboard.prototype._configUnchanged = function() {
    this.config_changed = false;
    return this;
  };

  /**
   * (Re-)build the rows and displays from provided controllers, filters and
   * heights strings. Within these strings rows are seperated by '#' and
   * displays by '|'
   *
   * @param controllers_string Contains the chart names to be used for the
   *                           displays
   * @param filters_string     Filters to use for the displays
   * @param heights_string     Heights for the rows
   *
   * @return This Dashboard
   */
  Dashboard.prototype._updateDisplaysFromStrings = function(controllers_string,
      filters_string, heights_string) {
    var self = this;

    var config;

    var controllers_string_list = split_rows(controllers_string);
    var filters_string_list = split_rows(filters_string);
    var heights_list = split_rows(heights_string);

    log.debug('Update displays from strings', controllers_string,
        filters_string, heights_string);

    var rows = [];
    self.forEachRowOrdered(function(row) {
      rows.push(row);
    });

    controllers_string_list.forEach(function(controllers_string, index) {
      var height = gsa.parse_int(heights_list[index]);
      config = create_row_config_from_strings(controllers_string,
          filters_string_list[index], height);
      if (index <= rows.length - 1) {
        rows[index].update(config);
      }
      else {
        self.addNewRow({config: config});
      }
    });
    if (rows.length > controllers_string_list.length) {
      rows.slice(controllers_string_list.length).forEach(function(row) {
        row.remove();
      });
    }
    return this;
  };

  /* Dashboard row class */

  /**
   * Constructor for a new dashboard row.
   *
   * @constructor
   *
   * @param id                   The id of the row.
   * @param config               The row config
   * @param controller_factories Factories for ChartController
   * @param fiters               All filters as array
   * @param height               The initial height of the row
   * @param width                The initial width of the row
   * @param edit_mode            Whether to create the row in edit mode.
   * @param dashboard_opts       Dashboard options
   */
  function DashboardRow(id, config, controller_factories, filters, width,
      edit_mode, dashboard_opts) {
    this.id = id;

    this.setConfig(config);

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
    this.max_per_row = gsa.is_defined(dashboard_opts.max_per_row) ?
      dashboard_opts.max_per_row : MAX_PER_ROW;

    this.last_display_index = 0;

    this.init();
  }

  // derive DashboardRow from EventNode
  gsa.derive(DashboardRow, EventNode);

  /**
   * Initializes the dashboard row.
   */
  DashboardRow.prototype.init = function() {
    var self = this;

    this.elem = $('<div/>', {
      'class': 'dashboard-row',
      id: this.id,
    });

    EventNode.call(this);

    this.elem.css('height', this.height);

    this.config.data.forEach(function(config) {
      self.createNewDisplay(config, self.config.data.length);
    });

    this._updateCssClasses();
  };

  /**
   * Creates a new DashboardDisplay and adds it to this row
   *
   * @param config         Initial config for the new display
   * @param display_count  Expected number of displays in this row (optional)
   *
   * @return This row
   */
  DashboardRow.prototype.createNewDisplay = function(config, display_count) {

    var display = new DashboardDisplay(this._getNextDisplayId(), config,
        this.controller_factories, this.filters, this.edit_mode, this.height,
        this._getDisplayWidth(display_count), this.dashboard_opts);
    this.addDisplay(display);

    return this;
  };

  /**
   * Adds a display to the dashboard row. Triggers display_added event.
   *
   * @param display  The display to add.
   *
   * @return This row
   */
  DashboardRow.prototype.addDisplay = function(display) {
    this.elem.append(display.elem);
    this.registerDisplay(display);
    this._updateCssClasses();
    this._trigger('display_added', [display, this]);
    return this;
  };

  /**
   * Adds a display to the dashboard row. Triggers display_removed event.
   *
   * @param display  The display to remove.
   *
   * @return This row
   */
  DashboardRow.prototype.removeDisplay = function(display) {
    this.unregisterDisplay(display);
    this._updateCssClasses();
    this._trigger('display_removed', [display, this]);
    return this;
  };

  /**
   * Gets a display of the dashboard row by id.
   *
   * @param id  The id of the display to get.
   *
   * @return The requested display.
   */
  DashboardRow.prototype.getDisplay = function(id) {
    return this.displays[id];
  };

  /**
   * Counts the number of displays in the row.
   *
   * @return The number of displays.
   */
  DashboardRow.prototype.getNumDisplays = function() {
    return Object.keys(this.displays).length;
  };

  /**
   * Registers a display in the dashboard row and adds event listeners to the
   * display.
   *
   * @param display  The display to register.
   *
   * @return This row
   */
  DashboardRow.prototype.registerDisplay = function(display) {
    var self = this;

    this.displays[display.id] = display;

    display.on('removed', function(event, display) {
      self.removeDisplay(display);
      self.resize();
    });
    display.on('controller_changed', function(event, display) {
      self._trigger('display_controller_changed', [display, this]);
    });
    display.on('filter_changed', function(event, display) {
      self._trigger('display_filter_changed', [display, this]);
    });

    return this;
  };

  /**
   * Unregisters a display from the dashboard row.
   *
   * @param display  The display to register.
   *
   * @return This row
   */
  DashboardRow.prototype.unregisterDisplay = function(display) {
    delete this.displays[display.id];
    return this;
  };

  /**
   * Iterate over each display in order of occurence
   *
   * @param callback A callback function as following function(display)
   */
  DashboardRow.prototype.forEachDisplayOrdered = function(callback) {
    this.elem.find('.dashboard-display').each(function() {
      callback($(this).data('display'));
    });
  };

  /**
   * Returns an array of configs from the ones of the displays.
   *
   * @return The config objects of all displays
   */
  DashboardRow.prototype.getConfig = function() {
    var configs = [];
    this.forEachDisplayOrdered(function(display) {
      configs.push(display.getConfig());
    });
    return {
      type: 'row',
      height: this.getHeight(),
      data: configs,
    };
  };

  DashboardRow.prototype.setConfig = function(config) {
    if (!gsa.is_object(config)) {
      config = {};
    }
    if (!gsa.is_array(config.data)) {
      config.data = [];
    }
    if (!gsa.is_defined(config.height)) {
      config.height = 280;
    }
    else if (config.height < 150) {
      config.height = 150;
    }
    this.config = config;
    return this;
  };

  /**
   * Start edit mode for the row
   *
   * @return This row
   */
  DashboardRow.prototype.startEdit = function() {
    var self = this;

    for (var display_id in this.displays) {
      this.displays[display_id].startEdit();
    }
    this.edit_mode = true;

    this.elem.resizable({
      handles: 's',
      minHeight: 150,
      grid: [10, 10],
      resize: function(event, ui) {
        self.resize(ui.size.height);
        self._trigger('resize', self);
      },
      stop: function(event, ui) {
        self._trigger('resized', self);
      }
    });
    this.elem.sortable({
      handle: '.chart-head',
      connectWith: '.dashboard-row:not(".full"), .dashboard-add-row',
      placeholder: 'dashboard-placeholder',
      forcePlaceholderSize: true,
      opacity: 0.75,
      tolerance: 'pointer',
      start: function(event, ui) {
        log.debug('sorting start ' + self.id);
        self.sort_start = true;
        self.display_count_offset = 0;
        self._updateCssClasses();
        self._trigger('reorder', self);
      },
      stop: function(event, ui) {
        log.debug('sorting stop ' + self.id);
        self.sort_start = false;
        self.display_count_offset = 0;
        self._updateCssClasses();
        self._trigger('reorderd', self);
      },
      remove: function(event, ui) {
        log.debug('sorting removed ' + self.id);
        var display = ui.item.data('display');
        self.removeDisplay(display);
        self.resize();
      },
      over: function(event, ui) {
        log.debug('sorting over ' + self.id);
        if (!self.sort_start) {
          self.display_count_offset = 1;
        }
        self._updateCssClasses();
        self.resize();
      },
      out: function(event, ui) {
        log.debug('sorting out ' + self.id);
        if (!self.sort_start) {
          self.display_count_offset = 0;
        }
        self._updateCssClasses();
        self.resize();
      },
      receive: function(event, ui) {
        log.debug('sorting received ' + self.id);
        var display = ui.item.data('display');
        self.display_count_offset = 0;
        self.addDisplay(display);
        self.resize();
      },
    });
    return this;
  };

  /**
   * End editing mode of this row and its displays
   *
   * @return This row
   */
  DashboardRow.prototype.stopEdit = function() {
    for (var display_id in this.displays) {
      this.displays[display_id].stopEdit();
    }
    this.edit_mode = false;
    this.elem.resizable('destroy');
    this.elem.sortable('destroy');
    return this;
  };

  /**
   * Resize this row and its displays
   *
   * @param height New height to set (optional)
   * @param width  New width to set (optional)
   *
   * @return This Row
   */
  DashboardRow.prototype.resize = function(height, width) {
    log.debug('resize row ' + this.id, height, width);

    if (gsa.is_defined(width)) {
      this.width = width;
    }
    if (gsa.is_defined(height)) {
      this.height = height;
    }

    this.elem.css('width', width);
    this.elem.css('height', height);

    for (var item in this.displays) {
      this.displays[item].resize(this.height, this._getDisplayWidth());
    }
    return this;
  };

  /**
   * Remove this row. Triggers removed event afterwards.
   *
   * @return This row.
   */
  DashboardRow.prototype.remove = function() {
    var self = this;
    this.elem.hide('blind', {}, 250, function() {
      self.elem.remove();
      self._trigger('removed', this);
    });
    return this;
  };

  /**
   * Gets the height of the dashboard row.
   *
   * @return The current height of the row
   */
  DashboardRow.prototype.getHeight = function() {
    return this.elem[0].clientHeight;
  };

  /**
   * Rebuild displays from controllers and filter string
   *
   * @param config  Configs to use for this row and its displays.
   *
   * @return This row
   */
  DashboardRow.prototype.update = function(config) {
    var self = this;

    log.debug('Updating row ' + this.id, config);

    this.setConfig(config);

    var displays = [];
    self.forEachDisplayOrdered(function(display) {
      displays.push(display);
    });

    this.config.data.forEach(function(config, index) {
      if (index <= displays.length - 1) {
        displays[index].update(config);
      }
      else {
        self.createNewDisplay(config);
      }
    });

    if (displays.length > this.config.data.length) {
      displays.slice(this.config.data.length).forEach(function(d) {
        d.remove();
      });
    }

    this._updateCssClasses();

    this.resize(this.config.height);
    return this;
  };

  /**
   * Returns the width for one in the row
   *
   * @param count Expect count displays in this row to calculate the width for
   *
   * @return The width for one display in this row in pixels
   */
  DashboardRow.prototype._getDisplayWidth = function(count) {
    if (!gsa.is_defined(count)) {
      count = this.getNumDisplays() + this.display_count_offset;
    }
    if (count <= 0) {
      count = 1;
    }
    /* 4 == 2 Pixels for left and right border + some safety space */
    return Math.floor((this.width - 4) / count);
  };

  /**
   * Update css classes of this row
   *
   * @return This row
   */
  DashboardRow.prototype._updateCssClasses = function(count) {
    for (var i = 0; i <= this.max_per_row; i++) {
      this.elem.removeClass('num-displays-' +  i);
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
  };

  /**
   * Return an ID for a new display
   *
   * @return New ID as a string
   */
  DashboardRow.prototype._getNextDisplayId = function() {
    return this.id + '-box-' + (++this.last_display_index);
  };

  /* Chart display */

  /**
   * Constructor for a chart display box.
   *
   * @constructor
   *
   * @param id                   The id of the display.
   * @param config               Config to use.
   * @param controller_factories Factories for ChartController
   * @param fiters               All filters as array
   * @param height               The initial height of the display
   * @param width                The initial width of the display
   * @param edit_mode            Whether to create the display in edit mode.
   * @param dashboard_opts       Dashboard options
   */
  function DashboardDisplay(id, config, controller_factories, filters,
      edit_mode, height, width, dashboard_opts) {
    this.id = id;
    this.height = gsa.is_defined(height) ? height : 200;
    this.width = gsa.is_defined(width) ? width : 450;
    this.last_height = this.height;
    this.last_width = this.width;

    this.setConfig(config);

    if (dashboard_opts) {
      if (gsa.is_defined(dashboard_opts.hide_controller_select)) {
        this.hide_controller_select = dashboard_opts.hide_controller_select;
      }
      if (gsa.is_defined(dashboard_opts.hide_filter_select)) {
        this.hide_filter_select = dashboard_opts.hide_filter_select;
      }
    }

    this.edit_mode = edit_mode;
    this.all_filters = filters || [EMPTY_FILTER];
    this.filters = [];
    this.controllers = [];

    for (var controller_name in controller_factories) {
      var new_controller = controller_factories[controller_name](this);
      if (controller_name === this.config.name) {
        this.current_controller = new_controller;
      }
      this.controllers.push(new_controller);
    }

    this._updateCurrentFilter();
    this._updateFilters();

    this.init();
  }

  gsa.derive(DashboardDisplay, EventNode);

  DashboardDisplay.prototype.init = function() {
    var self = this;

    this.elem = $('<div/>', {
      'class': 'dashboard-display',
      id: this.id,
    });

    this.elem.data('display', this); // add reference to this display. Allows access to it via the DOM

    EventNode.call(this);

    var inner_elem_d3 = $('<div/>', {
      'class': 'chart-box',
    }).appendTo(this.elem);

    this.menu = $('<li/>')
      .appendTo($('<ul/>')
          .appendTo($('<div/>', {
              id: 'chart_list',
            })
            .appendTo(inner_elem_d3))
        );

    $('<a/>', {
      'id': 'section_list_first',
    }).appendTo(this.menu);

    this.menu = $('<ul/>', {
      id: this.id + '-menu',
    }).appendTo(this.menu);

    this.menu = this.menu[0];

    this.top_buttons = $('<div/>', {
      'class': 'chart-top-buttons',
    }).appendTo(inner_elem_d3);

    $('<a/>', {
      'class': 'remove-button icon icon-sm',
      href: 'javascript:void(0);',
      on: {
        click: function() { self.remove(); },
      },
      css: {
        'display': this.edit_mode ? 'inline' : 'none',
      }
    })
    .append($('<img/>', {
      src: '/img/delete.svg',
      alt: gsa._('Remove'),
      title: gsa._('Remove'),
    }))
    .appendTo(this.top_buttons);

    this.header = $('<div/>', {
      'class': 'chart-head',
      id: this.id + '-head',
      text: gsa._('Initializing display for "{{display}}"...',
          {display: this.config.name}),
    }).appendTo(inner_elem_d3);

    this.content = $('<div/>', {
      'class': 'dashboard-display-content',
      id: this.id + '-content',
    }).appendTo(inner_elem_d3);

    this.content = this.content[0];

    this.loading = $('<div/>', {
      'class': 'dashboard-loading',
    }).appendTo(this.content);

    this.loading.append($('<span/>', {
      'class': 'ui-icon ui-icon-waiting',
    }));

    $('<span/>').text(gsa._('Loading data ...')).appendTo(this.loading[0]);

    this.svg = d3.select(this.content)
      .append('svg')
      .attr('class', 'chart-svg')
      .attr('id', this.id + '-svg');

    this.footer = $('<div/>', {
      'class': 'chart-foot',
      'id': this.id + '-foot',
    }).appendTo(inner_elem_d3);

    this.footer = this.footer[0];

    this._createControllerSelector();
    this._createFilterSelector();

    this._applySelect2();
  };

  /**
   * Gets a menu item or creates it if it does not exist.
   *
   * @param menu_item_id  Id of the menu item.
   * @param last          Whether to add the "last" class to the item.
   */
  DashboardDisplay.prototype.createOrGetMenuItem = function(menu_item_id,
      last) {
    var menu_d3 = d3.select(this.menu);
    var item = menu_d3
                .select('li #' + this.id + '_' + menu_item_id)
                  .select('a');

    if (item.empty()) {
      var li = menu_d3.append('li');
      if (last) {
        li.attr('class', 'last');
      }
      item = li.attr('id', this.id + '_' + menu_item_id).append('a');
    }

    return item;
  };

  /**
   * Updates the data on the last successful generator.
   * Should be called if a generator was successful.
   *
   * @param generator   The new generator.
   * @param gen_params  The new generator parameters.
   *
   * @return This display
   */
  DashboardDisplay.prototype.updateGenData = function(generator, gen_params) {
    this.last_generator = generator;
    this.last_gen_params = gen_params;
    return this;
  };

  /**
   * Removes a display. Triggers removed afterwards.
   *
   * @return This display
   */
  DashboardDisplay.prototype.remove = function() {
    var self = this;
    $(self.elem).hide('fade', {}, 250, function() {
      self.elem.data('display', null); // remove reference to the display
      self.elem.remove();
      self._trigger('removed', self);
    });
    return this;
  };

  /**
   * Sets the title bar text of the display box.
   *
   * @param new_title   The new title text.
   *
   * @return This display
   */
  DashboardDisplay.prototype.setTitle = function(new_title) {
    this.header.text(new_title);
    return this;
  };

  /**
   * Sets tht config og the display
   *
   * @return This display
   */
  DashboardDisplay.prototype.setConfig = function(config) {
    this.config = config || {name: '', filt_id: ''};
    return this;
  };

  /**
   * Gets the title bar text of the display box.
   *
   * @return The text of the title bar
   */
  DashboardDisplay.prototype.getTitle = function() {
    return this.header.text();
  };

  /**
   * Shows the "Loading ..." text and icon.
   *
   * @return This display
   */
  DashboardDisplay.prototype.showLoading = function() {
    $(this.loading).show();
    return this;
  };

  /**
   * Hides the "Loading ..." text and icon on a dashboard display.
   *
   * @return This display
   */
  DashboardDisplay.prototype.hideLoading = function() {
    $(this.loading).hide();
    return this;
  };

  /**
   * Removes all svg content
   *
   * @return This display
   */
  DashboardDisplay.prototype.clearSvg = function() {
    this.svg.selectAll('*').remove();
    return this;
  };

  /**
   * Enables edit mode for a dashboard display.
   *
   * @return This display
   */
  DashboardDisplay.prototype.startEdit = function() {
    this.edit_mode = true;
    this.top_buttons.children('.remove-button').show();

    if (this._showFilterSelect()) {
      this.filter_select_container.show();
    }
    if (this._showControllerSelect()) {
      this.controller_select_container.show();
    }
    this.resize();
    return this;
  };

  /**
   * Disable edit mode for a dashboard display.
   *
   * @return This display
   */
  DashboardDisplay.prototype.stopEdit = function() {
    this.edit_mode = false;
    this.top_buttons.children('.remove-button').hide();

    this.filter_select_container.hide();
    this.controller_select_container.hide();

    this.resize();
    return this;
  };

  /**
   *
   *
   * @return This display
   */
  DashboardDisplay.prototype.resize = function(height, width) {
    if (gsa.is_defined(width)) {
      this.width = width;
    }

    if (gsa.is_defined(height)) {
      this.height = height;
    }

    this.inner_height = this.height - 8 - 18; // 18 == header height, 8 == border height

    if (this._showControllerSelect()) {
      this.inner_height -= 24;
    }

    if (this._showFilterSelect()) {
      this.inner_height -= 24;
    }

    log.debug('resize display ' + this.id, this.height, this.width,
        this.inner_height);

    this.svg.attr('height', this.inner_height);

    this.elem.css('height', this.height);

    this.svg.attr('width', this.width - 8); // 8 == border width

    this.elem.css('width', this.width);

    if (this.last_width !== this.width || this.last_height !== this.height ||
        this.last_inner_height !== this.inner_height) {
      this.last_width = this.width;
      this.last_height = this.height;
      this.last_inner_height = this.inner_height;
      this.redraw();
    }
    return this;
  };

  /**
   * Redraws the chart within the display
   *
   * @return This display
   */
  DashboardDisplay.prototype.redraw = function() {
    log.debug('redraw display ' + this.id);
    this._requestNewChart();
    return this;
  };

  /**
   * Returns the filter id of the current filter or an empty string if no
   * current filter is set
   *
   * @return Filter id of the current filter or ''
   *
   */
  DashboardDisplay.prototype.getFilterString = function() {
    if (gsa.has_value(this.current_filter)) {
      return this.current_filter.id;
    }
    return '';
  };

  /**
   * Returns the chart name of the current controller or an empty string if no
   * current controller is set
   *
   * @return Chart name of the current controller or ''
   *
   */
  DashboardDisplay.prototype.getControllerString = function() {
    if (gsa.has_value(this.current_controller)) {
      return this.current_controller.chart_name;
    }
    return '';
  };

  /**
   * Returns the current config object of this chart
   *
   * @return The current config of this chart
   *
   */
  DashboardDisplay.prototype.getConfig = function() {
    return {
      type: 'chart',
      name: this.current_controller ? this.current_controller.chart_name : '',
      filt_id: this.current_filter ? this.current_filter.id : '',
    };
  };

  /**
   * Returns the controller for a chart name. If no controller could be found
   * undefined is returned
   *
   * @param name Name of the chart
   *
   * @return The controller or undefined if not found
   */
  DashboardDisplay.prototype.getController = function(name) {
    return this.controllers.find(function(controller) {
      return controller.chart_name === name;
    });
  };

  /**
   * Return the index of the current chart controller. If no controller is
   * applied -1 is returned.
   *
   * @return The index of the current applied filter
   */
  DashboardDisplay.prototype.getCurrentControllerIndex = function() {
    var self = this;

    if (!gsa.has_value(this.current_controller)) {
      return -1;
    }

    return this.controllers.findIndex(function(controller) {
      return controller === self.current_controller;
    });
  };

  /**
   * Return the index of the current filter. If no filter is applied -1 is
   * returned.
   *
   * @return The index of the current applied filter
   */
  DashboardDisplay.prototype.getCurrentFilterIndex = function() {
    var self = this;

    if (!gsa.has_value(this.current_filter)) {
      return -1;
    }

    return this.filters.findIndex(function(filter) {
      return filter === self.current_filter;
    });
  };

  /**
   * Returns the current set filter
   *
   * @return The currently applied filter
   *
   */
  DashboardDisplay.prototype.getCurrentFilter = function() {
    return this.current_filter;
  };

  /**
   *
   * @return This display
   */
  DashboardDisplay.prototype.prevController = function() {
    if (!this.edit_mode) {
      return;
    }

    var index = this.getCurrentControllerIndex();
    if (index <= 0) {
      // use last controller
      index = this.controllers.length;
    }

    index -= 1;
    this._selectController(index);

    // don't trigger select change event
    this.controller_select_elem.val(index);
    this.controller_select_elem.trigger('change.select2');
    return this;
  };

  /**
   * Selects the next chart controller and updates the controller selection
   * element.
   *
   * @return This display
   */
  DashboardDisplay.prototype.nextController = function() {
    if (!this.edit_mode) {
      return;
    }

    var index = this.getCurrentControllerIndex();
    if (index === this.controllers.length - 1) {
      // use first controller
      index = 0;
    }
    else {
      index += 1;
    }

    this._selectController(index);

    // don't trigger select change event
    this.controller_select_elem.val(index);
    this.controller_select_elem.trigger('change.select2');
    return this;
  };

  /**
   * Selects the previous filter and updates the filter selection element.
   *
   * @return This display
   */
  DashboardDisplay.prototype.prevFilter = function() {
    if (!this.edit_mode) {
      return;
    }

    var index = this.getCurrentFilterIndex();
    if (index <= 0) {
      // use last filter
      index = this.filters.length;
    }

    index -= 1;
    this._selectFilter(index);
    this._updateFilterSelection(index);

    return this;
  };

  /**
   * Selects the next filter and updates the filter selection element.
   *
   * @return This display
   */
  DashboardDisplay.prototype.nextFilter = function() {
    if (!this.edit_mode) {
      return;
    }

    var index = this.getCurrentFilterIndex();
    if (index === this.filters.length - 1) {
      // use first filter
      index = 0;
    }
    else {
      index += 1;
    }

    this._selectFilter(index);
    this._updateFilterSelection(index);

    return this;
  };

  /**
   * Update this display to use new controller and/or filter. Data will be
   * reloaded if the controller and/or filter is changed.
   *
   * @param config New config to use.
   *
   * @return This display
   */
  DashboardDisplay.prototype.update = function(config) {
    var changed = false;

    log.debug('Updating display ' + this.id, 'new config:', config,
        'old config:', this.config);

    this.setConfig(config);

    if (!gsa.is_defined(this.current_controller) ||
        this.config.name !== this.current_controller.chart_name) {
      log.debug('Controller has changed');
      this._updateCurrentController();
      this._updateFilters(); // maybe unnecessary because it will be updated by new request
      changed = true;
    }

    if (!gsa.is_defined(this.current_filter) ||
        this.config.filt_id !== this.current_filter.id) {
      log.debug('Filter has changed');
      this._updateCurrentFilter();
      this._updateFilterSelection();
      changed = true;
    }

    if (changed) {
      this._requestNewChart();
    }
    return this;
  };

  /**
   * Shows an error message text in the header of this display
   *
   * @param message Message text to be displayed
   *
   * @return This display
   */
  DashboardDisplay.prototype.showError = function(message) {
    this.setTitle(message);
    this.hideLoading();
    this.clearSvg();
    return this;
  };

  /**
   * (Re-)sets the current controller from the controller string
   *
   * @return This display
   */
  DashboardDisplay.prototype._updateCurrentController = function() {
    var self = this;

    this.current_controller = this.controllers.find(function(controller) {
      return controller.chart_name === self.config.name;
    });
    return this;
  };

  /**
   * (Re-)sets the current filter from the filter string
   *
   * @return This display
   */
  DashboardDisplay.prototype._updateCurrentFilter = function() {
    var filt_id = this.config.filt_id;

    this.current_filter = this.all_filters.find(function(filter, index) {
      return filter.type === null && !gsa.has_value(filt_id) ||
        filter.id === filt_id;
    });
    return this;
  };

  /**
   * Applies Select2 to the filter and controller select elements.
   *
   * @return This display
   */
  DashboardDisplay.prototype._applySelect2 = function() {
    if (gsa.is_defined(this.controller_select_elem)) {
      this.controller_select_elem.select2();
    }
    if (gsa.is_defined(this.filter_select_elem)) {
      this.filter_select_elem.select2();
    }
    return this;
  };

  /**
   * Rebuilds the options in the filter selector
   *
   * @return This display
   */
  DashboardDisplay.prototype._rebuildFilterSelection = function() {
    if (gsa.is_defined(this.filter_select_elem)) {
      var select2_data = [];

      this.filters.forEach(function(filter, index) {
        select2_data.push({id: index, text: filter.name});
      });
      this.filter_select_elem.find('*').remove();
      this.filter_select_elem.select2({'data': select2_data});
    }
    return this;
  };

  /**
   * Selects the current controller for the display and starts a redraw
   * if the controller has changed. Also triggers a controller_changed event in
   * that case.
   *
   * @param index Index of the new controller.
   *
   * @return This display
   */
  DashboardDisplay.prototype._selectController = function(index) {
    var old_filter_type;
    var new_controller = this.controllers[index];

    if (gsa.is_defined(this.current_controller)) {
      old_filter_type = this.current_controller.data_src.filter_type;
    }

    if (!gsa.is_defined(new_controller)) {
      log.warn('No controller found for index "' + index + '"');
      return;
    }

    if (this.current_controller !== new_controller) {
      this.current_controller = new_controller;

      if (new_controller.data_src.filter_type !== old_filter_type) {
        this._updateFilters();
        this._rebuildFilterSelection();
        this._selectFilter(); // select empty filter
      }

      this.redraw();
      this._trigger('controller_changed', this);
    }
    return this;
  };

  /**
   * Selects a controller for the display. If index is undefined the empty
   * filter (filter.type === null) is selected.
   *
   * If the filter has changed a redraw is
   * started. In that case also filter_changed is triggered.
   *
   * @param index Index of the new filter.
   *
   * @return This display
   */
  DashboardDisplay.prototype._selectFilter = function(index) {
    var new_filter;

    if (!gsa.is_defined(index)) {
      new_filter = this.filters.find(function(filter) {
        // find empty filter
        return filter.type === null;
      });
    }
    else {
      new_filter = this.filters[index];
    }

    if (!gsa.is_defined(new_filter)) {
      log.warn('No filter found for index "' + index + '"');
      return;
    }

    if (gsa.has_value(new_filter) && (!gsa.has_value(this.current_filter) ||
          new_filter !== this.current_filter)) {
      // filter has changed
      this.current_filter = new_filter;
      this.filter_string = new_filter.id;
      this.redraw();
      this._trigger('filter_changed', this);
    }
    return this;
  };

  /**
   * Adds chart selector elements to a dashboard display.
   *
   * @return This display
   */
  DashboardDisplay.prototype._createControllerSelector = function() {
    var self = this;

    this.controller_select_container = $('<div/>').appendTo(this.footer);

    $('<a/>', {
      href: 'javascript:void(0);',
      class: 'icon icon-sm',
      on: {
        click: function() {self.prevController();},
      }
    })
    .append($('<img/>', {
      src: 'img/previous.svg',
      css: {
        'vertical-align': 'middle'
      },
    }))
    .appendTo(this.controller_select_container);

    this.controller_select_elem = $('<select/>', {
      css: {
        'margin-left': '5px',
        'margin-right': '5px',
        'vertical-align': 'middle',
        'width': '60%',
      },
      on: {
        change: function() {
          self._selectController(this.value);
        },
      },
    })
    .appendTo(this.controller_select_container);

    this.controllers.forEach(function(controller, index) {
      $('<option/>', {
        value: index,
        selected: controller === self.current_controller,
        id: self.id + '_chart_opt_' + index,
        text: controller.selector_label,
      })
      .appendTo(self.controller_select_elem);
    });

    $('<a/>', {
      href: 'javascript:void(0);',
      class: 'icon icon-sm',
      on: {
        click: function() {
          self.nextController();
        },
      },
    })
    .append($('<img/>', {
      src: 'img/next.svg',
      css: {
        'vertical-align': 'middle',
      },
    }))
    .appendTo(this.controller_select_container);

    if (!this._showControllerSelect()) {
      this.controller_select_container.hide();
    }

    return this;
  };

  /**
   * Adds filter selector elements to a dashboard display.
   *
   * @return This display
   */
  DashboardDisplay.prototype._createFilterSelector = function() {
    var self = this;

    this.filter_select_container = $('<div/>').appendTo(this.footer);

    $('<a/>', {
      href: 'javascript:void(0);',
      class: 'icon icon-sm',
      on: {
        click: function() {
          self.prevFilter();
        },
      },
    })
    .append($('<img/>', {
      src: 'img/previous.svg',
      css: {
        'vertical-align': 'middle',
      },
    }))
    .appendTo(this.filter_select_container);

    this.filter_select_elem = $('<select/>', {
      css: {
        'margin-left': '5px',
        'margin-right': '5px',
        'vertical-align': 'middle',
        'width': '60%',
      },
      on: {
        change: function() {
          self._selectFilter(this.value);
        },
      },
    })
    .appendTo(this.filter_select_container);

    this.filters.forEach(function(filter, index) {
      $('<option/>', {
        value: index,
        id: self.id + '_filter_opt_' + filter.id,
        text: filter.name,
        selected: filter === self.current_filter,
      })
      .appendTo(self.filter_select_elem);
    });

    $('<a/>', {
      href: 'javascript:void(0);',
      class: 'icon icon-sm',
      on: {
        click: function() {
          self.nextFilter();
        },
      },
    })
    .append($('<img/>', {
      src: 'img/next.svg',
      css: {
        'vertical-align': 'middle',
      },
    }))
    .appendTo(this.filter_select_container);

    if (!this._showFilterSelect()) {
      this.filter_select_container.hide();
    }

    return this;
  };

  /**
   * Requests a new chart.
   *
   * @return This display
   */
  DashboardDisplay.prototype._requestNewChart = function() {
    if (!gsa.is_defined(this.current_controller)) {
      this.showError(gsa._('Could not load chart {{chart}}',
            {chart: this.config.name}));
      log.error('No controller selected');
      return;
    }

    if (gsa.is_defined(this.last_request)) {
      this.last_request.controller.removeRequest(this.last_request.filter);
      this.last_request = undefined;
    }

    this.current_controller.addRequest(this.current_filter);

    this.last_request = {
      controller: this.current_controller,
      filter: this.current_filter,
    };
    return this;
  };

  /**
   * Updates the filter list for the current controller
   *
   * @return This display
   */
  DashboardDisplay.prototype._updateFilters = function() {
    var self = this;

    if (!gsa.is_defined(this.current_controller)) {
      this.filters = [];
      return;
    }
    this.filters = this.all_filters.filter(function(filter) {
      return filter.type === null || filter.type === '' ||
        filter.type === self.current_controller.data_src.filter_type;
    });
    return this;
  };

  /**
   * Returns wether the filter selection element should be shown
   *
   * @return true if the filter selection should be shown
   */
  DashboardDisplay.prototype._showFilterSelect = function() {
    return !this.hide_filter_select && this.edit_mode;
  };

  /**
   * Returns wether the controller selection element should be shown
   *
   * @return true if the controller selection should be shown
   */
  DashboardDisplay.prototype._showControllerSelect = function() {
    return !this.hide_controller_select && this.edit_mode;
  };

  /**
   * Update the selected filter in the filter select element without triggering
   * a filter changed event
   *
   * @param index Index to set in the filter selection element. If index is
   *              undefined the current filter will be selected.
   *
   * @return This display
   */
  DashboardDisplay.prototype._updateFilterSelection = function(index) {
    var self = this;

    if (!gsa.is_defined(index)) {
      index = this.filters.findIndex(function(filter) {
        return filter.type === null && !gsa.has_value(self.filter_string) ||
          filter.id === self.current_filter.id;
      });
    }

    log.debug('Update filter selection to index', index);

    // don't trigger select change event only update the selected value
    this.filter_select_elem.val(index);
    this.filter_select_elem.trigger('change.select2');
    return this;
  };

  /* Chart controller class */

  /**
   * Constructor for a Chart controller which manages the data source,
   *  generator and display of a chart.
   *
   * @constructor
   *
   * @param data_src        The DataSource to use.
   * @param generator       The chart generator to use.
   * @param display         The Display to use.
   * @param chart_name      Name of the chart.
   * @param label           Label of the chart.
   * @param chart_type      The type of chart (bubble, donut, etc.).
   * @param chart_template  Special chart template to use.
   * @param chart_title     Title to be shown for the chart
   * @param count_field     Column for title count (optional).
   * @param gen_params      Parameters for the generator (optional).
   * @param init_params     Parameters to init the chart controller (optional).
   */
  function ChartController(chart_name, chart_type, chart_template,
      chart_title, data_src, display, count_field, gen_params, init_params) {
    this.chart_name = chart_name;
    this.chart_type = chart_type;
    this.chart_template = chart_template ? chart_template : '';
    this.data_src = data_src;
    this.display = display;

    this.gen_params = gsa.is_object(gen_params) ? gen_params : {};
    this.gen_params.chart_template = chart_template;

    this.init_params = gsa.is_object(init_params) ? init_params : {};

    this.selector_label = chart_title;

    this.id = chart_name + '@' + display.id;

    this.generator = gch.new_chart_generator(this.chart_type);

    this.generator.setTitleGenerator(
        get_title_generator(chart_title, count_field));

    // FIXME move this to the corresponding chart generators. they should now
    // their default style
    if (this.chart_template === 'info_by_cvss' ||
        this.chart_template === 'recent_info_by_cvss' &&
        this.chart_type !== 'donut') {
      this.generator.setBarStyle(gch.severity_bar_style('value',
          gsa.severity_levels.max_log,
          gsa.severity_levels.max_low,
          gsa.severity_levels.max_medium));
    }
  }

  /* Delegates a data request to the data source */
  ChartController.prototype.addRequest = function(filter) {
    this.filter = filter;

    if (this.hasChanged()) {
      this.showLoading();
    }
    this.data_src.addRequest(this, this.filter, this.gen_params);
  };

  ChartController.prototype.removeRequest = function(filter) {
    this.data_src.removeRequest(this, filter);
    return this;
  };

  /**
   * Shows the "Loading ..." text in the display.
   */
  ChartController.prototype.showLoading = function() {
    this.display.clearSvg();
    this.display.setTitle(this.generator.getTitle());
    this.display.showLoading();
  };

  /**
   * Shows an error message in the display.
   *
   * @param message  The error message to show.
   */
  ChartController.prototype.showError = function(message) {
    return this.display.showError(message);
  };

  ChartController.prototype.hasGeneratorChanged = function() {
    return this.display.last_generator !== this.generator;
  };

  ChartController.prototype.hasFilterChanged = function() {
    return this.last_filter !== this.filter;
  };

  ChartController.prototype.hasChanged = function() {
    return this.hasGeneratorChanged() || this.hasFilterChanged();
  };

  /**
   * Callback for when data is loaded.
   *
   * @param data  The data that was loaded.
   */
  ChartController.prototype.dataLoaded = function(data) {
    var self = this;

    self.display.hideLoading();

    if (!self.generator.supportsCommand(self.data_src.command)) {
      log.error('Generator does not support command "' + self.data_src.command +
          '"', self.generator);
      return;
    }

    self.generator.evaluateParams(self.gen_params);

    var orig_data = self.generator.extractData(data, self.gen_params);
    var chart_data = self.generator.generateData(orig_data, self.gen_params);

    self.display.setTitle(self.generator.getTitle(chart_data));
    self.generator.generate(self.display.svg, chart_data, self.hasChanged());
    self.last_filter = self.filter;
    self.display.updateGenData(self.generator, self.gen_params);
    self.generator.addMenuItems(self, chart_data);
  };

  /**
   * Generates a URL to a detached chart.
   *
   * @return The generated URL.
   */
  ChartController.prototype.getDetachedUrl = function() {
    var field;
    var param;
    var params = gsa.shallow_copy(this.data_src.params);

    if (gsa.has_value(this.gen_params.no_chart_links)) {
      params.no_chart_links = this.gen_params.no_chart_links ? '1' : '0';
    }

    if (gsa.has_value(this.gen_params.x_field)) {
      params.x_field = this.gen_params.x_field;
    }
    if (gsa.has_value(this.gen_params.y_fields)) {
      for (field in this.gen_params.y_fields) {
        params['y_fields:' + (1 + Number(field))] =
                this.gen_params.y_fields[field];
      }
    }
    if (gsa.has_value(this.gen_params.z_fields)) {
      for (field in this.gen_params.z_fields) {
        params['z_fields:' + (1 + Number(field))] =
            this.gen_params.z_fields[field];
      }
    }

    for (param in this.init_params) {
      params['chart_init:' + encodeURIComponent(param)] =
          this.init_params[param];
    }

    if (gsa.is_defined(this.gen_params.extra)) {
      for (param in this.gen_params.extra) {
        params['chart_gen:' + encodeURIComponent(param)] =
            this.gen_params.extra[param];
      }
    }

    var command = this.data_src.command;
    if (command !== 'get_aggregate') {
      command = command + '_chart';
    }

    params.chart_type = this.chart_type;
    params.chart_template = this.chart_template;
    params.chart_title = this.display.getTitle();

    return create_uri(command, this.display.getCurrentFilter(), params,
        this.data_src.prefix, true);
  };

  /**
   * Constructor for a data source, which handles the request params and
   *  caches the XML responses.
   *
   * @param name      The name of the data source.
   * @param options   Options of the data source.
   * @param prefix    Prefix for requests.
   */
  function DataSource(name, options, prefix) {
    this.name = name;
    this.options = gsa.is_defined(options) ? options : {};
    this.prefix = gsa.is_defined(prefix) ? prefix : '/omp?';

    this.requesting_controllers = {};
    this.active_requests = {};
    this.cached_data = {};
    this.column_info = {};
    this.data = {};
    this.params = {
      xml: 1,
    };

    this.init();
  }

  /**
   * Initializes a data source.
   */
  DataSource.prototype.init = function() {
    if (gsa.is_defined(this.options.filter)) {
      this.params.filter = this.options.filter;
    }

    if (gsa.is_defined(this.options.filt_id)) {
      this.params.filt_id = this.options.filt_id;
    }

    if (this.options.type === 'task' || this.options.type === 'tasks') {
      this.command = 'get_tasks';
      this.filter_type = 'Task';

      this.params.ignore_pagination = 1;
      this.params.no_filter_history = 1;
      this.params.schedules_only = 1;
    }
    else if (this.options.type === 'host') {
      this.command = 'get_assets';
      this.filter_type = 'Asset';

      this.params.asset_type = 'host';
      this.params.no_filter_history = 1;
      this.params.ignore_pagination = 1;
    }
    else {
      this.command = 'get_aggregate';
      this.filter_type = gch.filter_type_name(this.options.aggregate_type);

      this.params.aggregate_type = this.options.aggregate_type;

      this.params.data_column = gsa.is_defined(this.options.data_column) ?
        this.options.data_column : '';

      this.params.group_column = gsa.is_defined(this.options.group_column) ?
        this.options.group_column : '';

      this.params.subgroup_column =
        gsa.is_defined(this.options.subgroup_column) ?
          this.options.subgroup_column :
          '';

      if (!this.options.data_columns) {
        this.params.data_columns = [];
      }
      else {
        this.params.data_columns = this.options.data_columns.split(',');
      }

      if (!this.options.text_columns) {
        this.params.text_columns = [];
      }
      else {
        this.params.text_columns = this.options.text_columns.split(',');
      }

      if (!this.options.sort_fields) {
        this.params.sort_fields = [];
      }
      else {
        this.params.sort_fields = this.options.sort_fields.split(',');
      }

      if (!this.options.sort_orders) {
        this.params.sort_orders = [];
      }
      else {
        this.params.sort_orders = this.options.sort_orders.split(',');
      }

      if (!this.options.sort_stats) {
        this.params.sort_stats = [];
      }
      else {
        this.params.sort_stats = this.options.sort_stats.split(',');
      }

      if (this.options.first_group) {
        this.params.first_group = this.options.first_group;
      }
      if (this.options.max_groups) {
        this.params.max_groups = this.options.max_groups;
      }
      if (this.options.aggregate_mode) {
        this.params.aggregate_mode = this.options.aggregate_mode;
      }
    }
  };

  /**
   * Adds a request from a controller to a data source.
   *
   * @param controller  The controller requesting the data.
   * @param filter      The requested filter.
   * @param gen_params  Generator params for the request.
   */
  DataSource.prototype.addRequest = function(controller, filter, gen_params) {
    var filter_id = filter ? filter.id : '';

    if (!gsa.is_defined(this.requesting_controllers[filter_id])) {
      this.requesting_controllers[filter_id] = {};
    }

    this.requesting_controllers[filter_id][controller.id] = {
      active: true,
      controller: controller,
      filter: filter,
      gen_params: gen_params
    };

    this.checkRequests(filter);
  };

  /**
   * Removes a request of a controller from a data source.
   *
   * @param controller  The controller cancelling the request.
   * @param filter      The formerly requested filter.
   */
  DataSource.prototype.removeRequest = function(controller, filter) {
    var filter_id = filter ? filter.id : '';
    var controllers = this.requesting_controllers[filter_id];

    if (controllers && controllers[controller.id]) {
      delete controllers[controller.id];

      var requesting_count = Object.keys(controllers).length;

      if (requesting_count === 0) {
        if (this.active_requests[filter_id]) {
          this.active_requests[filter_id].abort();
          delete this.active_requests[filter_id];
          log.debug('Aborted request for ' + controller.id + ' and filter "' +
              filter_id + '"');
        }
      }
    }
  };

  /**
   * Checks if a data source has active requests for a filter and manages the
   *  HTTP requests.
   */
  DataSource.prototype.checkRequests = function(filter) {
    var filter_id = filter ? filter.id : '';

    var data = this.getData(filter_id);
    if (data) {
      this.dataLoaded(data, filter_id);
      return this;
    }

    this.addNewXmlRequest(filter);

    return this;
  };

  DataSource.prototype.addNewXmlRequest = function(filter) {
    var self = this;
    var filter_id = filter ? filter.id : '';

    if (this.active_requests[filter_id]) {
      // we already have an request
      return;
    }

    var data_uri = create_uri(this.command, filter, this.params, this.prefix,
        false);

    self.active_requests[filter_id] = d3.xml(data_uri, 'application/xml');
    self.active_requests[filter_id].get(function(error, xml) {
      var ctrls = self.requesting_controllers[filter_id];
      var omp_status;
      var omp_status_text;

      if (error) {
        if (error instanceof XMLHttpRequest) {
          if (error.status === 0) {
            self.outputError(ctrls, gsa._('Loading aborted'));
            return;
          }

          if (error.status === 401) {
            // not authorized (anymore)
            // reload page to show login dialog
            window.location.reload();
            return;
          }

          self.outputError(ctrls,
              gsa._('HTTP error {{error}}', {error: error.status}),
              gsa._('Error: HTTP request returned status ' +
                '{{status}} for URL: {{url}}',
                {status: error.status, url: self.data_uri}));
          return;
        }

        self.outputError(ctrls, gsa._('Error reading XML'),
            gsa._('Error reading XML from URL {{url}}: {{error}}',
              {url: self.data_uri, error: error}));
        return;
      }

      var xml_select = d3.select(xml.documentElement);

      if (xml.documentElement.localName === 'parsererror') {
        self.outputError(ctrls, gsa._('Error parsing XML data'),
            gsa._('Error parsing XML data. Details: {{details}}' +
              {details: xml.documentElement.textContent}));
        return;
      }

      if (self.command === 'get_aggregate') {
        omp_status = xml_select.select(
            'get_aggregate get_aggregates_response').attr('status');
        omp_status_text = xml_select.select(
            'get_aggregate get_aggregates_response')
          .attr('status_text');
      }
      else if (self.command === 'get_tasks') {
        omp_status = xml_select.select(
            'get_tasks get_tasks_response')
          .attr('status');
        omp_status_text = xml_select.select(
            'get_tasks get_tasks_response')
          .attr('status_text');
      }
      else if (self.command === 'get_assets') {
        omp_status = xml_select.select(
            'get_assets get_assets_response')
          .attr('status');
        omp_status_text = xml_select.select(
            'get_assets get_assets_response')
          .attr('status_text');
      }
      else {
        self.outputError(ctrls, gsa._('Internal error: Invalid request'),
            gsa._('Invalid request command: "{{command}}',
              {command: self.command}));
        return self;
      }

      if (omp_status !== '200') {
        self.outputError(ctrls,
            gsa._('Error {{omp_status}}: {{omp_status_text}}',
              {omp_status: omp_status, omp_status_text: omp_status_text}),
            gsa._('OMP Error {{omp_status}}: {{omp_status_text}}',
              {omp_status: omp_status, omp_status_text: omp_status_text}));
        return self;
      }

      var data = gch.xml2json(xml_select.node());
      self.addData(data, filter_id);
      self.dataLoaded(data, filter_id);

      delete self.active_requests[filter_id];
    });

    return this;
  };

  DataSource.prototype.getParam = function(param_name) {
    return this.params[param_name];
  };

  /**
   * Notifiy all controllers about available data
   *
   * @param data       Data to notify the requesting controllers about
   * @param filter_id  Filter ID (optional)
   *
   * @return This data source
   */
  DataSource.prototype.dataLoaded = function(data, filter_id) {
    filter_id = gsa.is_defined(filter_id) ? filter_id : '';

    var ctrls = this.requesting_controllers[filter_id];

    for (var controller_id in ctrls) {
      var ctrl = ctrls[controller_id];

      if (!ctrl.active) {
        continue;
      }

      ctrl.active = false;
      ctrl.controller.dataLoaded(data);
    }
    delete this.requesting_controllers[filter_id];
    return this;
  };

  /**
   * Store request data in the local cache
   *
   * This data will delivered to each requesting chart using the filter id
   * afterwards.
   *
   * @param data       Data to use for requesting charts
   * @param filter_id  Filter ID (optional)
   *
   * @return This data source
   */
  DataSource.prototype.addData = function(data, filter_id) {
    filter_id = gsa.is_defined(filter_id) ? filter_id : '';
    this.cached_data[filter_id] = data;
    return this;
  };

  /**
   * Get request data from the local cache
   *
   * @param filter_id  Filter ID (optional)
   *
   * @return The cached data or undefined of not available
   */
  DataSource.prototype.getData = function(filter_id) {
    filter_id = gsa.is_defined(filter_id) ? filter_id : '';
    return this.cached_data[filter_id];
  };

  /**
   * Prints an error to the console and shows it on the display of a chart.
   *
   * @param controllers       Controller of the chart where the error occurred.
   * @param display_message   Short message to show on the display.
   * @param console_message   Longer message shown on the console.
   * @param console_extra     Extra debug info shown on the console.
   */
  DataSource.prototype.outputError = function(controllers, display_message,
      console_message, console_extra) {
    if (gsa.is_defined(console_message)) {
      log.error(console_message);
    }
    if (gsa.is_defined(console_extra)) {
      log.debug(console_extra);
    }

    for (var id in controllers) {
      var controller = controllers[id];
      controller.controller.showError(display_message);
    }
  };

  /* Initialization on page load */

  /**
   * Initializes all dashboards elements on a page.
   *
   * @param   The document object where to init the dashboards.
   */
  function on_ready(doc) {
    doc = $(doc);

    doc.find('.dashboard').each(function() {
      var elem = $(this);
      var max_components = gsa.is_defined(elem.data('max-components')) ?
        elem.data('max-components') : 8;
      var no_chart_links = gsa.is_defined(elem.data('no-chart-links')) ?
        !!(elem.data('no-chart-links')) : false;

      var dashboard = new gch.Dashboard(elem.attr('id'),
          elem.data('config'),
          {
            config_pref_id: elem.data('config-pref-id'),
            filter: elem.data('filter'),
            filt_id: elem.data('filter-id'),
            max_components: max_components,
            default_controller_string: elem.data('default-controller-string'),
            default_controllers_string: elem.data('default-controllers'),
            default_filters_string: elem.data('default-filters'),
            default_heights_string: elem.data('default-heights'),
            hide_controller_select: elem.data('hide-controller-select'),
            hide_filter_select: elem.data('hide-filter-select'),
            dashboard_controls: '#' + elem.data('dashboard-controls'),
          }
      );

      elem.find('.dashboard-filter').each(function() {
        var elem = $(this);
        dashboard.addFilter(elem.data('id'), elem.data('name'),
            unescape_xml(elem.data('term')), elem.data('type'));
      });

      elem.find('.dashboard-data-source').each(function() {
        var ds_elem = $(this);
        var type = ds_elem.data('type');
        var data_source_name = ds_elem.data('source-name');
        var aggregate_type = ds_elem.data('aggregate-type');
        var group_column = ds_elem.data('group-column');
        var subgroup_column = ds_elem.data('subgroup-column');

        var data_source = new gch.DataSource(data_source_name,
            {
              type: type,
              aggregate_type: aggregate_type,
              group_column: group_column,
              subgroup_column: subgroup_column,
              data_column: ds_elem.data('column'),
              data_columns: ds_elem.data('columns'),
              text_columns: ds_elem.data('text-columns'),
              filter: ds_elem.data('filter'),
              filt_id: ds_elem.data('filter-id'),
              sort_fields: ds_elem.data('sort-fields'),
              sort_orders: ds_elem.data('sort-orders'),
              sort_stats: ds_elem.data('sort-stats'),
              aggregate_mode: ds_elem.data('aggregate-mode'),
              max_groups: ds_elem.data('max-groups'),
              first_group: ds_elem.data('first-group'),
            });

        ds_elem.find('.dashboard-chart').each(function() {
          var c_elem = $(this);
          var chart_template = c_elem.data('chart-template');
          var chart_type = c_elem.data('chart-type');
          var chart_name = c_elem.data('chart-name');
          var chart_title = c_elem.data('chart-title');
          var chart_title_count_column = c_elem.data('chart-title-count');
          var gen_params = {extra: {}};
          var init_params = {};

          if (gsa.is_defined(no_chart_links)) {
            gen_params.no_chart_links = no_chart_links;
          }
          if (c_elem.data('x-field')) {
            gen_params.x_field = c_elem.data('x-field');
          }
          if (c_elem.data('y-fields')) {
            gen_params.y_fields = c_elem.data('y-fields').split(',');
          }
          if (c_elem.data('z-fields')) {
            gen_params.z_fields = c_elem.data('z-fields').split(',');
          }

          var key;
          var c_elem_gen_params = c_elem.data('gen-params');
          if (gsa.is_object(c_elem_gen_params)) {
            for (key in c_elem_gen_params) {
              gen_params.extra[key] = c_elem_gen_params[key];
            }
          }

          var c_elem_init_params = c_elem.data('init-params');
          if (gsa.is_object(c_elem_init_params)) {
            for (key in c_elem_init_params) {
              init_params[key] = c_elem_init_params[key];
            }
          }

          dashboard.addControllerFactory(chart_name, function(for_display) {
            if (!gsa.is_defined(for_display)) {
              log.error('Display not defined');
              return null;
            }

            return new ChartController(chart_name, chart_type,
                chart_template, chart_title, data_source, for_display,
                chart_title_count_column, gen_params, init_params);
          });
        });
      });

      dashboard.initDisplays();
      // resize will also request the data
      dashboard.resize(elem[0].clientHeight, elem[0].clientWidth);

      if (elem.data('detached')) {
        $(window).on('resize', gch.detached_chart_resize_listener(dashboard));
      }
    });
  }

  $(document).ready(function() {
    on_ready(document);
  });

  /**
   * Unescapes XML entities in a string.
   *
   * @param string  Escaped XML string.
   *
   * @return  Unescaped string.
   */
  function unescape_xml(string) {
    if (!gsa.is_defined(gsa.parser)) {
      gsa.parser = new DOMParser();
    }

    var doc = gsa.parser.parseFromString('<doc>' + string + '</doc>',
                                        'application/xml');
    return doc.documentElement.textContent;
  }

  /* Dashboard helper function */

  /*
   * Creates a GSA request URI from a command name, parameters array and prefix.
   *
   */
  function create_uri(command, filter, params, prefix, no_xml) {
    var params_str = prefix + 'cmd=' + encodeURIComponent(command);
    for (var prop_name in params) {
      if ((!no_xml || prop_name !== 'xml') &&
          (!gsa.is_defined(filter) || filter.type === null ||
              (prop_name !== 'filter' && prop_name !== 'filt_id'))) {
        if (params[prop_name] instanceof Array) {
          for (var i = 0; i < params[prop_name].length; i++) {
            params_str = (params_str + '&' +
                          encodeURIComponent(prop_name) + ':' + i +
                          '=' +
                          encodeURIComponent(params[prop_name][i]));
          }
        }
        else {
          params_str = (params_str + '&' + encodeURIComponent(prop_name) +
                        '=' + encodeURIComponent(params[prop_name]));
        }
      }
    }
    if (gsa.has_value(filter) && filter.id && filter.id !== '') {
      params_str = params_str + '&filt_id=' + encodeURIComponent(filter.id);
    }
    params_str = params_str + '&token=' + encodeURIComponent(gsa.gsa_token);
    return params_str;
  }

  /**
   * Creates a title generator function.
   */
  function get_title_generator(title_text, count_field) {

    if (title_text) {
      if (gsa.is_defined(count_field)) {
        return gch.title_total(title_text, count_field);
      }
      return gch.title_static(gsa._('{{title_text}} (Loading...)',
          {title_text: title_text}), title_text);
    }

    log.error('Chart title not set. Please add a data-chart-title attribute');
    return gch.title_static(gsa._('Unknown chart'));
  }

  function split_rows(row_string) {
    return gsa.is_string(row_string) ? row_string.split('#') : [];
  }

  function split_elements(elements_string) {
    return gsa.is_string(elements_string) ? elements_string.split('|') : [];
  }

  function create_display_config_from_strings(controllers_string,
      filters_string) {
    return {
      type: 'chart',
      name: controllers_string,
      filt_id: filters_string,
    };
  }

  function create_row_config_from_strings(controllers_string, filters_string,
      height) {
    var controllers = split_elements(controllers_string);
    var filters = split_elements(filters_string);
    var configs = [];

    controllers.forEach(function(name, i) {
      var filter = i < filters.length ? filters[i] : '';
      configs.push(create_display_config_from_strings(name, filter));
    });
    return {
      type: 'row',
      height: height,
      data: configs,
    };
  }

})(window, window, window.document, window.gsa, window.d3, window.$,
  window.console, window.Promise);
