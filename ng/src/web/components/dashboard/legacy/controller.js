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
import logger from 'gmp/log.js';
import {has_value, is_defined, is_function, is_object} from 'gmp/utils.js';

import {create_uri, get_title_generator} from './helper.js';

import EventNode from './eventnode.js';

const log = logger.getLogger('web.dashboard.legacy.controller');

const chart_generators = {};

/**
 * Creates a new chart generator of a given type,
 *
 * @param {String} chart_type  The chart type.
 *
 * @returns {Function} The chart generator
 */
export const new_chart_generator = chart_type => {
  const Generator = get_chart_generator(chart_type);
  if (is_function(Generator)) {
    return new Generator();
  }
  return Generator;
};

/**
 * Gets a chart generator of a given type.
 *
 * @param {String} chart_type  The chart type.
 *
 * @returns {Function} The chart generator
 */
export const get_chart_generator = chart_type => {
  const Generator = chart_generators[chart_type];
  if (!is_defined(Generator)) {
    log.warn('Could not find chart generator for', chart_type);
    return undefined;
  }
  return Generator;
};

/**
 * Registers a chart generator class for a given type.
 *
 * @param {String}   chart_type  The chart type.
 * @param {Function} generator   The generator constructor.
 */
export const register_chart_generator = (chart_type, generator) => {
  chart_generators[chart_type] = generator;
};

class ChartController extends EventNode {

  constructor(chart_name, chart_type, options = {}) {
    super();
    const {
      template,
      title,
      datasource,
      display,
      count_field,
      gen_params,
      init_params,
    } = options;

    this.chart_name = chart_name;
    this.chart_type = chart_type;
    this.chart_template = is_defined(template) ? template : '';
    this.data_src = datasource;
    this.display = display;
    this.gen_params = is_object(gen_params) ? gen_params : {};
    this.gen_params.chart_template = this.chart_template;
    this.init_params = is_object(init_params) ? init_params : {};
    this.selector_label = title;
    this.id = chart_name + '@' + display.id;
    this.generator = new_chart_generator(this.chart_type);
    this.generator.setTitleGenerator(get_title_generator(title, count_field));

    this.data_src.on('changed', () => {
      this._trigger('data_source_changed');
    });
  }

  /* Delegates a data request to the data source */
  addRequest(filter, force_reload) {
    this.filter = filter;

    if (this.hasChanged()) {
      this.showLoading();
    }
    this.data_src.addRequest(this, this.filter, this.gen_params, force_reload);
  }

  removeRequest(filter) {
    this.data_src.removeRequest(this, filter);
    return this;
  }

  /**
   * Shows the "Loading ..." text in the display.
   */
  showLoading() {
    this.display.clearSvg();
    this.display.setTitle(this.generator.getTitle());
    this.display.showLoading();
  }

  /**
   * Shows an error message in the display.
   *
   * @param {String} message  The error message to show.
   *
   * @returns {DashboardDisplay}
   */
  showError(message) {
    return this.display.showError(message);
  }

  hasGeneratorChanged() {
    return this.display.last_generator !== this.generator;
  }

  hasFilterChanged() {
    return this.last_filter !== this.filter;
  }

  hasChanged() {
    return this.hasGeneratorChanged() || this.hasFilterChanged();
  }

  /**
   * Callback for when data is loaded.
   *
   * @param {Object} data  The data that was loaded.
   */
  dataLoaded(data) {
    this.display.hideLoading();

    if (!this.generator.supportsCommand(this.data_src.command)) {
      log.error('Generator does not support command "' + this.data_src.command +
        '"', this.generator);
      return;
    }

    this.generator.evaluateParams(this.gen_params);

    const orig_data = this.generator.extractData(data, this.gen_params);
    const chart_data = this.generator.generateData(orig_data, this.gen_params);

    this.display.setTitle(this.generator.getTitle(chart_data));

    this.generator.generate(this.display.svg, chart_data, this.hasChanged());

    this.last_filter = this.filter;

    this.display.updateGenData(this.generator, this.gen_params);
    this.generator.addMenuItems(this, chart_data);
  }

  /**
   * Generates a URL to a detached chart.
   *
   * @return The generated URL.
   */
  getDetachedUrl() {
    const params = {...this.data_src.params};

    if (has_value(this.gen_params.no_chart_links)) {
      params.no_chart_links = this.gen_params.no_chart_links ? '1' : '0';
    }

    if (has_value(this.gen_params.x_field)) {
      params.x_field = this.gen_params.x_field;
    }

    if (has_value(this.gen_params.y_fields)) {
      for (const field in this.gen_params.y_fields) {
        params['y_fields:' + (1 + Number(field))] =
          this.gen_params.y_fields[field];
      }
    }

    if (has_value(this.gen_params.z_fields)) {
      for (const field in this.gen_params.z_fields) {
        params['z_fields:' + (1 + Number(field))] =
          this.gen_params.z_fields[field];
      }
    }
    for (const param in this.init_params) {
      params['chart_init:' + encodeURIComponent(param)] =
        this.init_params[param];
    }

    if (is_defined(this.gen_params.extra)) {
      for (const param in this.gen_params.extra) {
        params['chart_gen:' + encodeURIComponent(param)] =
          this.gen_params.extra[param];
      }
    }
    let {command} = this.data_src;
    command = command === 'get_aggregate' ? command : command + '_chart';
    params.chart_type = this.chart_type;
    params.chart_template = this.chart_template;
    params.chart_title = this.display.getTitle();
    return create_uri(command, this.data_src.token,
      this.display.getCurrentFilter(), params, this.data_src.prefix, true);
  }
}

export default ChartController;

// vim: set ts=2 sw=2 tw=80:
