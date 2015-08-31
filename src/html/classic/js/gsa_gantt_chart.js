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

/* Schedule data extractor */
function data_task_schedules (old_data, gen_params)
{
  new_data = { records : [], column_info: old_data.column_info}

  for (var i in old_data.records)
    {
      var record = old_data.records[i]
      if (record.schedule_id != "" && record.schedule_next_time != "over")
        {
          new_data.records.push (record);
        }
    }
  new_data.records.sort(function(a, b)
                          {
                            return Date.parse (a.schedule_next_time)
                                    - Date.parse (b.schedule_next_time)
                          });

  return new_data;
}

/* Main chart generator */
function GanttChartGenerator ()
{
  function my () {};

  var svg;
  var height;
  var width;
  var margin = {top: 30, right: 30, bottom: 40, left: 30};

  var x_scale = d3.scale.ordinal ();
  var time_scale = d3.time.scale.utc ();

  var x_axis = d3.svg.axis ()
                      .scale(x_scale)
                      .tickFormat ("")
                      .orient("left");

  var time_format = d3.time.format.utc.multi([
    [".%L", function(d) { return d.getUTCMilliseconds(); }],
    [":%S", function(d) { return d.getUTCSeconds(); }],
    ["%H:%M", function(d) { return d.getUTCMinutes(); }],
    ["%H:%M", function(d) { return d.getUTCHours(); }],
    ["%b %d", function(d) { return d.getUTCDate() != 1; }],
    ["%b", function(d) { return d.getUTCMonth(); }],
    ["%Y", function() { return true; }]
  ]);

  var time_axis = d3.svg.axis ()
                    .scale (time_scale)
                    .ticks (7)
                    .tickFormat (time_format)
                    .orient ("bottom");

  var x_axis_elem;
  var time_axis_elem;

  var data_transform = data_task_schedules;
  var bar_style;
  var title = title_static ("Loading Gantt chart ...", "Gantt Chart");

  var records;
  var column_info;
  var data;
  var x_data;

  var x_label = "";
  var y_label = "";

  var x_field = "id";

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
        return size_field;
      size_field = value;
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

  my.bar_style = function (value)
    {
      if (!arguments.length)
        return bar_style;
      bar_style = value;
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

      var display_records;

      // evaluate options set by gen_params
      var limit = 10;

      // Extract records and column info
      switch (data_src.command ())
        {
          case "get_tasks":
            data = data_transform (original_data, gen_params);
            records = data.records;
            column_info = null;
            break;
          default:
            console.error ("Unsupported command:" + data_src.command ());
            return;
        }

      if (limit)
        display_records = records.slice (0, limit);
      else
        display_records = records;

      display.header ().text (title (data));
      x_data = display_records.map (function (d) { return d [x_field]; });

      // Create detach menu item
      display.create_or_get_menu_item ("detach")
               .attr("href", "javascript:void(0);")
               .attr("onclick", "javascript:open_detached (\"" + chart.detached_url () + "\")")
               .text("Show detached chart window");

      // Setup display parameters
      height = display.svg ().attr ("height") - margin.top - margin.bottom;
      width = display.svg ().attr ("width") - margin.left - margin.right;

      // Setup scales
      var start_date = new Date ();
      var scale_days = 7;
      var end_date;
      start_date.setUTCMinutes (start_date.getUTCMinutes ()
                                - start_date.getTimezoneOffset ())
      start_date.setUTCMinutes (0);
      start_date.setUTCSeconds (0);
      start_date.setUTCMilliseconds (0);

      end_date = new Date (start_date);
      end_date.setUTCDate (end_date.getUTCDate () + scale_days);

      time_scale.domain ([start_date, end_date])
                .range ([0, width])

      x_scale.domain (x_data)
             .rangeRoundBands ([height, 0], 0.125);

      if (!update)
        {
          display.svg ().text ("");

          svg = display.svg ().append ("g");

          display.svg ().on ("mousemove", null)
          display.svg ().on ("mouseleave", null)

          svg.attr ("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

          x_axis_elem = svg.append("g")
                            .attr("class", "x axis")
                            .call(x_axis);

          time_axis_elem = svg.append("g")
                            .attr("class", "y axis")
                            .call(time_axis);
        }

      time_axis_elem.attr("transform",
                          "translate (" + 0 + "," + height +")")

      x_axis_elem.call (x_axis);
      time_axis_elem.call (time_axis);

      svg.selectAll(".bar-group")
          .data (display_records)
            .enter ()
              .insert ("g")
                .attr ("class", "bar-group")

      svg.selectAll(".bar-label")
          .data (display_records)
            .enter ()
            .insert ("text")
              .attr ("class", "bar-label")
              .attr ("x", "3px")
              .style ("dominant-baseline", "middle")
              .style ("font-size", "10px")
              .style ("stroke", "#EEEEEE")
              .style ("stroke-opacity", "0.75")
              .style ("stroke-width", "3px")
              .style ("paint-order", "stroke")

      svg.selectAll (".bar-group")
          .data (display_records)
            .attr ("transform",
                    function (d) {
                    return "translate(" + 0 + "," + (height - x_scale(d [x_field]) - x_scale.rangeBand()) + ")"
                    })
            .each (function (d, i)
                    {
                      var sel = d3.select (this)
                      var r_start
                        = Date.parse (d.schedule_next_time.substr (0, 19)
                                      + "+00:00");
                      var r_duration = Number (d.schedule_duration);
                      var r_period = Number (d.schedule_period);
                      var r_period_months = Number (d.schedule_period_months);
                      var r_periods = Number (d.schedule_periods);
                      var r_length = r_duration ? r_duration * 1000
                                                : r_period ? Math.min (r_period * 1000, 3600000 * 24)
                                                           : end_date - r_start;
                      var offset = +(time_scale.domain ()[0])

                      var bar_starts = [];
                      new_date = new Date (r_start)
                      if (+new_date <= +end_date)
                        bar_starts.push (new_date);

                      for (var i = 1;
                           (+new_date <= +end_date)
                           && (i < r_periods
                               || (r_periods == 0 && r_period > 0));
                           i ++)
                        {
                          new_date = new Date (1000 * r_period * i + r_start);
                          new_date.setUTCMonth (new_date.getUTCMonth ()
                                                + i * r_period_months);

                          if (+new_date > +end_date)
                            break;

                          bar_starts.push (new_date)
                        }

                      sel.selectAll ("rect")
                          .data (bar_starts)
                            .enter ()
                              .insert ("rect")
                              .style ("fill", "#71C000")
                              .style ("stroke", "#549330")

                      sel.selectAll ("rect")
                            .data (bar_starts)
                              .style ("fill-opacity", function (d) { return r_duration ? 1.0 : 0.25 })
                              .attr ("x", function (start) { return time_scale (start); })
                              .attr ("width", function (start) { return time_scale (offset + Math.min (r_length, end_date - start)) })
                              .attr ("height", x_scale.rangeBand())
                              .attr ("title", function (start) {  var text = d.name;
                                                                  text += "\nStart: " + gsa.datetime_format (new Date (start))
                                                                  if (r_duration)
                                                                    text += "\nEnd: " + gsa.datetime_format (new Date (+start + r_duration * 1000));
                                                                  else
                                                                    text += "\nNo scheduled end"
                                                                  text += "\nCurrent scheduled run: " + gsa.datetime_format (new_date)
                                                                  return text })

                      sel.selectAll ("rect")
                            .data (bar_starts)
                              .exit ()
                                .remove ()
                    })

      svg.selectAll (".bar-label")
          .data (display_records)
            .text (function (d) { return d.name })
            .attr ("y", function (d) { return (height - x_scale(d [x_field]) - (x_scale.rangeBand() /2)) })
      // Generate CSV
/*
      csv_data = csv_from_records (records,
                                   column_info,
                                   [x_field, size_field],
                                   [column_label (column_info.columns [x_field], true, false, show_stat_type),
                                    column_label (column_info.columns [size_field], true, false, show_stat_type)],
                                   display.header(). text ());
      if (csv_url != null)
        URL.revokeObjectURL (csv_url);
      csv_blob = new Blob([csv_data], { type: "text/csv" });
      csv_url = URL.createObjectURL(csv_blob);

      display.create_or_get_menu_item ("csv_dl")
               .attr("href", csv_url)
               .attr("download", "gsa_bar_chart-" + new Date().getTime() + ".csv")
               .text("Download CSV");

      // Generate HTML table
      if (html_table_url != null)
        {
          URL.revokeObjectURL (html_table_url);
          html_table_data = null;
        }
      var open_html_table = function ()
        {
          if (html_table_url == null)
            {
              html_table_data
                = html_table_from_records (records,
                                           column_info,
                                           [x_field, size_field],
                                           [column_label (column_info.columns [x_field], true, false, show_stat_type),
                                            column_label (column_info.columns [size_field], true, false, show_stat_type)],
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

                    display.create_or_get_menu_item ("svg_dl")
                               .attr("href", svg_url)
                               .attr("download", "gsa_bar_chart-" + new Date().getTime() + ".svg")
                               .text("Download SVG");
                  }, 600);
*/
      display.update_gen_data (my, gen_params);
    };

  return my;

}