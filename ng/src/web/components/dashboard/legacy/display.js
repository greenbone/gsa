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
import 'jquery-ui/ui/effects/effect-fade';

import 'select2';

import d3 from 'd3';

import _ from 'gmp/locale.js';
import Logger from 'gmp/log.js';
import {is_defined, has_value} from 'gmp/utils.js';

import {EMPTY_FILTER} from './helper.js';
import EventNode from './eventnode.js';

const log = Logger.getLogger('web.dashboard.legacy.dashboarddisplay');

class DashboardDisplay extends EventNode {

  constructor(id, config, controller_factories, filters, edit_mode, height,
    width, dashboard_opts) {
    super();

    const elem = $('<div/>', {
      class: 'dashboard-display',
      id,
    });

    this.elem = elem;
    this.id = id;
    this.height = is_defined(height) ? height : 200;
    this.width = is_defined(width) ? width : 450;
    this.last_height = this.height;
    this.last_width = this.width;

    this.setConfig(config);

    if (dashboard_opts) {
      if (is_defined(dashboard_opts.hide_controller_select)) {
        this.hide_controller_select = dashboard_opts.hide_controller_select;
      }
      if (is_defined(dashboard_opts.hide_filter_select)) {
        this.hide_filter_select = dashboard_opts.hide_filter_select;
      }
    }

    this.edit_mode = edit_mode;
    this.all_filters = filters || [EMPTY_FILTER];
    this.filters = [];
    this.controllers = [];
    this.onDataSourceChanged = this.onDataSourceChanged.bind(this);

    for (var controller_name in controller_factories) {
      var new_controller = controller_factories[controller_name](this);
      if (controller_name === this.config.name) {
        this._setCurrentController(new_controller);
      }
      this.controllers.push(new_controller);
    }

    this._updateCurrentFilter();
    this._updateFilters();
    this.init();
  }

  init() {
    this.elem.data('display', this); // add reference to this display. Allows access to it via the DOM

    var inner_elem_d3 = $('<div/>', {
      class: 'chart-box',
    }).appendTo(this.elem);

    this.menu = $('<li/>')
      .appendTo($('<ul/>')
      .appendTo($('<div/>', {
        id: 'chart_list',
      })
      .appendTo(inner_elem_d3)));

    $('<a/>', {
      id: 'section_list_first',
    }).appendTo(this.menu);

    this.menu = $('<ul/>', {
      id: this.id + '-menu',
    }).appendTo(this.menu);

    this.menu = this.menu[0];

    this.top_buttons = $('<div/>', {
      class: 'chart-top-buttons',
    }).appendTo(inner_elem_d3);

    $('<a/>', {
      class: 'remove-button icon icon-sm',
      on: {
        click: () => this.remove(),
      },
      css: {
        display: this.edit_mode ? 'inline' : 'none',
      },
    })
      .append($('<img/>', {
        src: '/img/delete.svg',
        alt: _('Remove'),
        title: _('Remove'),
      }))
      .appendTo(this.top_buttons);

    this.header = $('<div/>', {
      class: 'chart-head',
      id: this.id + '-head',
      text: _('Initializing display for "{{display}}"...',
        {display: this.config.name}),
    }).appendTo(inner_elem_d3);

    this.content = $('<div/>', {
      class: 'dashboard-display-content',
      id: this.id + '-content',
    }).appendTo(inner_elem_d3);

    this.content = this.content[0];

    this.loading = $('<div/>', {
      class: 'dashboard-loading',
    }).appendTo(this.content);

    this.loading.append($('<span/>', {
      class: 'ui-icon ui-icon-waiting',
    }));

    $('<span/>').text(_('Loading data ...')).appendTo(this.loading[0]);

    this.svg = d3.select(this.content)
      .append('svg')
      .attr('class', 'chart-svg')
      .attr('id', this.id + '-svg');

    this.footer = $('<div/>', {
      class: 'chart-foot',
      id: this.id + '-foot',
    }).appendTo(inner_elem_d3);

    this.footer = this.footer[0];

    this._createControllerSelector();
    this._createFilterSelector();
    this._applySelect2();
    this.resize(); // will also request the data
  }

  _setCurrentController(controller) {
    if (this.current_controller) {
      this.current_controller.off('data_source_changed');
    }
    this.current_controller = controller;

    if (this.current_controller) {
      this.current_controller.on('data_source_changed',
        this.onDataSourceChanged);
    }
  }

  /**
   * Gets a menu item or creates it if it does not exist.
   *
   * @param {String}  menu_item_id  Id of the menu item.
   * @param {Boolean} last          Whether to add the "last" class to the item.
   *
   * @returns New menu item element
   */
  createOrGetMenuItem(menu_item_id, last) {
    const menu_d3 = d3.select(this.menu);
    let item = menu_d3
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
  }

  /**
   * Updates the data on the last successful generator.
   * Should be called if a generator was successful.
   *
   * @param {Function} generator   The new generator.
   * @param {Object}   gen_params  The new generator parameters.
   *
   * @return This display
   */
  updateGenData(generator, gen_params) {
    this.last_generator = generator;
    this.last_gen_params = gen_params;
    return this;
  }

  /**
   * Removes a display. Triggers removed afterwards.
   *
   * @return This display
   */
  remove() {
    $(this.elem).hide('fade', {}, 250, () => {
      this.elem.data('display', null); // remove reference to the display
      this.elem.remove();
      this._trigger('removed', this);
    });
    return this;
  }

  /**
   * Sets the title bar text of the display box.
   *
   * @param {String} new_title   The new title text.
   *
   * @return This display
   */
  setTitle(new_title) {
    this.header.text(new_title);
    return this;
  }

  /**
   * Sets the config of the display
   *
   * @param {Object} config  The new config to set.
   *
   * @return This display
   */
  setConfig(config) {
    this.config = config || {name: '', filt_id: ''};
    return this;
  }

  /**
   * Gets the title bar text of the display box.
   *
   * @return The text of the title bar
   */
  getTitle() {
    return this.header.text();
  }

  /**
   * Shows the "Loading ..." text and icon.
   *
   * @return This display
   */
  showLoading() {
    $(this.loading).show();
    return this;
  }

  /**
   * Hides the "Loading ..." text and icon on a dashboard display.
   *
   * @return This display
   */
  hideLoading() {
    $(this.loading).hide();
    return this;
  }

  /**
   * Removes all svg content
   *
   * @return This display
   */
  clearSvg() {
    this.svg.selectAll('*').remove();
    return this;
  }

  /**
   * Enables edit mode for a dashboard display.
   *
   * @return This display
   */
  startEdit() {
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
  }

  /**
   * Disable edit mode for a dashboard display.
   *
   * @return This display
   */
  stopEdit() {
    this.edit_mode = false;
    this.top_buttons.children('.remove-button').hide();
    this.filter_select_container.hide();
    this.controller_select_container.hide();
    this.resize();
    return this;
  }

  /**
   * Resize the display
   *
   * @param {Number} height New height
   * @param {Number} width  New width
   *
   * @return This display
   */
  resize(height, width) {
    if (is_defined(width)) {
      this.width = width;
    }
    if (is_defined(height)) {
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
  }

  /**
   * Redraws the chart within the display
   *
   * @return This display
   */
  redraw() {
    log.debug('redraw display ' + this.id);
    this._requestNewChart();
    return this;
  }

  reload() {
    log.debug('reload display ', this.id);
    this._requestNewChart(true);
    return this;
  }

  /**
   * Returns the filter id of the current filter or an empty string if no
   * current filter is set
   *
   * @return Filter id of the current filter or ''
   *
   */
  getFilterString() {
    if (has_value(this.current_filter)) {
      return this.current_filter.id;
    }
    return '';
  }

  /**
   * Returns the chart name of the current controller or an empty string if no
   * current controller is set
   *
   * @return Chart name of the current controller or ''
   *
   */
  getControllerString() {
    if (has_value(this.current_controller)) {
      return this.current_controller.chart_name;
    }
    return '';
  }

  /**
   * Returns the current config object of this chart
   *
   * @return The current config of this chart
   *
   */
  getConfig() {
    return {
      type: 'chart',
      name: this.current_controller ? this.current_controller.chart_name : '',
      filt_id: this.current_filter ? this.current_filter.id : '',
    };
  }

  /**
   * Returns the controller for a chart name. If no controller could be found
   * undefined is returned
   *
   * @param {String} name Name of the chart
   *
   * @return The controller or undefined if not found
   */
  getController(name) {
    return this.controllers.find(controller =>
       controller.chart_name === name);
  }

  /**
   * Return the index of the current chart controller. If no controller is
   * applied -1 is returned.
   *
   * @return The index of the current applied filter
   */
  getCurrentControllerIndex() {
    if (!has_value(this.current_controller)) {
      return -1;
    }

    return this.controllers.findIndex(controller =>
      controller === this.current_controller
    );
  }

  /**
   * Return the index of the current filter. If no filter is applied -1 is
   * returned.
   *
   * @return The index of the current applied filter
   */
  getCurrentFilterIndex() {
    if (!has_value(this.current_filter)) {
      return -1;
    }

    return this.filters.findIndex(filter =>
      filter === this.current_filter
    );
  }

  /**
   * Returns the current set filter
   *
   * @return The currently applied filter
   *
   */
  getCurrentFilter() {
    return this.current_filter;
  }

  /**
   *
   * @return This display
   */
  prevController() {
    if (!this.edit_mode) {
      return this;
    }

    let index = this.getCurrentControllerIndex();
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
  }

  /**
   * Selects the next chart controller and updates the controller selection
   * element.
   *
   * @return This display
   */
  nextController() {
    if (!this.edit_mode) {
      return this;
    }

    let index = this.getCurrentControllerIndex();
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
  }

  /**
   * Selects the previous filter and updates the filter selection element.
   *
   * @return This display
   */
  prevFilter() {
    if (!this.edit_mode) {
      return this;
    }

    let index = this.getCurrentFilterIndex();

    if (index <= 0) {
      // use last filter
      index = this.filters.length;
    }
    index -= 1;

    this._selectFilter(index);
    this._updateFilterSelection(index);
    return this;
  }

  /**
   * Selects the next filter and updates the filter selection element.
   *
   * @return This display
   */
  nextFilter() {
    if (!this.edit_mode) {
      return this;
    }

    let index = this.getCurrentFilterIndex();
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
  }

  /**
   * Update this display to use new controller and/or filter. Data will be
   * reloaded if the controller and/or filter is changed.
   *
   * @param {Object} config New config to use.
   *
   * @return This display
   */
  update(config) {
    let changed = false;

    log.debug('Updating display ' + this.id, 'new config:', config,
      'old config:', this.config);

    this.setConfig(config);

    if (!is_defined(this.current_controller) ||
      this.config.name !== this.current_controller.chart_name) {

      log.debug('Controller has changed');

      this._updateCurrentController();
      this._updateFilters(); // maybe unnecessary because it will be updated by new request

      changed = true;
    }

    if (!is_defined(this.current_filter) ||
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
  }

  /**
   * Shows an error message text in the header of this display
   *
   * @param {String} message Message text to be displayed
   *
   * @return This display
   */
  showError(message) {
    this.setTitle(message);
    this.hideLoading();
    this.clearSvg();
    return this;
  }

  /**
   * (Re-)sets the current controller from the controller string
   *
   * @return This display
   */
  _updateCurrentController() {
    this._setCurrentController(this.controllers.find(controller =>
      controller.chart_name === this.config.name
    ));
    return this;
  }

  /**
   * (Re-)sets the current filter from the filter string
   *
   * @return This display
   */
  _updateCurrentFilter() {
    const {filt_id} = this.config;

    this.current_filter = this.all_filters.find((filter, index) =>
      (filter.type === null && !has_value(filt_id)) ||
        filter.id === filt_id
    );
    return this;
  }

  /**
   * Applies Select2 to the filter and controller select elements.
   *
   * @return This display
   */
  _applySelect2() {
    if (is_defined(this.controller_select_elem)) {
      this.controller_select_elem.select2();
    }
    if (is_defined(this.filter_select_elem)) {
      this.filter_select_elem.select2();
    }
    return this;
  }

  /**
   * Rebuilds the options in the filter selector
   *
   * @return This display
   */
  _rebuildFilterSelection() {
    if (is_defined(this.filter_select_elem)) {
      var select2_data = [];

      this.filters.forEach((filter, index) =>
        select2_data.push({id: index, text: filter.name})
      );

      this.filter_select_elem.find('*').remove();
      this.filter_select_elem.select2({data: select2_data});
    }
    return this;
  }

  /**
   * Selects the current controller for the display and starts a redraw
   * if the controller has changed. Also triggers a controller_changed event in
   * that case.
   *
   * @param {Number} index Index of the new controller.
   *
   * @return This display
   */
  _selectController(index) {
    let old_filter_type;
    const new_controller = this.controllers[index];

    if (is_defined(this.current_controller)) {
      old_filter_type = this.current_controller.data_src.filter_type;
    }

    if (!is_defined(new_controller)) {
      log.warn('No controller found for index "' + index + '"');
      return this;
    }

    if (this.current_controller !== new_controller) {
      this._setCurrentController(new_controller);

      if (new_controller.data_src.filter_type !== old_filter_type) {
        this._updateFilters();
        this._rebuildFilterSelection();
        this._selectFilter(); // select empty filter
      }

      this.redraw();
      this._trigger('controller_changed', this);
    }
    return this;
  }

  /**
   * Selects a controller for the display. If index is undefined the empty
   * filter (filter.type === null) is selected.
   *
   * If the filter has changed a redraw is
   * started. In that case also filter_changed is triggered.
   *
   * @param {Number} index Index of the new filter.
   *
   * @return This display
   */
  _selectFilter(index) {
    let new_filter;
    if (is_defined(index)) {
      new_filter = this.filters[index];
    }
    else {
      new_filter = this.filters.find(filter =>
        // find empty filter
        filter.type === null
      );
    }

    if (!is_defined(new_filter)) {
      log.warn('No filter found for index "' + index + '"');
      return this;
    }

    if (has_value(new_filter) && (!has_value(this.current_filter) ||
      new_filter !== this.current_filter)) {
      // filter has changed
      this.current_filter = new_filter;
      this.filter_string = new_filter.id;
      this.redraw();
      this._trigger('filter_changed', this);
    }
    return this;
  }

  /**
   * Adds chart selector elements to a dashboard display.
   *
   * @return This display
   */
  _createControllerSelector() {
    this.controller_select_container = $('<div/>').appendTo(this.footer);

    $('<a/>', {
      class: 'icon icon-sm',
      on: {
        click: () => this.prevController(),
      },
    })
      .append($('<img/>', {
        src: '/img/previous.svg',
        css: {
          'vertical-align': 'middle',
        },
      }))
      .appendTo(this.controller_select_container);

    const self = this;
    this.controller_select_elem = $('<select/>', {
      css: {
        'margin-left': '5px',
        'margin-right': '5px',
        'vertical-align': 'middle',
        width: '60%',
      },
      on: {
        change: function() {
          self._selectController(this.value);
        },
      },
    })
      .appendTo(this.controller_select_container);

    this.controllers.forEach((controller, index) => {
      $('<option/>', {
        value: index,
        selected: controller === this.current_controller,
        id: this.id + '_chart_opt_' + index,
        text: controller.selector_label,
      })
        .appendTo(this.controller_select_elem);
    });

    $('<a/>', {
      class: 'icon icon-sm',
      on: {
        click: () => this.nextController(),
      },
    })
      .append($('<img/>', {
        src: '/img/next.svg',
        css: {
          'vertical-align': 'middle',
        },
      }))
      .appendTo(this.controller_select_container);

    if (!this._showControllerSelect()) {
      this.controller_select_container.hide();
    }
    return this;
  }

  /**
   * Adds filter selector elements to a dashboard display.
   *
   * @return This display
   */
  _createFilterSelector() {
    this.filter_select_container = $('<div/>').appendTo(this.footer);

    $('<a/>', {
      class: 'icon icon-sm',
      on: {
        click: () => this.prevFilter(),
      },
    })
      .append($('<img/>', {
        src: '/img/previous.svg',
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
        width: '60%',
      },
      on: {
        change: () => this._selectFilter(this.value),
      },
    })
      .appendTo(this.filter_select_container);

    this.filters.forEach((filter, index) => {
      $('<option/>', {
        value: index,
        id: this.id + '_filter_opt_' + filter.id,
        text: filter.name,
        selected: filter === this.current_filter,
      })
        .appendTo(this.filter_select_elem);
    });

    $('<a/>', {
      class: 'icon icon-sm',
      on: {
        click: () => this.nextFilter(),
      },
    })
      .append($('<img/>', {
        src: '/img/next.svg',
        css: {
          'vertical-align': 'middle',
        },
      }))
      .appendTo(this.filter_select_container);

    if (!this._showFilterSelect()) {
      this.filter_select_container.hide();
    }
    return this;
  }

  /**
   * Requests a new chart.
   *
   * @param {Boolean} force_reload
   *
   * @return This display
   */
  _requestNewChart(force_reload) {
    if (!is_defined(this.current_controller)) {
      this.showError(_('Could not load chart {{chart}}',
        {chart: this.config.name}));
      log.error('No controller selected');
      return this;
    }

    if (is_defined(this.last_request)) {
      this.last_request.controller.removeRequest(this.last_request.filter);
      this.last_request = undefined;
    }

    this.current_controller.addRequest(this.current_filter, force_reload);
    this.last_request = {
      controller: this.current_controller,
      filter: this.current_filter,
    };
    return this;
  }

  /**
   * Updates the filter list for the current controller
   *
   * @return This display
   */
  _updateFilters() {
    if (!is_defined(this.current_controller)) {
      this.filters = [];
      return this;
    }

    this.filters = this.all_filters.filter(filter =>
      filter.type === null || filter.type === '' ||
      filter.type === this.current_controller.data_src.filter_type
    );
    return this;
  }

  /**
   * Returns whether the filter selection element should be shown
   *
   * @return true if the filter selection should be shown
   */
  _showFilterSelect() {
    return !this.hide_filter_select && this.edit_mode;
  }

  /**
   * Returns whether the controller selection element should be shown
   *
   * @return true if the controller selection should be shown
   */
  _showControllerSelect() {
    return !this.hide_controller_select && this.edit_mode;
  }

  /**
   * Update the selected filter in the filter select element without triggering
   * a filter changed event
   *
   * @param {Number} index Index to set in the filter selection element. If index is
   *                       undefined the current filter will be selected.
   *
   * @return This display
   */
  _updateFilterSelection(index) {
    if (!is_defined(index)) {
      index = this.filters.findIndex(filter =>
        (filter.type === null && !has_value(this.filter_string)) ||
        filter.id === this.current_filter.id
      );
    }

    log.debug('Update filter selection to index', index);
    // don't trigger select change event only update the selected value
    this.filter_select_elem.val(index);
    this.filter_select_elem.trigger('change.select2');
    return this;
  }

  onDataSourceChanged() {
    log.debug('data source changed', this.id);
    this.redraw();
  };
}

export default DashboardDisplay;

// vim: set ts=2 sw=2 tw=80:
