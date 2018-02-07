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

import _ from 'gmp/locale.js';
import Logger from 'gmp/log.js';
import {is_defined} from 'gmp/utils';

import {
  data_raw,
  open_detached,
  svg_from_elem,
  blob_img_window,
  resource_type_counts,
  qod_type_counts,
  percentage_counts,
  data_severity_level_counts,
  data_severity_histogram,
  data_quantile_histogram,
} from '../helper.js';

const log = Logger.getLogger('web.components.dashboard.legacy.chart.base');

class BaseChartGenerator {

  constructor(name) {
    this.csv_url = undefined;
    this.html_table_data = undefined;
    this.html_table_url = undefined;
    this.svg_url = undefined;
    this.svg = undefined;

    this.setDataTransformFunc(data_raw);
    this.setName(name);
    this.init();
  }

  /**
   * Initializes a chart generator.
   */
  init() {
  }

  /**
   * Gets the name of a chart generator.
   *
   * @returns {String} The name of the chart generator
   */
  getName() {
    return this.name;
  }

  /**
   * Sets the name of a chart generator.
   *
   * @param {String} value   The new name.
   *
   * @returns This chart generator
   */
  setName(value) {
    this.name = value;
    return this;
  }

  /**
   * Generates a title for the chart.
   *
   * @param {Object} data  The current data.
   *
   * @returns {String} The title for this chart generator
   */
  getTitle(data) {
    return this.title_generator(data);
  }

  /**
   * Sets the title generator for a chart generator.
   *
   * @param {Function} value Set a new title generator
   *
   * @returns This chart generator
   */
  setTitleGenerator(value) {
    this.title_generator = value;
    return this;
  }

  /**
   * Sets the data transformation function of a chart generator.
   *
   * @param {Function} value   The new data transformation function.
   *
   * @returns This chart generator
   */
  setDataTransformFunc(value) {
    this.data_transform_func = value;

    if (!is_defined(value)) {
      log.warn('undefined setDataTransformFunc');
    }
    return this;
  }

  /**
   * Applies the data transformation function of a chart generator.
   *
   * @param {Object} original_data   The original data.
   * @param {Object} gen_params      Generator parameters.
   *
   * @return The transformed data.
   */
  transformData(original_data, gen_params) {
    return this.data_transform_func(original_data, gen_params);
  }

  /**
   * Extracts chart data from response data
   *
   * Child classes MUST implement this method. Per default it throws an error.
   *
   * @param {Object} data        JSON data from the response
   * @param {Object} gen_params  Generator parameters.
   */
  extractData(data, gen_params) {
    throw new Error('Not implemented');
  }

  /**
   * Generates the chart data from the original data by using the generator
   * params.
   *
   * Per default it calls transformData.
   *
   * @param {Object} original_data   The original data.
   * @param {Object} gen_params      Generator parameters.
   *
   * @return The chart data.
   */
  generateData(original_data, gen_params) {
    return this.transformData(original_data, gen_params);
  }

  generateLink(d, i, column, type, filter_info) {
  }

  generateCsvData(controller, data) {
    return undefined;
  }

  generateHtmlTableData(controller, data) {
    return undefined;
  }

  /**
   * Generates the chart from data, drawing it in a given display.
   *
   * @param {DashboardDisplay} display The display to draw in.
   * @param {Object}           data    The data to generate a chart for.
   * @param {Boolean}          update  True if data has changed since last rendering
   */
  generate(display, data, update) {
  }

  addMenuItems(controller, data) {
    this.addDetachedChartMenuItem(controller);

    // Generate CSV
    const csv_data = this.generateCsvData(controller, data);
    this.addCsvDownloadMenuItem(controller, csv_data);
    this.addHtmlTableMenuItem(controller);

    // Generate HTML table
    const html_table_data = this.generateHtmlTableData(controller, data);
    this.addHtmlTableMenuItem(controller, html_table_data);
    this.addSvgMenuItems(controller);
    return this;
  }

  addDetachedChartMenuItem(controller) {
    // Create detach menu item
    controller.display.createOrGetMenuItem('detach')
      .on('click', () => {
        open_detached(controller.getDetachedUrl());
      })
      .text(_('Show detached chart window'));
    return this;
  }

  addCsvDownloadMenuItem(controller, csv_data) {
    if (is_defined(this.csv_url)) {
      URL.revokeObjectURL(this.csv_url);
      this.csv_url = undefined;
    }

    const csv_blob = new Blob([csv_data], {type: 'text/csv'});

    this.csv_url = URL.createObjectURL(csv_blob);

    controller.display.createOrGetMenuItem('csv_dl')
      .attr('href', this.csv_url)
      .attr('download', 'gsa_' + this.getName() + '_chart-' +
        new Date().getTime() + '.csv')
      .text(_('Download CSV'));

    return this;
  }

  addHtmlTableMenuItem(controller, html_table_data) {
    const data = is_defined(html_table_data) ? html_table_data : '';

    if (is_defined(this.html_table_url)) {
      URL.revokeObjectURL(this.html_table_url);
      this.html_table_url = undefined;
    }

    const html_table_blob = new Blob([data], {type: 'text/html'});
    this.html_table_url = URL.createObjectURL(html_table_blob);

    controller.display.createOrGetMenuItem('html_table')
      .attr('href', '#')
      .on('click', () => {
        window.open(this.html_table_url);
        return true;
      })
      .text(_('Show HTML table'));

    return this;
  }

  addSvgMenuItems(controller) {
    const {display} = controller;

    const create_svg_url = () => {
      const svg_data = svg_from_elem(display.svg, display.getTitle());

      if (is_defined(this.svg_url)) {
        URL.revokeObjectURL(this.svg_url);
        this.svg_url = undefined;
      }

      const svg_blob = new Blob([svg_data], {type: 'image/svg+xml'});
      this.svg_url = URL.createObjectURL(svg_blob);
      return this.svg_url;
    };

    display.createOrGetMenuItem('svg_window')
      .on('click', () => {
        blob_img_window(create_svg_url());
      })
      .text(_('Show copyable SVG'));

    display.createOrGetMenuItem('svg_dl', true /* Last. */)
      .attr('download', 'gsa_' + this.getName() + '_chart-' +
        new Date().getTime() + '.svg')
      .on('click', function() {
        $(this).attr('href', create_svg_url());
      })
      .text(_('Download SVG'));
    return this;
  }

  setBarStyle(value) {
    this.bar_style = value;
    return this;
  }

  setColorScale(value) {
    this.color_scale = value;
    return this;
  }

  scaleColor(value) {
    const color = this.color_scale(value);
    return color === '#NaNNaNNaN' ?
      undefined : color;
  }

  evaluateParams(gen_params) {
    if (is_defined(gen_params.no_chart_links)) {
      this.no_chart_links = gen_params.no_chart_links;
    }
    if (gen_params.chart_template === 'resource_type_counts') {
      this.setDataTransformFunc(resource_type_counts);
    }
    else if (gen_params.chart_template === 'qod_type_counts') {
      this.setDataTransformFunc(qod_type_counts);
    }
    else if (gen_params.chart_template === 'percentage_counts') {
      this.setDataTransformFunc(percentage_counts);
    }
    else if (gen_params.chart_template === 'info_by_class' ||
      gen_params.chart_template === 'recent_info_by_class') {
      this.setDataTransformFunc(data_severity_level_counts);
    }
    else if (gen_params.chart_template === 'info_by_cvss' ||
      gen_params.chart_template === 'recent_info_by_cvss') {
      this.setDataTransformFunc(data_severity_histogram);
    }
    else if (gen_params.chart_template === 'quantile_histogram') {
      this.setDataTransformFunc(data_quantile_histogram);
    }
  }

  createGenerateLinkFunc(column, type, filter_info) {
    return (d, i) => {
      if (this.no_chart_links !== true) {
        return this.generateLink(d, i, column, type, filter_info);
      }
    };
  }

  supportsCommand(command) {
    return this.command === command;
  }
}

export default BaseChartGenerator;

// vim: set ts=2 sw=2 tw=80:
