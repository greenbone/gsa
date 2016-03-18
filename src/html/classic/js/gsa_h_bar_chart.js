/*
 * Greenbone Security Assistant
 * $Id$
 * Description: Horizontal bar chart in GSA.
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2015 Greenbone Networks GmbH
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

(function(global, window, d3, console, gsa) {
  'use strict';

  gsa.register_chart_generator('horizontal_bar',
      create_new_h_bar_chart_generator);

  function create_new_h_bar_chart_generator() {
    return new HorizontalBarChartGenerator();
  }

  /*
  * Transform data into a top 10 list.
  */
  function data_top_list(old_data, params) {
    var new_data = {
      original_xml: old_data.original_xml,
      records: [],
      column_info: old_data.column_info,
      filter_info: old_data.filter_info
    };

    var y_field = params.y_fields[0];
    if (y_field === null || y_field === undefined) {
      y_field = 'count';
    }

    // Take only top 10 records with non-zero y field
    var top_count = 10;
    for (var i in old_data.records) {
      if (top_count) {
        if (old_data.records [i][y_field] > 0) {
          top_count--;
          new_data.records.push(old_data.records[i]);
        }
      }
      else {
        break;
      }
    }

    return new_data;
  }

  function HorizontalBarChartGenerator() {
    gsa.BaseChartGenerator.call(this, 'h_bar');
  }

  HorizontalBarChartGenerator.prototype = Object.create(
      gsa.BaseChartGenerator.prototype);
  HorizontalBarChartGenerator.prototype.constructor =
    HorizontalBarChartGenerator;

  HorizontalBarChartGenerator.prototype.init = function() {
    this.margin = {top: 40, right: 30, bottom: 40, left: 175};

    this.x_label = '';
    this.y_label = '';

    this.x_field = 'value';
    this.y_field = 'count'; // == size_field

    this.show_stat_type = true;

    this.x_scale = d3.scale.ordinal();
    this.y_scale = d3.scale.linear(); // == size_scale

    this.x_axis = d3.svg.axis()
      .scale(this.x_scale)
      .tickSize(0)
      .orient('left');

    this.y_axis = d3.svg.axis() // == size_axis
      .scale(this.y_scale)
      .ticks(5)
      .orient('bottom');

    this.setDataTransformFunc(data_top_list);
    this.setBarStyle(gsa.severity_bar_style('severity_max',
      gsa.severity_levels.max_log,
      gsa.severity_levels.max_low,
      gsa.severity_levels.max_medium));
    this.setTitleGenerator(gsa.title_static(
      gsa._('Loading bar chart ...'), gsa._('Bar Chart')));
  };

  HorizontalBarChartGenerator.prototype.generate = function(original_data,
      controller, gen_params) {
    var display = controller.display();
    var update = this.mustUpdate(display);

    var self = this;
    var data;
    var x_data;
    var y_data; // == size_data

    var empty_text;

    // evaluate options set by gen_params
    if (gen_params.x_field) {
      this.x_field = gen_params.x_field;
    }

    if (gen_params.y_fields && gen_params.y_fields[0]) {
      this.y_field = gen_params.y_fields[0];
    }

    if (gen_params.extra.show_stat_type) {
      this.show_stat_type = !!JSON.parse(gen_params.extra.show_stat_type);
    }

    data = this.generateData(original_data, controller, gen_params);
    if (data === null) {
      return;
    }

    if (gen_params.extra.empty_text) {
      empty_text = gen_params.extra.empty_text;
    }
    else {
      empty_text = gsa._('No matching {{resource_type}}',
          gsa.resource_type_name(data.column_info.columns[this.x_field].type));
    }

    display.setTitle(this.title_generator(data));

    var records = data.records;
    x_data = records.map(function(d) { return d[this.x_field]; });
    y_data = records.map(function(d) { return d[this.y_field]; });

    var i;
    var y_sum = 0;
    for (i in y_data) {
      y_sum += y_data[i];
    }

    var y_max = Math.max.apply(null, y_data); // == size_max

    // Adjust margin to labels
    var max_len = 0;
    for (i in x_data) {
      var len = x_data[i].toString().length;
      if (len > max_len) {
        max_len = len;
      }
    }

    this.margin.left = this.margin.right + Math.min(25, max_len) * 6.5;

    // Setup display parameters
    var height = display.svg().attr('height') - this.margin.top -
      this.margin.bottom;
    var width = display.svg().attr('width') - this.margin.left -
      this.margin.right;

    this.x_scale.rangeRoundBands([0, height], 0.125);
    this.y_scale.range([0, width]);

    var x_data_abbreviated = [];
    for (var d_index in x_data) {
      if (x_data[d_index].length > 25) {
        x_data_abbreviated[d_index] = x_data[d_index].slice(0, 25) + '…';
      }
      else {
        x_data_abbreviated[d_index] = x_data[d_index];
      }
    }

    this.x_scale.domain(x_data_abbreviated);
    this.y_scale.domain([0, y_max]).nice(10);

    if (!update) {
      display.svg().text('');
      this.svg = display.svg().append('g');

      display.svg().on('mousemove', null);
      display.svg().on('mouseleave', null);

      this.svg.attr('transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')');

      this.x_axis_elem = this.svg.append('g')
        .attr('class', 'x axis')
        .call(this.x_axis);

      this.y_axis_elem = this.svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(this.y_axis);

      this.tip = d3.tip()
        .attr('class', 'd3-tip')
        .style('font-weight', 'normal')
        .offset([-10, 0])
        .html(function(d) {
          var x;
          if (d[self.x_field + '~long']) {
            x = d[self.x_field + '~long'];
          }
          else {
            x = d[self.x_field];
          }

          if (self.y_field === 'count') {
            if (self.y_label !== '') {
              return '<strong>' + self.y_label + ' (' + x +
                  '):</strong><br/> ' + d[self.y_field] + ' (' +
                  (100 * d[self.y_field] / y_sum).toFixed(1) + '%)';
            }
            else {
              return '<strong>' + x + ':</strong><br/> ' + d[self.y_field] +
                ' (' + (100 * d[self.y_field] / y_sum).toFixed(1) + '%)';
            }
          }
          else {
            if (self.y_label !== '') {
              return '<strong>' + self.y_label + ' (' + x +
                '):</strong><br/> ' + d[self.y_field] + ' (' +
                  (100 * d[self.y_field] / y_max).toFixed(1) + '%)';
            }
            else {
              return '<strong>' + x + ':</strong><br/> ' + d[self.y_field] +
                ' (' + (100 * d[self.y_field] / y_max).toFixed(1) + '%)';
            }
          }
        });
    }

    // Add a text if records list is empty
    var dummy_data = [];
    if (records.length === 0) {
      dummy_data.push('dummy');
    }

    // Text if record set is empty
    this.svg.selectAll('.empty_text')
      .data(dummy_data)
      .enter().insert('text')
      .attr('class', 'empty_text')
      .style('dominant-baseline', 'middle')
      .style('text-anchor', 'middle')
      .text(empty_text);

    this.svg.selectAll('.empty_text')
      .data(dummy_data)
      .exit()
      .remove();

    this.svg.selectAll('.empty_text')
      .data(dummy_data)
      .attr('x', width / 2)
      .attr('y', height / 2);

    // Add new bars
    this.svg.selectAll('.bar')
      .data(records)
      .enter().insert('rect', '.x.axis')
      .attr('class', 'bar')
      .attr('x', this.y_scale(0))
      .attr('y', function(d) { return self.x_scale(d[self.x_field]); })
      .attr('width', 0)
      .attr('height', function(d) { return self.x_scale.rangeBand(); })
      .on('mouseover', this.tip.show)
      .on('mouseout', this.tip.hide);

    // Update bar heights and x axis
    this.svg.selectAll('.bar')
      .data(records)
      .transition().delay(0).duration(250).ease('sin-in-out')
      .attr('y', function(d) { return self.x_scale(d[self.x_field]); })
      .attr('height', self.x_scale.rangeBand());

    this.x_axis_elem
      .transition()
      .delay(0)
      .duration(125)
      .ease('sin-in-out')
      .call(this.x_axis);

    // Update widths and size axis
    this.svg.selectAll('.bar')
      .data(records)
      .transition().delay(500).duration(250).ease('sin-in-out')
      .attr('width', function(d) { return self.y_scale(d[self.y_field]); })
      .attr('style', this.bar_style);

    this.y_axis_elem
      .attr('transform', 'translate(0,' + height + ')')
      .transition()
      .delay(0)
      .duration(125)
      .ease('sin-in-out')
      .call(this.y_axis);

    // Fade out and remove unused bars
    this.svg.selectAll('.bar')
      .data(records)
      .exit()
      .transition().delay(0).duration(250).ease('sin-in-out')
      .style('opacity', 0)
      .remove();

    this.svg.call(this.tip);

    this.addMenuItems(controller, data);
  };

  HorizontalBarChartGenerator.prototype.generateCsvData = function(controller,
      data) {
    var cols = data.column_info.columns;
    return gsa.csv_from_records(data.records, data.column_info,
        [this.x_field, this.y_field],
        [gsa.column_label(cols[this.x_field], true, false, this.show_stat_type),
        gsa.column_label(cols[this.y_field], true, false, this.show_stat_type)],
        controller.display().header().text());
  };

  HorizontalBarChartGenerator.prototype.generateHtmlTableData = function(
      controller, data) {
    var cols = data.column_info.columns;
    return gsa.html_table_from_records(data.records, data.column_info,
        [this.x_field, this.y_field],
        [gsa.column_label(cols[this.x_field], true, false, this.show_stat_type),
        gsa.column_label(cols[this.y_field], true, false, this.show_stat_type)],
        controller.display().header().text(),
        controller.data_src().param('filter'));
  };

  HorizontalBarChartGenerator.prototype.generateData = function(original_data,
      controller, gen_params) {
    // Extract records and column info
    var cmd = controller.data_src().command();
    if (cmd === 'get_aggregate') {
      return this.transformData(original_data, gen_params);
    }
    else {
      console.error('Unsupported command:' + cmd);
      return null;
    }
  };

})(window, window, window.d3, window.console, window.gsa);

// vim: set ts=2 sw=2 tw=80:
