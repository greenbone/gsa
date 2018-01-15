
/* Greenbone Security Assistant
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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
import 'core-js/fn/array/find-index';
import 'core-js/fn/object/entries';

import d3 from 'd3';

import _ from 'gmp/locale.js';
import {is_date, is_defined, has_value} from 'gmp/utils.js';

import {
  column_label,
  csv_from_records,
  data_quantile_info,
  date_format,
  default_column_label,
  field_color_scale,
  fill_in_numbered_records,
  format_data,
  goto_list_page,
  html_table_from_records,
  iso_time_format,
  quantiles_colors_gradient,
  resource_type_name_plural,
  title_static,
} from '../helper.js';

import {register_chart_generator} from '../controller.js';

import AggregateChartGenerator from './aggregate.js';

const zero_pad = d3.format('02d');

const ONE_MINUTE = 60;
const ONE_HOUR = ONE_MINUTE * 60;
const ONE_DAY = ONE_HOUR * 24;

/* TODO:
   Quantiles and not timeline is only used for vulns.
   Therefore split this into a separate line chart
*/

/**
 * Create a color scale for a color for each field name. If alt_color_limit
 * is defined, the fields starting at that index will use alternate (lighter
 * or darker) colors.
 *
 * @param {Array}  y_fields         An array containing the field names.
 * @param {Object} column_info      The column info object of the dataset
 * @param {Number} alt_color_limit  Index at which alternate colors are used
 *
 * @returns A d3 color scale for the field names given
 */
export const field_name_colors = (y_fields, column_info, alt_color_limit) => {
  const range = [];
  const scale = d3.scale.ordinal();

  let subgroup_scale;

  if (is_defined(column_info.subgroup_column)) {
    const {type} = column_info.columns.subgroup_value;
    const column = column_info.subgroup_column;
    subgroup_scale = field_color_scale(type, column);
  }

  for (const index in y_fields) {
    const y_field_name = y_fields[index];
    const field_info = column_info.columns[y_field_name];

    let color = 'green';

    if (is_defined(field_info.subgroup_value)) {
      color = subgroup_scale(field_info.subgroup_value);
    }
    else if ((y_fields.length <= 1 && !is_defined(alt_color_limit)) ||
              y_fields.length - alt_color_limit <= 1) {
      color = 'green';
    }
    else if (is_defined(field_info.stat)) {
      if (field_info.stat === 'max') {
        color = '#ff7f0e';
      }
      else if (field_info.stat === 'min') {
        color = '#9467bd';
      }
      else if (field_info.stat === 'sum') {
        color = '#7f7f7f';
      }
    }

    if (!is_defined(alt_color_limit) || index < alt_color_limit) {
      range.push(color);
    }
    else if (d3.lab(color).l >= 70) {
      range.push(d3.rgb(color).darker().toString());
    }
    else {
      range.push(d3.rgb(color).brighter().toString());
    }
  }

  scale.domain(y_fields);
  scale.range(range);

  return scale;
};

/*
* Finds the index of a record by the value of a given field
*/
const find_record_index = (records, value, field) => {
  if (is_defined(value.getTime)) {
    return records.findIndex(record =>
      record[field].getTime() === value.getTime());
  }
  return records.findIndex(record => record[field] === value);
};

class LineChartGenerator extends AggregateChartGenerator {

  constructor() {
    super('line');
  }

  init() {
    this.margin = {
      top: 55,
      right: 60,
      bottom: 25,
      left: 60,
    };

    this.x_scale = d3.scale.linear();
    this.y_scale = d3.scale.linear();
    this.y2_scale = d3.scale.linear();
    this.x_axis = d3.svg.axis().scale(this.x_scale).orient('bottom').ticks(10);
    this.y_axis = d3.svg.axis().scale(this.y_scale).orient('left');
    this.y2_axis = d3.svg.axis().scale(this.y2_scale).orient('right');

    this.x_label = '';
    this.y_label = '';
    this.y2_label = '';
    this.x_field = 'value';
    this.y_fields = ['c_count'];
    this.y2_fields = ['count'];

    this.show_stat_type = true;

    this.setColorScale(d3.scale.category20());
    this.setTitleGenerator(title_static(_('Loading line chart ...'),
      _('Line Chart')));
  }

  generate(svg, data) {
    const {records, column_info} = data;

    const get_y_line = (field, y_scale) =>
      d3.svg.line()
        .x(d => this.x_scale(d[this.x_field]))
        .y(d => y_scale(d[field]))
        .defined(d => is_defined(d[field]));

    const lines = [];
    for (const y_field_name of this.y_fields) {
      lines.push(get_y_line(y_field_name, this.y_scale));
    }

    for (const y_field_name of this.y2_fields) {
      lines.push(get_y_line(y_field_name, this.y2_scale));
    }

    let y_min;
    let y_max;
    let y2_min;
    let y2_max;

    const all_y_fields = this.y_fields.concat(this.y2_fields);

    this.setColorScale(field_name_colors(all_y_fields, data.column_info,
      this.y_fields.length));

    const x_records = records.map(record => record[this.x_field]);
    const x_min = d3.min(x_records);
    const x_max = d3.max(x_records);

    for (const record of records) {
      for (const y_field_name of this.y_fields) {
        y_min = d3.min([y_min, record[y_field_name]]);
        y_max = d3.max([y_max, record[y_field_name]]);
      }

      for (const y2_field_name of this.y2_fields) {
        y2_min = d3.min([y2_min, record[y2_field_name]]);
        y2_max = d3.max([y2_max, record[y2_field_name]]);
      }
    }

    // Setup display parameters
    const height = svg.attr('height') - this.margin.top -
      this.margin.bottom;
    const width = svg.attr('width') - this.margin.left -
      this.margin.right;

    this.x_scale.range([0, width]);
    this.y_scale.range([height, 0]);
    this.y2_scale.range([height, 0]);

    if (records.length > 1) {
      this.x_scale.domain([x_min, x_max]);
    }
    else {
      this.x_scale.domain([x_min - 1, x_min + 1]);
    }

    if (this.y_format === 'duration') {
      const y_ticks = this.duration_ticks(0, y_max, 10);
      this.y_scale.domain([0, y_ticks[y_ticks.length - 1]]);
      this.y_axis.tickValues(y_ticks);
      this.y_axis.tickFormat(this.duration_tick_format);
    }
    else {
      this.y_scale.domain([0, y_max]).nice(10);
      this.y_axis.tickValues(null);
      this.y_axis.tickFormat(null);
    }

    if (this.y2_format === 'duration') {
      const y2_ticks = this.duration_ticks(0, y2_max, 10);

      this.y2_scale.domain([0, y2_ticks[y2_ticks.length - 1]]);
      this.y2_axis.tickValues(y2_ticks);
      this.y2_axis.tickFormat(this.duration_tick_format);
    }
    else {
      this.y2_scale.domain([0, y2_max]).nice(10);
      this.y2_axis.tickValues(null);
      this.y2_axis.tickFormat(null);
    }

    const resize_range_marker_elems = () => {
      const range_left_line_width = 2;
      let range_right_line_width = 2;

      if (this.is_timeline) {
        range_right_line_width = 12;
      }

      const y_range = this.y_scale.range();
      let points;

      if (!is_defined(this.range_marker_start)) {
        return;
      }

      // Center area
      this.range_marker_elem.select('.range_marker_c')
        .attr('x', this.x_scale(this.range_marker_start))
        .attr('y', 0)
        .attr('width', this.x_scale(this.range_marker_end) -
          this.x_scale(this.range_marker_start))
        .attr('height', y_range[0] - y_range[1]);

      // Left marker
      points = [
        this.x_scale(this.range_marker_start),
        ',',
        y_range[1],
        ' ',
        this.x_scale(this.range_marker_start),
        ',',
        y_range[0],
        ' ',
        this.x_scale(this.range_marker_start) - range_left_line_width,
        ',',
        y_range[0] - range_left_line_width,
        ' ',
        this.x_scale(this.range_marker_start) - range_left_line_width,
        ',',
        y_range[1] + range_left_line_width,
      ];

      points = points.join('');

      this.range_marker_elem.select('.range_marker_l')
        .attr('points', points);

      // Right Marker
      points = [
        this.x_scale(this.range_marker_end),
        ',',
        y_range[1],
        ' ',
        this.x_scale(this.range_marker_end),
        ',',
        y_range[0],
        ' ',
        this.x_scale(this.range_marker_end) + range_right_line_width,
        ',',
        y_range[0] - range_right_line_width,
        ' ',
        this.x_scale(this.range_marker_end) + range_right_line_width,
        ',',
        y_range[1] + range_right_line_width,
      ];
      points = points.join('');

      this.range_marker_elem.select('.range_marker_r')
        .attr('points', points);
    };

    const mouse_exited = () => {
      this.info_box.style('display', 'none');
      this.info_line.style('display', 'none');
      this.info_text_g.style('display', 'none');
      this.range_info_box.style('display', 'none');
      this.range_info_text_g.style('display', 'none');
    };

    const mouse_down = () => {
      if (this.no_chart_links ||
        d3.event.button >= 2 || records.length <= 1) {
        return;
      }

      const parent_rect = this.svg.node()
        .parentNode
        .parentNode
        .getBoundingClientRect();

      const mouse_x = d3.event.clientX - parent_rect.left -
        this.margin.left - 1;

      this.range_marker_mouse_down = true;
      this.range_marker_mouse_start_x = mouse_x;

      if (!is_defined(this.range_marker_start)) {
        this.range_marker_start = this.getRoundedX(mouse_x, x_min, x_max);
        this.range_marker_resize = true;
        mouse_moved();
      }
    };

    const mouse_up = () => {
      if (!is_defined(this.range_marker_start) ||
        !is_defined(this.range_marker_end)) {
        return;
      }

      let start;
      let end;
      const {type} = data.column_info.columns[this.x_field];
      const {column} = data.column_info.columns[this.x_field];

      let value;
      if (this.is_timeline) {
        if (this.range_marker_start.getTime() >=
          this.range_marker_end.getTime()) {
          start = new Date(this.range_marker_end);
          end = new Date(this.range_marker_start);
        }
        else {
          start = new Date(this.range_marker_start);
          end = new Date(this.range_marker_end);
        }
        start.setTime(start.getTime() - 60000);
        end = this.x_step.offset(end, 1);
        value = [iso_time_format(start), iso_time_format(end)];
      }
      else {
        const step = 1;
        if (this.range_marker_start >= this.range_marker_end) {
          start = this.range_marker_end + step;
          end = this.range_marker_start - step;
        }
        else {
          start = this.range_marker_start - step;
          end = this.range_marker_end + step;
        }
        value = [start, end];
      }

      if (this.range_marker_resize) {
        const handler = goto_list_page(type, column, value, data.filter_info,
          'range');
        this.range_marker_elem.on('click', handler);
      }

      this.range_marker_resize = false;
      this.range_marker_mouse_down = false;
    };

    const mouse_moved = () => {
      if (data.records.length === 0) {
        return;
      }

      this.info_line.style('display', 'block');

      if (this.range_marker_resize) {
        this.info_box.style('display', 'none');
        this.info_text_g.style('display', 'none');
        this.range_info_box.style('display', 'block');
        this.range_info_text_g.style('display', 'block');
      }
      else {
        this.info_box.style('display', 'block');
        this.info_text_g.style('display', 'block');
        this.range_info_box.style('display', 'none');
        this.range_info_text_g.style('display', 'none');
      }
      const parent_rect = this.svg.node()
        .parentNode
        .parentNode
        .getBoundingClientRect();

      const mouse_x = d3.event.clientX - parent_rect.left -
        this.margin.left - 1;
      const mouse_y = d3.event.clientY - parent_rect.top -
        this.margin.top - 21;
      const y_range = this.y_scale.range();

      let rounded_x;
      let info_last_x;
      let line_index;
      let line_x;
      let box_x;

      if (data.records.length > 1) {
        rounded_x = this.getRoundedX(mouse_x, x_min, x_max);
        line_index = find_record_index(data.records, rounded_x, this.x_field,
          false);
        line_x = this.x_scale(rounded_x);
      }
      else {
        rounded_x = x_min;
        line_index = 0;
        line_x = width / 2; // FIXME width was always undefined
      }

      let marker_x_changed;
      let info_x_changed;
      if (this.is_timeline) {
        marker_x_changed = !is_defined(this.range_marker_last_x) ||
          this.range_marker_last_x.getTime() !== rounded_x.getTime();
        info_x_changed = !is_defined(info_last_x) ||
          info_last_x.getTime() !== rounded_x.getTime();
      }
      else {
        marker_x_changed = this.range_marker_last_x !== rounded_x;
        info_x_changed = info_last_x !== rounded_x;
      }

      if (this.range_marker_mouse_down &&
        data.records.length > 1 &&
        marker_x_changed &&
        (Math.abs(this.range_marker_mouse_start_x - mouse_x) >= 10 ||
          this.range_marker_resize)) {
        const rounded_start_x = this.getRoundedX(
          this.range_marker_mouse_start_x, x_min, x_max);

        if (rounded_start_x < rounded_x) {
          this.range_marker_start = rounded_start_x;
          this.range_marker_end = rounded_x;
        }
        else {
          this.range_marker_start = rounded_x;
          this.range_marker_end = rounded_start_x;
        }

        this.range_marker_resize = true;
        this.range_marker_last_x = rounded_x;

        resize_range_marker_elems();
      }

      if (info_x_changed) {
        info_last_x = rounded_x;
        // Range Selection info box
        let max_line_width = 0;
        if (this.range_marker_resize) {
          const {type} = data.column_info.columns.count;
          if (this.is_timeline) {
            const end_date = this.x_step.offset(this.range_marker_end, 1);
            end_date.setTime(end_date.getTime() - 1000);
            const start_time = this.range_marker_start.getTime();
            const end_time = end_date.getTime();

            let range_count = 0;
            for (const index in records) {
              const record_time = records[index][this.x_field].getTime();
              if (record_time >= start_time && record_time < end_time) {
                range_count += records[index].count;
              }
              else if (record_time >= end_time) {
                break;
              }
            }

            this.range_info_text_lines[0]
              .text(date_format(this.range_marker_start));

            this.range_info_text_lines[1]
              .text('to ' + date_format(end_date));

            this.range_info_text_lines[2]
              .text(resource_type_name_plural(type) + ': ' +
              range_count);
          }
          else {
            let range_count = 0;
            const x_label = column_label(column_info.columns[this.x_field],
              true, false, this.show_stat_type);
            for (const index in records) {
              const record_val = records[index][this.x_field];
              if (record_val >= this.range_marker_start &&
                record_val <= this.range_marker_end) {
                range_count += records[index].count;
              }
              else if (record_val > this.range_marker_end) {
                break;
              }
            }
            this.range_info_text_lines[0]
              .text(x_label + ':');
            if (this.range_marker_start === this.range_marker_end) {
              this.range_info_text_lines[1]
                .text(this.range_marker_start);
            }
            else {
              this.range_info_text_lines[1]
                .text(this.range_marker_start +
                  ' to ' + this.range_marker_end);
            }
            this.range_info_text_lines[2]
              .text(resource_type_name_plural(type) + ': ' +
                range_count);
          }
        }

        let bbox;
        let line_width;
        for (const line in this.range_info_text_lines) {
          bbox = this.range_info_text_lines[line].node()
            .getBoundingClientRect();
          line_width = bbox.width;
          max_line_width = Math.max(max_line_width, line_width);
        }

        this.range_info_box
          .attr('width', max_line_width + 10)
          .attr('height', this.range_info_text_lines.length * 15 + 6);

        // Normal point info
        max_line_width = 0;
        for (const line in this.info_text_lines) {
          let d = data.records[line_index];
          const line_col_info = data.column_info.columns[
            this.info_text_lines[line].field];

          if (has_value(d)) {
            d = d[this.info_text_lines[line].field];
            if (line > this.y_fields.length) {
              // y2 field
              switch (this.y2_format) {
                case 'duration':
                  d = this.duration_tick_format(d);
                  break;
                default:
                  d = format_data(d, line_col_info);
              }
            }
            else if (line >= 1) {
              // y field
              switch (this.y2_format) {
                case 'duration':
                  d = this.duration_tick_format(d);
                  break;
                default:
                  d = format_data(d, line_col_info);
              }
            }
            else {
              d = format_data(d, line_col_info);
            }
            this.info_text_lines[line].elem.text(d);
          }
          else if (line === '0') {
            if (this.is_timeline) {
              this.info_text_lines[line].elem.text(
                format_data(rounded_x, {data_type: 'js_date'}));
            }
            else {
              this.info_text_lines[line].elem.text(
                format_data(rounded_x), line_col_info);
            }
          }
          else {
            this.info_text_lines[line].elem.text('N/A');
          }

          bbox = this.info_text_lines[line].elem.node()
            .getBoundingClientRect();
          line_width = bbox.width;

          if (this.info_text_lines[line].field !== this.x_field) {
            line_width += 25;
          }

          max_line_width = Math.max(max_line_width, line_width);
        }

        for (const line in this.info_text_lines) {
          this.info_text_lines[line].elem.attr('x', max_line_width);
        }

        this.info_box
          .attr('width', max_line_width + 10)
          .attr('height', this.info_text_lines.length * 15 + 6);
      }

      // Selection info box
      box_x = Math.min(width - this.range_info_box.attr('width') +
        this.margin.right, Math.max(-this.margin.left,
          mouse_x - this.range_info_box.attr('width') / 2));

      this.range_info_box
        .text('')
        .attr('x', box_x)
        .attr('y', mouse_y - 50);

      this.range_info_text_g
        .attr('text-anchor', 'start')
        .attr('transform',
          'translate(' + (box_x + 5) + ',' + (mouse_y - 35) + ')');

      // Normal point info
      box_x = Math.min(width - this.info_box.attr('width') + this.margin.right,
        Math.max(-this.margin.left, mouse_x - this.info_box.attr('width') / 2));

      this.info_box
        .text('')
        .attr('x', box_x)
        .attr('y', mouse_y - 50);

      this.info_text_g
        .attr('text-anchor', 'end')
        .attr('transform',
          'translate (' + (box_x + 5) + ',' + (mouse_y - 35) + ')');

      // Tooltip marker line
      this.info_line
        .attr('x1', line_x)
        .attr('x2', line_x)
        .attr('y1', 0)
        .attr('y2', y_range[0] - y_range[1]);
    };

    svg.text('');
    this.defs = svg.append('defs');
    this.svg = svg.append('g');
    this.svg.attr('transform',
      'translate(' + this.margin.left + ',' + this.margin.top + ')');

    this.range_marker_elem = undefined;
    this.range_marker_resize = false;
    this.range_marker_mouse_start_x = undefined;
    this.range_marker_start = undefined;
    this.range_marker_end = undefined;
    this.range_marker_mouse_down = false;
    this.range_marker_last_x = undefined;

    // Setup mouse event listeners
    svg.on('mousedown', mouse_down);
    svg.on('mouseup', mouse_up);
    svg.on('dragstart', () => d3.event.preventDefault());
    svg.on('mousemove', mouse_moved);
    svg.on('mouseleave', mouse_exited);

    // Setup chart
    this.svg.attr('transform',
      'translate(' + this.margin.left + ',' + this.margin.top + ')');
    this.legend_elem = this.svg.append('g')
      .attr('id', 'legend')
      .attr('transform', 'translate(' + (20 - this.margin.left) + ', -50)');

    this.x_axis_elem = this.svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(this.x_axis);

    this.y_axis_elem = this.svg.append('g')
      .attr('class', 'y axis')
      .call(this.y_axis);

    this.y2_axis_elem = this.svg.append('g')
      .attr('class', 'y axis')
      .style('font-style', 'oblique')
      .attr('transform', 'translate(' + width + ', 0)')
      .call(this.y2_axis);


    this.renderGradients(records);

    for (let index = 0; index < all_y_fields.length; index++) {
      const y_field_name = all_y_fields[index];
      const new_path = this.svg.append('path');
      new_path
        .attr('id', 'line_' + y_field_name + '_' + index)
        .datum(records)
        .style('fill', 'transparent')
        .style('stroke', '1px')
        .style('stroke', this.scaleColor(y_field_name))
        .attr('d', lines[index]);

      if (index >= this.y_fields.length) {
        // Special style for y2 axis lines
        new_path
          .style('stroke-dasharray', '3,2');
      }
    }

    if (records.length === 1) {
      for (let index = 0; index < all_y_fields.length; index++) {
        const new_circle = this.svg.append('circle');
        new_circle
          .attr('id', 'circle_' + index)
          .attr('class', 'single_value_circle')
          .style('fill', 'transparent')
          .style('stroke', '1px')
          .style('stroke', this.scaleColor(all_y_fields[index]))
          .attr('r', '4px')
          .attr('cx', width / 2);

        if (index >= this.y_fields.length) {
          // Special style for y2 axis circles
          new_circle
            .style('stroke-dasharray', '3,2')
            .attr('cy', this.y2_scale(records[0][all_y_fields[index]]));
        }
        else {
          new_circle
            .attr('cy', this.y_scale(records[0][all_y_fields[index]]));
        }
      }
    }

    // Create tooltip line
    this.info_line = this.svg.append('line')
      .style('stroke', 'grey')
      .style('display', 'none')
      .classed('remove_on_static', true);

    // Create selection marker element
    this.range_marker_elem = this.svg.append('a')
      .attr('class', 'range_marker_a');

    this.range_marker_elem
      .append('rect')
      .attr('class', 'range_marker_c')
      .style('fill', '#008800')
      .style('opacity', '0.125');

    this.range_marker_elem
      .append('polygon')
      .attr('class', 'range_marker_l')
      .style('fill', '#008800')
      .style('opacity', '0.25');

    this.range_marker_elem
      .append('polygon')
      .attr('class', 'range_marker_r')
      .style('fill', '#008800')
      .style('opacity', '0.25');

    // Create range selection tooltip
    this.range_info_box = this.svg.append('rect')
      .style('fill', 'white')
      .style('opacity', '0.75')
      .style('display', 'none')
      .classed('remove_on_static', true);

    this.range_info_text_g = this.svg.append('g')
      .style('display', 'none')
      .classed('remove_on_static', true);

    this.range_info_text_lines = [
      this.range_info_text_g.append('text')
        .attr('transform', 'translate(0,0)')
        .style('font-weight', 'bold')
        .text('START'),
      this.range_info_text_g.append('text')
        .attr('transform', 'translate(0,15)')
        .style('font-weight', 'bold')
        .text('to END'),
      this.range_info_text_g.append('text')
        .attr('transform', 'translate(0,30)')
        .style('font-weight', 'normal')
        .text('1234567 items'),
    ];

    // Create normal tooltip elements
    this.info_box = this.svg.append('rect')
      .style('fill', 'white')
      .style('opacity', '0.75')
      .style('display', 'none')
      .classed('remove_on_static', true);

    this.info_text_g = this.svg.append('g')
      .style('display', 'none')
      .classed('remove_on_static', true);

    this.info_text_lines = [];
    this.info_text_lines.push({
      elem: this.info_text_g.append('text')
        .attr('transform', 'translate(0,0)')
        .style('font-weight', 'bold')
        .text('X'),
      field: this.x_field,
    });

    let line_y_offset = 15;
    for (let index = 0; index < all_y_fields.length; index++) {
      this.info_text_lines.push({
        elem: this.info_text_g.append('text')
          .attr('transform', 'translate(0,' + line_y_offset + ')')
          .style('font-weight', 'normal')
          .text('Y' + index),
        field: all_y_fields[index],
      });

      const new_line = this.info_text_g.append('line');
      new_line
        .attr('x1', '0')
        .attr('x2', '15')
        .attr('y1', line_y_offset - 5)
        .attr('y2', line_y_offset - 5)
        .style('stroke', this.scaleColor([all_y_fields[index]]));

      if (index >= this.y_fields.length) {
        // Special style for y2 axis lines
        new_line.style('stroke-dasharray', '3,2');
      }
      line_y_offset += 15;
    }

    this.renderLegend(column_info, width);

    this.x_axis_elem
      .call(this.x_axis)
      .attr('transform', 'translate(0,' + height + ')');

    this.y_axis_elem.call(this.y_axis);
    this.y2_axis_elem
      .call(this.y2_axis)
      .attr('transform', 'translate(' + width + ', 0)');

    for (let index = 0; index < lines.length; index++) {
      this.svg.select('#line_' + index)
        .datum(records)
        .attr('d', lines[index]);
    }

    for (let index = 0; index < all_y_fields.length; index++) {
      const enter = this.svg.selectAll('.marker_' + index)
        .data(records)
        .enter();

      if (all_y_fields[index].substr(0, 5) === 'count' ||
        all_y_fields[index].substr(0, 7) === 'c_count') {
        this.svg.selectAll('.marker_' + index)
          .remove();
        break;
      }

      const new_markers = enter.insert('circle');
      new_markers
        .attr('class', 'marker_' + index)
        .attr('r', 1.5)
        .style('stroke', d3.rgb(this.scaleColor(all_y_fields[index])));

      if (index >= this.y_fields.length) {
        // Special style for y2 lines
        new_markers
          .style('fill', 'none');
      }
      else {
        new_markers
          .style('fill', d3.rgb(this.scaleColor(all_y_fields[index])));
      }

      const selected_markers = this.svg.selectAll('.marker_' + index);
      selected_markers
        .data(records)
        .attr('cx', d => this.x_scale(d[this.x_field]));

      if (index >= this.y_fields.length) {
        selected_markers
          .attr('cy', d => this.y2_scale(d[all_y_fields[index]]));
      }
      else {
        selected_markers
          .attr('cy', d => this.y_scale(d[all_y_fields[index]]));
      }
      this.svg.selectAll('.marker_' + index)
        .data(records)
        .exit()
        .remove();
    }

    // Single value markers
    if (records.length === 1) {
      for (let index = 0; index < all_y_fields.length; index++) {
        const selected_circle = this.svg.selectAll('#circle_' + index);
        selected_circle.attr('cx', width / 2);

        if (index >= this.y_fields.length) {
          selected_circle
            .attr('cy', this.y2_scale(records[0][all_y_fields[index]]));
        }
        else {
          selected_circle
            .attr('cy', this.y_scale(records[0][all_y_fields[index]]));
        }
      }
    }
    else {
      this.svg.select('.single_value_circle').remove();
    }

    if (is_defined(this.range_marker_start)) {
      resize_range_marker_elems();
    }
  }

  renderLegend(column_info, width) {
    /* Create legend items */
    this.legend_elem.text('');

    let legend_part;
    let legend_part_x = 0;
    let legend_part_y = 0;
    let last_part_rect;
    let current_part_rect;

    const all_y_fields = this.y_fields.concat(this.y2_fields);

    for (let index = 0; index < all_y_fields.length; index++) {
      const y_field_name = all_y_fields[index];
      // create legend part for each y field
      legend_part = this.legend_elem.append('g');
      // draw line with same color as in the chart
      const new_line = legend_part.append('path');
      new_line
        .attr('d', 'M 0 10 L 20 10')
        .style('fill', 'transparent')
        .style('stroke', '1px')
        .style('stroke', this.scaleColor(y_field_name));

      if (index >= this.y_fields.length) {
        // Special style for y2 lines
        new_line.style('stroke-dasharray', '3,2');
      }

      const new_text = legend_part.append('text');
      new_text
        .style('font-size', '8pt')
        .style('font-weight', 'bold')
        .attr('x', 25)
        .attr('y', 15)
        .text(column_label(column_info.columns[y_field_name],
          true, false, this.show_stat_type));

      if (index >= this.y_fields.length) {
        // Special style for y2 labels
        new_text
          .style('font-weight', 'bold')
          .style('font-style', 'oblique');
      }

      // calculate position of legend part
      current_part_rect = legend_part.node().getBoundingClientRect();

      if (!is_defined(last_part_rect)) { // xpos for first legend element
        legend_part_x = 0;
      }
      else if ((all_y_fields.length <= 2 ||
          index !== this.y_fields.length) &&
          legend_part_x +
          last_part_rect.width + current_part_rect.width + 10 <=
          width - 40 + this.margin.left + this.margin.right) {
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
  }

  renderGradients(records) {
    const get_y_area = (field, y_scale) =>
      d3.svg.area()
        .x(d => this.x_scale(d[this.x_field]))
        .y0(d => y_scale(0))
        .y1(d => y_scale(d[field]))
        .defined(d => is_defined(d[field]));

    const areas = {};

    if (this.y_area) {
      for (const y_field_name of this.y_fields) {
        areas[y_field_name] = get_y_area(y_field_name, this.y_scale);
      }
    }

    if (this.y2_area) {
      for (const y_field_name of this.y2_fields) {
        areas[y_field_name] = get_y_area(y_field_name, this.y2_scale);
      }
    }

    for (const [field_name, area] of Object.entries(areas)) {
      let fill;
      if (this.quantile_fill) {
        const gradient = this.defs.append('linearGradient');
        gradient
          .attr('x1', '0%')
          .attr('x2', '100%')
          .attr('y1', '0')
          .attr('y2', '0')
          .attr('id', 'gradient_' + field_name)
          .attr('xlink:href', '#gradient_' + field_name);

        const q_info = data_quantile_info(records,
          field_name, this.x_field);

        gradient.append('stop')
          .attr('offset', '0%')
          .style('stop-color', quantiles_colors_gradient(0.0))
          .style('stop-opacity', '1.0');

        let prev_quantile = 0.0;

        gradient.append('stop')
          .attr('offset', '0%')
          .style('stop-color', quantiles_colors_gradient(0.0))
          .style('stop-opacity', '1.0');

        for (let q_index = 0; q_index < records.length; q_index++) {
          const q_value = records[q_index][this.x_field];
          const percent = 100 * (q_value - q_info.min_value) /
            (q_info.max_value - q_info.min_value);
          const quantile = q_info.record_quantiles[q_index];

          if (quantile !== prev_quantile) {
            if (q_index > 0) {
              gradient.append('stop')
                .attr('offset', percent.toFixed(5) + '%')
                .style('stop-color', quantiles_colors_gradient(prev_quantile))
                .style('stop-opacity', '1.0');
            }

            gradient.append('stop')
              .attr('offset', percent.toFixed(5) + '%')
              .style('stop-color', quantiles_colors_gradient(quantile))
              .style('stop-opacity', '1.0');

            prev_quantile = quantile;
          }
        }
        fill = 'url(\'#gradient_' + field_name + '\')';
      }
      else {
        fill = this.scaleColor(field_name);
      }

      const new_path = this.svg.append('path');
      new_path
        .attr('id', 'area_' + field_name)
        .datum(records)
        .style('fill', fill)
        .style('opacity', 0.33)
        .attr('d', area);

      this.svg.select('#area_' + field_name)
        .datum(records)
        .attr('d', area);
    }
  }

  generateCsvData(controller, data) {
    const cols = data.column_info.columns;
    const column_selection = [this.x_field];
    const column_labels = [
      column_label(cols[this.x_field], true, false, this.show_stat_type),
    ];

    const all_y_fields = this.y_fields.concat(this.y2_fields);

    for (let index = 0; index < all_y_fields.length; index++) {
      column_selection.push(all_y_fields[index]);
      column_labels.push(column_label(
        cols[all_y_fields[index]], true, false, this.show_stat_type
      ));
    }
    return csv_from_records(
      data.records,
      data.column_info,
      column_selection,
      column_labels,
      controller.display.getTitle()
    );
  }

  generateHtmlTableData(controller, data) {
    const cols = data.column_info.columns;
    const column_selection = [this.x_field];
    const column_labels = [
      column_label(cols[this.x_field], true, false, this.show_stat_type),
    ];

    const all_y_fields = this.y_fields.concat(this.y2_fields);

    for (let index = 0; index < all_y_fields.length; index++) {
      column_selection.push(all_y_fields[index]);
      column_labels.push(column_label(
        cols[all_y_fields[index]], true, false, this.show_stat_type));
    }

    return html_table_from_records(
      data.records,
      data.column_info,
      column_selection,
      column_labels,
      controller.display.getTitle(),
      controller.data_src.getParam('filter')
    );
  }

  evaluateParams(gen_params) {
    super.evaluateParams(gen_params);

    if (gen_params.x_field) {
      this.x_field = gen_params.x_field;
    }

    this.is_timeline = false;
    this.y_area = false;
    this.y2_area = false;
    this.quantile_fill = 0;
    this.fill_in_missing = 0;

    if (is_defined(gen_params.extra)) {
      if (is_defined(gen_params.extra.is_timeline)) {
        this.is_timeline = gen_params.extra.is_timeline;
      }
      if (!this.is_timeline && is_defined(gen_params.extra.fill_in_missing)) {
        this.fill_in_missing = gen_params.extra.fill_in_missing;
      }
      if (is_defined(gen_params.extra.y_area)) {
        this.y_area = gen_params.extra.y_area;
      }
      if (is_defined(gen_params.extra.y2_area)) {
        this.y2_area = gen_params.extra.y2_area;
      }
      if (is_defined(gen_params.extra.quantile_fill)) {
        this.quantile_fill = gen_params.extra.quantile_fill;
      }
    }

    if (gen_params.y_fields && gen_params.y_fields[0] &&
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

    if (has_value(gen_params.t_field)) {
      this.t_field = gen_params.t_field;
    }
    else {
      this.t_field = 'value';
    }

    if (has_value(gen_params.fillers)) {
      this.fillers = gen_params.fillers;
    }
    else {
      this.fillers = {};
    }

    if (this.is_timeline) {
      this.x_scale = d3.time.scale.utc();
      this.x_axis = d3.svg.axis().scale(this.x_scale).orient('bottom').ticks(6);
      this.setDataTransformFunc(this.timeLine);
    }
    else if (this.fill_in_missing) {
      this.setDataTransformFunc(fill_in_numbered_records);
    }
  }

  getRoundedX(mouse_x, x_min, x_max) {
    if (this.is_timeline) {
      const rounded_x = this.x_step.round(this.x_scale.invert(mouse_x));
      if (rounded_x.getTime() > x_max.getTime()) {
        return x_max;
      }
      else if (rounded_x.getTime() < x_min.getTime()) {
        return x_min;
      }
      return rounded_x;
    }

    const rounded_x = Math.round(this.x_scale.invert(mouse_x));
    if (rounded_x > x_max) {
      return x_max;
    }
    else if (rounded_x < x_min) {
      return x_min;
    }
    return rounded_x;
  };

  timeLine(old_data) {
    let fill_empty_records = false;
    if (this.y_fields[0].substr(0, 5) === 'count' ||
      this.y_fields[0].substr(0, 7) === 'c_count' ||
      this.y2_fields[0].substr(0, 5) === 'count' ||
      this.y2_fields[0].substr(0, 7) === 'c_count' ||
      this.fill_in_missing) {
      fill_empty_records = true;
    }

    const new_data = {
      records: [],
      column_info: {},
      filter_info: old_data.filter_info,
    };

    const {column_info} = new_data;

    column_info.group_column = old_data.column_info.group_column;
    column_info.subgroup_column = old_data.column_info.subgroup_column;
    column_info.data_columns = old_data.column_info.data_columns;
    column_info.columns = {};

    const generate_label = (column, capitalize_label, include_type,
        include_stat) => {
      let suffix = '';
      if (this.x_step === d3.time.day.utc) {
        suffix = ' / day';
      }
      else if (this.x_step === d3.time.week.utc) {
        suffix = ' / week';
      }
      else if (this.x_step === d3.time.month.utc) {
        suffix = ' / month';
      }
      else if (this.x_step === d3.time.year.utc) {
        suffix = ' / year';
      }
      return default_column_label(
        column,
        capitalize_label,
        include_type,
        include_stat
      ) + suffix;
    };

    for (const column_name in old_data.column_info.columns) {
      const column = old_data.column_info.columns[column_name];
      if (column_name === this.t_field) {
        column_info.columns[column_name] = {};
        for (const info in column) {
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
        for (const info in column) {
          column_info.columns[column_name][info] = column[info];
        }
        column_info.columns[column_name].label_generator = generate_label;
      }
      else {
        column_info.columns[column_name] =
          old_data.column_info.columns[column_name];
      }
    }

    if (old_data.records.length === 0) {
      return new_data;
    }

    let t_index = 0;
    while (!is_date(old_data.records[t_index][this.t_field])) {
      t_index++;
    }

    const t_min = new Date(old_data.records[t_index][this.t_field].getTime());
    t_index = old_data.records.length - 1;
    while (!is_date(old_data.records[t_index][this.t_field])) {
      t_index--;
    }

    /* Add 1 millisecond to ensure the range function give the correct results
     * This addition should be negligible since timestamps in OpenVAS have
     *  a resolution of 1 second */
    const t_max = new Date(
      old_data.records[t_index][this.t_field].getTime() + 1);
    const interval_days = (t_max.getTime() - t_min.getTime() - 1) / 86400000;

    let times;
    t_index = 0;

    if (interval_days <= 100) {
      this.x_step = d3.time.day.utc;
      times = d3.time.day.range.utc(d3.time.day.utc.floor(t_min), t_max);
    }
    else if (interval_days <= 750) {
      this.x_step = d3.time.week.utc;
      times = d3.time.week.range.utc(d3.time.week.utc.floor(t_min), t_max);
    }
    else if (interval_days <= 3650) {
      this.x_step = d3.time.month.utc;
      times = d3.time.month.range.utc(d3.time.month.utc.floor(t_min), t_max);
    }
    else {
      this.x_step = d3.time.year.utc;
      times = d3.time.year.range.utc(d3.time.year.utc.floor(t_min), t_max);
    }

    let data_index = 0;

    for (t_index in times) {
      const prev_values = {};
      const new_record = {};
      const values = {};
      const t = times[t_index];

      new_record[this.t_field] = t;

      let has_values = false;
      while (data_index < old_data.records.length &&
        (t_index >= times.length - 1 ||
          !is_date(old_data.records[data_index][this.t_field]) ||
          old_data.records[data_index][this.t_field].getTime() <
          times[Number(t_index) + 1].getTime())) {
        // collect values from origin data which fit to the time value
        if (!is_date(old_data.records[data_index][this.t_field])) {
          data_index++;
          continue;
        }

        for (const field in old_data.records[data_index]) {
          if (field !== this.t_field) {
            let field_column_data = column_info.columns[field];

            if (field.indexOf('value[') === 0) {
              field_column_data = column_info.columns.subgroup_value;
            }

            if (!is_defined(values[field])) {
              values[field] = old_data.records[data_index][field];
            }
            else if (field_column_data.stat === 'sum' ||
              field_column_data.stat === 'count') {
              values[field] += Number(old_data.records[data_index][field]);
            }
            else if (field_column_data.stat === 'min') {
              values[field] = Math.min(values[field],
                Number(old_data.records[data_index][field]));
            }
            else if (field_column_data.stat === 'max' ||
              field_column_data.stat === 'c_count') {
              values[field] = Math.max(values[field],
                Number(old_data.records[data_index][field]));
            }
          }
        }
        data_index++;
      }
      for (const field in old_data.column_info.columns) {
        if (field !== this.t_field) {
          if (has_value(values[field])) {
            prev_values[field] = values[field];
            new_record[field] = values[field];
            has_values = true;
          }
          else if (this.fillers[field] === '!previous') {
            new_record[field] = prev_values[field] ? prev_values[field] : 0;
          }
          else if (has_value(this.fillers[field])) {
            new_record[field] = this.fillers[field];
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
  }

  duration_tick_format(val) {
    val = Math.round(val);

    if (val >= ONE_DAY) {
      const days = Math.floor(val / ONE_DAY);
      const hours = Math.floor((val - days * ONE_DAY) / ONE_HOUR);

      if (hours === 0) {
        return days + 'd';
      }
      return days + 'd' + zero_pad(hours) + 'h';
    }
    else if (val >= 3600) {
      const hours = Math.floor(val / ONE_HOUR);
      const minutes = Math.floor((val - hours * ONE_HOUR) / ONE_MINUTE);

      if (minutes === 0) {
        return hours + 'h';
      }
      return hours + 'h' + zero_pad(minutes) + 'm';
    }
    else if (val >= 60) {
      const minutes = Math.floor(val / ONE_MINUTE);
      const seconds = Math.floor(val % ONE_MINUTE);
      if (seconds === 0) {
        return minutes + 'm';
      }
      return minutes + 'm' + zero_pad(seconds) + 's';
    }
    return val.toFixed(0) + 's';
  }

  duration_ticks(min, max, number) {
    const approx_step = (max - min) / number;
    const steps = [1, 2, 5, 10, 15, 30,
      1 * 60, 2 * 60, 5 * 60, 10 * 60, 15 * 60, 30 * 60,
      1 * 3600, 2 * 3600, 3 * 3600, 6 * 3600, 12 * 3600, 24 * 3600];
    let step;

    for (let i = 0; i < steps.length && !is_defined(step); i++) {
      if (approx_step <= steps[i]) {
        step = steps[i];
      }
    }

    const rounded_max = Math.ceil(max / step) * step;
    const ticks = [];
    for (let i = 0; (min + i * step) <= rounded_max; i++) {
      ticks.push(min + i * step);
    }
    return ticks;
  }
}

register_chart_generator('line', LineChartGenerator);

// vim: set ts=2 sw=2 tw=80:
