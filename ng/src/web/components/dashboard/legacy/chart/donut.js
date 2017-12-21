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

import $ from 'jquery';

import _ from 'gmp/locale.js';
import {is_defined, is_string, has_value} from 'gmp/utils.js';

import {
  array_sum,
  column_label,
  csv_from_records,
  field_color_scale,
  fill_empty_fields,
  goto_list_page,
  html_table_from_records,
  severity_level_color_scale,
  title_static,
  wrap_text,
} from '../helper.js';

import {register_chart_generator} from '../controller.js';

import AggregateChartGenerator from './aggregate.js';

const get_box = node => {
  try {
    return node.getBBox();
  }
  catch (error) {
    // firefox seems to have issues with getBBox sometimes
    return node.getBoundingClientRect();
  }
};

const get_title_data = (d, {x_field, y_field}) => {
  let x = d.data[x_field + '~long'];
  if (!is_defined(x)) {
    x = d.data[x_field];
  }
  return {
    x,
    y: d.data[y_field],
  };
};

const get_title_string = (x, y, y_sum) => {
  return x + ': ' + (100 * y / y_sum).toFixed(1) + '% (' + y + ')';
};

const get_title = (d, obj, y_sum) => {
  const dta = get_title_data(d, obj);
  return get_title_string(dta.x, dta.y, y_sum);
};

const get_title_func = (y_sum, obj) => d => get_title(d, obj, y_sum);

const get_tooltip_title_func = (d, obj, y_sum, tip_func) => {
  return () => {
    const dta = get_title_data(d, obj);
    const title = get_title_string(dta.x, dta.y, y_sum);
    tip_func.show(title, d3.event.target);
  };
};

/**
 * Convert a value to a string that can be used as an id attribute
 *
 * @param {Any} value to convert to an id
 *
 * @returns {String} An ID string
 */
function to_id(value) {
  if (!has_value(value)) {
    return '';
  }
  if (!is_string(value)) {
    value = '' + value;
  }
  return value.replace(/\W/g, '_');
}

/*
* Gets the path data for the inner side of a donut
*/
const donut_inner_path_d = (sa, ea, rx, ry, ri, h) => {
  if ((sa > 0.5 * Math.PI) && (ea > 0.5 * Math.PI) &&
    (sa < 1.5 * Math.PI) && (ea < 1.5 * Math.PI)) {
    return 'M 0 0';
  }

  const result = [];
  let sa_trunc;
  let ea_trunc;
  let sx;
  let sy;
  let ex;
  let ey;

  if (sa <= (0.5 * Math.PI)) {
    sa_trunc = sa;
    ea_trunc = ea < 0.5 * Math.PI ? ea : 0.5 * Math.PI;

    sx = +Math.sin(sa_trunc) * rx * ri;
    sy = -Math.cos(sa_trunc) * ry * ri;
    ex = +Math.sin(ea_trunc) * rx * ri;
    ey = -Math.cos(ea_trunc) * ry * ri;

    result.push('M', sx, sy,
      'A', rx * ri, ry * ri, '0 0 1', ex, ey,
      'l 0', h,
      'A', rx * ri, ry * ri, '0 0 0', sx, sy + h,
      'z');
  }

  if (ea >= (1.5 * Math.PI)) {
    sa_trunc = sa > (1.5 * Math.PI) ? sa : 1.5 * Math.PI;
    ea_trunc = ea;

    sx = +Math.sin(sa_trunc) * rx * ri;
    sy = -Math.cos(sa_trunc) * ry * ri;
    ex = +Math.sin(ea_trunc) * rx * ri;
    ey = -Math.cos(ea_trunc) * ry * ri;

    result.push('M', sx, sy,
      'A', rx * ri, ry * ri, '1 0 1', ex, ey,
      'l 0', h,
      'A', rx * ri, ry * ri, '1 0 0', sx, sy + h,
      'z');
  }

  return result.join(' ');
};

/*
* Gets the path data for the outer side of a donut
*/
const donut_outer_path_d = (sa, ea, rx, ry, ri, h) => {
  if ((sa < (0.5 * Math.PI) && (ea < (0.5 * Math.PI))) ||
    (sa > (1.5 * Math.Pi) && (ea > (1.5 * Math.Pi)))) {
    return 'M 0 0';
  }

  const result = [];

  /* eslint-disable no-extra-parens */
  const sa_trunc = (sa > (1.5 * Math.PI) ? (1.5 * Math.PI) :
    (sa < (0.5 * Math.PI) ? (0.5 * Math.PI) : sa));
  const ea_trunc = (ea > (1.5 * Math.PI) ? (1.5 * Math.PI) :
    (ea < (0.5 * Math.PI) ? (0.5 * Math.PI) : ea));
  /* eslint-enable */

  const sx = +Math.sin(sa_trunc) * rx;
  const sy = -Math.cos(sa_trunc) * ry;
  const ex = +Math.sin(ea_trunc) * rx;
  const ey = -Math.cos(ea_trunc) * ry;

  result.push('M', sx, sy,
    'A', rx, ry, '0', ea_trunc - sa_trunc > Math.PI ? 1 : 0,
    '1', ex, ey,
    'l', '0', h,
    'A', rx, ry, '0', ea_trunc - sa_trunc > Math.PI ? 1 : 0,
    '0', sx, sy + h,
    'z',
  );

  return result.join(' ');
};

/*
* Gets the path data for the top of a whole donut.
*
* This is needed because start and end points being the same could be
*  interpreted as an empty / nonexistent slice by some renderers.
*/
const donut_full_top_path_d = (sa, ea, rx, ry, ri, h) => {
  const result = [];

  result.push('M', 0, -ry,
    'A', rx, ry, '0', '1', '1', 0, +ry,
    'A', rx, ry, '0', '1', '1', 0, -ry,
    'M', 0, -ry * ri,
    'A', rx * ri, ry * ri, '0', '0', '0', 0, +ry * ri,
    'A', rx * ri, ry * ri, '0', '0', '0', 0, -ry * ri);

  return result.join(' ');
};

/*
* Gets the path data for top of a donut
*/
const donut_top_path_d = (sa, ea, rx, ry, ri, h) => {
  const result = [];

  const sx = Math.sin(sa) * rx;
  const sy = -Math.cos(sa) * ry;
  const ex = Math.sin(ea) * rx;
  const ey = -Math.cos(ea) * ry;

  result.push('M', sx, sy,
    'A', rx, ry, '0', ea - sa > Math.PI ? 1 : 0, '1', ex, ey,
    'L', ri * ex, ri * ey,
    'A', rx * ri, ry * ri, '0',
    ea - sa > Math.PI ? 1 : 0, '0', sx * ri, sy * ri,
    'z',
  );

  return result.join(' ');
};

const active_status_transform = (old_data, params) => {
  const count_field = 'count';
  const value_field = 'value';

  const records = old_data.records.map(d => {
    const value = d[value_field];
    const new_record = {};

    new_record[count_field] = d[count_field];

    if (value === -1) {
      new_record[value_field] = _('Inactive');
    }
    else if (value === -2) {
      new_record[value_field] = _('Active (unlimited)');
    }
    else {
      new_record[value_field] = _('Active for next {{days}} days',
        {days: value});
    }
    new_record[value_field + '~original'] = value;
    return new_record;
  });

  return {
    records: records,
    column_info: old_data.column_info,
    filter_info: old_data.filter_info,
  };
};

class DonutChartGenerator extends AggregateChartGenerator {

  constructor() {
    super('donut');
  }

  init() {
    this.margin = {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    };

    this.x_label = '';
    this.y_label = '';
    this.x_field = 'value';
    this.y_field = 'count';

    this.setTitleGenerator(title_static(_('Loading donut chart ...'),
      _('Donut Chart')));
  }

  generateData(original_data) {
    const data = this.transformData(original_data);
    return fill_empty_fields(data);
  }

  evaluateParams(gen_params) {
    super.evaluateParams(gen_params);

    if (gen_params.x_field) {
      this.x_field = gen_params.x_field;
    }

    if (gen_params.y_fields && gen_params.y_fields[0]) {
      this.y_field = gen_params.y_fields[0];
    }

    if (gen_params.extra && gen_params.extra.show_stat_type) {
      this.show_stat_type = !!JSON.parse(gen_params.extra.show_stat_type);
    }

    if (gen_params.chart_template === 'active_status') {
      this.setDataTransformFunc(active_status_transform);
    }
    else if (gen_params.chart_template === 'info_by_class' ||
      gen_params.chart_template === 'recent_info_by_class') {
      this.setColorScale(severity_level_color_scale);
    }
  }

  generate(svg, data, update) {
    if (!is_defined(this.color_scale)) {
      this.setColorScale(field_color_scale(
        data.column_info.columns[this.x_field].type,
        data.column_info.columns[this.x_field].column
      ));
    }

    const {records} = data;
    const x_data = records.map(d => d[this.x_field]);
    const y_data = records.map(d => d[this.y_field]);
    const y_sum = array_sum(y_data);
    const slice_f = d3.layout.pie()
      .value(d => d[this.y_field])
      .sort(null);

    const slices = slice_f(records).filter(elem => !isNaN(elem.endAngle));

    const legend_width = Math.min(240, Math.max(120, svg.attr('width') / 5));

    // Setup display parameters
    const height = svg.attr('height') - this.margin.top -
      this.margin.bottom;
    const width = svg.attr('width') - this.margin.left -
      this.margin.right - legend_width;

    if (update) {
      svg.text('');
      this.svg = svg.append('g');
      svg.on('mousemove', null);
      svg.on('mouseleave', null);
      this.svg.attr('transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')');
    }

    const h = Math.min(height, width) / 8;
    const cx = width / 2;
    const cy = height / 2 - h / 2;
    const rx = width / 2;
    const ry = Math.min(height / 2, width / 2) - h / 2;
    const ri = 1.0 / 2.0;

    const generate_link = this.createGenerateLinkFunc(
      data.column_info.columns[this.x_field].column,
      data.column_info.columns[this.x_field].type,
      data.filter_info
    );

    const tooltip = d3tip()
      .attr('class', 'd3-tip')
      .style('font-weight', 'bold')
      .offset([-10, 0])
      .html(d => d);

    // Remove legend
    this.svg.selectAll('.legend')
      .remove();

    // Draw legend
    const legend = this.svg.insert('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(' + (width + 10.5) + ', 0)');

    const show_slice_tooltip = d => {
      const dta = get_title_data(d, this);
      const label = '#label-' + to_id(d.data[this.x_field]);
      const target = this.svg.select(label);

      if (target.empty() || target.classed('empty')) {
        tooltip.show(get_title_string(dta.x, dta.y, y_sum), {
          x: d3.event.pageX,
          y: d3.event.pageY,
        });
      }
      else {
        tooltip.show(get_title_string(dta.x, dta.y, y_sum), target.node());
      }
    };

    let legend_y = 0;
    for (let i = 0; i < slices.length; i++) {
      const d = slices[i];
      let color = this.scaleColor(d.data[this.x_field]);

      if (!is_defined(color)) {
        color = this.scaleColor(d.data[this.x_field + '~original']);
      }

      const legend_group = legend.insert('g')
        .attr('class', 'legend-group')
        .on('mouseover', get_tooltip_title_func(d, this, y_sum, tooltip))
        .on('mouseout', tooltip.hide);

      const legend_item = legend_group.insert('a')
        .on('click', () => {
          generate_link(d, i);
        });

      legend_item.insert('rect')
        .attr('height', '15')
        .attr('width', '15')
        .attr('x', 0.5)
        .attr('y', legend_y + 0.5)
        .attr('fill', color)
        .attr('stroke', 'black')
        .attr('stroke-width', '0.25')
        .style('shape-rendering', 'geometricPrecision')
        .attr('title', get_title(d, this, y_sum));

      const new_text = legend_item.insert('text')
        .attr('x', 22)
        .attr('y', legend_y + 12)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text(x_data[i])
        .attr('title', get_title(d, this, y_sum));

      wrap_text(new_text, legend_width - 25);

      const box = get_box(new_text.node());

      legend_y += Math.max(20, box.height + 5);
    }

    this.svg.call(tooltip);

    legend.attr('opacity', 0)
      .transition(500)
      .attr('opacity', 1);

    // Remove old donut
    this.svg.selectAll('.donut')
      .attr('class', 'old_donut')
      .transition(500)
      .remove();

    // Add new donut
    const donut = this.svg.insert('g')
      .attr('class', 'donut')
      .attr('transform', 'translate(' + cx + ',' + cy + ')');

    donut.selectAll('.slice')
      .data(slices)
      .enter()
      .insert('a')
      .attr('class', 'slice')
      .on('click', generate_link)
      .on('mouseover', show_slice_tooltip)
      .on('mouseout', tooltip.hide)
      .each(function(d, i) {
        const slice = d3.select(this);
        slice.insert('path')
          .attr('class', 'slice_inner')
          .style('shape-rendering', 'geometricPrecision');
        slice.insert('path')
          .attr('class', 'slice_top')
          .style('shape-rendering', 'geometricPrecision');
        slice.insert('path')
          .attr('class', 'slice_outer')
          .style('shape-rendering', 'geometricPrecision');
      });

    donut.selectAll('.slice_inner')
      .data(slices)
      .attr('d', (d, i) =>
        donut_inner_path_d(d.startAngle, d.endAngle, rx, ry, ri, h)
      )
      .attr('fill', (d, i) => {
        let color = this.scaleColor(d.data[this.x_field]);

        if (!is_defined(color)) {
          color = this.scaleColor(d.data[this.x_field + '~original']);
        }
        return d3.lab(color).darker();
      })
      .attr('title', get_title_func);

    donut.selectAll('.slice_top')
      .data(slices)
      .attr('d', (d, i) => {
        if (d.value !== 0 &&
          (slices.length <= 1 ||
            (d.startAngle === 0 && 2 * Math.PI - d.endAngle < 1e-12))) {
          return donut_full_top_path_d(d.startAngle, d.endAngle, rx, ry, ri, h);
        }
        return donut_top_path_d(d.startAngle, d.endAngle, rx, ry, ri, h);
      })
      .attr('fill', (d, i) => {
        let color = this.scaleColor(d.data[this.x_field]);
        if (!is_defined(color)) {
          color = this.scaleColor(d.data[this.x_field + '~original']);
        }
        return color;
      })
      .attr('title', get_title_func);

    donut.selectAll('.slice_outer')
      .data(slices)
      .attr('d', (d, i) =>
        donut_outer_path_d(d.startAngle, d.endAngle, rx, ry, ri, h)
      )
      .attr('fill', (d, i) => {
        let color = this.scaleColor(d.data[this.x_field]);
        if (!is_defined(color)) {
          color = this.scaleColor(d.data[this.x_field + '~original']);
        }
        return d3.lab(color).darker();
      })
      .attr('title', get_title_func);

    // Sort slices so they are rendered in correct order.
    const [slice_elems] = donut.selectAll('.slice');

    slice_elems.sort((a, b) => {
      const a_BBox = get_box(a);
      const b_BBox = get_box(b);
      return (a_BBox.y + a_BBox.height) - (b_BBox.y + b_BBox.height);
    });

    for (const elem in slice_elems) {
      $(donut.node()).append(slice_elems[elem]);
    }

    function display_label(d) {
      return d.endAngle - d.startAngle >= 0.02;
    }

    /*
      * Labels must be rendered after all slices have been added to the doom.
      * Otherwise the label text would be cutted by overlapping slice elements.
      */
    donut.selectAll('.slice_label')
      .data(slices)
      .enter()
      .insert('a')
      .on('click', generate_link)
      .insert('text')
      .classed('slice_label', true)
      .classed('empty', d => !display_label(d)) // mark label as empty
      .attr('id', (d, i) => 'label-' + to_id(d.data[this.x_field]))
      .text((d, i) => display_label(d) ? d.data[this.y_field] : '')
      .attr('x', (d, i) =>
        Math.sin((d.startAngle + d.endAngle) / 2) * rx *
          ((1 + ri) / 2)
      )
      .attr('y', (d, i) =>
        -Math.cos((d.startAngle + d.endAngle) / 2) * ry *
          ((1 + ri) / 2)
      )
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .style('font-size', '7pt')
      .on('mouseover', show_slice_tooltip)
      .on('mouseout', tooltip.hide)
      .attr('title', get_title_func);

    // In case of missing data, draw a transparent grey donut
    if (slices.length === 0) {
      donut.insert('path')
        .attr('class', 'slice_inner')
        .attr('title', 'No data')
        .style('shape-rendering', 'geometricPrecision')
        .attr('d', donut_inner_path_d(0, 2 * Math.PI, rx, ry, ri, h))
        .style('fill', d3.lab('silver').darker());

      donut.insert('path')
        .attr('class', 'slice_top')
        .attr('title', 'No data')
        .style('shape-rendering', 'geometricPrecision')
        .attr('d', donut_full_top_path_d(0, 2 * Math.PI, rx, ry, ri, h))
        .style('fill', 'silver');

      donut.insert('path')
        .attr('class', 'slice_outer')
        .attr('title', 'No data')
        .style('shape-rendering', 'geometricPrecision')
        .attr('d', donut_outer_path_d(0, 2 * Math.PI, rx, ry, ri, h))
        .style('fill', d3.lab('silver').darker());
    }

    donut.attr('opacity', 0)
      .transition(500)
      .attr('opacity', slices.length === 0 ? 0.25 : 1);

    const relax_labels = () => {
      // adjust labels to not having overlapping texts
      // for details see
      // https://www.safaribooksonline.com/blog/2014/03/11/solving-d3-label-placement-constraint-relaxing/
      let elem_a;
      let elem_b;
      let sel_a;
      let sel_b;
      let x_a;
      let x_b;
      let y_a;
      let y_b;
      let width_a;
      let width_b;
      let again = false;
      let delta_y;

      const label_spacing = 10;
      const labels = this.svg.selectAll('.slice_label');

      labels.each(function(d, i) {
        elem_a = this;

        /*
        * Test if the node is not in the document yet because this would
        * cause an error in Internet Explorer when calling
        * getComputedTextLength.
        */
        if (document.body.contains(elem_a)) {
          width_a = elem_a.getComputedTextLength();
        }
        else {
          width_a = 0;
        }

        if (width_a === 0) {
          return;
        }

        sel_a = d3.select(elem_a);
        x_a = sel_a.attr('x');
        y_a = sel_a.attr('y');

        labels.each(function(d, j) { // eslint-disable-line no-shadow
          elem_b = this;
          if (elem_a === elem_b) {
            return;
          }

          /* Test if the node is not in the document as above */
          if (document.body.contains(elem_b)) {
            width_b = elem_b.getComputedTextLength();
          }
          else {
            width_b = 0;
          }
          if (width_b === 0) {
            return;
          }

          sel_b = d3.select(elem_b);
          x_b = sel_b.attr('x');
          y_b = sel_b.attr('y');

          if (Math.abs(x_a - x_b) * 2 > (width_a + width_b)) {
            return;
          }

          delta_y = y_a - y_b;
          if (Math.abs(delta_y) > label_spacing) {
            return;
          }

          again = true;
          const adjust = (delta_y > 0 ? 1 : -1) * 1;
          sel_a.attr('y', +y_a + adjust);
          sel_b.attr('y', +y_b - adjust);
        });
      });

      if (again) {
        global.setTimeout(relax_labels, 1);
      }
    };

    relax_labels();
  }

  generateCsvData(controller, data) {
    const cols = data.column_info.columns;
    return csv_from_records(data.records, data.column_info,
      [this.x_field, this.y_field], [
        column_label(cols[this.x_field], true, false, this.show_stat_type),
        column_label(cols[this.y_field], true, false, this.show_stat_type),
      ],
      controller.display.getTitle()
    );
  }
  generateHtmlTableData(controller, data) {
    const cols = data.column_info.columns;
    return html_table_from_records(data.records, data.column_info,
      [this.x_field, this.y_field], [
        column_label(cols[this.x_field], true, false, this.show_stat_type),
        column_label(cols[this.y_field], true, false, this.show_stat_type),
      ],
      controller.display.getTitle(),
      controller.data_src.getParam('filter')
    );
  }

  generateLink(d, i, column, type, filter_info) {
    let value = d.data[this.x_field + '~original'];

    if (!is_defined(value)) {
      value = d.data[this.x_field];
    }
    return goto_list_page(type, column, value, filter_info);
  }
}

register_chart_generator('donut', DonutChartGenerator);

// vim: set ts=2 sw=2 tw=80:
