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
                     column_info : old_data.column_info,
                     filter_info : old_data.filter_info };

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
        times = d3.time.day.range.utc (d3.time.day.utc.floor (t_min),
                                       t_max)
      }
    else if (interval_days <= 750)
      {
        times = d3.time.week.range.utc (d3.time.week.utc.floor (t_min),
                                        t_max)
      }
    else if (interval_days <= 3650)
      {
        times = d3.time.month.range.utc (d3.time.month.utc.floor (t_min),
                                         t_max)
      }
    else
      {
        times = d3.time.year.range.utc (d3.time.year.utc.floor (t_min),
                                        t_max)
      }

    for (t_index in times)
      {
        var new_record = {};
        var t = times[t_index];
        var values = {};
        new_record[t_field] = t;
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
                    else if (old_data.column_info.columns[field].stat == "sum"
                             || old_data.column_info.columns[field].stat == "count")
                      {
                        values [field] += Number(old_data.records [data_index][field])
                      }
                    else if (old_data.column_info.columns[field].stat == "min")
                      {
                        values [field] = Math.min (values [field], Number(old_data.records [data_index][field]))
                      }
                    else if (old_data.column_info.columns[field].stat == "max"
                             || old_data.column_info.columns[field].stat == "c_count")
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
                  }
                else if (fillers [field] == "!previous")
                  {
                    new_record [field] = prev_values [field] ? prev_values [field] : 0;
                  }
                else if (fillers [field] != null)
                  {
                    new_record [field] = fillers [field]
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
                  console.debug ("!" + field);

              }
          }
        new_data.records.push (new_record);
      }
    return (new_data);
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

  my.color_scale = function (value)
    {
      if (!arguments.length)
        return color_scale;
      color_scale = value;
      return my;
    }

  my.data_transform = function (value)
    {
      if (!arguments.length)
        return data_transform;
      data_transform = value;
      return my;
    }

  my.title = function (value)
    {
      if (!arguments.length)
        return title;
      title = value;
      return my;
    }

  my.show_loading = function (display)
    {
      display.header ().text (title ());
    }

  my.generate = function (original_data, chart, gen_params)
    {
      var display = chart.display ();
      var data_src = chart.data_src ();
      var update = (display.last_generator () == my);

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
      x_min = Math.min.apply (null, x_data.filter (defined) )
      x_max = Math.max.apply (null, x_data.filter (defined))
      y_min = Math.min.apply (null, y_data.filter (defined))
      y_max = Math.max.apply (null, y_data.filter (defined))
      y2_min = Math.min.apply (null, y2_data.filter (defined))
      y2_max = Math.max.apply (null, y2_data.filter (defined))

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
                  .attr ("cx", x_scale (records [0][x_field]))
                  .attr ("cy", y_scale (records [0][y_field]));

              svg.append ("circle")
                  .attr ("id", "circle_y2")
                  .style("fill", "transparent")
                  .style("stroke", "1px")
                  .style("stroke-dasharray", "3,2")
                  .style("stroke", d3.rgb("green").brighter())
                  .attr ("r", "4px")
                  .attr ("cx", x_scale (records [0][x_field]))
                  .attr ("cy", y2_scale (records [0][y2_field]));
            }
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
                  .text (column_label (column_info.columns [y_field], true, false, true))

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
                  .text (column_label (column_info.columns [y2_field], true, false, true))

      current_part_rect = legend_part.node ().getBoundingClientRect ()

      if (legend_part_x + 10 + current_part_rect.width <= width + 40)
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

      if (records.length == 1)
        {
          svg.select ("#circle_y")
              .attr ("cx", x_scale (records [0][x_field]))
              .attr ("cy", y_scale (records [0][y_field]));

          svg.select ("#circle_y2")
              .attr ("cx", x_scale (records [0][x_field]))
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
                                   [x_field, y_field, y2_field],
                                   [column_label (column_info.columns [x_field], true, false, true),
                                    column_label (column_info.columns [y_field], true, false, true),
                                    column_label (column_info.columns [y2_field], true, false, true)],
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
      html_table_data
        = html_table_from_records (records,
                                   [x_field, y_field, y2_field],
                                   [column_label (column_info.columns [x_field], true, false, true),
                                    column_label (column_info.columns [y_field], true, false, true),
                                    column_label (column_info.columns [y2_field], true, false, true)],
                                   display.header(). text (),
                                   data_src.param ("filter"));
      if (html_table_url != null)
        URL.revokeObjectURL (html_table_url);
      html_table_blob = new Blob([html_table_data], { type: "text/html" });
      html_table_url = URL.createObjectURL(html_table_blob);

      display.create_or_get_menu_item ("html_table")
                  .attr("href", html_table_url)
                  .attr("target", "_blank")
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

                    display.create_or_get_menu_item ("svg_dl")
                               .attr("href", svg_url)
                               .attr("download", "gsa_line_chart-" + new Date().getTime() + ".svg")
                               .text("Download SVG");
                  }, 600);

      display.update_gen_data (my, gen_params);
    };

  return my;

}