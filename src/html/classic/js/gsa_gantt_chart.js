/*
 * Greenbone Security Assistant
 * $Id$
 * Description: Gantt chart in GSA.
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

  gsa.register_chart_generator('gantt', create_new_gantt_chart_generator);

  function create_new_gantt_chart_generator() {
    return new GanttChartGenerator();
  }

  /* Schedule data extractor */
  function data_task_schedules(old_data, gen_params) {
    var new_data = {
      records: [],
      column_info: old_data.column_info,
    };

    for (var i in old_data.records) {
      var record = old_data.records[i];
      if (record.schedule_id !== '' && record.schedule_next_time !== 'over') {
        new_data.records.push(record);
      }
    }

    new_data.records.sort(function(a, b) {
      return Date.parse(a.schedule_next_time) -
        Date.parse(b.schedule_next_time);
    });

    return new_data;
  }

  function GanttChartGenerator() {
    gsa.BaseChartGenerator.call(this, 'gantt');
  }

  GanttChartGenerator.prototype = Object.create(
      gsa.BaseChartGenerator.prototype);
  GanttChartGenerator.prototype.constructor = GanttChartGenerator;

  GanttChartGenerator.prototype.init = function() {
    this.margin = {top: 30, right: 40, bottom: 40, left: 30};
    this.x_label = '';
    this.y_label = '';

    this.x_field = 'name';
    this.y_field = 'schedule_next_time'; // == time_field

    this.show_stat_type = true;

    this.setDataTransformFunc(data_task_schedules);
    this.setTitleGenerator(gsa.title_static(
      gsa._('Loading Gantt chart ...'), gsa._('Gantt Chart')));
  };

  GanttChartGenerator.prototype.generate = function(original_data, controller,
      gen_params) {
    var display = controller.display();
    var update = this.mustUpdate(display);

    var data;

    var self = this;

    this.x_scale = d3.scale.ordinal();
    this.y_scale = d3.time.scale.utc(); // == time_scale

    this.x_axis = d3.svg.axis()
      .scale(this.x_scale)
      .tickFormat('')
      .orient('left');

    var time_format = d3.time.format.utc.multi([
        ['.%L', function(d) { return d.getUTCMilliseconds(); }],
        [':%S', function(d) { return d.getUTCSeconds(); }],
        ['%H:%M', function(d) { return d.getUTCMinutes(); }],
        ['%H:%M', function(d) { return d.getUTCHours(); }],
        ['%b %d', function(d) { return d.getUTCDate() !== 1; }],
        ['%b', function(d) { return d.getUTCMonth(); }],
        ['%Y', function() { return true; }]
    ]);

    this.y_axis = d3.svg.axis()
      .scale(self.y_scale)
      .ticks(7)
      .tickFormat(time_format)
      .orient('bottom'); // == time_axis

    var column_info;
    var x_data;
    var empty_text = '';
    var display_records;
    var limit = 10;

    data = this.generateData(original_data, controller, gen_params);
    if (data === null) {
      return;
    }

    var records = data.records;

    display.setTitle(this.title_generator(data));

    if (gen_params.extra.empty_text) {
      empty_text = gen_params.extra.empty_text;
    }
    else {
      empty_text = gsa._('No matching {{resource_type}}',
          gsa.resource_type_name(column_info.columns[this.x_field].type));
    }

    if (limit) {
      display_records = records.slice(0, limit);
    }
    else {
      display_records = records;
    }

    x_data = display_records.map(function(d) { return d[self.x_field]; });

    // Setup display parameters
    var height = display.svg().attr('height') - this.margin.top -
      this.margin.bottom;
    var width = display.svg().attr('width') - this.margin.left -
      this.margin.right;

    // Setup scales
    var start_date = new Date();
    var scale_days = 7;
    var end_date;

    start_date.setUTCMinutes(start_date.getUTCMinutes() -
        start_date.getTimezoneOffset());
    start_date.setUTCMinutes(0);
    start_date.setUTCSeconds(0);
    start_date.setUTCMilliseconds(0);

    end_date = new Date(start_date);
    end_date.setUTCDate(end_date.getUTCDate() + scale_days);

    self.y_scale.domain([start_date, end_date])
      .range([0, width]);

    this.x_scale.domain(x_data)
      .rangeRoundBands([height, 0], 0.125);

    if (!update) {
      display.svg().text('');

      var defs = display.svg().append('defs');
      var gradient1 = defs.append('linearGradient')
        .attr('id', 'green_fill_gradient')
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y1', '0%');

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

      var gradient2 = defs.append('linearGradient')
        .attr('id', 'green_stroke_gradient')
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y1', '0%');

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

      this.svg = display.svg().append('g');

      display.svg().on('mousemove', null);
      display.svg().on('mouseleave', null);

      this.svg.attr('transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')');

      this.x_axis_elem = this.svg.append('g')
        .attr('class', 'x axis')
        .call(self.x_axis);

      this.y_axis_elem = this.svg.append('g')
        .attr('class', 'y axis')
        .call(this.y_axis);
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

    // Update chart
    this.y_axis_elem.attr('transform',
      'translate (' + 0 + ',' + height + ')');

    this.x_axis_elem.call(self.x_axis);
    this.y_axis_elem.call(self.y_axis);

    this.svg.selectAll('.bar-group')
      .data(display_records)
      .enter()
      .insert('g')
      .attr('class', 'bar-group');

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
      .enter()
      .insert('text')
      .attr('class', 'bar-label')
      .attr('x', '3px')
      .style('dominant-baseline', 'middle')
      .style('font-size', '10px');

    this.svg.selectAll('.bar-group')
      .data(display_records)
      .attr('transform', function(d) {
        return 'translate(' + 0 + ',' + (height - self.x_scale(
                d[self.x_field]) - self.x_scale.rangeBand()) + ')';
      })
      .each(function(d, i) {
        var sel = d3.select(this);
        var r_start = Date.parse(d.schedule_next_time.substr(0, 19) +
            '+00:00');
        var r_duration = Number(d.schedule_duration);
        var r_period = Number(d.schedule_period);
        var r_period_months = Number(d.schedule_period_months);
        var r_periods = Number(d.schedule_periods);
        var r_length = r_duration ? r_duration * 1000 :
          r_period ? Math.min(r_period * 1000, 3600000 * 24) : 3600000 * 24;
        var offset = +(self.y_scale.domain()[0]);

        var bar_starts = [];
        var future_runs = 0;

        var new_date = new Date(r_start);
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

        for (i = 1;
            (+new_date <= +end_date) &&
            (i < r_periods || (r_periods === 0 && r_period > 0)); i++) {

          new_date = new Date(1000 * r_period * i + r_start);
          new_date.setUTCMonth(new_date.getUTCMonth() + i * r_period_months);

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
          .style('fill', function(d) {
            return r_duration ? '#71C000' : 'url(#green_fill_gradient)';
          })
          .style('stroke', function(d) {
            return r_duration ? '#549330' : 'url(#green_stroke_gradient)';
          })
          .attr('x', function(start) { return self.y_scale(start); })
          .attr('width', function(start) {
            return self.y_scale(offset + Math.min(r_length, end_date - start));
          })
          .attr('height', self.x_scale.rangeBand())
          .attr('title', function(start) {
            var text = d.name;
            text += '\nStart: ' + gsa.datetime_format(new Date(start));
            if (r_duration) {
              text += '\nEnd: ' + gsa.datetime_format(new Date(
                    +start + r_duration * 1000));
            }
            else {
              text += '\nNo scheduled end';
            }
            return text;
          });

        sel.selectAll('rect')
          .data(bar_starts)
          .exit()
          .remove();

        var future_runs_text;
        if (future_runs === Number.POSITIVE_INFINITY) {
          future_runs_text = 'More runs not shown';
        }
        else if (future_runs === 1) {
          future_runs_text = '1 more run not shown';
        }
        else {
          future_runs_text = future_runs + ' more runs not shown';
        }

        future_runs_text += '\nNext scheduled run: ' +
          gsa.datetime_format(new_date);

        sel.selectAll('.future-marker')
          .data(future_runs ? [1] : [])
          .enter()
          .insert('polygon')
          .attr('class', 'future-marker')
          .style('opacity', 0.5)
          .style('fill', '#549330')
          .style('stroke', '#549330')
          .attr('points',
              (width + 5) + ',' + (self.x_scale.rangeBand() / 8) +
              ' ' + (width + 20) + ',' + (self.x_scale.rangeBand() / 2) +
              ' ' + (width + 5) + ',' + (7 * self.x_scale.rangeBand() / 8))
          .attr('title', future_runs_text);

        sel.selectAll('.future-marker')
          .data(future_runs ? [1] : [])
          .attr('points', function() {
            return (width + 5) + ',' + (self.x_scale.rangeBand() / 8) +
              ' ' + (width + 20) + ',' + (self.x_scale.rangeBand() / 2) +
              ' ' + (width + 5) + ',' + (7 * self.x_scale.rangeBand() / 8);
          });
      });

    this.svg.selectAll('.bar-label-shadow')
      .data(display_records)
      .text(function(d) { return d.name; })
      .attr('y', function(d) {
        return (height - self.x_scale(d[self.x_field]) -
            (self.x_scale.rangeBand() / 2));
      });

    this.svg.selectAll('.bar-label')
      .data(display_records)
      .text(function(d) { return d.name; })
      .attr('y', function(d) {
        return (height - self.x_scale(d[self.x_field]) -
            (self.x_scale.rangeBand() / 2));
      });

    this.addMenuItems(controller, data);
  };

  GanttChartGenerator.prototype.generateData = function(original_data,
      controller, gen_params) {
    // Extract records and column info
    var cmd = controller.data_src().command();
    if (cmd === 'get_tasks') {
      return this.transformData(original_data, gen_params);
    }
    else {
      console.error('Unsupported command:' + cmd);
      return null;
    }
  };

  GanttChartGenerator.prototype.generateCsvData = function(controller, data) {
    var cols = data.column_info.columns;
    return gsa.csv_from_records(data.records, data.column_info,
        [this.x_field, this.y_field],
        [gsa.column_label(cols[this.x_field], true, false, this.show_stat_type),
        gsa.column_label(cols[this.y_field], true, false, this.show_stat_type)],
        controller.display().header().text());
  };

  GanttChartGenerator.prototype.generateHtmlTableData = function(controller,
      data) {
    var cols = data.column_info.columns;
    return gsa.html_table_from_records(data.records, data.column_info,
        [this.x_field, this.y_field],
        [gsa.column_label(cols[this.x_field], true, false, this.show_stat_type),
        gsa.column_label(cols[this.y_field], true, false, this.show_stat_type)],
        controller.display().header().text(),
        controller.data_src().param('filter'));
  };

})(window, window, window.d3, window.console, window.gsa);

// vim: set ts=2 sw=2 tw=80:
