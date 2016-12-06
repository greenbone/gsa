/*
 * Greenbone Security Assistant
 * $Id$
 * Description: JavaScript for word cloud charts in GSA.
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

  gch.register_chart_generator('cloud', CloudChartGenerator);

  function CloudChartGenerator() {
    gch.AggregateChartGenerator.call(this, 'cloud');
  }

  CloudChartGenerator.prototype = Object.create(
    gch.AggregateChartGenerator.prototype);
  CloudChartGenerator.prototype.constructor = CloudChartGenerator;

  CloudChartGenerator.prototype.init = function() {
    this.margin = {top: 5, right: 5, bottom: 5, left: 5};

    this.x_label = '';
    this.y_label = '';

    this.x_field = 'value';
    this.y_field = 'count';

    this.show_stat_type = true;

    this.setDataTransformFunc(gch.data_raw);
    this.setColorScale(d3.scale.category10());
    this.setTitleGenerator(gch.title_static(gsa._('Loading word cloud ...'),
          gsa._('Word Cloud')));

  };

  CloudChartGenerator.prototype.evaluateParams = function(gen_params) {
    gch.AggregateChartGenerator.prototype.evaluateParams.call(this, gen_params);

    if (gen_params.x_field) {
      this.x_field = gen_params.x_field;
    }

    if (gen_params.y_fields && gen_params.y_fields[0]) {
      this.y_field = gen_params.y_fields[0];
    }

    if (gen_params.extra.show_stat_type) {
      this.show_stat_type = !!JSON.parse(gen_params.extra.show_stat_type);
    }
  };

  CloudChartGenerator.prototype.generate = function(svg, data, update) {
    var self = this;
    var records = data.records;

    var cloud = d3.layout.cloud();

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

    // generate cloud
    cloud.stop();
    this.svg.selectAll('*').remove();

    var i;
    var x;
    var y;
    var max_y = 1;
    for (i in records) {
      x = records[i][this.x_field];
      y = records[i][this.y_field];
      if (y > max_y && x !== '') {
        max_y = y;
      }
    }

    var words = [];
    var scale_domain = [];
    var max_y_scaled = Math.log(max_y);
    for (i in records) {
      x = records[i][this.x_field];
      y = records[i][this.y_field];
      var y_scaled = Math.log(y) / max_y_scaled * 20;
      if (y_scaled >= 8.0 && x !== '') {
        words.push({text: x, size: y_scaled});
        scale_domain.push(x);
      }
    }

    this.color_scale.domain(words);

    var generate_link = this.createGenerateLinkFunc(
        data.column_info.group_columns[0],
        data.column_info.columns[self.x_field].type,
        data.filter_info);

    cloud
      .size([width, height])
      .fontSize(function(d) { return d.size; })
      .rotate(0)
      .font('Sans')
      .words(words)
      .on('end', function(words) {
        self.svg.selectAll('text')
          .data(words)
          .enter().append('a')
            .attr('xlink:href', generate_link)
            .append('text')
              .style('font-size', function(d) { return d.size + 'px'; })
              .style('font-family', function(d) { return d.font; })
              .style('font-weight', function(d) { return d.weight; })
              .style('fill', function(d, i) { return self.scaleColor(d.text); })
              .attr('text-anchor', 'middle')
              .attr('transform', function(d) {
                return 'translate(' + [d.x + width / 2 + self.margin.left,
                    d.y + height / 2 + self.margin.top] +
                    ')rotate(' + d.rotate + ')';
              })
              .text(function(d) { return d.text; });
      })
      .start();
  };

  CloudChartGenerator.prototype.generateCsvData = function(controller, data) {
    var cols = data.column_info.columns;
    return gch.csv_from_records(data.records, data.column_info,
        [this.x_field, this.y_field],
        [gch.column_label(cols[this.x_field], true, false, this.show_stat_type),
        gch.column_label(cols[this.y_field], true, false, this.show_stat_type)],
        controller.display.getTitle());
  };

  CloudChartGenerator.prototype.generateHtmlTableData = function(controller,
      data) {
    var cols = data.column_info.columns;
    return gch.html_table_from_records(data.records, data.column_info,
        [this.x_field, this.y_field],
        [gch.column_label(cols[this.x_field], true, false, this.show_stat_type),
        gch.column_label(cols[this.y_field], true, false, this.show_stat_type)],
        controller.display.getTitle(),
        controller.data_src.getParam('filter'));
  };

  CloudChartGenerator.prototype.generateLink = function(d, i, column, type,
      filter_info) {
    var value = d.text;
    return gch.filtered_list_url(type, column, value, filter_info, '~');
  };

})(window, window, window.d3, window.console, window.gsa);

// vim: set ts=2 sw=2 tw=80:
