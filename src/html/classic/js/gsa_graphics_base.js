/*
 * Greenbone Security Assistant
 * $Id$
 * Description: Base JavaScript for graphics in GSA.
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2014 - 2016 Greenbone Networks GmbH
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

(function(global, window, document, gsa, d3, $, console) {
  'use strict';
  if (!gsa.is_defined(gsa.charts)) {
    gsa.charts = {};
  }
  var gch = gsa.charts;

  gch.BaseChartGenerator = BaseChartGenerator;
  gch.AggregateChartGenerator = AggregateChartGenerator;
  gch.TaskChartGenerator = TaskChartGenerator;
  gch.AssetChartGenerator = AssetChartGenerator;

  /* Base class for chart generators */

  /**
   * Constructor for a chart gererator.
   *
   * @param name  Name of the generator.
   */
  function BaseChartGenerator(name) {
    this.csv_url = null;

    this.html_table_data = null;
    this.html_table_url = null;

    this.svg_url = null;
    this.svg = null;

    this.setDataTransformFunc(gch.data_raw);
    this.setName(name);

    this.init();
  }

  /**
   * Initializes a chart generator.
   */
  BaseChartGenerator.prototype.init = function() {
  };

  /**
   * Gets the name of a chart generator.
   */
  BaseChartGenerator.prototype.getName = function() {
    return this.name;
  };

  /**
   * Sets the name of a chart generator.
   *
   * @param value   The new name.
   */
  BaseChartGenerator.prototype.setName = function(value) {
    this.name = value;
    return this;
  };

  /**
   * Generates a title for the chart.
   *
   * @param data  The current data.
   */
  BaseChartGenerator.prototype.getTitle = function(data) {
    return this.title_generator(data);
  };

  /**
   * Sets the title generator for a chart generator.
   */
  BaseChartGenerator.prototype.setTitleGenerator = function(value) {
    this.title_generator = value;
    return this;
  };

  /**
   * Sets the data transformation function of a chart generator.
   *
   * @param value   The new data transformation function.
   */
  BaseChartGenerator.prototype.setDataTransformFunc = function(value) {
    this.data_transform_func = value;
    if (!gsa.is_defined(value)) {
      console.warn('undefined setDataTransformFunc');
    }
    return this;
  };

  /**
   * Applies the data transformation function of a chart generator.
   *
   * @param original_data   The original data.
   * @param gen_params      Generator parameters.
   *
   * @return The transformed data.
   */
  BaseChartGenerator.prototype.transformData = function(original_data,
      gen_params) {
    return this.data_transform_func(original_data, gen_params);
  };

  /**
   * Extracts chart data from response data
   *
   * Child classes MUST implement this method. Per default it throws an error.
   *
   * @param data        JSON data from the response
   * @param gen_params  Generator parameters.
   *
   * @return Must return an object which represents the original data
   */
  BaseChartGenerator.prototype.extractData = function(data, gen_params) {
    throw new Error('Not implemented');
  };

  /**
   * Generates the chart data from the original data by using the generator
   * params.
   *
   * Per default it calls transformData.
   *
   * @param original_data   The original data.
   * @param gen_params      Generator parameters.
   *
   * @return The chart data.
   */
  BaseChartGenerator.prototype.generateData = function(original_data,
      gen_params) {
    return this.transformData(original_data, gen_params);
  };

  BaseChartGenerator.prototype.generateLink = function(d, i, column, type,
      filter_info) {
  };

  BaseChartGenerator.prototype.generateCsvData = function(controller, data) {
    return null;
  };

  BaseChartGenerator.prototype.generateHtmlTableData = function(controller,
      data) {
    return null;
  };

  /**
   * Generates the chart from data, drawing it in a given display.
   *
   * @param display   The display to draw in.
   * @param data      The data to generate a chart for.
   */
  BaseChartGenerator.prototype.generate = function(display, data) {
  };

  BaseChartGenerator.prototype.addMenuItems = function(controller, data) {
    this.addDetachedChartMenuItem(controller);

    // Generate CSV
    var csv_data = this.generateCsvData(controller, data);
    this.addCsvDownloadMenuItem(controller, csv_data);
    this.addHtmlTableMenuItem(controller);

    // Generate HTML table
    var html_table_data = this.generateHtmlTableData(controller, data);
    this.addHtmlTableMenuItem(controller, html_table_data);

    this.addSvgMenuItems(controller);
    return this;
  };

  BaseChartGenerator.prototype.addDetachedChartMenuItem = function(controller) {
    // Create detach menu item
    controller.display.createOrGetMenuItem('detach')
      .attr('href', 'javascript:void(0);')
      .on('click', function() {
        gch.open_detached(controller.getDetachedUrl());
      })
      .text(gsa._('Show detached chart window'));
    return this;
  };

  BaseChartGenerator.prototype.addCsvDownloadMenuItem = function(controller,
      csv_data) {
    if (this.csv_url !== null) {
      URL.revokeObjectURL(this.csv_url);
    }

    var csv_blob = new Blob([csv_data], {type: 'text/csv'});
    this.csv_url = URL.createObjectURL(csv_blob);

    controller.display.createOrGetMenuItem('csv_dl')
      .attr('href', this.csv_url)
      .attr('download', 'gsa_' + this.getName() + '_chart-' +
          new Date().getTime() + '.csv')
      .text(gsa._('Download CSV'));
    return this;
  };

  BaseChartGenerator.prototype.addHtmlTableMenuItem = function(controller,
      html_table_data) {
    var self = this;
    var data = gsa.is_defined (html_table_data) ? html_table_data : "";

    if (this.html_table_url !== null) {
      URL.revokeObjectURL(this.html_table_url);
      this.html_table_url = null;
    }

    var html_table_blob = new Blob([data],
        {type: 'text/html'});
    this.html_table_url = URL.createObjectURL(html_table_blob);

    controller.display.createOrGetMenuItem('html_table')
      .attr('href', '#')
      .on('click', function() {
        window.open(self.html_table_url);
        return true;
      })
      .text(gsa._('Show HTML table'));
    return this;
  };

  BaseChartGenerator.prototype.addSvgMenuItems = function(controller) {
    var self = this;
    var display = controller.display;

    function create_svg_url() {
      var svg_data = gch.svg_from_elem(display.svg, display.getTitle());

      if (self.svg_url !== null) {
        URL.revokeObjectURL(self.svg_url);
      }
      var svg_blob = new Blob([svg_data], {type: 'image/svg+xml'});
      self.svg_url = URL.createObjectURL(svg_blob);
      return self.svg_url;
    }

    display.createOrGetMenuItem('svg_window')
      .attr('href', 'javascript:void(0)')
      .on('click', function() {
        gch.blob_img_window(create_svg_url());
      })
      .text(gsa._('Show copyable SVG'));

    display.createOrGetMenuItem('svg_dl', true /* Last. */)
      .attr('download', 'gsa_' + self.getName() + '_chart-' +
          new Date().getTime() + '.svg')
      .on('click', function() {
        $(this).attr('href', create_svg_url());
      })
      .text(gsa._('Download SVG'));
    return this;
  };

  BaseChartGenerator.prototype.setBarStyle = function(value) {
    this.bar_style = value;
    return this;
  };

  BaseChartGenerator.prototype.setColorScale = function(value) {
    this.color_scale = value;
    return this;
  };

  BaseChartGenerator.prototype.scaleColor = function(value) {
    var color = this.color_scale(value);
    if (color === '#NaNNaNNaN') {
      return undefined;
    } else {
      return color;
    }
  };

  BaseChartGenerator.prototype.evaluateParams = function(gen_params) {
    if (gsa.is_defined(gen_params.no_chart_links)) {
      this.no_chart_links = gen_params.no_chart_links;
    }

    if (gen_params.chart_template === 'resource_type_counts') {
      this.setDataTransformFunc(gch.resource_type_counts);
    }
    else if (gen_params.chart_template === 'qod_type_counts') {
      this.setDataTransformFunc(gch.qod_type_counts);
    }
    else if (gen_params.chart_template === 'percentage_counts') {
      this.setDataTransformFunc(gch.percentage_counts);
    }
    else if (gen_params.chart_template === 'info_by_class' ||
        gen_params.chart_template === 'recent_info_by_class') {
      this.setDataTransformFunc(gch.data_severity_level_counts);
    }
    else if (gen_params.chart_template === 'info_by_cvss' ||
        gen_params.chart_template === 'recent_info_by_cvss') {
      this.setDataTransformFunc(gch.data_severity_histogram);
    }
  };

  BaseChartGenerator.prototype.createGenerateLinkFunc = function(column, type,
      filter_info) {
    var self = this;
    return function(d, i) {
      if (self.no_chart_links !== true) {
        return self.generateLink(d, i, column, type, filter_info);
      }
    };
  };

  BaseChartGenerator.prototype.supportsCommand = function(command) {
    return this.command === command;
  };

  function AggregateChartGenerator(name) {
    BaseChartGenerator.call(this, name);
    this.command = 'get_aggregate';
  }

  gsa.derive(AggregateChartGenerator, BaseChartGenerator);

  AggregateChartGenerator.prototype.extractData = function(data, gen_params) {
    var response = data.get_aggregate.get_aggregates_response;
    var aggregate = response.aggregate;
    var column_info = gch.extract_column_info_json(aggregate, gen_params);
    var records = gch.extract_simple_records_json(aggregate.group);
    var filter_info = gch.extract_filter_info_json(response.filters);
    return {
      records: records,
      column_info: column_info,
      filter_info: filter_info,
    };
  };

  function TaskChartGenerator(name) {
    BaseChartGenerator.call(this, name);
    this.command = 'get_tasks';
  }

  gsa.derive(TaskChartGenerator, BaseChartGenerator);

  TaskChartGenerator.prototype.extractData = function(data, gen_params) {
    var response = data.get_tasks.get_tasks_response;
    var records = gch.extract_task_records_json(response);
    return {
      records: records,
      column_info: gch.tasks_column_info(),
      filter_info: gch.extract_filter_info_json(response.filters)
    };
  };

  function AssetChartGenerator(name) {
    BaseChartGenerator.call(this, name);
    this.command = 'get_assets';
  }

  gsa.derive(AssetChartGenerator, BaseChartGenerator);

  AssetChartGenerator.prototype.extractData = function(data, gen_params) {
    var response = data.get_assets.get_assets_response;
    return {
      topology: gch.extract_host_topology_data_json(response),
      filter_info: gch.extract_filter_info_json(response.filters)
    };
  };

})(window, window, window.document, window.gsa, window.d3, window.$,
  window.console);

// vim: set ts=2 sw=2 tw=80:
