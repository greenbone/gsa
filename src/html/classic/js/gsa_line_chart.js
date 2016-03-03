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

/* Main chart generator */
function LineChartGenerator ()
{
  function my () {};

  var svg;
  var height;
  var width;
  var margin = {top: 55, right: 55, bottom: 25, left: 55};

  var legend_elem;

  var x_scale = d3.time.scale.utc ();
  var y_scale = d3.scale.linear ();
  var y2_scale = d3.scale.linear ();

  var x_axis;
  var y_axis;
  var y2_axis;

  var x_axis_elem;
  var y_axis_elem;
  var y2_axis_elem;

  var data_transform = time_line;
  var color_scale = d3.scale.category20 ();
  var title = title_static ("Loading line chart ...", "Bubble Chart");

  var records;
  var column_info;
  var data;

  var x_data;
  var y_data;
  var y2_data;

  var x_label = "";
  var y_label = "";
  var y2_label = "";

  var x_field = "value";
  var y_field = "c_count";
  var y2_field = "count";

  var line_1 = d3.svg.line()
    .x(function(d) { return x_scale (d [x_field]); })
    .y(function(d) { return y_scale (d [y_field]); })
    .defined (function (d) { return d [y_field] != undefined; })

  var line_2 = d3.svg.line()
    .x(function(d) { return x_scale (d [x_field]); })
    .y(function(d) { return y2_scale (d [y2_field]); })
    .defined (function (d) { return d [y2_field] != undefined; })

  var info_line;
  var info_box;
  var info_text_g;
  var info_text_lines;

  var show_stat_type = true;

  var csv_data;
  var csv_blob;
  var csv_url;

  var html_table_data;
  var html_table_blob;
  var html_table_url;

  var svg_data;
  var svg_blob;
  var svg_url;

  var x_min, x_max;
  var y_min, y_max;

  var x_step;
  var info_last_x;

  function time_line (old_data, params)
  {
    var t_field = "value"
    var fillers = { }

    if (params)
      {
        if (params.t_field != null)
          t_field = params.t_field;
        if (params.fillers != null)
          fillers = parms.fillers;
      }

    var new_data = { original_xml : old_data.original_xml,
                     records : [],
                     column_info : {},
                     filter_info : old_data.filter_info };

    var column_info = new_data.column_info;
    column_info.group_columns = old_data.column_info.group_columns
    column_info.data_columns = old_data.column_info.data_columns
    column_info.columns = {}
    for (var column_name in old_data.column_info.columns)
      {
        var column = old_data.column_info.columns [column_name]
        if (column_name == t_field)
          {
            column_info.columns [column_name] = {}
            for (var info in column)
              {
                if (info == "data_type")
                  column_info.columns [column_name][info] = "js_date";
                else
                  column_info.columns [column_name][info] = column[info];
              }
          }
        else if (column.stat == "count")
          {
            var column = old_data.column_info.columns [column_name]
            column_info.columns [column_name] = {}
            for (var info in column)
              {
                column_info.columns [column_name][info] = column[info];
              }

            column_info.columns [column_name].label_generator
              = function (column, capitalize_label, include_type, include_stat)
                  {
                    var suffix = "";

                    if (x_step == d3.time.day.utc)
                      suffix = " / day"
                    else if (x_step == d3.time.week.utc)
                      suffix = " / week"
                    else if (x_step == d3.time.month.utc)
                      suffix = " / month"
                    else if (x_step == d3.time.year.utc)
                      suffix = " / year"

                    return (default_column_label (column, capitalize_label,
                                                  include_type, include_stat)
                            + suffix)
                  }
          }
        else
          column_info.columns [column_name]
            = old_data.column_info.columns [column_name]
      }

    if (old_data.records.length == 0)
      return new_data;

    var t_index;

    t_index = 0;
    while (isNaN (old_data.records[t_index][t_field]))
      t_index++;
    var t_min = new Date (old_data.records[t_index][t_field] * 1000)

    t_index = old_data.records.length-1;
    while (isNaN (old_data.records[t_index][t_field]))
      t_index--;
    var t_max = new Date (old_data.records[t_index][t_field] * 1000)

    var interval_days = (t_max.getTime() - t_min.getTime()) / 86400000
    var times;
    t_index = 0;
    var data_index = 0;
    var prev_values = {};

    if (interval_days <= 100)
      {
        x_step = d3.time.day.utc
        times = d3.time.day.range.utc (d3.time.day.utc.floor (t_min),
                                       t_max)
      }
    else if (interval_days <= 750)
      {
        x_step = d3.time.week.utc
        times = d3.time.week.range.utc (d3.time.week.utc.floor (t_min),
                                        t_max)
      }
    else if (interval_days <= 3650)
      {
        x_step = d3.time.month.utc
        times = d3.time.month.range.utc (d3.time.month.utc.floor (t_min),
                                         t_max)
      }
    else
      {
        x_step = d3.time.year.utc
        times = d3.time.year.range.utc (d3.time.year.utc.floor (t_min),
                                        t_max)
      }

    for (t_index in times)
      {
        var new_record = {};
        var t = times[t_index];
        var values = {};
        new_record[t_field] = t;
        var has_values = false;

        while (data_index < old_data.records.length
               && (t_index >= times.length - 1
                   || isNaN (old_data.records [data_index][t_field])
                   || old_data.records [data_index][t_field] * 1000 < times[Number(t_index)+1].getTime()))
          {
            if (isNaN (old_data.records [data_index][t_field]))
              {
                data_index++;
                continue;
              }
            for (var field in old_data.records [data_index])
              {
                if (field != t_field)
                  {
                    if (values [field] == undefined)
                      {
                        values [field] = old_data.records [data_index][field]
                      }
                    else if (column_info.columns[field].stat == "sum"
                             || column_info.columns[field].stat == "count")
                      {
                        values [field] += Number(old_data.records [data_index][field])
                      }
                    else if (column_info.columns[field].stat == "min")
                      {
                        values [field] = Math.min (values [field], Number(old_data.records [data_index][field]))
                      }
                    else if (column_info.columns[field].stat == "max"
                             || column_info.columns[field].stat == "c_count")
                      {
                        values [field] = Math.max (values [field], Number(old_data.records [data_index][field]))
                      }
                  }
              }

            data_index ++;
          }

        for (var field in old_data.column_info.columns)
          {
            if (field != t_field)
              {
                if (values [field] != null)
                  {
                    prev_values [field] = values [field];
                    new_record [field] = values [field];
                    has_values = true;
                  }
                else if (fillers [field] == "!previous")
                  {
                    new_record [field] = prev_values [field] ? prev_values [field] : 0;
                  }
                else if (fillers [field] != null)
                  {
                    new_record [field] = fillers [field];
                  }
                else if (old_data.column_info.columns[field].stat == "c_count")
                  {
                    new_record [field] = prev_values [field] ? prev_values [field] : 0;
                  }
                else if (old_data.column_info.columns[field].stat == "count")
                  {
                    new_record [field] = 0;
                  }
                else
                  {
                    new_record [field] = null;
                  }
              }
          }
        // FIXME: make filling an explicit option
        if (has_values
            || y_field == "count" || y_field == "c_count"
            || y2_field == "count" || y2_field == "c_count")
          new_data.records.push (new_record);
      }

    return (new_data);
  }

  function mouse_exited ()
    {
      info_box.style ("display", "none");
      info_line.style ("display", "none");
      info_text_g.style ("display", "none");
    }

  function mouse_moved ()
    {
      if (data.records.length == 0)
        return;

      info_box.style ("display", "block");
      info_line.style ("display", "block");
      info_text_g.style ("display", "block");

      var parent_rect = svg.node ()
                            .parentNode
                              .parentNode
                                .getBoundingClientRect ()

      var mouse_x = d3.event.clientX - parent_rect.left - margin.left - 1;
      var mouse_y = d3.event.clientY - parent_rect.top - margin.top - 21;


      var rounded_x;
      var line_index;
      var line_x;
      var box_x;

      if (data.records.length > 1)
        {
          rounded_x = x_step.round (x_scale.invert (mouse_x));
          if (rounded_x.getTime () > x_max.getTime ())
            rounded_x = x_max;
          else if (rounded_x.getTime () < x_min.getTime ())
            rounded_x = x_min;

          line_index = find_record_index (data.records,
                                          rounded_x,
                                          x_field,
                                          false);

          line_x = x_scale (rounded_x);
        }
      else
        {
          rounded_x = x_min;
          line_index = 0;
          line_x = width / 2;
        }

      if (info_last_x == undefined
          || info_last_x.getTime() != rounded_x.getTime())
        {
          var max_line_width = 0;

          info_last_x = rounded_x;

          for (var line in info_text_lines)
            {
              var bbox;
              var line_width;
              var d = data.records [line_index];
              if (d != null)
                {
                  d = d [info_text_lines [line].field];
                  d = format_data (d, data.column_info.columns [info_text_lines [line].field])

                  info_text_lines [line]
                    .elem
                      .text (d)
                }
              else
                {
                  if (line == 0)
                    info_text_lines [line]
                      .elem
                        .text (format_data (rounded_x, {data_type:"js_date"}))
                  else
                    info_text_lines [line]
                      .elem
                        .text ("N/A");
                }

              bbox = info_text_lines [line].elem.node ()
                                                  .getBoundingClientRect ();
              line_width = bbox.width;
              if (info_text_lines [line].field != x_field)
                line_width += 25;
              max_line_width = Math.max (max_line_width, line_width)
            }

          for (var line in info_text_lines)
            {
              info_text_lines [line].elem.attr ("x", max_line_width);
            }

          info_box
            .attr ("width", max_line_width + 10)
            .attr ("height", 53);
        }

      box_x = Math.min (width - info_box.attr ("width") + margin.right,
                        Math.max (-margin.left,
                                  mouse_x - info_box.attr ("width") / 2))

      info_box
        .text ("")
        .attr ("x", box_x)
        .attr ("y", mouse_y - 50)


      info_text_g
        .attr ("text-anchor", "end")
        .attr ("transform",
               "translate (" + (box_x + 5) + "," + (mouse_y - 35) + ")")

      info_line
        .attr ("x1", line_x)
        .attr ("x2", line_x)
        .attr ("y1", 0)
        .attr ("y2", height)
    }

  my.height = function ()
    {
      return height;
    }

  my.width = function ()
    {
      return width;
    }

  my.x_field = function (value)
    {
      if (!arguments.length)
        return x_field;
      x_field = value;
      return my;
    }

  my.y_field = function (value)
    {
      if (!arguments.length)
        return y_field;
      y_field = value;
      return my;
    }

  my.x_label = function (value)
    {
      if (!arguments.length)
        return x_label;
      x_label = value;
      return my;
    }

  my.y_label = function (value)
    {
      if (!arguments.length)
        return y_label;
      y_label = value;
      return my;
    }

  my.setColorScale = function (value)
    {
      if (!arguments.length)
        return color_scale;
      color_scale = value;
      return my;
    }

  my.setDataTransformFunc = function (value)
    {
      if (!arguments.length)
        return data_transform;
      data_transform = value;
      return my;
    }

  my.setTitleGenerator = function (value)
    {
      if (!arguments.length)
        return title;
      title = value;
      return my;
    }

  my.showLoading = function (display)
    {
      display.header ().text (title ());
    }

  my.generate = function (original_data, chart, gen_params)
    {
      var display = chart.display ();
      var data_src = chart.data_src ();
      var update = (display.last_generator () == my);

      // evaluate options set by gen_params
      if (gen_params.x_field)
        x_field = gen_params.x_field;

      if (gen_params.y_fields && gen_params.y_fields[0]
          && gen_params.z_fields && gen_params.z_fields[0])
        {
          y_field = gen_params.y_fields[0];
          y2_field = gen_params.z_fields[0];
        }
      else if (gen_params.y_fields && gen_params.y_fields[0])
        {
          y_field = gen_params.y_fields[0];
          y2_field = "count";
        }
      else
        {
          y_field = "count";
          y2_field = "c_count";
        }

      if (gen_params.extra.show_stat_type)
        show_stat_type = !!JSON.parse (gen_params.extra.show_stat_type)

      // Extract records
      switch (data_src.command ())
        {
          case "get_aggregate":
            data = data_transform (original_data, gen_params);
            records = data.records;
            column_info = data.column_info;
            break;
          default:
            console.error ("Unsupported command:" + data_src.command ());
            return;
        }
      display.header ().text (title (data));

      var defined = function (d) { return d != undefined; }
      x_data = records.map (function (d) { return d [x_field]; });
      y_data = records.map (function (d) { return d [y_field]; });
      y2_data = records.map (function (d) { return d [y2_field]; });
      x_min = d3.min (x_data.filter (defined))
      x_max = d3.max (x_data.filter (defined))
      y_min = d3.min ( y_data.filter (defined))
      y_max = d3.max (y_data.filter (defined))
      y2_min = d3.min (y2_data.filter (defined))
      y2_max = d3.max (y2_data.filter (defined))

      // Setup display parameters
      height = display.svg ().attr ("height") - margin.top - margin.bottom;
      width = display.svg ().attr ("width") - margin.left - margin.right;

      if (!update)
        {
          display.svg ().text ("");
          svg = display.svg ().append ("g");

          svg.attr ("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

          x_axis = d3.svg.axis ()
                          .scale(x_scale)
                          .orient("bottom")
                          .ticks (6);

          y_axis = d3.svg.axis ()
                    .scale (y_scale)
                    .orient ("left");

          y2_axis = d3.svg.axis ()
                      .scale (y2_scale)
                      .orient ("right");
        }

      x_scale.range ([0, width]);
      y_scale.range ([height, 0]);
      y2_scale.range ([height, 0]);

      if (records.length > 1)
        x_scale.domain ([x_min, x_max]);
      else
        x_scale.domain ([x_min-1, x_min+1]);

      y_scale.domain ([0, y_max]).nice(10);
      y2_scale.domain ([0, y2_max]).nice(10);

      if (!update)
        {
          display.svg ().text ("");
          svg = display.svg ().append ("g");

          display.svg ().on ("mousemove", null)
          display.svg ().on ("mouseleave", null)

          // Setup mouse event listeners
          display.svg ().on ("mousemove", mouse_moved)
          display.svg ().on ("mouseleave", mouse_exited)

          // Setup chart
          svg.attr ("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

          legend_elem = svg.append ("g")
                            .attr ("id", "legend")
                            .attr("transform", "translate(" + (20 - margin.left) + ", -50)")

          x_axis_elem = svg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0," + height + ")")
                            .call(x_axis);

          y_axis_elem = svg.append("g")
                            .attr("class", "y axis")
                            .call(y_axis);

          y2_axis_elem = svg.append("g")
                            .attr("class", "y axis")
                            .style("font-style", "oblique")
                            .attr("transform", "translate(" + width + ", 0)")
                            .call(y2_axis);

          svg.append("path")
              .attr ("id", "line_y")
              .datum(records)
              .style("fill", "transparent")
              .style("stroke", "1px")
              .style("stroke", "green")
              .attr("d", line_1);

          svg.append("path")
              .attr ("id", "line_y2")
              .datum(records)
              .style("fill", "transparent")
              .style("stroke", "1px")
              .style("stroke-dasharray", "3,2")
              .style("stroke", d3.rgb("green").brighter())
              .attr("d", line_2);

          if (records.length == 1)
            {
              svg.append ("circle")
                  .attr ("id", "circle_y")
                  .style("fill", "transparent")
                  .style("stroke", "1px")
                  .style("stroke", "green")
                  .attr ("r", "4px")
                  .attr ("cx", width / 2)
                  .attr ("cy", y_scale (records [0][y_field]));

              svg.append ("circle")
                  .attr ("id", "circle_y2")
                  .style("fill", "transparent")
                  .style("stroke", "1px")
                  .style("stroke-dasharray", "3,2")
                  .style("stroke", d3.rgb("green").brighter())
                  .attr ("r", "4px")
                  .attr ("cx", width / 2)
                  .attr ("cy", y2_scale (records [0][y2_field]));
            }

          // Create tooltip elements
          info_line = svg.append ("line")
                          .style ("stroke", "grey")
                          .style ("display", "none")
                          .classed ("remove_on_static", true);
          info_box = svg.append ("rect")
                          .style ("fill", "white")
                          .style ("opacity", "0.75")
                          .style ("display", "none")
                          .classed ("remove_on_static", true);
          info_text_g = svg.append ("g")
                            .style ("display", "none")
                            .classed ("remove_on_static", true);

          info_text_lines = [];
          info_text_lines
            .push ({ elem : info_text_g.append ("text")
                                          .attr ("transform", "translate(0,0)")
                                          .style ("font-weight", "bold")
                                          .text ("X"),
                     field : x_field
                   })
          info_text_lines
            .push ({ elem : info_text_g.append ("text")
                                          .attr ("transform", "translate(0,15)")
                                          .style ("font-weight", "normal")
                                          .text ("Y1"),
                     field : y_field
                   })
          info_text_lines
            .push ({ elem : info_text_g.append ("text")
                                          .attr ("transform", "translate(0,30)")
                                          .style ("font-weight", "normal")
                                          .text ("Y2"),
                     field : y2_field
                   })

          info_text_g.append ("line")
                        .attr ("x1", "0")
                        .attr ("x2", "15")
                        .attr ("y1", "10")
                        .attr ("y2", "10")
                        .style ("stroke", "green")

          info_text_g.append ("line")
                        .attr ("x1", "0")
                        .attr ("x2", "15")
                        .attr ("y1", "25")
                        .attr ("y2", "25")
                        .style("stroke-dasharray", "3,2")
                        .style("stroke", d3.rgb("green").brighter())
        }

      /* Create legend items */
      /* TODO: automatic layout of legend elements*/
      legend_elem.text ("");
      var legend_part = legend_elem.append ("g");
      var legend_part_x = 0;
      var legend_part_y = 0;
      var last_part_rect = null;
      var current_part_rect = null;

      legend_part.append ("path")
                  .attr ("d", "M 0 10 L 20 10")
                  .style("fill", "transparent")
                  .style("stroke", "1px")
                  .style("stroke", "green")

      legend_part.append ("text")
                  .style ("font-size", "8pt")
                  .style ("font-weight", "bold")
                  .attr ("x", 25)
                  .attr ("y", 15)
                  .text (column_label (column_info.columns [y_field], true, false, show_stat_type))

      last_part_rect = legend_part.node ().getBoundingClientRect ()
      legend_part = legend_elem.append ("g");

      legend_part.append ("path")
                  .attr ("d", "M 0 10 L 20 10")
                  .style("fill", "transparent")
                  .style("stroke", "1px")
                  .style("stroke-dasharray", "3,2")
                  .style("stroke", d3.rgb("green").brighter())

      legend_part.append ("text")
                  .style ("font-size", "8pt")
                  .style ("font-weight", "bold")
                  .style ("font-style", "oblique")
                  .attr ("x", 25)
                  .attr ("y", 15)
                  .text (column_label (column_info.columns [y2_field], true, false, show_stat_type))

      current_part_rect = legend_part.node ().getBoundingClientRect ()
      if (legend_part_x + last_part_rect.width + current_part_rect.width + 10
          <= width - 40 + margin.left + margin.right)
        {
          legend_part_x = legend_part_x + last_part_rect.width + 10
        }
      else
        {
          legend_part_x = 0;
          legend_part_y = legend_part_y + last_part_rect.height + 2;
        }
      legend_part.attr ("transform", "translate(" + legend_part_x + ", " + legend_part_y + ")")

      x_axis_elem
        .call (x_axis)
        .attr("transform", "translate(0," + height + ")")
      y_axis_elem
        .call (y_axis)
      y2_axis_elem
        .call (y2_axis)
        .attr("transform", "translate(" + width + ", 0)")

      svg.select ("#line_y")
        .datum(records)
        .attr ("d", line_1);

      svg.select ("#line_y2")
        .datum(records)
        .attr ("d", line_2);

      var enter = svg.selectAll(".marker")
                      .data(records)
                        .enter()
      if (y_field != "count" && y_field != "c_count")
        enter.insert("circle")
                .attr("class", "marker y")
                .attr("r", 1.5)
                .style("fill", d3.rgb("green"))
                .style("stroke", d3.rgb("green"))
      if (y2_field != "count" && y2_field != "c_count")
        enter.insert("circle")
                .attr("class", "marker y2")
                .attr("r", 1.5)
                .style("fill", "none")
                .style("stroke", d3.rgb("green").brighter())

      svg.selectAll(".marker.y")
            .data(records)
              .attr("cx", function (d) { return x_scale (d[x_field]); })
              .attr("cy", function (d) { return y_scale (d[y_field]); })

      svg.selectAll(".marker.y2")
              .data(records)
                .attr("cx", function (d) { return x_scale (d[x_field]); })
                .attr("cy", function (d) { return y_scale (d[y2_field]); })

      svg.selectAll (".marker.y")
            .data (records)
              .exit ()
                .remove ()

      svg.selectAll (".marker.y2")
            .data (records)
              .exit ()
                .remove ()

      if (records.length == 1)
        {
          svg.select ("#circle_y")
              .attr ("cx", width / 2)
              .attr ("cy", y_scale (records [0][y_field]));

          svg.select ("#circle_y2")
              .attr ("cx", width / 2)
              .attr ("cy", y2_scale (records [0][y2_field]));
        }
      else
        {
          svg.select ("#circle_y")
              .remove ();

          svg.select ("#circle_y2")
              .remove ();
        }

      // Create detach menu item
      display.create_or_get_menu_item ("detach")
               .attr("href", "javascript:void(0);")
               .attr("onclick", "javascript:open_detached (\"" + chart.detached_url () + "\")")
               .text("Show detached chart window");

      // Generate CSV
      csv_data = csv_from_records (records,
                                   column_info,
                                   [x_field, y_field, y2_field],
                                   [column_label (column_info.columns [x_field], true, false, show_stat_type),
                                    column_label (column_info.columns [y_field], true, false, show_stat_type),
                                    column_label (column_info.columns [y2_field], true, false, show_stat_type)],
                                   display.header(). text ());
      if (csv_url != null)
        URL.revokeObjectURL (csv_url);
      csv_blob = new Blob([csv_data], { type: "text/csv" });
      csv_url = URL.createObjectURL(csv_blob);

      display.create_or_get_menu_item ("csv_dl")
               .attr("href", csv_url)
               .attr("download", "gsa_line_chart-" + new Date().getTime() + ".csv")
               .text("Download CSV");

      // Generate HTML table
      if (html_table_url != null)
        {
          URL.revokeObjectURL (html_table_url);
          html_table_data = null;
          html_table_url = null;
        }
      var open_html_table = function ()
        {
          if (html_table_url == null)
            {
              html_table_data
                = html_table_from_records (records,
                                           column_info,
                                           [x_field, y_field, y2_field],
                                           [column_label (column_info.columns [x_field], true, false, show_stat_type),
                                            column_label (column_info.columns [y_field], true, false, show_stat_type),
                                            column_label (column_info.columns [y2_field], true, false, show_stat_type)],
                                           display.header(). text (),
                                           data_src.param ("filter"));
              html_table_blob = new Blob([html_table_data], { type: "text/html" });
              html_table_url = URL.createObjectURL(html_table_blob);
            }
          window.open (html_table_url);
          return true;
        }
      display.create_or_get_menu_item ("html_table")
                  .attr("href", "#")
                  .on("click", open_html_table)
                  .text("Show HTML table");

      // Generate SVG after transition
      setTimeout(function()
                  {
                    svg_data = svg_from_elem (display.svg (),
                                              display.header ().text ());
                    if (svg_url != null)
                      URL.revokeObjectURL (svg_url);
                    svg_blob = new Blob([svg_data], { type: "image/svg+xml" });
                    svg_url = URL.createObjectURL(svg_blob);

                    display.create_or_get_menu_item ("svg_window")
                               .attr("href", "javascript:void(0)")
                               .attr("onclick", "blob_img_window (\"" + svg_url + "\")")
                               .text("Show copyable SVG");

                    display.create_or_get_menu_item ("svg_dl", true /* Last. */)
                               .attr("href", svg_url)
                               .attr("download", "gsa_line_chart-" + new Date().getTime() + ".svg")
                               .text("Download SVG");
                  }, 600);

      display.update_gen_data (my, gen_params);
    };

  return my;

}
