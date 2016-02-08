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
  var margin = {top: 30, right: 40, bottom: 40, left: 30};

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

  var empty_text = "empty";

  var x_label = "";
  var y_label = "";

  var x_field = "name";
  var time_field = "schedule_next_time"

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
        return time_field;
      time_field = value;
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
            column_info = data.column_info;
            break;
          default:
            console.error ("Unsupported command:" + data_src.command ());
            return;
        }

      if (gen_params.extra.empty_text)
        empty_text = gen_params.extra.empty_text;
      else
        empty_text = "No matching " + resource_type_name (column_info.columns
                                                          [x_field].type);

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

          var defs = display.svg ().append ("defs");
          var gradient1 = defs.append ("linearGradient")
                                .attr ("id", "green_fill_gradient")
                                .attr ("x1", "0%")
                                .attr ("x2", "100%")
                                .attr ("y1", "0%")
                                .attr ("y1", "0%")

          gradient1.append ("stop")
                    .attr ("offset", "0%")
                    .style ("stop-color", "#71C000")
                    .style ("stop-opacity", "1.0")

          gradient1.append ("stop")
                    .attr ("offset", "25%")
                    .style ("stop-color", "#71C000")
                    .style ("stop-opacity", "1.0")

          gradient1.append ("stop")
                    .attr ("offset", "100%")
                    .style ("stop-color", "#71C000")
                    .style ("stop-opacity", "0.1")

          var gradient2 = defs.append ("linearGradient")
                                .attr ("id", "green_stroke_gradient")
                                .attr ("x1", "0%")
                                .attr ("x2", "100%")
                                .attr ("y1", "0%")
                                .attr ("y1", "0%")

          gradient2.append ("stop")
                    .attr ("offset", "0%")
                    .style ("stop-color", "#549330")
                    .style ("stop-opacity", "1.0")

          gradient2.append ("stop")
                    .attr ("offset", "25%")
                    .style ("stop-color", "#549330")
                    .style ("stop-opacity", "1.0")

          gradient2.append ("stop")
                    .attr ("offset", "100%")
                    .style ("stop-color", "#549330")
                    .style ("stop-opacity", "0.1")

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

      // Add a text if records list is empty
      var dummy_data = [];
      if (records.length == 0)
        dummy_data.push ("dummy");
      // Text if record set is empty
       svg.selectAll(".empty_text")
            .data (dummy_data)
              .enter().insert("text")
                .attr ("class", "empty_text")
                .style ("dominant-baseline", "middle")
                .style ("text-anchor", "middle")
                .text (empty_text);
      svg.selectAll(".empty_text")
          .data (dummy_data)
            .exit ()
              .remove ()
      svg.selectAll(".empty_text")
            .data (dummy_data)
              .attr ("x", width/2)
              .attr ("y", height/2)

      // Update chart
      time_axis_elem.attr("transform",
                          "translate (" + 0 + "," + height +")")

      x_axis_elem.call (x_axis);
      time_axis_elem.call (time_axis);

      svg.selectAll(".bar-group")
          .data (display_records)
            .enter ()
              .insert ("g")
                .attr ("class", "bar-group")

      svg.selectAll(".bar-label-shadow")
          .data (display_records)
            .enter ()
            .insert ("text")
              .attr ("class", "bar-label-shadow")
              .attr ("x", "3px")
              .style ("dominant-baseline", "middle")
              .style ("font-size", "10px")
              .style ("stroke", "#EEEEEE")
              .style ("stroke-opacity", "0.75")
              .style ("stroke-width", "3px")

      svg.selectAll(".bar-label")
          .data (display_records)
            .enter ()
            .insert ("text")
              .attr ("class", "bar-label")
              .attr ("x", "3px")
              .style ("dominant-baseline", "middle")
              .style ("font-size", "10px")

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
                                                           : 3600000 * 24;
                      var offset = +(time_scale.domain ()[0])

                      var bar_starts = [];
                      var future_runs = 0;
                      new_date = new Date (r_start)
                      if (+new_date <= +end_date)
                        bar_starts.push (new_date);
                      else if (r_periods == 0 && (r_period != 0 || r_period_months != 0))
                        future_runs = Number.POSITIVE_INFINITY
                      else
                        future_runs = 1;

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
                            {
                              if (r_periods == 0)
                                {
                                  future_runs = Number.POSITIVE_INFINITY
                                  break;
                                }
                              else
                                {
                                  future_runs++;
                                }
                            }

                          bar_starts.push (new_date)
                        }

                      sel.selectAll ("rect")
                          .data (bar_starts)
                            .enter ()
                              .insert ("rect")

                      sel.selectAll ("rect")
                            .data (bar_starts)
                              .style ("fill", function (d) { return r_duration ? "#71C000" : "url(#green_fill_gradient)" })
                              .style ("stroke", function (d) { return r_duration ? "#549330" : "url(#green_stroke_gradient)" })
                              .attr ("x", function (start) { return time_scale (start); })
                              .attr ("width", function (start) { return time_scale (offset + Math.min (r_length, end_date - start)) })
                              .attr ("height", x_scale.rangeBand())
                              .attr ("title", function (start) {  var text = d.name;
                                                                  text += "\nStart: " + gsa.datetime_format (new Date (start))
                                                                  if (r_duration)
                                                                    text += "\nEnd: " + gsa.datetime_format (new Date (+start + r_duration * 1000));
                                                                  else
                                                                    text += "\nNo scheduled end"
                                                                  return text })

                      sel.selectAll ("rect")
                            .data (bar_starts)
                              .exit ()
                                .remove ()

                      if (future_runs == Number.POSITIVE_INFINITY)
                        future_runs_text = "More runs not shown";
                      else if (future_runs == 1)
                        future_runs_text = "1 more run not shown";
                      else
                        future_runs_text = future_runs + " more runs not shown"
                      future_runs_text += "\nNext scheduled run: " + gsa.datetime_format (new_date)

                      sel.selectAll (".future-marker")
                            .data (future_runs ? [1] : [])
                              .enter ()
                                .insert ("polygon")
                                  .attr ("class", "future-marker")
                                  .style ("opacity", 0.5)
                                  .style ("fill", "#549330")
                                  .style ("stroke", "#549330")
                                  .attr ("points",
                                         (width+5) + "," + (x_scale.rangeBand() / 8)
                                         + " " + (width+20) + "," + (x_scale.rangeBand() / 2)
                                         + " " + (width+5) + "," + (7 * x_scale.rangeBand() / 8))
                                  .attr ("title", future_runs_text)

                      sel.selectAll (".future-marker")
                            .data (future_runs ? [1] : [])
                              .attr ("points",
                                     function ()
                                      {
                                        return (width+5) + "," + (x_scale.rangeBand() / 8)
                                                + " " + (width+20) + "," + (x_scale.rangeBand() / 2)
                                                + " " + (width+5) + "," + (7 * x_scale.rangeBand() / 8)
                                      })
                    })

      svg.selectAll (".bar-label-shadow")
          .data (display_records)
            .text (function (d) { return d.name })
            .attr ("y", function (d) { return (height - x_scale(d [x_field]) - (x_scale.rangeBand() /2)) })

      svg.selectAll (".bar-label")
          .data (display_records)
            .text (function (d) { return d.name })
            .attr ("y", function (d) { return (height - x_scale(d [x_field]) - (x_scale.rangeBand() /2)) })


      // Generate CSV
      csv_data = csv_from_records (records,
                                   column_info,
                                   [x_field, time_field],
                                   [column_label (column_info.columns [x_field], true, false, show_stat_type),
                                    column_label (column_info.columns [time_field], true, false, show_stat_type)],
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
          html_table_url = null;
        }
      var open_html_table = function ()
        {
          if (html_table_url == null)
            {
              html_table_data
                = html_table_from_records (records,
                                           column_info,
                                           [x_field, time_field],
                                           [column_label (column_info.columns [x_field], true, false, show_stat_type),
                                            column_label (column_info.columns [time_field], true, false, show_stat_type)],
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
                               .attr("download", "gsa_bar_chart-" + new Date().getTime() + ".svg")
                               .text("Download SVG");
                  }, 600);

      display.update_gen_data (my, gen_params);
    };

  return my;

}
