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

  var gch = gsa.charts;

  gch.register_chart_generator('horizontal_bar', HorizontalBarChartGenerator);

  function default_bar_style(d) {
    return ('');
  }

  /*
  * Transform data into a top 10 list.
  */
  function data_top_list(old_data, params) {
    var new_data = {
      records: [],
      column_info: old_data.column_info,
      filter_info: old_data.filter_info
    };

    var y_field;
    if (gsa.is_defined(params.y_fields) && gsa.has_value(params.y_fields[0])) {
      y_field = params.y_fields[0];
    }
    else {
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
    gch.AggregateChartGenerator.call(this, 'h_bar');
  }

  HorizontalBarChartGenerator.prototype = Object.create(
      gch.get_chart_generator('bar').prototype);
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
    this.setBarStyle(default_bar_style);
    this.setTitleGenerator(gch.title_static(
      gsa._('Loading horizontal bar chart ...'),
      gsa._('Horizontal Bar Chart')));
  };

  HorizontalBarChartGenerator.prototype.evaluateParams = function(gen_params) {
    gch.get_chart_generator('bar').prototype.evaluateParams.call(
        this, gen_params);

    if (gsa.is_defined(gen_params.extra)) {
      this.empty_text = gen_params.extra.empty_text;
      this.score_severity = gen_params.extra.score_severity;
      this.score_assets = gen_params.extra.score_assets;
      this.score_asset_type = gen_params.extra.score_asset_type;
    }

    this.z_fields = gen_params.z_fields;

    if (!gsa.has_value(gen_params.chart_template) ||
        gen_params.chart_template === '') {
      if (gsa.is_array(this.z_fields) && gsa.is_string(this.z_fields[0])) {
        if (this.z_fields[0].indexOf('severity') !== -1) {
          this.setBarStyle(gch.severity_bar_style(this.z_fields[0],
            gsa.severity_levels.max_log,
            gsa.severity_levels.max_low,
            gsa.severity_levels.max_medium));
        }
      }
      else if (gsa.is_string(this.y_field) &&
          this.y_field.indexOf('severity') !== -1) {
        this.setBarStyle(gch.severity_bar_style(this.y_field,
              gsa.severity_levels.max_log,
              gsa.severity_levels.max_low,
              gsa.severity_levels.max_medium));
      }
    }
  };

  HorizontalBarChartGenerator.prototype.generate = function(svg, data, update) {
    var self = this;
    var x_data;
    var y_data; // == size_data

    if (!gsa.is_defined(this.empty_text)) {
      this.empty_text = gsa._('No matching {{resource_type}}',
          {
            resource_type: gch.resource_type_name(
                                data.column_info.columns[this.x_field].type)
          });
    }

    var records = data.records;
    x_data = records.map(function(d) { return d[self.x_field]; });
    y_data = records.map(function(d) { return d[self.y_field]; });

    var i;
    var y_sum = gsa.array_sum(y_data);
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
    var height = svg.attr('height') - this.margin.top -
      this.margin.bottom;
    var width = svg.attr('width') - this.margin.left -
      this.margin.right;

    this.x_scale.rangeRoundBands([0, height], 0.125);
    this.y_scale.range([0, width]);

    this.x_axis.tickFormat(function(d) {
          var text = d.toString();
          if (text.length > 25) {
            if (text.slice(0, 4) === 'cpe:') {
              return '…' + text.slice(Math.max(4, text.length - 25),
                  text.length);
            }
            else {
              return text.slice(0, 25) + '…';
            }
          }
          else {
            return text;
          }
        });

    this.x_scale.domain(x_data);
    this.y_scale.domain([0, y_max]).nice(10);

    if (update) {
      svg.text('');
      this.svg = svg.append('g');

      svg.on('mousemove', null);
      svg.on('mouseleave', null);

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
          var x, extra;
          if (d[self.x_field + '~long']) {
            x = d[self.x_field + '~long'];
          }
          else {
            x = d[self.x_field];
          }

          extra = '';
          if (gsa.is_defined(self.tooltips)) {
            for (var tooltip in self.tooltips) {

              if (self.tooltips[tooltip].label) {
                extra += '<br/><strong>' + self.tooltips[tooltip].label +
                  ':</strong> ';
              }
              else {
                extra += '<br/>';
              }

              if (gsa.is_date(d[self.tooltips[tooltip].field])) {
                extra += gch.datetime_format(d[self.tooltips[tooltip].field]);
              }
              else {
                extra += d[self.tooltips[tooltip].field];
              }
            }
          }

          if (self.y_field === 'count') {
            if (self.y_label !== '') {
              return '<strong>' + self.y_label + ' (' + x +
                  '):</strong><br/> ' + d[self.y_field] + ' (' +
                  (100 * d[self.y_field] / y_sum).toFixed(1) + '%)' +
                  extra;
            }
            else {
              return '<strong>' + x + ':</strong><br/> ' + d[self.y_field] +
                  ' (' + (100 * d[self.y_field] / y_sum).toFixed(1) + '%)' +
                  extra;
            }
          }
          else if (self.y_field.indexOf('severity_score') !== -1) {
            if (gsa.is_defined(self.score_severity) &&
                gsa.is_defined(self.score_assets) &&
                gsa.is_defined(self.score_asset_type)) {
              var breakdown_extra;
              if (self.score_asset_type === 'hosts') {
                breakdown_extra = gsa._('<br/>({{assets}} Host(s) with ' +
                      'average severity {{severity}})',
                    {
                      assets: d[self.score_assets],
                      severity: d[self.score_severity],
                    });
              }
              else {
                breakdown_extra = '';
              }

              if (self.y_label !== '') {
                return '<strong>' + self.y_label + ' (' + x +
                    '):</strong><br/> ' + d[self.y_field].toFixed(2) +
                    breakdown_extra + extra;
              }
              else {
                return '<strong>' + x + ':</strong><br/> ' +
                    d[self.y_field].toFixed(2) +
                    breakdown_extra + extra;
              }
            }
            else {
              if (self.y_label !== '') {
                return '<strong>' + self.y_label + ' (' + x +
                    '):</strong><br/> ' + d[self.y_field].toFixed(2) +
                    extra;
              }
              else {
                return '<strong>' + x + ':</strong><br/> ' +
                    d[self.y_field].toFixed(2) +
                    extra;
              }
            }
          }
          else if (self.y_field.indexOf('severity') !== -1) {
            if (self.y_label !== '') {
              return '<strong>' + self.y_label + ' (' + x +
                  '):</strong><br/> ' + d[self.y_field].toFixed(1) +
                  ' (' + gch.severity_level(d[self.y_field]) + ')' +
                  extra;
            }
            else {
              return '<strong>' + x + ':</strong><br/> ' +
                  d[self.y_field].toFixed(1) +
                  ' (' + gch.severity_level(d[self.y_field]) + ')' +
                  extra;
            }
          }
          else {
            if (self.y_label !== '') {
              return '<strong>' + self.y_label + ' (' + x +
                  '):</strong><br/> ' + d[self.y_field] + ' (' +
                  (100 * d[self.y_field] / y_max).toFixed(1) + '%)' +
                  extra;
            }
            else {
              return '<strong>' + x + ':</strong><br/> ' + d[self.y_field] +
                  ' (' + (100 * d[self.y_field] / y_max).toFixed(1) + '%)' +
                  extra;
            }
          }
        });
    }

    this.svg.attr('transform',
      'translate(' + this.margin.left + ',' + this.margin.top + ')');

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
      .text(this.empty_text);

    this.svg.selectAll('.empty_text')
      .data(dummy_data)
      .exit()
      .remove();

    this.svg.selectAll('.empty_text')
      .data(dummy_data)
      .attr('x', width / 2)
      .attr('y', height / 2);

    var generateLink = self.createGenerateLinkFunc(
        data.column_info.columns.value.column,
        data.column_info.columns.value.type, data.filter_info);

    // Fade out and remove unused bars
    this.svg.selectAll('.bar')
      .data(records)
      .exit()
      .transition().delay(0).duration(250).ease('sin-in-out')
      .style('opacity', 0)
      .remove();

    // Add new bars
    this.svg.selectAll('.bar')
      .data(records).enter().insert('a')
        .attr('class', 'bar')
        .attr('xlink:href', generateLink)
        .insert('rect', '.x.axis')
          .attr('class', 'bar-rect')
          .attr('x', this.y_scale(0))
          .attr('y', function(d) { return self.x_scale(d[self.x_field]); })
          .attr('width', 0)
          .attr('height', function(d) { return self.x_scale.rangeBand(); })
          .on('mouseover', this.tip.show)
          .on('mouseout', this.tip.hide);

    // Update bar heights and x axis
    this.svg.selectAll('.bar rect')
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
    this.svg.selectAll('.bar rect')
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

    this.svg.call(this.tip);
  };

})(window, window, window.d3, window.console, window.gsa);

// vim: set ts=2 sw=2 tw=80:
