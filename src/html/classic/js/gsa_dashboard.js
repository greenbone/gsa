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

  var log = {};

  log.error =  function() {
    console.error.apply(console, arguments);
  };
  log.warn = function() {
    console.warn.apply(console, arguments);
  };

  if (gch.DEBUG) {
    log.debug = function() {
      console.log.apply(console, arguments);
    };
  }
  else {
    log.debug = function() {
    };
  }

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

  RowTarget.prototype = Object.create(EventNode.prototype);
  RowTarget.prototype.constructor = RowTarget;

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
   * @param id     The id of the dashboard and its container element
   * @param controllers_string Names of the controllers for the displays
   * @param heights_string '|' seperated values for the height of the rows
   * @param filters_string uuids of the filters for the displays
   * @param dashboard_opts Optional parameters for the dashboard and its
   *                       components.
   */
  function Dashboard(id, controllers_string, heights_string, filters_string,
        dashboard_opts) {
    if (gsa.has_value(heights_string)) {
      // ensure a string
      heights_string += '';
    }
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

    this.controllers_string = controllers_string;
    this.prev_controllers_string = controllers_string;
    this.default_controller_string = 'by-cvss';
    this.controllers_pref_id = '';

    // Row heights preference
    this.heights_pref_id = '';
    this.heights_string = heights_string;
    this.prev_heights_string = heights_string;

    // Filter selection preference
    this.filters_string = filters_string;
    this.filters_pref_id = '';
    // Filter String for new displays
    this.default_filter_string = '';
    this.prev_filters_string = filters_string;

    this.controller_factories = {};
    this.filters = [EMPTY_FILTER];

    this.reordering = false; // indicator if the dashboard rows are currently reorderd

    this._allUnchanged();

    this.init();
  }

  /**
   * Initializes a Dashboard.
   */
  Dashboard.prototype.init = function() {
    var self = this;

    if (this.dashboard_opts) {
      if (this.dashboard_opts.controllers_pref_id) {
        this.controllers_pref_id = this.dashboard_opts.controllers_pref_id;
      }
      if (this.dashboard_opts.heights_pref_id) {
        this.heights_pref_id = this.dashboard_opts.heights_pref_id;
      }
      if (this.dashboard_opts.filters_pref_id) {
        this.filters_pref_id = this.dashboard_opts.filters_pref_id;
      }
      if (this.dashboard_opts.default_filter_string) {
        this.default_filter_string = this.dashboard_opts.default_filter_string;
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
    }

    // Initialize DOM elements
    if (this.dashboard_controls) {
      var control_elem = $(this.dashboard_controls);
      this.start_edit_button = $('<a/>', {
        href: 'javascript:void(0);',
        on: {
          click: function() {self.startEdit();},
        },
      })
      .append($('<img/>', {
        src: 'img/edit.png',
        alt: gsa._('Edit Dashboard'),
        title: gsa._('Edit Dashboard'),
      }))
      .appendTo(control_elem);

      this.new_display_button = $('<a/>', {
        href: 'javascript:void(0);',
        on: {
          click: function() {self.newDisplay();},
        }
      })
      .append($('<img/>', {
        src: 'img/new.png',
        alt: gsa._('Add new Chart'),
        title: gsa._('Add new Chart'),
      }))
      .appendTo(control_elem);

      this.new_display_button.hide();

      this.stop_edit_button = $('<a/>', {
        href: 'javascript:void(0);',
        on: {
          click: function() {self.saveEdit();},
        }
      })
      .append($('<img/>', {
        src: 'img/stop.png',
        alt: gsa._('Stop Editing'),
        title: gsa._('Stop Editing'),
      }))
      .appendTo(control_elem);

      this.stop_edit_button.hide();

      this.cancel_edit_button = $('<a/>', {
        href: 'javascript:void(0);',
        on: {
          click: function() {self.cancelEdit();},
        },
      })
      .append($('<img/>', {
        src: 'img/delete.png',
        alt: gsa._('Cancel Editing'),
        title: gsa._('Cancel Editing'),
      }))
      .appendTo(control_elem);

      this.cancel_edit_button.hide();

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
    }

    $(window).off('keydown'); // remove event listener

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
      this.updateDisplaysFromString();
      this._allUnchanged();
    }
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
    row.createNewDisplay(this.default_controller_string,
        this.default_filter_string);
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
    if (!gsa.is_defined(options.height)) {
      options.height = 280;
    }
    else if (options.height < 150) {
      options.height = 150;
    }

    var row = new DashboardRow(this.getNextRowId(),
        options.row_controllers_string, options.row_filters_string,
        this.controller_factories, this.filters,
        options.height, this.width, this.edit_mode, this.dashboard_opts);

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
      self._allChanged();

      if (self.dashboard_controls && self.edit_mode && self.canAddDisplay()) {
        self.new_display_button.show();
      }
    });
    row.on('display_added', function(event, display) {
      log.debug('on display added');
      self.total_displays += 1;
      self._allChanged();
    });
    row.on('display_filter_changed', function(event, display) {
      log.debug('on display filter changed');
      self.filters_changed = true;
    });
    row.on('display_controller_changed', function(event, display) {
      log.debug('on display controller changed');
      self.controllers_changed = true;
    });
    row.on('resized', function(event, row) {
      log.debug('on resized');
      self.heights_changed = true;
    });
    row.on('reorder', function(event, row) {
      log.debug('on reorder');
    });
    row.on('reorderd', function(event, row) {
      log.debug('on reordered');
      self._removeEmptyRows();
      self.reordering = false;
      self._allChanged();
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
    this._allChanged();
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
   * Updates the controllers string of the dashboard using the ones of the rows.
   *
   * @return  This dashboard
   */
  Dashboard.prototype.updateControllersString = function() {
    var self = this;
    self.controllers_string = '';

    self.forEachRowOrdered(function(row) {
      var row_controllers_string = row.getControllersString();
      if (row.getNumDisplays() !== 0) {
        self.controllers_string += row_controllers_string;
        self.controllers_string += '#';
      }
    });

    self.controllers_string = self.controllers_string.slice(0, -1);

    return self;
  };

  /**
   * Saves the controllers string to the user's setting.
   *
   * @return  This dashboard
   */
  Dashboard.prototype.saveControllersString = function() {
    if (this.controllers_string !== this.prev_controllers_string) {

      if (this.controllers_pref_id !== '') {

        this.prev_controllers_string = this.controllers_string;

        if (this.controllers_pref_request) {
          this.controllers_pref_request.abort();
        }

        this.controllers_pref_request = d3.xhr('/omp');

        var form_data = new FormData();
        form_data.append('chart_preference_id', this.controllers_pref_id);
        form_data.append('chart_preference_value', this.controllers_string);
        form_data.append('token', gsa.gsa_token);
        form_data.append('cmd', 'save_chart_preference');

        log.debug('saving dashboard controllers string');

        this.controllers_pref_request.post(form_data);
      }
    }
    return this;
  };

  /**
   * Updates the filters string of the dashboard using the ones of the rows.
   *
   * @return  This dashboard
   */
  Dashboard.prototype.updateFiltersString = function() {
    var self = this;
    self.filters_string = '';

    self.forEachRowOrdered(function(row) {
      var row_filters_string = row.getFiltersString();
      if (row.getNumDisplays() !== 0) {
        self.filters_string += row_filters_string;
        self.filters_string += '#';
      }
    });

    self.filters_string = this.filters_string.slice(0, -1);

    return this;
  };

  /**
   * Saves the filters string to the user's setting.
   *
   * @return  This dashboard
   */
  Dashboard.prototype.saveFiltersString = function() {
    if (this.filters_string !== this.prev_filters_string) {

      if (this.filters_pref_id !== '') {

        this.prev_filters_string = this.filters_string;

        if (this.filters_pref_request) {
          this.filters_pref_request.abort();
        }

        this.filters_pref_request = d3.xhr('/omp');

        var form_data = new FormData();
        form_data.append('chart_preference_id', this.filters_pref_id);
        form_data.append('chart_preference_value', this.filters_string);
        form_data.append('token', gsa.gsa_token);
        form_data.append('cmd', 'save_chart_preference');

        log.debug('saving dashboard filters string');

        this.filters_pref_request.post(form_data);
      }
    }
    return this;
  };

  /**
   * Updates the heights string of the dashboard from the containing rows
   *
   * @return  This dashboard
   */
  Dashboard.prototype.updateHeightsString =  function() {
    var self = this;
    this.heights_string = '';

    this.forEachRowOrdered(function(row) {
      if (row.getNumDisplays() !== 0) {
        var row_height = row.getHeight();
        self.heights_string += row_height;
        self.heights_string += '#';
      }
    });

    this.heights_string = this.heights_string.slice(0, -1);

    return this;
  };

  /**
   * Saves the heights string of the dashboard to the user's setting.
   *
   * @return  This dashboard
   */
  Dashboard.prototype.saveHeightsString = function() {
    if (this.heights_string !== this.prev_heights_string) {
      this.prev_heights_string = this.heights_string;

      if (this.heights_pref_id !== '' && gsa.has_value(this.heights_pref_id)) {
        if (this.heights_pref_request) {
          this.heights_pref_request.abort();
        }

        this.heights_pref_request = d3.xhr('/omp');

        var form_data = new FormData();
        form_data.append('chart_preference_id', this.heights_pref_id);
        form_data.append('chart_preference_value', this.heights_string);
        form_data.append('token', gsa.gsa_token);
        form_data.append('cmd', 'save_chart_preference');

        this.heights_pref_request.post(form_data);
      }
    }
    return this;
  };

  /**
   * Updates the filter, controllers and heights string and saves ithem to the
   * user's settings if they have changed
   *
   * @return  This dashboard
   */
  Dashboard.prototype.save = function() {
    if (this.hasFilterChanged()) {
      this.saveFilters();
    }
    if (this.hasControllerChanged()) {
      this.saveControllers();
    }
    if (this.hasHeightsChanged()) {
      this.saveHeights();
    }
    return this;
  };

  /**
   * Update the heights string and save it to the user's settings.
   *
   * @return  This dashboard
   */
  Dashboard.prototype.saveHeights = function() {
    this.updateHeightsString();
    this.saveHeightsString();
    this.heights_changed = false;
    return this;
  };

  /**
   * Update the controllers string and save it to the user's settings.
   *
   * @return  This dashboard
   */
  Dashboard.prototype.saveControllers = function() {
    this.updateControllersString();
    this.saveControllersString();
    this.controllers_changed = false;
    return this;
  };

  /**
   * Update the filters string and save it to the user's settings.
   *
   * @return  This dashboard
   */
  Dashboard.prototype.saveFilters = function() {
    this.updateFiltersString();
    this.saveFiltersString();
    this.filters_changed = false;
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

  /**
   * Initializes the Displays with the values in the displays string.
   *
   * @return  This dashboard
   */
  Dashboard.prototype.initDisplaysFromString = function() {

    var row_controllers_string_list = split_rows(this.controllers_string);
    var row_filters_string_list = split_rows(this.filters_string);
    var row_heights_list = split_rows(this.heights_string);

    for (var index in row_controllers_string_list) {
      var height = parseInt(row_heights_list[index]);
      if (isNaN(height)) {
        height = undefined;
      }

      this.addNewRow({
        row_controllers_string: row_controllers_string_list[index],
        row_filters_string: row_filters_string_list[index],
        height: height,
      });
    }
    return this;
  };

  /**
   * Rebuilds the displays (and rows) from controllers and filters string
   *
   * @return This dashboard
   */
  Dashboard.prototype.updateDisplaysFromString = function() {
    var self = this;
    var controllers_string_list = split_rows(this.controllers_string);
    var filters_string_list = split_rows(this.filters_string);
    var heights_list = split_rows(this.heights_string);

    log.debug('Update displays from string', controllers_string_list,
        filters_string_list, heights_list);

    var rows = [];
    self.forEachRowOrdered(function(row) {
      rows.push(row);
    });

    controllers_string_list.forEach(function(controllers_string, index) {
      var height = parseInt(heights_list[index]);
      if (isNaN(height)) {
        height = undefined;
      }
      if (index <= rows.length - 1) {
        rows[index].update(controllers_string, filters_string_list[index],
            height);
      }
      else {
        self.addNewRow({
          row_controllers_string: controllers_string,
          row_filters_string: filters_string_list[index],
          height: height,
        });
      }
    });
    if (rows.length > controllers_string_list.length) {
      rows.slice(controllers_string_list.length).forEach(function(row) {
        row.remove();
      });
    }
    return this;
  };

  /**
   * Returns true if any height of the rows has changed
   *
   * @return true if a height of a row has changed
   */
  Dashboard.prototype.hasHeightsChanged = function() {
    return this.heights_changed;
  };

  /**
   * Returns true if any controller of the rows has changed
   *
   * @return true if a controller of a row has changed
   */
  Dashboard.prototype.hasControllerChanged = function() {
    return this.controllers_changed;
  };

  /**
   * Returns true if any filter of the rows has changed
   *
   * @return true if a filter of a row has changed
   */
  Dashboard.prototype.hasFilterChanged = function() {
    return this.filters_changed;
  };

  /**
   * Returns true if a filter, controller or height has changed
   *
   * @return true if a filter, controller of height of a row has changed
   */
  Dashboard.prototype.hasChanged = function() {
    return this.hasHeightsChanged() || this.hasFilterChanged() ||
      this.hasControllerChanged();
  };

  /**
   * Resizes the dashboard and its rows
   *
   * @param height the new height if defined (optional)
   * @param width the new width if defined (optional)
   *
   * @return This dashboard
   */
  Dashboard.prototype.resize = function(height, width) {
    log.debug('resize dashboard', height, width);

    if (gsa.is_defined(width)) {
      this.width = width;
    }
    if (gsa.is_defined(height)) {
      this.height = height;
    }

    for (var item in this.rows) {
      this.rows[item].resize(undefined, this.width);
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
  Dashboard.prototype._allChanged = function() {
    this.filters_changed = true;
    this.controllers_changed = true;
    this.heights_changed = true;
    return this;
  };

  /**
   * Marks filters, controllers and heights as unchanged
   *
   * @return This Dashboard
   */
  Dashboard.prototype._allUnchanged = function() {
    this.filters_changed = false;
    this.controllers_changed = false;
    this.heights_changed = false;
    return this;
  };

  /* Dashboard row class */

  /**
   * Constructor for a new dashboard row.
   *
   * @constructor
   *
   * @param id                   The id of the row.
   * @param controllers_string   String listing the controllers to use.
   * @param filters_string       String listing the filters to use.
   * @param controller_factories Factories for ChartController
   * @param fiters               All filters as array
   * @param height               The initial height of the row
   * @param width                The initial width of the row
   * @param edit_mode            Whether to create the row in edit mode.
   * @param dashboard_opts       Dashboard options
   */
  function DashboardRow(id, controllers_string, filters_string,
      controller_factories, filters, height, width, edit_mode, dashboard_opts) {
    this.id = id;

    this.controller_factories = controller_factories;

    this.filters = filters;

    this.height = height;
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

    this._updateControllersStringList(controllers_string);
    this._updateFiltersStringList(filters_string);

    this.init();
  }

  // derive DashboardRow from EventNode
  DashboardRow.prototype = Object.create(EventNode.prototype);
  DashboardRow.prototype.constructor = DashboardRow;

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

    this.controller_string_list.forEach(function(controller_string, index) {
      self.createNewDisplay(controller_string, self.filter_string_list[index],
          self.controller_string_list.length);
    });

    this._updateCssClasses();
  };

  /**
   * Creates a new DashboardDisplay and adds it to this row
   *
   * @param controller_string Initial ChartController name for the new display
   * @param filter_string     Initial filter id for the new display
   * @param display_count     Expected number of displays in this row (optional)
   *
   * @return This row
   */
  DashboardRow.prototype.createNewDisplay = function(controller_string,
      filter_string, display_count) {

    var display = new DashboardDisplay(this._getNextDisplayId(),
        controller_string, filter_string, this.controller_factories,
        this.filters, this.edit_mode, this.height,
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
   * Returns the controllers string from the ones of the displays.
   *
   * @return  The controllers string.
   */
  DashboardRow.prototype.getControllersString = function() {
    var controllers_string = '';
    this.forEachDisplayOrdered(function(display) {
      controllers_string += display.getControllerString();
      controllers_string += '|';
    });
    return controllers_string.slice(0, -1);
  };

  /**
   * Returns the filters string from the ones of the displays.
   *
   * @return  The filters string.
   */
  DashboardRow.prototype.getFiltersString = function() {
    var filters_string = '';
    this.forEachDisplayOrdered(function(display) {
      filters_string += display.getFilterString();
      filters_string += '|';
    });
    return filters_string.slice(0, -1);
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
   * @param controllers_string   String listing the controllers to use.
   * @param filters_string       String listing the filters to use.
   * @param height               Height to set for this row.
   *
   * @return This row
   */
  DashboardRow.prototype.update = function(controllers_string, filters_string,
      height) {
    var self = this;

    this._updateControllersStringList(controllers_string);
    this._updateFiltersStringList(filters_string);

    var displays = [];
    self.forEachDisplayOrdered(function(display) {
      displays.push(display);
    });

    log.debug('Updating row ' + this.id, controllers_string, filters_string,
        height);

    this.controller_string_list.forEach(function(controller_string, index) {
      if (index <= displays.length - 1) {
        displays[index].update(controller_string,
            self.filter_string_list[index]);
      }
      else {
        self.createNewDisplay(controller_string,
            self.filter_string_list[index], self.controller_string_list.length);
      }
    });

    if (displays.length > this.controller_string_list.length) {
      displays.slice(this.controller_string_list.length).forEach(function(d) {
        d.remove();
      });
    }

    this._updateCssClasses();

    this.resize(height);
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
    return (this.width - 2) / count;
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

  DashboardRow.prototype._updateControllersStringList = function(
      controllers_string) {
    this.controller_string_list = split_elements(controllers_string);
    return this;
  };

  DashboardRow.prototype._updateFiltersStringList = function(filters_string) {
    this.filter_string_list = split_elements(filters_string);
    return this;
  };

  /* Chart display */

  /**
   * Constructor for a chart display box.
   *
   * @constructor
   *
   * @param id                   The id of the display.
   * @param controller_string    String name of the chart controllers to use.
   * @param filters_string       String id of the filters to use.
   * @param controller_factories Factories for ChartController
   * @param fiters               All filters as array
   * @param height               The initial height of the display
   * @param width                The initial width of the display
   * @param edit_mode            Whether to create the display in edit mode.
   * @param dashboard_opts       Dashboard options
   */
  function DashboardDisplay(id, controller_string, filter_string,
      controller_factories, filters, edit_mode, height, width, dashboard_opts) {
    this.id = id;
    this.controller_string = controller_string;
    this.filter_string = filter_string;
    this.height = gsa.is_defined(height) ? height : 200;
    this.width = gsa.is_defined(width) ? width : 450;
    this.last_height = this.height;
    this.last_width = this.width;

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
      if (controller_name === this.controller_string) {
        this.current_controller = new_controller;
      }
      this.controllers.push(new_controller);
    }

    this._updateCurrentFilter();
    this._updateFilters();

    this.init();
  }

  DashboardDisplay.prototype = Object.create(EventNode.prototype);
  DashboardDisplay.prototype.constructor = DashboardDisplay;

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
      'class': 'remove-button',
      href: 'javascript:void(0);',
      on: {
        click: function() { self.remove(); },
      },
      css: {
        'display': this.edit_mode ? 'inline' : 'none',
      }
    })
    .append($('<img/>', {
      src: '/img/delete.png',
      alt: gsa._('Remove'),
      title: gsa._('Remove'),
    }))
    .appendTo(this.top_buttons);

    this.header = $('<div/>', {
      'class': 'chart-head',
      id: this.id + '-head',
      text: gsa._('Initializing display for "{{display}}"...',
          {display: this.controller_string}),
    }).appendTo(inner_elem_d3);

    this.header = this.header[0];

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

    this.resize(); // will also request the data
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
    $(this.header).text(new_title);
    return this;
  };

  /**
   * Gets the title bar text of the display box.
   *
   * @return The text of the title bar
   */
  DashboardDisplay.prototype.getTitle = function() {
    return $(this.header).text();
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
   * @param controller_string Name of the new controller to use.
   * @param filter_string     ID of the new filter to use.
   *
   * @return This display
   */
  DashboardDisplay.prototype.update = function(controller_string,
      filter_string) {
    var changed = false;

    log.debug('Updating display ' + this.id, 'new controller:',
        controller_string, 'old controller:', this.controller_string,
        'new filter:', filter_string, 'old filter:', this.filter_string);

    if (controller_string !== this.current_controller.chart_name) {
      log.debug('Controller has changed');
      this.controller_string = controller_string;
      this._updateCurrentController();
      this._updateFilters(); // maybe unnecessary because it will be updated by new request
      changed = true;
    }

    if (filter_string !== this.current_filter.id) {
      log.debug('Filter has changed');
      this.filter_string = filter_string;
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
   * (Re-)sets the current controller from the controller string
   *
   * @return This display
   */
  DashboardDisplay.prototype._updateCurrentController = function() {
    var self = this;

    this.current_controller = this.controllers.find(function(controller) {
      return controller.chart_name === self.controller_string;
    });
    return this;
  };

  /**
   * (Re-)sets the current filter from the filter string
   *
   * @return This display
   */
  DashboardDisplay.prototype._updateCurrentFilter = function() {
    var self = this;

    this.current_filter = this.all_filters.find(function(filter, index) {
      return filter.type === null && !gsa.has_value(self.filter_string) ||
        filter.id === self.filter_string;
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
      this.filter_select_elem.html('');
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
      on: {
        click: function() {self.prevController();},
      }
    })
    .append($('<img/>', {
      src: 'img/previous.png',
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
      on: {
        click: function() {
          self.nextController();
        },
      },
    })
    .append($('<img/>', {
      src: 'img/next.png',
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
      on: {
        click: function() {
          self.prevFilter();
        },
      },
    })
    .append($('<img/>', {
      src: 'img/previous.png',
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
      on: {
        click: function() {
          self.nextFilter();
        },
      },
    })
    .append($('<img/>', {
      src: 'img/next.png',
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
      log.warn('No controller selected');
      return;
    }

    if (gsa.is_defined(this.last_request)) {
      this.last_request.controller.removeRequest(this.last_request.filter);
      this.last_request = undefined;
    }

    this.current_controller
        .addRequest(this.current_filter);

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
      return filter.type === null ||
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
   * @param icon            Icon to use for the chart // TODO: remove?
   * @param chart_type      The type of chart (bubble, donut, etc.).
   * @param chart_template  Special chart template to use.
   * @param gen_params      Parameters for the generator.
   * @param init_params     Parameters to init the chart controller.
   */
  function ChartController(chart_name, icon, chart_type, chart_template,
                           data_src, display, gen_params, init_params) {
    this.chart_name = chart_name;
    this.icon = icon ? icon : '/img/help.png';
    this.chart_type = chart_type;
    this.chart_template = chart_template ? chart_template : '';
    this.data_src = data_src;
    this.display = display;
    this.gen_params = gen_params;
    this.init_params = init_params;

    this.selector_label = get_selector_label(data_src.options.type,
                              chart_type, chart_template,
                              data_src.options.aggregate_type,
                              data_src.options.group_column,
                              init_params.title_text);

    this.title_generator = get_title_generator(data_src.options.type,
                              chart_type, chart_template,
                              data_src.options.aggregate_type,
                              data_src.options.group_column,
                              init_params.title_text);

    this.current_request = null;

    this.id = chart_name + '@' + display.id;

    this.generator = gch.new_chart_generator(this.chart_type);

    // TODO: Move title generator and style function calls.
    this.generator.setTitleGenerator(this.title_generator);

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
  ChartController.prototype.addRequest = function(filter, gen_params) {
    this.filter = filter;

    if (gen_params) {
      this.gen_params = gen_params;
    }

    if (!gsa.is_defined(this.gen_params)) {
      throw new Error('gen_params are undefined');
    }

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
   * @param xml_select  The xml data that was loaded.
   */
  ChartController.prototype.dataLoaded = function(xml_select) {
    var self = this;

    self.display.hideLoading();

    if (!self.generator.supportsCommand(self.data_src.command)) {
      log.error('Generator does not support command "' + self.data_src.command +
          '"', self.generator);
      return;
    }

    self.generator.evaluateParams(self.gen_params);

    var orig_data = self.generator.extractData(xml_select, self.gen_params);
    var data = self.generator.generateData(orig_data, self.gen_params);

    self.display.setTitle(self.generator.getTitle(data));
    self.generator.generate(self.display.svg, data, self.hasChanged());
    self.last_filter = self.filter;
    self.display.updateGenData(self.generator, self.gen_params);
    self.generator.addMenuItems(self, data);
  };

  /**
   * Generates a URL to a detached chart.
   *
   * @return The generated URL.
   */
  ChartController.prototype.getDetachedUrl = function() {
    var extra_params_str = '';
    var field;
    if (gsa.has_value(this.gen_params.no_chart_links)) {
      extra_params_str = extra_params_str + '&no_chart_links=' +
                          (this.gen_params.no_chart_links ? '1' : '0');
    }

    if (gsa.has_value(this.gen_params.x_field)) {
      extra_params_str = extra_params_str + '&x_field=' +
                          encodeURIComponent(this.gen_params.x_field);
    }
    if (gsa.has_value(this.gen_params.y_fields)) {
      for (field in this.gen_params.y_fields) {
        extra_params_str = extra_params_str + '&y_fields:' +
                            (1 + Number(field)) +
                            '=' +
                            encodeURIComponent(this.gen_params.y_fields[field]);
      }
    }
    if (gsa.has_value(this.gen_params.z_fields)) {
      for (field in this.gen_params.z_fields) {
        extra_params_str = extra_params_str + '&z_fields:' +
                            (1 + Number(field)) +
                            '=' +
                            encodeURIComponent(this.gen_params.z_fields[field]);
      }
    }
    var param;
    for (param in this.init_params) {
      extra_params_str = extra_params_str + '&chart_init:' +
                          encodeURIComponent(param) +
                          '=' +
                          encodeURIComponent(this.init_params[param]);
    }
    for (param in this.gen_params.extra) {
      extra_params_str = extra_params_str + '&chart_gen:' +
                          encodeURIComponent(param) +
                          '=' +
                          encodeURIComponent(this.gen_params.extra[param]);
    }

    var command = this.data_src.command;
    if (command !== 'get_aggregate') {
      command = encodeURIComponent(command) + '_chart';
    }

    return create_uri(command, this.display.getCurrentFilter(),
        this.data_src.params, this.data_src.prefix, true) +
      '&chart_type=' + encodeURIComponent(this.chart_type) +
      '&chart_template=' + encodeURIComponent(this.chart_template) +
      extra_params_str;
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
    this.xml_data = {};
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
    var self = this;
    var filter_id = filter ? filter.id : '';
    var controllers = this.requesting_controllers[filter_id];

    if (this.active_requests[filter_id]) {
      // we already have an request
      return;
    }
    else {
      var data_uri = create_uri(this.command, filter, this.params,
          this.prefix, false);

      var xml_select = this.xml_data[filter_id];
      if (xml_select) {
        // data has already been received once
        for (var controller_id in controllers) {
          if (!controllers[controller_id].active) {
            // controller already has received the requested data
            continue;
          }

          controllers[controller_id].active = false;
          controllers[controller_id].controller.dataLoaded(xml_select);
        }
        delete this.requesting_controllers[filter_id];
        return;
      }

      self.active_requests[filter_id] = d3.xml(data_uri, 'application/xml');
      self.active_requests[filter_id].get(
          function(error, xml) {
            var ctrls = controllers;
            var controller_id;
            var omp_status;
            var omp_status_text;

            if (error) {
              if (error instanceof XMLHttpRequest) {
                if (error.status === 0) {
                  for (controller_id in ctrls) {
                    self.outputError(ctrls[controller_id].controller,
                        gsa._('Loading aborted'));
                  }
                  return;
                }
                else {
                  if (error.status === 401) {
                    // not authorized (anymore)
                    // reload page to show login dialog
                    window.location.reload();
                    return;
                  }
                  for (controller_id in ctrls) {
                    self.outputError(ctrls[controller_id].controller,
                        gsa._('HTTP error {{error}}',
                          {error: error.status}),
                        gsa._('Error: HTTP request returned status ' +
                          '{{status}} for URL: {{url}}',
                          {status: error.status, url: self.data_uri}));
                  }
                  return;
                }
              }
              else {
                for (controller_id in ctrls) {
                  self.outputError(ctrls[controller_id].controller,
                      gsa._('Error reading XML'),
                      gsa._('Error reading XML from URL {{url}}: {{error}}',
                        {url: self.data_uri, error: error}));
                }
                return;
              }
            }
            else {
              var xml_select = d3.select(xml.documentElement);
              if (xml.documentElement.localName === 'parsererror') {
                for (controller_id in ctrls) {
                  self.outputError(ctrls[controller_id].controller,
                      gsa._('Error parsing XML data'),
                      gsa._('Error parsing XML data. Details: {{details}}' +
                        {details: xml.documentElement.textContent}));
                }
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
                for (controller_id in ctrls) {
                  self.outputError(ctrls[controller_id].controller,
                      gsa._('Internal error: Invalid request'),
                      gsa._('Invalid request command: "{{command}}',
                        {command: self.command}));
                }
                return self;
              }

              if (omp_status !== '200') {
                for (controller_id in ctrls) {
                  if (!ctrls[controller_id].active) {
                    continue;
                  }
                  self.outputError(ctrls[controller_id].controller,
                      gsa._('Error {{omp_status}}: {{omp_status_text}}',
                        {omp_status: omp_status,
                          omp_status_text: omp_status_text}),
                      gsa._('OMP Error {{omp_status}}: ' +
                        '{{omp_status_text}}',
                        {omp_status: omp_status,
                          omp_status_text: omp_status_text}));
                }
                return self;
              }

              self.xml_data[filter_id] = xml_select;

              for (controller_id in ctrls) {
                var ctrl = ctrls[controller_id];

                if (!ctrl.active) {
                  continue;
                }

                ctrl.active = false;
                ctrl.controller.dataLoaded(xml_select);
              }
              delete self.requesting_controllers[filter_id];
              delete self.active_requests[filter_id];
            }
          });
    }
  };

  DataSource.prototype.getParam = function(param_name) {
    return this.params[param_name];
  };

  /**
   * Prints an error to the console and shows it on the display of a chart.
   *
   * @param controller        Controller of the chart where the error occurred.
   * @param display_message   Short message to show on the display.
   * @param console_message   Longer message shown on the console.
   * @param console_extra     Extra debug info shown on the console.
   */
  DataSource.prototype.outputError = function(controller, display_message,
      console_message, console_extra) {
    if (gsa.is_defined(console_message)) {
      log.error(console_message);
    }
    if (gsa.is_defined(console_extra)) {
      log.debug(console_extra);
    }

    controller.showError(display_message);
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
      var dashboard_name = elem.data('dashboard-name');
      var max_components = gsa.is_defined(elem.data('max-components')) ?
        elem.data('max-components') : 8;
      var no_chart_links = gsa.is_defined(elem.data('no-chart-links')) ?
        !!(elem.data('no-chart-links')) : false;

      var dashboard = new gch.Dashboard(dashboard_name,
          elem.data('controllers'), elem.data('heights'),
          elem.data('filters-string'),
          {
            controllers_pref_id: elem.data('controllers-pref-id'),
            filters_pref_id: elem.data('filters-pref-id'),
            heights_pref_id: elem.data('heights-pref-id'),
            filter: elem.data('filter'),
            filt_id: elem.data('filter-id'),
            max_components: max_components,
            default_controller_string: elem.data('default-controller-string'),
            hide_controller_select: elem.data('hide-controller-select'),
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
          if (gsa.is_defined(chart_template)) {
            gen_params.chart_template = chart_template;
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

          var icon = '/img/charts/severity-bar-chart.png';

          dashboard.addControllerFactory(chart_name, function(for_display) {
            if (!gsa.is_defined(for_display)) {
              log.error('Display not defined');
              return null;
            }

            return new ChartController(chart_name, icon, chart_type,
                chart_template, data_source, for_display, gen_params,
                init_params);
          });
        });
      });

      gch.dashboards[dashboard_name] = dashboard;

      dashboard.initDisplaysFromString();

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
   * Creates a selector label.
   */
  function get_selector_label(type, chart_type, chart_template, aggregate_type,
      group_column, title_text) {

    if (title_text) {
      return title_text;
    }

    if (type === 'task') {
      return gsa._('Next scheduled tasks');
    }

    if (type === 'host') {
      return gsa._('Hosts topology');
    }

    if (chart_template === 'info_by_class' ||
        chart_template === 'recent_info_by_class') {
      if (group_column === 'average_severity') {
        return gsa._('{{resource_type_plural}} by average Severity Class',
            {
              resource_type_plural:
                gch.resource_type_name_plural(aggregate_type),
              interpolation: {escape: false}
            });
      }
      else {
        return gsa._('{{resource_type_plural}} by Severity Class',
            {
              resource_type_plural:
                gch.resource_type_name_plural(aggregate_type),
              interpolation: {escape: false}
            });
      }
    }

    if (chart_template === 'info_by_cvss' ||
        chart_template === 'recent_info_by_cvss') {
      if (group_column === 'average_severity') {
        return gsa._('{{resource_type_plural}} by average CVSS',
            {
              resource_type_plural:
                gch.resource_type_name_plural(aggregate_type),
              interpolation: {escape: false}
            });
      }
      else {
        return gsa._('{{resource_type_plural}} by CVSS',
            {
              resource_type_plural:
                gch.resource_type_name_plural(aggregate_type),
              interpolation: {escape: false}
            });
      }
    }

    if (chart_type === 'cloud') {
      return gsa._('{{resource_type_plural}} {{field_name}} word cloud',
          {
            resource_type_plural:
              gch.resource_type_name_plural(aggregate_type),
            field_name: gch.field_name(group_column),
            interpolation: {escape: false}
          });
    }

    return gsa._('{{resource_type_plural}} by {{field_name}}',
        {
          resource_type_plural:
            gch.resource_type_name_plural(aggregate_type),
          field_name: gch.field_name(group_column),
          interpolation: {escape: false},
        });
  }

  /**
   * Creates a title generator function.
   */
  function get_title_generator(type, chart_type, chart_template, aggregate_type,
      group_column, title_text) {

    if (title_text) {
      return gch.title_static(gsa._('{{title_text}} (Loading...)',
            {title_text: title_text}), title_text);
    }

    if (type === 'task') {
      return gch.title_static(gsa._('Next scheduled tasks (Loading...)'),
          gsa._('Next scheduled Tasks'));
    }

    if (type === 'host') {
      return gch.title_static(gsa._('Hosts topology  (Loading...)'),
                              gsa._('Hosts topology'));
    }

    if (chart_template === 'info_by_class' ||
        chart_template === 'info_by_cvss') {
      return gch.title_total(gsa._('{{resource_type_plural}} by {{field_name}}',
            {
              resource_type_plural:
                gch.resource_type_name_plural(aggregate_type),
              field_name: 'severity',
              interpolation: {escape: false},
            }), 'count');
    }

    if (chart_type === 'bubbles') {
      return gch.title_total(gsa._('{{resource_type_plural}} by {{field_name}}',
          {
            resource_type_plural:
              gch.resource_type_name_plural(aggregate_type),
            field_name: gch.field_name(group_column),
            interpolation: {escape: false},
          }), 'size_value');
    }

    if (chart_type === 'cloud') {
      var cloud_text = gsa._(
        '{{resource_type_plural}} {{field_name}} word cloud', {
        resource_type_plural:
          gch.resource_type_name_plural(aggregate_type),
        field_name: gch.field_name(group_column),
      });
      var cloud_text_loading = gsa._(
          '{{resource_type_plural}} {{field_name}} word cloud (Loading...)',
          {
            resource_type_plural:
              gch.resource_type_name_plural(aggregate_type),
            field_name: gch.field_name(group_column),
            interpolation: {escape: false}
          });
      return gch.title_static(cloud_text_loading, cloud_text);
    }

    return gch.title_total(gsa._('{{resource_type_plural}} by {{field_name}}',
          {
            resource_type_plural:
              gch.resource_type_name_plural(aggregate_type),
            field_name: gch.field_name(group_column),
            interpolation: {escape: false},
          }), 'count');
  }

  function split_rows(row_string) {
    return row_string ? row_string.split('#') : [];
  }

  function split_elements(elements_string) {
    return elements_string ? elements_string.split('|') : [];
  }

})(window, window, window.document, window.gsa, window.d3, window.$,
  window.console, window.Promise);
