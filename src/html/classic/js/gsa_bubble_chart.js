/*
 * Greenbone Security Assistant
 * $Id$
 * Description: JavaScript for bubble charts in GSA.
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2014 Greenbone Networks GmbH
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

(function(window, global, gsa, d3, console) {
  'use strict';
  var gch = gsa.charts;

  gch.register_chart_generator('bubbles', BubbleChartGenerator);

  /* Main chart generator */
  function BubbleChartGenerator() {
    // call super constructor
    gch.AggregateChartGenerator.call(this, 'bubble');
  }

  BubbleChartGenerator.prototype = Object.create(
      gch.AggregateChartGenerator.prototype);
  BubbleChartGenerator.prototype.constructor = BubbleChartGenerator;

  BubbleChartGenerator.prototype.init = function() {
    this.margin = {top: 5, right: 5, bottom: 5, left: 5};

    this.x_label = '';
    this.y_label = '';
    this.color_label = '';

    this.x_field = 'value';
    this.y_field = 'count';
    this.color_field = 'mean';

    this.setDataTransformFunc(simple_bubble_data);
    this.setColorScale(gch.severity_colors_gradient());
    this.setTitleGenerator(gch.title_static(
          gsa._('Loading bubble chart ...'), gsa._('Bubble Chart')));
  };

  BubbleChartGenerator.prototype.generateData = function(original_data,
      gen_params) {
    return this.transformData(original_data, gen_params);
  };

  BubbleChartGenerator.prototype.evaluateParams = function(gen_params) {
    gch.AggregateChartGenerator.prototype.evaluateParams.call(this, gen_params);

    if (gen_params.x_field) {
      this.x_field = gen_params.x_field;
    }

    if (gen_params.y_fields && gen_params.y_fields[0]) {
      this.y_field = gen_params.y_fields[0];
    }

    if (gen_params.z_fields && gen_params.z_fields[0]) {
      this.color_field = gen_params.z_fields[0];
    }

    if (gsa.is_defined(gen_params.extra)) {

      if (gen_params.extra.show_stat_type) {
        this.show_stat_type = !!JSON.parse(gen_params.extra.show_stat_type);
      }

      if (gen_params.extra.empty_text) {
        this.empty_text = gen_params.extra.empty_text;
      }
    }
  };

  BubbleChartGenerator.prototype.generate = function(svg, data, update) {
    var self = this;

    var records = data.records;
    var column_info = data.column_info;

    this.color_label = gch.column_label(column_info.columns.color_value, false,
        false, this.show_stat_type);

    if (!gsa.is_defined(this.empty_text)) {
      this.empty_text = gsa._('No matching {{- resource_type}}',
          {
            resource_type: gch.resource_type_name(
                               column_info.columns.label_value.type),
          });
    }

    // Setup display parameters
    var height = svg.attr('height') - this.margin.top -
      this.margin.bottom;
    var width = svg.attr('width') - this.margin.left -
      this.margin.right;

    if (update) {
      svg.text('');
      this.svg = svg.append('g');

      svg.on('mousemove', null);
      svg.on('mouseleave', null);

      this.svg.attr('transform',
          'translate(' + this.margin.left + ',' + this.margin.top + ')');

    }

    // Create bubbles
    var bubbles = d3.layout.pack()
      .sort(null)
      .size([width, height])
      .value(function(d) { return d.size_value; })
      .padding(1.5);

    var filtered_records = [];
    for (var i in records) {
      if (records[i].size_value !== 0) {
        filtered_records.push(records[i]);
      }
    }

    var records_empty;
    if (filtered_records.length === 0) {
      records_empty = true;

      var dummy = {
        color_value: 0,
        size_value: 1,
        label_value: '* ' + this.empty_text + ' *'
      };
      filtered_records.push(dummy);

    }
    else {
      records_empty = false;
    }

    function tooltip_func(d) {
      if (records_empty) {
        return self.empty_text;
      }

      var label_value = gch.format_data(d.label_value,
          data.column_info.columns.label_value);
      var size_value  = gch.format_data(d.size_value,
          data.column_info.columns.size_value);
      var color_value = gch.format_data(d.color_value,
          data.column_info.columns.color_value);

      return label_value + ': ' + size_value   +
        ' (' + self.color_label + ': ' + color_value + ')';
    }

    this.tip = d3.tip()
    .attr('class', 'd3-tip')
    .style('font-weight', 'bold')
    .offset([-10, 0])
    .html(function(d) {
      return tooltip_func(d);
    });

    var nodes = bubbles.nodes({children: filtered_records})
      .filter(function(d) { return d.depth !== 0; });

    this.svg.selectAll('.node')
      .data(nodes)
      .enter()
      .call(function(selection) { return create_bubble(selection, data,
          self.no_chart_links);
      });

    // Remove unused bubbles
    this.svg.selectAll('.node')
      .data(nodes)
      .exit()
      .remove();

    // Update bubbles
    this.svg.selectAll('.node')
      .attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      })
      .on('mouseover', function(d) {
        var target = d3.select(this).select('.node-label').node();
        self.tip.show(d, target);
      })
      .on('mouseout', this.tip.hide)
      .select('circle')
      .attr('r', function(d) { return d.r;})
      .attr('title', tooltip_func)
      .style('fill', function(d) { return self.scaleColor(d.color_value); });

    this.svg.selectAll('.node')
      .select('text')
      .attr('title', tooltip_func)
      .text(function(d) { return d.label_value.substring(0, d.r / 3); });

    this.svg.call(this.tip);
  };

  BubbleChartGenerator.prototype.generateCsvData = function(controller, data) {
    var cols = data.column_info.columns;
    return gch.csv_from_records(data.records,
        data.column_info,
        ['label_value', 'size_value', 'color_value'],
        [gch.column_label(cols.label_value, true, false, this.show_stat_type),
        gch.column_label(cols.size_value, true, false, this.show_stat_type),
        gch.column_label(cols.color_value, true, false, this.show_stat_type)],
        controller.display.getTitle());
  };

  BubbleChartGenerator.prototype.generateHtmlTableData = function(controller,
      data) {
    var cols = data.column_info.columns;
    return gch.html_table_from_records(data.records,
        data.column_info,
        ['label_value', 'size_value', 'color_value'],
        [gch.column_label(cols.label_value, true, false, this.show_stat_type),
        gch.column_label(cols.size_value, true, false, this.show_stat_type),
        gch.column_label(cols.color_value, true, false, this.show_stat_type)],
        controller.display.getTitle(),
        controller.data_src.getParam('filter'));
  };

  function create_bubble(selection, data, no_chart_links) {
    var new_node_a;

    new_node_a = selection.append('g')
      .attr('class', 'node')
      .attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      })
      .append('a');

    new_node_a.attr('xlink:href', function(d) {
      if (no_chart_links === true) {
        return null;
      }

      var group_col_info = data.column_info.columns.group_value;
      if (group_col_info.column === 'uuid') {
        return gch.details_page_url(group_col_info.type, d.group_value,
            data.filter_info);
      } else {
        return gch.filtered_list_url(group_col_info.type, group_col_info.column,
            d.group_value, data.filter_info);
      }
    });

    new_node_a
      .append('circle')
      .attr('r', function(d) { return d.r; })
      .style('fill', 'green');

    new_node_a
      .append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-weight', 'normal')
      .style('font-size', '10px')
      .text('X');
  }

  function simple_bubble_data(old_data, params) {
    var label_field = (params && params.x_field) ? params.x_field : 'value';
    var size_field = (params && params.y_fields && params.y_fields[0]) ?
      params.y_fields[0] : 'count';
    var color_field = (params &&  params.z_fields && params.z_fields[0]) ?
      params.z_fields[0] : old_data.column_info.data_columns[0] + '_mean';
    var group_field = 'value';

    var column_info = {
      group_columns: ['group_value'],
      data_columns: ['size_value', 'color_value'],
      text_columns: ['label_value'],
      columns: {},
    };

    column_info.columns.label_value = {
      name: 'label_value',
      type: old_data.column_info.columns[label_field].type,
      column: old_data.column_info.columns[label_field].column,
      stat: old_data.column_info.columns[label_field].stat,
      data_type: old_data.column_info.columns[label_field].data_type,
    };

    column_info.columns.size_value = {
      name: 'size_value',
      type: old_data.column_info.columns[size_field].type,
      column: old_data.column_info.columns[size_field].column,
      stat: old_data.column_info.columns[size_field].stat,
      data_type: old_data.column_info.columns[size_field].data_type,
    };

    column_info.columns.color_value = {
      name: 'color_value',
      type: old_data.column_info.columns[color_field].type,
      column: old_data.column_info.columns[color_field].column,
      stat: old_data.column_info.columns[color_field].stat,
      data_type: old_data.column_info.columns[color_field].data_type,
    };

    column_info.columns.group_value = {
      name: 'group_value',
      type: old_data.column_info.columns[group_field].type,
      column: old_data.column_info.columns[group_field].column,
      stat: old_data.column_info.columns[group_field].stat,
      data_type: old_data.column_info.columns[group_field].data_type,
    };

    var bubble_data = [];

    for (var d in old_data.records) {
      var new_record = {};

      new_record.label_value = old_data.records[d][label_field];
      new_record.size_value = old_data.records[d][size_field];
      if (color_field) {
        new_record.color_value = old_data.records[d][color_field];
      }
      else {
        new_record.color_value = null;
      }
      new_record.group_value = old_data.records[d][group_field];

      bubble_data.push(new_record);
    }

    var new_data = {
      column_info: column_info,
      records: bubble_data,
      filter_info: old_data.filter_info,
    };

    return new_data;
  }

})(window, window, window.gsa, window.d3, window.console);

// vim: set ts=2 sw=2 tw=80:
