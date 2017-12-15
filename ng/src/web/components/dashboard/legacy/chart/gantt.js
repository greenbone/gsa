
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
import d3 from 'd3';
import d3tip from 'd3-tip';

import _ from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import {
  column_label,
  csv_from_records,
  datetime_format,
  goto_details_page,
  html_table_from_records,
  title_static,
  resource_type_name,
} from '../helper.js';

import {register_chart_generator} from '../controller.js';

import TaskChartGenerator from './task.js';

/* Schedule data extractor */
const data_task_schedules = (old_data, gen_params) => {
  const new_data = {
    records: [],
    column_info: old_data.column_info,
    filter_info: old_data.filter_info,
  };

  for (const record of old_data.records) {
    // only add records with valid schedules
    if (is_defined(record.schedule_id) && record.schedule_id !== '' &&
        record.schedule_next_time !== 'over') {
      new_data.records.push(record);
    }
  }

  new_data.records.sort(function(a, b) {
    return Date.parse(a.schedule_next_time) -
      Date.parse(b.schedule_next_time);
  });

  return new_data;
};

function get_start_title(d, duration, start) {
  let text = d.name;
  text += '\nStart: ' + datetime_format(new Date(start));
  if (duration) {
    text += '\nEnd: ' + datetime_format(new Date(+start + duration * 1000));
  }
  else {
    text += '\nNo scheduled end';
  }
  return text;
}

const get_start_title_func = (d, duration) => start =>
  get_start_title(d, duration, start);

const get_start_title_tooltip_func = (d, duration, tip_func) => start => {
  const title = get_start_title(d, duration, start);
  tip_func.show(title, d3.event.target);
};

const DEFAULT_LIMIT = 10;

class GanttChartGenerator extends TaskChartGenerator {

  constructor() {
    super('gantt');
  }

  init() {
    this.margin = {
      top: 30,
      right: 40,
      bottom: 40,
      left: 30,
    };
    this.x_label = '';
    this.y_label = '';
    this.x_field = 'name';
    this.y_field = 'schedule_next_time'; // == time_field
    this.limit = DEFAULT_LIMIT;

    this.show_stat_type = true;

    this.setDataTransformFunc(data_task_schedules);
    this.setTitleGenerator(title_static(_('Loading Gantt chart ...'),
      _('Gantt Chart')));
  }

  evaluateParams(gen_params) {
    super.evaluateParams(gen_params);

    if (gen_params.extra.empty_text) {
      this.empty_text = gen_params.extra.empty_text;
    }
  }

  generate(svg, data, update) {
    this.x_scale = d3.scale.ordinal();
    this.y_scale = d3.time.scale.utc(); // == time_scale

    this.x_axis = d3.svg.axis()
      .scale(this.x_scale)
      .tickFormat('')
      .orient('left');

    const time_format = d3.time.format.utc.multi([
      ['.%L', d => d.getUTCMilliseconds()],
      [':%S', d => d.getUTCSeconds()],
      ['%H:%M', d => d.getUTCMinutes()],
      ['%H:%M', d => d.getUTCHours()],
      ['%b %d', d => d.getUTCDate() !== 1],
      ['%b', d => d.getUTCMonth()],
      ['%Y', () => true],
    ]);

    this.y_axis = d3.svg.axis()
      .scale(this.y_scale)
      .ticks(7)
      .tickFormat(time_format)
      .orient('bottom'); // == time_axis

    const {records, column_info} = data;

    if (!is_defined(this.empty_text)) {
      this.empty_text = _('No matching {{resource_type}}',
        resource_type_name(column_info.columns[this.x_field].type));
    }

    let display_records;
    if (this.limit > 0) {
      display_records = records.slice(0, this.limit);
    }
    else {
      display_records = records;
    }

    const x_data = display_records.map(d => d[this.x_field]);

    // Setup display parameters
    const height = svg.attr('height') - this.margin.top -
      this.margin.bottom;
    const width = svg.attr('width') - this.margin.left -
      this.margin.right;

    // Setup scales
    const scale_days = 7;
    const start_date = new Date();
    start_date.setUTCMinutes(start_date.getUTCMinutes() -
      start_date.getTimezoneOffset());
    start_date.setUTCMinutes(0);
    start_date.setUTCSeconds(0);
    start_date.setUTCMilliseconds(0);

    const end_date = new Date(start_date);
    end_date.setUTCDate(end_date.getUTCDate() + scale_days);

    this.y_scale
      .domain([start_date, end_date])
      .range([0, width]);
    this.x_scale.domain(x_data)
      .rangeRoundBands([height, 0], 0.125);

    if (update) {
      svg.text('');
      const defs = svg.append('defs');

      const gradient1 = defs.append('linearGradient')
        .attr('id', 'green_fill_gradient')
        .attr('xlink:href', '#green_fill_gradient')
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y2', '0%');

      gradient1.append('stop')
        .attr('offset', '0%')
        .style('stop-color', '#71C000')
        .style('stop-opacity', '1.0');

      gradient1.append('stop')
        .attr('offset', '25%')
        .style('stop-color', '#71C000')
        .style('stop-opacity', '1.0');

      gradient1.append('stop')
        .attr('offset', '100%')
        .style('stop-color', '#71C000')
        .style('stop-opacity', '0.1');

      const gradient2 = defs.append('linearGradient')
        .attr('id', 'green_stroke_gradient')
        .attr('xlink:href', '#green_stroke_gradient')
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y2', '0%');

      gradient2.append('stop')
        .attr('offset', '0%')
        .style('stop-color', '#549330')
        .style('stop-opacity', '1.0');

      gradient2.append('stop')
        .attr('offset', '25%')
        .style('stop-color', '#549330')
        .style('stop-opacity', '1.0');

      gradient2.append('stop')
        .attr('offset', '100%')
        .style('stop-color', '#549330')
        .style('stop-opacity', '0.1');

      this.svg = svg.append('g');

      svg.on('mousemove', null);
      svg.on('mouseleave', null);

      this.svg.attr('transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')');

      this.x_axis_elem = this.svg.append('g')
        .attr('class', 'x axis')
        .call(this.x_axis);

      this.y_axis_elem = this.svg.append('g')
        .attr('class', 'y axis')
        .call(this.y_axis);
    }

    // Add a text if records list is empty
    const dummy_data = [];
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
      .text(this.empty_text);

    this.svg.selectAll('.empty_text')
      .data(dummy_data)
      .exit()
      .remove();

    this.svg.selectAll('.empty_text')
      .data(dummy_data)
      .attr('x', width / 2)
      .attr('y', height / 2);

    // Function to generate click handler
    const handler = d => {
      if (this.noChartLinks) {
        return;
      }

      const {type} = column_info.columns.id;
      return goto_details_page(type, d.id);
    };

    // Update chart
    this.y_axis_elem.attr('transform', 'translate (' + 0 + ',' + height + ')');
    this.x_axis_elem.call(this.x_axis);
    this.y_axis_elem.call(this.y_axis);

    this.svg.selectAll('.bar-group')
      .data(display_records)
      .exit()
      .remove();

    this.svg.selectAll('.bar-group')
      .data(display_records)
      .enter()
      .insert('g')
      .attr('class', 'bar-group')
      .insert('a')
      .on('click', handler);

    this.svg.selectAll('.bar-label-shadow')
      .data(display_records)
      .exit()
      .remove();

    this.svg.selectAll('.bar-label-shadow')
      .data(display_records)
      .enter()
      .insert('text')
      .attr('class', 'bar-label-shadow')
      .attr('x', '3px')
      .style('dominant-baseline', 'middle')
      .style('font-size', '10px')
      .style('stroke', '#EEEEEE')
      .style('stroke-opacity', '0.75')
      .style('stroke-width', '3px');

    this.svg.selectAll('.bar-label')
      .data(display_records)
      .exit()
      .remove();

    this.svg.selectAll('.bar-label')
      .data(display_records)
      .enter()
      .insert('text')
      .attr('class', 'bar-label')
      .attr('x', '3px')
      .style('dominant-baseline', 'middle')
      .style('font-size', '10px');

    this.svg.selectAll('.bar-group')
      .data(display_records)
      .attr('transform', d => 'translate(' + 0 + ',' + (height -
          this.x_scale(d[this.x_field]) - this.x_scale.rangeBand()) + ')'
      );

    const tip = d3tip()
      .attr('class', 'd3-tip')
      .style('font-weight', 'bold')
      .offset([-10, 0])
      .html(d => d);

    this.svg.call(tip);

    const offset = +this.y_scale.domain()[0];
    const {x_scale, y_scale} = this;

    this.svg.selectAll('.bar-group a')
      .data(display_records)
      .each(function(d, i) {
        const sel = d3.select(this);
        const r_start = Date.parse(d.schedule_next_time.substr(0, 19) +
          '+00:00');
        const r_duration = Number(d.schedule_duration);
        const r_period = Number(d.schedule_period);
        const r_period_months = Number(d.schedule_period_months);
        const r_periods = Number(d.schedule_periods);
        const r_length = r_duration ? r_duration * 1000 :
          r_period ? Math.min(r_period * 1000, 3600000 * 24) : 3600000 * 24;
        const bar_starts = [];

        let new_date = new Date(r_start);

        let future_runs = 0;
        if (+new_date <= +end_date) {
          bar_starts.push(new_date);
        }
        else if (r_periods === 0 && (r_period !== 0 ||
          r_period_months !== 0)) {
          future_runs = Number.POSITIVE_INFINITY;
        }
        else {
          future_runs = 1;
        }

        for (let j = 1; (+new_date <= +end_date) &&
          (j < r_periods || (r_periods === 0 && r_period > 0)); j++) { // eslint-disable-line no-unmodified-loop-condition
          new_date = new Date(1000 * r_period * j + r_start);
          new_date.setUTCMonth(new_date.getUTCMonth() + j * r_period_months);
          if (+new_date > +end_date) {
            if (r_periods === 0) {
              future_runs = Number.POSITIVE_INFINITY;
              break;
            }
            else {
              future_runs++;
            }
          }
          bar_starts.push(new_date);
        }

        sel.selectAll('rect')
          .data(bar_starts)
          .enter()
          .insert('rect');

        sel.selectAll('rect')
          .data(bar_starts)
          .style('fill', () => r_duration ? '#71C000' :
            'url(#green_fill_gradient)')
          .style('stroke', () => r_duration ? '#549330' :
            'url(#green_stroke_gradient)')
          .attr('x', start => y_scale(start))
          .attr('width', start => y_scale(
            offset + Math.min(r_length, end_date - start)))
          .attr('height', x_scale.rangeBand())
          .on('mouseout', tip.hide)
          .on('mouseover', get_start_title_tooltip_func(
            d, r_duration, tip))
          .attr('title', get_start_title_func(d, r_duration));

        sel.selectAll('rect')
          .data(bar_starts)
          .exit()
          .remove();

        let future_runs_text;
        if (future_runs === Number.POSITIVE_INFINITY) {
          future_runs_text = _('More runs not shown.');
        }
        else if (future_runs === 1) {
          future_runs_text = _('One more run not shown.');
        }
        else {
          future_runs_text = _('{{num}} more runs not shown.',
            {num: future_runs});
        }

        future_runs_text += '\n';
        future_runs_text += _('Next scheduled run: {{date}}',
          {date: datetime_format(new_date)});

        sel.selectAll('.future-marker')
          .data(future_runs ? [1] : [])
          .enter()
          .insert('polygon')
          .attr('class', 'future-marker')
          .style('opacity', 0.5)
          .style('fill', '#549330')
          .style('stroke', '#549330')
          .attr('points', (width + 5) + ',' + (x_scale.rangeBand() / 8) +
          ' ' + (width + 20) + ',' + (x_scale.rangeBand() / 2) +
          ' ' + (width + 5) + ',' + (7 * x_scale.rangeBand() / 8))
          .on('mouseout', tip.hide)
          .on('mouseover', () => tip.show(
            future_runs_text, d3.event.target))
          .attr('title', future_runs_text);

        sel.selectAll('.future-marker')
          .data(future_runs ? [1] : [])
          .attr('points', () =>
            (width + 5) + ',' + (x_scale.rangeBand() / 8) +
              ' ' + (width + 20) + ',' + (x_scale.rangeBand() / 2) +
              ' ' + (width + 5) + ',' + (7 * x_scale.rangeBand() / 8)
          );
      });

    this.svg.selectAll('.bar-label-shadow')
      .data(display_records)
      .text(d => d.name)
      .attr('y', d => height - this.x_scale(d[this.x_field]) -
        (this.x_scale.rangeBand() / 2));

    this.svg.selectAll('.bar-label')
      .data(display_records)
      .text(d => d.name)
      .attr('y', d => height - this.x_scale(d[this.x_field]) -
          (this.x_scale.rangeBand() / 2));
  }

  generateCsvData(controller, data) {
    const cols = data.column_info.columns;
    return csv_from_records(
      data.records,
      data.column_info,
      [this.x_field, this.y_field],
      [
        column_label(cols[this.x_field], true, false, this.show_stat_type),
        column_label(cols[this.y_field], true, false, this.show_stat_type),
      ],
      controller.display.header.text
    );
  }

  generateHtmlTableData(controller, data) {
    const cols = data.column_info.columns;
    return html_table_from_records(
      data.records,
      data.column_info,
      [this.x_field, this.y_field],
      [
        column_label(cols[this.x_field], true, false, this.show_stat_type),
        column_label(cols[this.y_field], true, false, this.show_stat_type),
      ],
      controller.display.getTitle(),
      controller.data_src.getParam('filter'),
    );
  }
}

register_chart_generator('gantt', GanttChartGenerator);

// vim: set ts=2 sw=2 tw=80:
