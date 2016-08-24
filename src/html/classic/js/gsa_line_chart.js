/*
 * Greenbone Security Assistant
 * $Id$
 * Description: JavaScript for line charts in GSA.
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

(function(global, window, d3, console, gsa) {
  'use strict';

  var gch = gsa.charts;

  gch.register_chart_generator('line', LineChartGenerator);

  /*
  * Finds the index of a record by the value of a given field
  */
  function find_record_index(records, value, field) {
    for (var index in records) {
      if (records[index][field].getTime() === value.getTime()) {
        return index;
      }
    }
    return -1;
  }

  function LineChartGenerator() {
    // call super constructor
    gch.AggregateChartGenerator.call(this, 'bar');
  }

  LineChartGenerator.prototype = Object.create(
      gch.AggregateChartGenerator.prototype);
  LineChartGenerator.prototype.constructor = LineChartGenerator;

  LineChartGenerator.prototype.init = function() {
    this.margin = {top: 55, right: 60, bottom: 25, left: 60};

    this.x_scale = d3.time.scale.utc();
    this.y_scale = d3.scale.linear();
    this.y2_scale = d3.scale.linear();

    this.x_axis = d3.svg.axis().scale(this.x_scale).orient('bottom').ticks(6);
    this.y_axis = d3.svg.axis().scale(this.y_scale).orient('left');
    this.y2_axis = d3.svg.axis().scale(this.y2_scale).orient('right');

    this.x_label = '';
    this.y_label = '';
    this.y2_label = '';

    this.x_field = 'value';
    this.y_fields = ['c_count'];
    this.y2_fields = ['count'];

    this.show_stat_type = true;

    this.setDataTransformFunc(this.timeLine);
    this.setColorScale(d3.scale.category20());
    this.setTitleGenerator(gch.title_static(
      gsa._('Loading line chart ...'), gsa._('Bubble Chart')));
  };

  LineChartGenerator.prototype.generate = function(svg, data, update) {
    var records = data.records;

    var self = this;

    function y_line(field, y_scale) {
      return d3.svg.line()
        .x(function(d) { return self.x_scale(d[self.x_field]); })
        .y(function(d) { return y_scale(d[field]); })
        .defined(function(d) { return gsa.is_defined(d[field]); });
    }

    self.all_y_fields = self.y_fields.concat(self.y2_fields);

    var lines = [];
    var line_index;
    for (line_index = 0; line_index < self.y_fields.length; line_index++) {
      lines.push(y_line(self.y_fields[line_index], self.y_scale));
    }
    for (line_index = 0; line_index < self.y2_fields.length; line_index++) {
      lines.push(y_line(self.y2_fields[line_index], self.y2_scale));
    }

    var x_min, x_max;
    var y_min, y_max;
    var y2_min, y2_max;

    var height;
    var width;
    var index;
    var new_line;

    var column_info = data.column_info;

    function get_rounded_x(mouse_x) {
      var rounded_x = self.x_step.round(self.x_scale.invert(mouse_x));

      if (rounded_x.getTime() > x_max.getTime()) {
        rounded_x = x_max;
      }
      else if (rounded_x.getTime() < x_min.getTime()) {
        rounded_x = x_min;
      }
      return rounded_x;
    }

    function resize_range_marker_elems() {
      var range_left_line_width = 2;
      var range_right_line_width = 12;
      var y_range = self.y_scale.range();
      var points;

      self.range_marker_elem.select('.range_marker_c')
        .attr('x', self.x_scale(self.range_marker_start))
        .attr('y', 0)
        .attr('width',
            self.x_scale(self.range_marker_end) -
            self.x_scale(self.range_marker_start))
        .attr('height', y_range[0] - y_range[1]);

      self.range_marker_elem.select('.range_marker_l')
        .attr('x', self.x_scale(self.range_marker_start) -
            range_left_line_width)
        .attr('y', 0)
        .attr('width', range_left_line_width)
        .attr('height', y_range[0] - y_range[1]);

      points = [
        self.x_scale(self.range_marker_end),
        ',',
        y_range[1],
        ' ',
        self.x_scale(self.range_marker_end),
        ',',
        y_range[0],
        ' ',
        self.x_scale(self.range_marker_end) + range_right_line_width,
        ',',
        y_range[0] - range_right_line_width,
        ' ',
        self.x_scale(self.range_marker_end) + range_right_line_width,
        ',',
        y_range[1] + range_right_line_width,
      ];
      points = points.join('');

      self.range_marker_elem.select('.range_marker_r')
        .attr('points', points);
    }

    function mouse_exited() {
      self.info_box.style('display', 'none');
      self.info_line.style('display', 'none');
      self.info_text_g.style('display', 'none');
      self.range_info_box.style('display', 'none');
      self.range_info_text_g.style('display', 'none');
    }

    function mouse_down() {
      if (self.no_chart_links ||
          d3.event.button >= 2 || data.records.length <= 1) {
        return;
      }

      var parent_rect = self.svg.node()
        .parentNode
        .parentNode
        .getBoundingClientRect();
      var mouse_x = d3.event.clientX - parent_rect.left - self.margin.left - 1;

      self.range_marker_mouse_down = true;
      self.range_marker_mouse_start_x = mouse_x;

      if (self.range_marker_start === null) {
        self.range_marker_start = get_rounded_x(mouse_x);
        self.range_marker_resize = true;
        mouse_moved();
      }
    }

    function mouse_up() {
      if (self.range_marker_start === null || self.range_marker_end === null) {
        return;
      }

      var start, end;
      var type = data.column_info.columns[self.x_field].type;
      var column = data.column_info.columns[self.x_field].column;
      var value;
      var url;

      if (self.range_marker_start.getTime() >=
          self.range_marker_end.getTime()) {
        start = new Date(self.range_marker_end);
        end = new Date(self.range_marker_start);
      } else {
        start = new Date(self.range_marker_start);
        end = new Date(self.range_marker_end);
      }

      start.setTime(start.getTime() - 60000);
      end = self.x_step.offset(end, 1);

      value = [gch.iso_time_format(start), gch.iso_time_format(end)];

      if (self.range_marker_resize) {
        url = gch.filtered_list_url(
            type, column, value, data.filter_info, 'range');

        self.range_marker_elem.attr('xlink:href', url);

        if (d3.event.button === 1 || d3.event.ctrlKey || d3.event.shiftKey) {
          window.open(url, '_blank');
        } else {
          window.location = url;
        }
      }

      self.range_marker_resize = false;
      self.range_marker_mouse_down = false;
    }

    function mouse_moved() {
      if (data.records.length === 0) {
        return;
      }

      self.info_line.style('display', 'block');
      if (self.range_marker_resize) {
        self.info_box.style('display', 'none');
        self.info_text_g.style('display', 'none');
        self.range_info_box.style('display', 'block');
        self.range_info_text_g.style('display', 'block');
      } else {
        self.info_box.style('display', 'block');
        self.info_text_g.style('display', 'block');
        self.range_info_box.style('display', 'none');
        self.range_info_text_g.style('display', 'none');
      }

      var parent_rect = self.svg.node()
        .parentNode
        .parentNode
        .getBoundingClientRect();

      var mouse_x = d3.event.clientX - parent_rect.left - self.margin.left - 1;
      var mouse_y = d3.event.clientY - parent_rect.top - self.margin.top - 21;

      var y_range = self.y_scale.range();

      var rounded_x;
      var info_last_x;
      var line_index;
      var line_x;
      var box_x;

      if (data.records.length > 1) {
        rounded_x = get_rounded_x(mouse_x);

        line_index = find_record_index(data.records, rounded_x, self.x_field,
          false);
        line_x = self.x_scale(rounded_x);
      }
      else {
        rounded_x = x_min;
        line_index = 0;
        line_x = width / 2;
      }

      if (self.range_marker_mouse_down &&
          data.records.length > 1 &&
          (self.range_marker_last_x === null ||
           self.range_marker_last_x.getTime() !== rounded_x.getTime()) &&
          (Math.abs(self.range_marker_mouse_start_x - mouse_x) >= 10 ||
           self.range_marker_resize)) {

        var rounded_start_x = get_rounded_x(self.range_marker_mouse_start_x);

        if (rounded_start_x < rounded_x) {
          self.range_marker_start = rounded_start_x;
          self.range_marker_end = rounded_x;
        } else {
          self.range_marker_start = rounded_x;
          self.range_marker_end = rounded_start_x;
        }
        self.range_marker_resize = true;
        self.range_marker_last_x = rounded_x;

        resize_range_marker_elems();
      }

      if (!gsa.is_defined(info_last_x) ||
          info_last_x.getTime() !== rounded_x.getTime()) {
        var max_line_width;

        info_last_x = rounded_x;

        var line;
        // Range Selection info box
        max_line_width = 0;

        if (self.range_marker_resize) {
          var end_date = self.x_step.offset(self.range_marker_end, 1);
          end_date.setTime(end_date.getTime() - 1000);
          var start_time = self.range_marker_start.getTime();
          var end_time = end_date.getTime();
          var range_count = 0;
          for (var index in records) {
            var record_time = records[index][self.x_field].getTime();
            if (record_time >= start_time && record_time < end_time) {
              range_count += records[index].count;
            } else if (record_time >= end_time) {
              break;
            }
          }
          var type = data.column_info.columns.count.type;
          self.range_info_text_lines[0]
              .text(gch.date_format(self.range_marker_start));
          self.range_info_text_lines[1]
              .text('to ' + gch.date_format(end_date));
          self.range_info_text_lines[2]
              .text(gch.resource_type_name_plural(type) + ': ' +
                  range_count);
        }

        var bbox;
        var line_width;

        for (line in self.range_info_text_lines) {
          bbox = self.range_info_text_lines[line].node()
            .getBoundingClientRect();
          line_width = bbox.width;
          max_line_width = Math.max(max_line_width, line_width);
        }

        self.range_info_box
          .attr('width', max_line_width + 10)
          .attr('height', self.range_info_text_lines.length * 15 + 6);

        // Normal point info
        max_line_width = 0;
        for (line in self.info_text_lines) {
          var d = data.records[line_index];
          if (gsa.has_value(d)) {
            d = d[self.info_text_lines[line].field];

            if (line > self.y_fields.length) {
              // y2 field
              switch (self.y2_format) {
                case 'duration':
                  d = self.duration_tick_format(d);
                  break;
                default:
                  d = gch.format_data(d,
                    data.column_info.columns[self.info_text_lines[line].field]);
              }
            }
            else if (line >= 1) {
              // y field
              switch (self.y2_format) {
                case 'duration':
                  d = self.duration_tick_format(d);
                  break;
                default:
                  d = gch.format_data(d,
                    data.column_info.columns[self.info_text_lines[line].field]);
              }
            }
            else {
              d = gch.format_data(d,
                data.column_info.columns[self.info_text_lines[line].field]);
            }

            self.info_text_lines[line].elem.text(d);
          }
          else {
            if (line === '0') {
              self.info_text_lines[line].elem.text(
                  gch.format_data(rounded_x, {data_type: 'js_date'}));
            }
            else {
              self.info_text_lines[line].elem.text('N/A');
            }
          }

          bbox = self.info_text_lines[line].elem.node()
            .getBoundingClientRect();
          line_width = bbox.width;

          if (self.info_text_lines[line].field !== self.x_field) {
            line_width += 25;
          }

          max_line_width = Math.max(max_line_width, line_width);
        }

        for (line in self.info_text_lines) {
          self.info_text_lines[line].elem.attr('x', max_line_width);
        }

        self.info_box
          .attr('width', max_line_width + 10)
          .attr('height', self.info_text_lines.length * 15 + 6);
      }

      // Selection info box
      box_x = Math.min(width - self.range_info_box.attr('width') +
          self.margin.right,
          Math.max(-self.margin.left,
            mouse_x - self.range_info_box.attr('width') / 2));

      self.range_info_box
        .text('')
        .attr('x', box_x)
        .attr('y', mouse_y - 50);

      self.range_info_text_g
        .attr('text-anchor', 'start')
        .attr('transform',
            'translate (' + (box_x + 5) + ',' + (mouse_y - 35) + ')');

      // Normal point info
      box_x = Math.min(width - self.info_box.attr('width') + self.margin.right,
          Math.max(-self.margin.left,
            mouse_x - self.info_box.attr('width') / 2));

      self.info_box
        .text('')
        .attr('x', box_x)
        .attr('y', mouse_y - 50);

      self.info_text_g
        .attr('text-anchor', 'end')
        .attr('transform',
            'translate (' + (box_x + 5) + ',' + (mouse_y - 35) + ')');

      // Tooltip marker line
      self.info_line
        .attr('x1', line_x)
        .attr('x2', line_x)
        .attr('y1', 0)
        .attr('y2', y_range[0] - y_range[1]);
    }

    self.setColorScale(gch.field_name_colors(self.all_y_fields,
        data.column_info, self.y_fields.length));

    for (var record_index = 0; record_index < records.length; record_index++) {
      var record = records[record_index];

      x_min = d3.min([x_min, record[self.x_field]]);
      x_max = d3.max([x_max, record[self.x_field]]);

      for (var y_index = 0; y_index < self.y_fields.length; y_index++) {
        y_min = d3.min([y_min, record[self.y_fields[y_index]]]);
        y_max = d3.max([y_max, record[self.y_fields[y_index]]]);
      }

      for (var y2_index = 0; y2_index < self.y2_fields.length; y2_index++) {
        y2_min = d3.min([y2_min, record[self.y2_fields[y2_index]]]);
        y2_max = d3.max([y2_max, record[self.y2_fields[y2_index]]]);
      }
    }

    // Setup display parameters
    height = svg.attr('height') - self.margin.top -
      self.margin.bottom;
    width = svg.attr('width') - self.margin.left -
      self.margin.right;

    self.x_scale.range([0, width]);
    self.y_scale.range([height, 0]);
    self.y2_scale.range([height, 0]);

    if (records.length > 1) {
      self.x_scale.domain([x_min, x_max]);
    }
    else {
      self.x_scale.domain([x_min - 1, x_min + 1]);
    }

    var y_ticks, y2_ticks;
    switch (self.y_format) {
      case 'duration':
        y_ticks = self.duration_ticks(0, y_max, 10);
        self.y_scale.domain([0, y_ticks[y_ticks.length - 1]]);
        self.y_axis.tickValues(y_ticks);
        self.y_axis.tickFormat(self.duration_tick_format);
        break;
      default:
        self.y_scale.domain([0, y_max]).nice(10);
        self.y_axis.tickValues(null);
        self.y_axis.tickFormat(null);
    }

    switch (self.y2_format) {
      case 'duration':
        y2_ticks = self.duration_ticks(0, y2_max, 10);
        self.y2_scale.domain([0, y2_ticks[y2_ticks.length - 1]]);
        self.y2_axis.tickValues(y2_ticks);
        self.y2_axis.tickFormat(self.duration_tick_format);
        break;
      default:
        self.y2_scale.domain([0, y2_max]).nice(10);
        self.y2_axis.tickValues(null);
        self.y2_axis.tickFormat(null);
    }

    if (update) {
      svg.text('');
      self.svg = svg.append('g');

      self.svg.attr('transform',
        'translate(' + self.margin.left + ',' + self.margin.top + ')');

      self.range_marker_elem = null;
      self.range_marker_resize = false;
      self.range_marker_mouse_start_x = null;
      self.range_marker_start = null;
      self.range_marker_end = null;
      self.range_marker_mouse_down = false;
      self.range_marker_last_x = null;

      // Setup mouse event listeners
      svg.on('mousedown', mouse_down);
      svg.on('mouseup', mouse_up);
      svg.on('dragstart',
                       function() { d3.event.preventDefault(); });
      svg.on('mousemove', mouse_moved);
      svg.on('mouseleave', mouse_exited);

      // Setup chart
      self.svg.attr('transform',
        'translate(' + self.margin.left + ',' + self.margin.top + ')');

      self.legend_elem = self.svg.append('g')
        .attr('id', 'legend')
        .attr('transform', 'translate(' + (20 - self.margin.left) + ', -50)');

      self.x_axis_elem = self.svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(self.x_axis);

      self.y_axis_elem = self.svg.append('g')
        .attr('class', 'y axis')
        .call(self.y_axis);

      self.y2_axis_elem = self.svg.append('g')
        .attr('class', 'y axis')
        .style('font-style', 'oblique')
        .attr('transform', 'translate(' + width + ', 0)')
        .call(self.y2_axis);

      for (index = 0; index < self.all_y_fields.length; index++) {
        var new_path = self.svg.append('path');
        new_path
          .attr('id', 'line_' + index)
          .datum(records)
          .style('fill', 'transparent')
          .style('stroke', '1px')
          .style('stroke', self.scaleColor(self.all_y_fields[index]))
          .attr('d', lines[index]);

        if (index >= self.y_fields.length) {
          // Special style for y2 axis lines
          new_path
            .style('stroke-dasharray', '3,2');
        }
      }

      if (records.length === 1) {
        for (index = 0; index < self.all_y_fields.length; index++) {
          var new_circle = self.svg.append('circle');
          new_circle
            .attr('id', 'circle_' + index)
            .attr('class', 'single_value_circle')
            .style('fill', 'transparent')
            .style('stroke', '1px')
            .style('stroke', self.scaleColor(self.all_y_fields[index]))
            .attr('r', '4px')
            .attr('cx', width / 2);

          if (index >= self.y_fields.length) {
            // Special style for y2 axis circles
            new_circle
              .style('stroke-dasharray', '3,2')
              .attr('cy', self.y2_scale(records[0][self.all_y_fields[index]]));
          }
          else {
            new_circle
              .attr('cy', self.y_scale(records[0][self.all_y_fields[index]]));
          }
        }
      }

      // Create tooltip line
      self.info_line = self.svg.append('line')
        .style('stroke', 'grey')
        .style('display', 'none')
        .classed('remove_on_static', true);

      // Create selection marker element
      self.range_marker_elem = self.svg.append('a')
        .attr('class', 'range_marker_a');

      self.range_marker_elem
        .append('rect')
          .attr('class', 'range_marker_c')
          .style('fill', '#008800')
          .style('opacity', '0.125');

      self.range_marker_elem
        .append('rect')
          .attr('class', 'range_marker_l')
          .style('fill', '#008800')
          .style('opacity', '0.25');

      self.range_marker_elem
        .append('polygon')
          .attr('class', 'range_marker_r')
          .style('fill', '#008800')
          .style('opacity', '0.25');

      // Create tange selection tooltip
      self.range_info_box = self.svg.append('rect')
        .style('fill', 'white')
        .style('opacity', '0.75')
        .style('display', 'none')
        .classed('remove_on_static', true);

      self.range_info_text_g = self.svg.append('g')
        .style('display', 'none')
        .classed('remove_on_static', true);

      self.range_info_text_lines = [
          self.range_info_text_g.append('text')
            .attr('transform', 'translate(0,0)')
            .style('font-weight', 'bold')
            .text('START'),
          self.range_info_text_g.append('text')
            .attr('transform', 'translate(0,15)')
            .style('font-weight', 'bold')
            .text('to END'),
          self.range_info_text_g.append('text')
            .attr('transform', 'translate(0,30)')
            .style('font-weight', 'normal')
            .text('1234567 items'),
        ];

      // Create normal tooltip elements
      self.info_box = self.svg.append('rect')
        .style('fill', 'white')
        .style('opacity', '0.75')
        .style('display', 'none')
        .classed('remove_on_static', true);

      self.info_text_g = self.svg.append('g')
        .style('display', 'none')
        .classed('remove_on_static', true);

      self.info_text_lines = [];
      self.info_text_lines .push({
        elem: self.info_text_g.append('text')
          .attr('transform', 'translate(0,0)')
          .style('font-weight', 'bold')
          .text('X'),
        field: self.x_field,
      });

      var line_y_offset = 15;

      for (index = 0; index < self.all_y_fields.length; index++) {
        self.info_text_lines.push({
          elem: self.info_text_g.append('text')
            .attr('transform', 'translate(0,' + line_y_offset + ')')
            .style('font-weight', 'normal')
            .text('Y' + index),
          field: self.all_y_fields[index],
        });

        new_line = self.info_text_g.append('line');

        new_line
          .attr('x1', '0')
          .attr('x2', '15')
          .attr('y1', line_y_offset - 5)
          .attr('y2', line_y_offset - 5)
          .style('stroke', self.scaleColor([self.all_y_fields[index]]));

        if (index >= self.y_fields.length) {
          // Special style for y2 axis lines
          new_line.style('stroke-dasharray', '3,2');
        }

        line_y_offset += 15;
      }
    }

    /* Create legend items */
    self.legend_elem.text('');

    var legend_part;
    var legend_part_x = 0;
    var legend_part_y = 0;
    var last_part_rect;
    var current_part_rect;

    for (index = 0; index < self.all_y_fields.length; index++) {
      var new_text;
      legend_part = self.legend_elem.append('g');

      new_line = legend_part.append('path');
      new_line
        .attr('d', 'M 0 10 L 20 10')
        .style('fill', 'transparent')
        .style('stroke', '1px')
        .style('stroke', self.scaleColor(self.all_y_fields[index]));

      if (index >= self.y_fields.length) {
        // Special style for y2 lines
        new_line.style('stroke-dasharray', '3,2');
      }

      new_text = legend_part.append('text');
      new_text
        .style('font-size', '8pt')
        .style('font-weight', 'bold')
        .attr('x', 25)
        .attr('y', 15)
        .text(gch.column_label(
          column_info.columns[self.all_y_fields[index]], true, false,
              self.show_stat_type));
      if (index >= self.y_fields.length) {
        // Special style for y2 labels
        new_text
          .style('font-weight', 'bold')
          .style('font-style', 'oblique');
      }

      current_part_rect = legend_part.node().getBoundingClientRect();

      if (!gsa.is_defined(last_part_rect)) {
        legend_part_x = 0;
      }
      else if ((self.all_y_fields.length <= 2 ||
                index !== self.y_fields.length) &&
               legend_part_x +
               last_part_rect.width + current_part_rect.width + 10 <=
               width - 40 + self.margin.left + self.margin.right) {
        legend_part_x = legend_part_x + last_part_rect.width + 10;
      }
      else {
        legend_part_x = 0;
        legend_part_y = legend_part_y + last_part_rect.height + 2;
      }

      legend_part.attr('transform', 'translate(' + legend_part_x +
          ', ' + legend_part_y + ')');

      last_part_rect = current_part_rect;
    }

    self.x_axis_elem
      .call(self.x_axis)
      .attr('transform', 'translate(0,' + height + ')');

    self.y_axis_elem.call(self.y_axis);

    self.y2_axis_elem
      .call(self.y2_axis)
      .attr('transform', 'translate(' + width + ', 0)');

    for (index = 0; index < lines.length; index++) {
      self.svg.select('#line_' + index)
        .datum(records)
        .attr('d', lines[index]);
    }

    for (index = 0; index < self.all_y_fields.length; index++) {
      var new_markers;
      var selected_markers;

      var enter = self.svg.selectAll('.marker_' + index)
        .data(records)
        .enter();

      if (self.all_y_fields[index].substr(0, 5) === 'count' ||
          self.all_y_fields[index].substr(0, 7) === 'c_count') {
        self.svg.selectAll('.marker_' + index)
          .remove();
        break;
      }

      new_markers = enter.insert('circle');

      new_markers
        .attr('class', 'marker_' + index)
        .attr('r', 1.5)
        .style('stroke', d3.rgb(self.scaleColor(self.all_y_fields[index])));

      if (index >= self.y_fields.length) {
        // Special style for y2 lines
        new_markers
          .style('fill', 'none');
      }
      else {
        new_markers
          .style('fill', d3.rgb(self.scaleColor(self.all_y_fields[index])));
      }

      selected_markers = self.svg.selectAll('.marker_' + index);

      selected_markers
        .data(records)
        .attr('cx', function(d) { return self.x_scale(d[self.x_field]); });

      if (index >= self.y_fields.length) {
        selected_markers
          .attr('cy', function(d) {
            return self.y2_scale(d[self.all_y_fields[index]]);
          });
      }
      else {
        selected_markers
          .attr('cy', function(d) {
            return self.y_scale(d[self.all_y_fields[index]]);
          });
      }

      self.svg.selectAll('.marker_' + index)
        .data(records)
        .exit()
        .remove();
    }

    // Single value markers
    if (records.length === 1) {
      for (index = 0; index < self.all_y_fields.length; index++) {
        var selected_circle;
        selected_circle = self.svg.selectAll('#circle_' + index);

        selected_circle
          .attr('cx', width / 2);

        if (index >= self.y_fields.length) {
          selected_circle
            .attr('cy', self.y2_scale(records[0][self.all_y_fields[index]]));
        }
        else {
          selected_circle
            .attr('cy', self.y_scale(records[0][self.all_y_fields[index]]));
        }
      }
    }
    else {
      self.svg.select('.single_value_circle').remove();
    }

    if (gsa.is_defined(self.range_marker_start)) {
      resize_range_marker_elems();
    }
  };

  LineChartGenerator.prototype.generateCsvData = function(controller, data) {
    var cols = data.column_info.columns;
    var column_selection = [this.x_field];
    var column_labels = [
        gch.column_label(cols[this.x_field], true, false, this.show_stat_type)
      ];

    for (var index = 0; index < this.all_y_fields.length; index++) {
      column_selection.push(this.all_y_fields[index]);
      column_labels.push(gch.column_label(cols[this.all_y_fields[index]],
          true, false, this.show_stat_type));
    }

    return gch.csv_from_records(data.records, data.column_info,
        column_selection, column_labels, controller.display.getTitle());
  };

  LineChartGenerator.prototype.generateHtmlTableData = function(controller,
      data) {
    var cols = data.column_info.columns;
    var column_selection = [this.x_field];
    var column_labels = [
        gch.column_label(cols[this.x_field], true, false, this.show_stat_type)
      ];

    for (var index = 0; index < this.all_y_fields.length; index++) {
      column_selection.push(this.all_y_fields[index]);
      column_labels.push(gch.column_label(cols[this.all_y_fields[index]],
          true, false, this.show_stat_type));
    }

    return gch.html_table_from_records(data.records, data.column_info,
        column_selection, column_labels, controller.display.getTitle(),
        controller.data_src.getParam('filter'));
  };

  LineChartGenerator.prototype.evaluateParams = function(gen_params) {
    gch.AggregateChartGenerator.prototype.evaluateParams.call(this, gen_params);

    if (gen_params.x_field) {
      this.x_field = gen_params.x_field;
    }

    if (gen_params.y_fields && gen_params.y_fields[0]  &&
      gen_params.z_fields && gen_params.z_fields[0]) {
      this.y_fields = gen_params.y_fields;
      this.y2_fields = gen_params.z_fields;
    }
    else if (gen_params.y_fields && gen_params.y_fields[0]) {
      this.y_fields = gen_params.y_fields;
      this.y2_fields = ['count'];
    }
    else {
      this.y_fields = ['count'];
      this.y2_fields = ['c_count'];
    }

    this.y_format = gen_params.extra.y_format;
    this.y2_format = gen_params.extra.y2_format;

    if (gen_params.extra.show_stat_type) {
      this.show_stat_type = !!JSON.parse(gen_params.extra.show_stat_type);
    }

    if (gsa.has_value(gen_params.t_field)) {
      this.t_field = gen_params.t_field;
    }
    else {
      this.t_field = 'value';
    }

    if (gsa.has_value(gen_params.fillers)) {
      this.fillers = gen_params.fillers;
    }
    else {
      this.fillers = {};
    }
  };

  LineChartGenerator.prototype.timeLine = function(old_data) {
    var self = this;
    var fill_empty_records = false;

    // FIXME: make filling an explicit option
    if (self.y_fields[0].substr(0, 5) === 'count' ||
          self.y_fields[0].substr(0, 7) === 'c_count' ||
          self.y2_fields[0].substr(0, 5) === 'count' ||
          self.y2_fields[0].substr(0, 7) === 'c_count') {
      fill_empty_records = true;
    }

    var new_data = {
      records: [],
      column_info: {},
      filter_info: old_data.filter_info,
    };

    var column_info = new_data.column_info;
    column_info.group_columns = old_data.column_info.group_columns;
    column_info.data_columns = old_data.column_info.data_columns;
    column_info.columns = {};

    function generate_label(column, capitalize_label, include_type,
        include_stat) {
      var suffix = '';

      if (self.x_step === d3.time.day.utc) {
        suffix = ' / day';
      }
      else if (self.x_step === d3.time.week.utc) {
        suffix = ' / week';
      }
      else if (self.x_step === d3.time.month.utc) {
        suffix = ' / month';
      }
      else if (self.x_step === d3.time.year.utc) {
        suffix = ' / year';
      }

      return gch.default_column_label(column, capitalize_label,
            include_type, include_stat) + suffix;
    }

    for (var column_name in old_data.column_info.columns) {
      var info;
      var column = old_data.column_info.columns[column_name];
      if (column_name === self.t_field) {
        column_info.columns[column_name] = {};
        for (info in column) {
          if (info === 'data_type') {
            column_info.columns[column_name][info] = 'js_date';
          }
          else {
            column_info.columns[column_name][info] = column[info];
          }
        }
      }
      else if (column.stat === 'count') {
        column_info.columns[column_name] = {};
        for (info in column) {
          column_info.columns[column_name][info] = column[info];
        }

        column_info.columns[column_name].label_generator = generate_label;
      }
      else {
        column_info.columns [column_name] =
          old_data.column_info.columns[column_name];
      }
    }

    if (old_data.records.length === 0) {
      return new_data;
    }

    var t_index = 0;

    while (!gsa.is_date(old_data.records[t_index][self.t_field])) {
      t_index++;
    }
    var t_min = new Date(old_data.records[t_index][self.t_field].getTime());

    t_index = old_data.records.length - 1;
    while (!gsa.is_date(old_data.records[t_index][self.t_field])) {
      t_index--;
    }
    /* Add 1 millisecond to ensure the range function give the correct results
     * This addition should be negligible since timestamps in OpenVAS have
     *  a resolution of 1 second */
    var t_max = new Date(old_data.records[t_index][self.t_field].getTime() + 1);

    var interval_days = (t_max.getTime() - t_min.getTime() - 1) / 86400000;
    var times;
    t_index = 0;
    var has_values;
    var values;
    var new_record;
    var t;
    var field;
    var data_index = 0;
    var prev_values = {};

    if (interval_days <= 100) {
      self.x_step = d3.time.day.utc;
      times = d3.time.day.range.utc(d3.time.day.utc.floor(t_min),
          t_max);
    }
    else if (interval_days <= 750) {
      self.x_step = d3.time.week.utc;
      times = d3.time.week.range.utc(d3.time.week.utc.floor(t_min),
          t_max);
    }
    else if (interval_days <= 3650) {
      self.x_step = d3.time.month.utc;
      times = d3.time.month.range.utc(d3.time.month.utc.floor(t_min), t_max);
    }
    else {
      self.x_step = d3.time.year.utc;
      times = d3.time.year.range.utc(d3.time.year.utc.floor(t_min), t_max);
    }

    for (t_index in times) {
      new_record = {};
      t = times[t_index];
      values = {};
      new_record[self.t_field] = t;
      has_values = false;

      while (data_index < old_data.records.length &&
          (t_index >= times.length - 1 ||
           !gsa.is_date(old_data.records[data_index][self.t_field]) ||
           old_data.records[data_index][self.t_field].getTime() <
           times[Number(t_index) + 1].getTime())) {

        // collect values from orgin data which fit to the time value

        if (!gsa.is_date(old_data.records[data_index][self.t_field])) {
          data_index++;
          continue;
        }

        for (field in old_data.records[data_index]) {
          if (field !== self.t_field) {
            if (!gsa.is_defined(values[field])) {
              values[field] = old_data.records[data_index][field];
            }
            else if (column_info.columns[field].stat === 'sum' ||
                column_info.columns[field].stat === 'count') {
              values[field] += Number(old_data.records[data_index][field]);
            }
            else if (column_info.columns[field].stat === 'min') {
              values[field] = Math.min(values[field],
                  Number(old_data.records[data_index][field]));
            }
            else if (column_info.columns[field].stat === 'max' ||
                column_info.columns[field].stat === 'c_count') {
              values[field] = Math.max(values[field],
                  Number(old_data.records[data_index][field]));
            }
          }
        }

        data_index++;
      }

      for (field in old_data.column_info.columns) {
        if (field !== self.t_field) {
          if (gsa.has_value(values[field])) {
            prev_values[field] = values[field];
            new_record[field] = values[field];
            has_values = true;
          }
          else if (self.fillers[field] === '!previous') {
            new_record[field] = prev_values[field] ? prev_values[field] : 0;
          }
          else if (gsa.has_value(self.fillers[field])) {
            new_record[field] = self.fillers[field];
          }
          else if (old_data.column_info.columns[field].stat === 'c_count') {
            new_record[field] = prev_values[field] ? prev_values[field] : 0;
          }
          else if (old_data.column_info.columns[field].stat === 'count') {
            new_record[field] = 0;
          }
          else {
            new_record[field] = null;
          }
        }
      }
      if (has_values || fill_empty_records) {
        new_data.records.push(new_record);
      }
    }

    return new_data;
  };

  var zero_pad = d3.format('02d');
  LineChartGenerator.prototype.duration_tick_format = function(val) {
    val = Math.round(val);
    var hours;
    var minutes;
    if (val >= 86400) {
      var days = Math.floor(val / 86400);
      hours = Math.floor((val - hours * 86400) / 3600);
      if (hours === 0) {
        return days + 'd';
      }
      else {
        return days + 'd' + zero_pad(hours) + 'h';
      }
    }
    else if (val >= 3600) {
      hours = Math.floor(val / 3600);
      minutes = Math.floor((val - hours * 3600) / 60);
      if (minutes === 0) {
        return hours + 'h';
      }
      else {
        return hours + 'h' + zero_pad(minutes) + 'm';
      }
    }
    else if (val >= 60) {
      minutes = Math.floor(val / 60);
      var seconds = Math.floor(val % 60);
      if (seconds === 0) {
        return minutes + 'm';
      }
      else {
        return minutes + 'm' + zero_pad(seconds) + 's';
      }
    }
    else {
      return val.toFixed(0) + 's';
    }
  };

  LineChartGenerator.prototype.duration_ticks = function(min, max, number) {
    var approx_step = (max - min) / number;
    var step;
    var i;
    var ticks = [];

    var steps = [1, 2, 5, 10, 15, 30,
                  1 * 60, 2 * 60, 5 * 60, 10 * 60, 15 * 60, 30 * 60,
                  1 * 3600, 2 * 3600, 3 * 3600, 6 * 3600, 12 * 3600, 24 * 3600];

    for (i = 0; i < steps.length && step === undefined; i++) {
      if (approx_step <= steps[i]) {
        step = steps[i];
      }
    }

    var rounded_max = Math.ceil(max / step) * step;

    for (i = 0; (min + i * step) <= rounded_max; i++) {
      ticks.push(min + i * step);
    }
    return ticks;
  };

})(window, window, window.d3, window.console, window.gsa);

// vim: set ts=2 sw=2 tw=80:
