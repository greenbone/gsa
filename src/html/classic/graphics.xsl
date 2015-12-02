<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
      version="1.0"
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
      xmlns:gsa="http://openvas.org"
      xmlns:exslt="http://exslt.org/common"
      xmlns:str="http://exslt.org/strings"
      xmlns="http://www.w3.org/1999/xhtml"
      extension-element-prefixes="gsa exslt str">
     <xsl:output
      method="html"
      doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
      doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN"
      encoding="UTF-8"/>

<!--
Greenbone Security Assistant
$Id$
Description: Graphics for GSA.

Authors:
Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
Timo Pollmeier <timo.pollmeier@greenbone.net>

Copyright:
Copyright (C) 2013-2014 Greenbone Networks GmbH

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
-->

<xsl:template name="init-d3charts">
  <script src="/js/d3.v3.js"></script>
  <script src="/js/d3.layout.cloud.js"></script>
  <script src="/js/d3.tip.js"></script>
  <script src="/js/gsa_graphics_base.js"></script>
  <script src="/js/gsa_bar_chart.js"></script>
  <script src="/js/gsa_bubble_chart.js"></script>
  <script src="/js/gsa_cloud_chart.js"></script>
  <script src="/js/gsa_donut_chart.js"></script>
  <script src="/js/gsa_gantt_chart.js"></script>
  <script src="/js/gsa_h_bar_chart.js"></script>
  <script src="/js/gsa_line_chart.js"></script>
  <script type="text/javascript">
    gsa.gsa_token = "<xsl:value-of select="/envelope/params/token"/>";
    gsa.data_sources = {};
    gsa.generators = {};
    gsa.displays = {};
    gsa.charts = {};

    gsa.severity_levels =
      {max_high : <xsl:value-of select="gsa:risk-factor-max-cvss ('high')"/>,
       min_high : <xsl:value-of select="gsa:risk-factor-min-cvss ('high')"/>,
       max_medium : <xsl:value-of select="gsa:risk-factor-max-cvss ('medium')"/>,
       min_medium : <xsl:value-of select="gsa:risk-factor-min-cvss ('medium')"/>,
       max_low : <xsl:value-of select="gsa:risk-factor-max-cvss ('low')"/>,
       min_low : <xsl:value-of select="gsa:risk-factor-min-cvss ('low')"/>,
       max_log : <xsl:value-of select="gsa:risk-factor-max-cvss ('log')"/>};
  </script>
</xsl:template>

<xsl:template name="js-create-chart-box">
  <xsl:param name="parent_id" select="'top-visualization'"/>
  <xsl:param name="container_id" select="'chart-box'"/>
  <xsl:param name="width" select="433"/>
  <xsl:param name="height" select="250"/>
  <xsl:param name="container_width" select="concat ($width + 2, 'px')"/>
  <xsl:param name="select_pref_id"/>
  <xsl:param name="filter_pref_id"/>
  create_chart_box ("<xsl:value-of select="$parent_id"/>",
                    "<xsl:value-of select="$container_id"/>",
                    <xsl:value-of select="$width"/>,
                    <xsl:value-of select="$height"/>,
                    "<xsl:value-of select="$container_width"/>",
                    "<xsl:value-of select="$select_pref_id"/>",
                    "<xsl:value-of select="$filter_pref_id"/>")
</xsl:template>

<xsl:template name="js-aggregate-data-source">
  <xsl:param name="data_source_name" select="'aggregate-source'"/>

  <xsl:param name="aggregate_type"/>
  <xsl:param name="group_column"/>
  <xsl:param name="data_column"/>
  <xsl:param name="data_columns" select="''"/>
  <xsl:param name="text_columns" select="''"/>
  <xsl:param name="sort_field" select="''"/>
  <xsl:param name="sort_order" select="''"/>
  <xsl:param name="sort_stat" select="''"/>
  <xsl:param name="first_group" select="''"/>
  <xsl:param name="max_groups" select="''"/>
  <xsl:param name="aggregate_mode" select="''"/>
  <xsl:param name="filter"/>
  <xsl:param name="filt_id"/>
  <xsl:param name="chart_template" select="/envelope/params/chart_template"/>

  <xsl:variable name="data_columns_array">
    <xsl:if test="$data_columns">
      <xsl:for-each select="exslt:node-set ($data_columns)/data_columns/column">
        <xsl:if test="position() != 1">, </xsl:if>
        <xsl:value-of select="concat ('&quot;', gsa:escape-js (text()), '&quot;')"/>
      </xsl:for-each>
    </xsl:if>
  </xsl:variable>

  <xsl:variable name="text_columns_array">
    <xsl:if test="$text_columns">
      <xsl:for-each select="exslt:node-set ($text_columns)/text_columns/column">
        <xsl:if test="position() != 1">, </xsl:if>
        <xsl:value-of select="concat ('&quot;', gsa:escape-js (text()), '&quot;')"/>
      </xsl:for-each>
    </xsl:if>
  </xsl:variable>

  if (gsa.data_sources ["<xsl:value-of select="$data_source_name"/>"] == undefined)
    {
      gsa.data_sources ["<xsl:value-of select="$data_source_name"/>"]
        =
        <xsl:choose>
          <xsl:when test="$chart_template = 'info_by_cvss' or $chart_template = 'info_by_class'">
            DataSource ("get_aggregate",
                        {xml:1,
                         aggregate_type:"<xsl:value-of select="$aggregate_type"/>",
                         group_column:"severity",
                         filter:"<xsl:value-of select="gsa:escape-js ($filter)"/>",
                         filt_id:"<xsl:value-of select="gsa:escape-js ($filt_id)"/>"});
          </xsl:when>
          <xsl:otherwise>
            DataSource ("get_aggregate",
                        {xml:1,
                         aggregate_type:"<xsl:value-of select="$aggregate_type"/>",
                         group_column:"<xsl:value-of select="$group_column"/>",
                         data_column:"<xsl:value-of select="$data_column"/>",
                         data_columns: [<xsl:value-of select="$data_columns_array"/>],
                         text_columns: [<xsl:value-of select="$text_columns_array"/>],
            <xsl:if test="$sort_field != ''">
                         sort_field:"<xsl:value-of select="$sort_field"/>",
            </xsl:if>
            <xsl:if test="$sort_order != ''">
                         sort_order:"<xsl:value-of select="$sort_order"/>",
            </xsl:if>
            <xsl:if test="$sort_stat != ''">
                         sort_stat:"<xsl:value-of select="$sort_stat"/>",
            </xsl:if>
            <xsl:if test="$first_group != ''">
                         first_group:"<xsl:value-of select="$first_group"/>",
            </xsl:if>
            <xsl:if test="$max_groups != ''">
                         max_groups:"<xsl:value-of select="$max_groups"/>",
            </xsl:if>
            <xsl:if test="$aggregate_mode != ''">
                         aggregate_mode:"<xsl:value-of select="$aggregate_mode"/>",
            </xsl:if>
                         filter:"<xsl:value-of select="gsa:escape-js ($filter)"/>",
                         filt_id:"<xsl:value-of select="gsa:escape-js ($filt_id)"/>"});
          </xsl:otherwise>
        </xsl:choose>
    }
</xsl:template>

<xsl:template name="js-tasks-data-source">
  <xsl:param name="data_source_name" select="'tasks-source'"/>
  <xsl:param name="filter"/>
  <xsl:param name="filt_id"/>

  if (gsa.data_sources ["<xsl:value-of select="$data_source_name"/>"] == undefined)
    {
      gsa.data_sources ["<xsl:value-of select="$data_source_name"/>"]
        =
        <xsl:choose>
          <xsl:when test="0">
          </xsl:when>
          <xsl:otherwise>
            DataSource ("get_tasks",
                        {xml:1,
                         ignore_pagination : 1,
                         schedules_only : 1,
                         filter:"<xsl:value-of select="gsa:escape-js ($filter)"/>",
                         filt_id:"<xsl:value-of select="gsa:escape-js ($filt_id)"/>"});
          </xsl:otherwise>
        </xsl:choose>
    }
</xsl:template>

<xsl:template name="js-aggregate-chart">
  <xsl:param name="chart_name" select="'aggregate-chart'"/>
  <xsl:param name="data_source_name" select="concat($chart_name, '-source')"/>
  <xsl:param name="generator_name" select="concat($chart_name, '-generator')"/>
  <xsl:param name="display_name" select="'chart-box'"/>

  <xsl:param name="aggregate_type"/>
  <xsl:param name="group_column"/>
  <xsl:param name="data_column"/>
  <xsl:param name="filter"/>
  <xsl:param name="filt_id"/>

  <xsl:param name="chart_type"/>
  <xsl:param name="init_params" select="''"/>
  <xsl:param name="gen_params" select="''"/>

  <xsl:param name="x_field" select="''"/>
  <xsl:param name="y_fields" select="''"/>
  <xsl:param name="z_fields" select="''"/>

  <xsl:param name="chart_template"/>
  <xsl:param name="auto_load" select="0"/>
  <xsl:param name="create_data_source" select="0"/>

  <xsl:variable name="init_params_js">
    {
      <xsl:for-each select="exslt:node-set ($init_params)/params/param">
        "<xsl:value-of select="gsa:escape-js (@name)"/>" : "<xsl:value-of select="gsa:escape-js (.)"/>"
        <xsl:if test="position() &lt; count(exslt:node-set ($init_params)/params/param)">, </xsl:if>
      </xsl:for-each>
    }
  </xsl:variable>

  <xsl:variable name="gen_params_js">
    {
      <xsl:if test="$x_field">
        "x_field" : "<xsl:value-of select="gsa:escape-js ($x_field)"/>",
      </xsl:if>
      <xsl:if test="$y_fields">
        "y_fields" : [
          <xsl:for-each select="exslt:node-set ($y_fields)/fields/field">
            "<xsl:value-of select="gsa:escape-js (.)"/>"
            <xsl:if test="position() &lt; count(exslt:node-set ($y_fields)/fields/field)">, </xsl:if>
          </xsl:for-each>
        ],
      </xsl:if>
      <xsl:if test="$z_fields">
        "z_fields" : [
          <xsl:for-each select="exslt:node-set ($z_fields)/fields/field">
            "<xsl:value-of select="gsa:escape-js (.)"/>"
            <xsl:if test="position() &lt; count(exslt:node-set ($z_fields)/fields/field)">, </xsl:if>
          </xsl:for-each>
        ],
      </xsl:if>
      "extra" : {
        <xsl:for-each select="exslt:node-set ($gen_params)/params/param">
          "<xsl:value-of select="gsa:escape-js (@name)"/>" : "<xsl:value-of select="gsa:escape-js (.)"/>"
          <xsl:if test="position() &lt; count(exslt:node-set ($gen_params)/params/param)">, </xsl:if>
        </xsl:for-each>
        }
    }
  </xsl:variable>

  if (gsa.displays ["<xsl:value-of select="$display_name"/>"] == undefined)
    {
      console.error ("Display not found: <xsl:value-of select="$display_name"/>");
    }

  <!-- Optionally create data source -->
  <xsl:choose>
    <xsl:when test="$create_data_source">
      <xsl:call-template name="js-aggregate-data-source">
        <xsl:with-param name="data_source_name" select="$data_source_name"/>
        <xsl:with-param name="aggregate_type" select="$aggregate_type"/>
        <xsl:with-param name="group_column" select="$group_column"/>
        <xsl:with-param name="data_column" select="$data_column"/>
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
        <xsl:with-param name="chart_template" select="$chart_template"/>
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      if (gsa.data_sources ["<xsl:value-of select="$data_source_name"/>"] == undefined)
        {
          console.error ("Data source not found: <xsl:value-of select="$data_source_name"/>");
        }
    </xsl:otherwise>
  </xsl:choose>

  <!-- Select selector label -->
  <xsl:variable name="selector_label">
    <xsl:choose>
      <xsl:when test="exslt:node-set ($init_params)/params/param[@name='title_text'] != ''">
        <xsl:value-of select="gsa:escape-js (exslt:node-set ($init_params)/params/param[@name='title_text'])"/>
      </xsl:when>
      <xsl:when test="$chart_template = 'info_by_class' or $chart_template = 'recent_info_by_class'">
        <xsl:value-of select="concat (gsa:type-name-plural ($aggregate_type), ' by Severity Class')"/>
      </xsl:when>
      <xsl:when test="$chart_template = 'info_by_cvss' or $chart_template = 'recent_info_by_cvss'">
        <xsl:value-of select="concat (gsa:type-name-plural ($aggregate_type), ' by CVSS')"/>
      </xsl:when>
      <xsl:when test="$chart_type = 'cloud'">
        <xsl:value-of select="concat (gsa:type-name-plural ($aggregate_type), ' ', gsa:field-name ($group_column), ' word cloud')"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="concat (gsa:type-name-plural ($aggregate_type), ' by ', gsa:field-name ($group_column))"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <!-- Select title generator -->
  <xsl:variable name="title_generator">
    <xsl:choose>
      <xsl:when test="exslt:node-set ($init_params)/params/param[@name='title_text'] != ''">
        title_static ("<xsl:value-of select="gsa:escape-js (exslt:node-set ($init_params)/params/param[@name='title_text'])"/> (Loading...)", "<xsl:value-of select="gsa:escape-js (exslt:node-set ($init_params)/params/param[@name='title_text'])"/>")
      </xsl:when>
      <xsl:when test="$chart_template = 'info_by_class' or $chart_template = 'info_by_cvss'">
        title_total ("<xsl:value-of select="concat(gsa:type-name-plural ($aggregate_type), ' by severity')"/>",
                     "count")
      </xsl:when>
      <xsl:when test="$chart_type = 'bubbles'">
        title_total ("<xsl:value-of select="concat(gsa:type-name-plural ($aggregate_type), ' by ', gsa:field-name ($group_column))"/>",
                     "size_value")
      </xsl:when>
      <xsl:when test="$chart_type = 'cloud'">
        title_static ("<xsl:value-of select="concat(gsa:type-name-plural ($aggregate_type), ' ', gsa:field-name ($group_column), ' word cloud (Loading...)')"/>", "<xsl:value-of select="concat(gsa:type-name-plural ($aggregate_type), ' ', gsa:field-name ($group_column), ' word cloud')"/>")
      </xsl:when>
      <xsl:otherwise>
        title_total ("<xsl:value-of select="concat(gsa:type-name-plural ($aggregate_type), ' by ', gsa:field-name ($group_column))"/>",
                     "count")
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <!-- Create chart generator -->
  <xsl:choose>
    <xsl:when test="$chart_type = 'donut'">
      gsa.generators ["<xsl:value-of select="$generator_name"/>"]
        = DonutChartGenerator (gsa.data_sources ["<xsl:value-of select="$data_source_name"/>"])
            .title (<xsl:value-of select="$title_generator"/>)
    </xsl:when>
    <xsl:when test="$chart_type = 'bubbles'">
      gsa.generators ["<xsl:value-of select="$generator_name"/>"]
        = BubbleChartGenerator (gsa.data_sources ["<xsl:value-of select="$data_source_name"/>"])
            .title (<xsl:value-of select="$title_generator"/>)
    </xsl:when>
    <xsl:when test="$chart_type = 'cloud'">
      gsa.generators ["<xsl:value-of select="$generator_name"/>"]
        = CloudChartGenerator (gsa.data_sources ["<xsl:value-of select="$data_source_name"/>"])
            .title (<xsl:value-of select="$title_generator"/>)
    </xsl:when>
    <xsl:when test="$chart_type = 'horizontal_bar'">
      gsa.generators ["<xsl:value-of select="$generator_name"/>"]
        = HorizontalBarChartGenerator (gsa.data_sources ["<xsl:value-of select="$data_source_name"/>"])
            .title (<xsl:value-of select="$title_generator"/>)
    </xsl:when>
    <xsl:when test="$chart_type = 'line'">
      gsa.generators ["<xsl:value-of select="$generator_name"/>"]
        = LineChartGenerator (gsa.data_sources ["<xsl:value-of select="$data_source_name"/>"])
            .title (<xsl:value-of select="$title_generator"/>)
    </xsl:when>
    <xsl:otherwise>
      gsa.generators ["<xsl:value-of select="$generator_name"/>"]
        = BarChartGenerator (gsa.data_sources ["<xsl:value-of select="$data_source_name"/>"])
            .title (<xsl:value-of select="$title_generator"/>)
    </xsl:otherwise>
  </xsl:choose>

  <!-- Create basic chart -->
  gsa.charts ["<xsl:value-of select="$chart_name"/>"] =
    Chart (gsa.data_sources ["<xsl:value-of select="$data_source_name"/>"],
            gsa.generators ["<xsl:value-of select="$generator_name"/>"],
            gsa.displays ["<xsl:value-of select="$display_name"/>"],
            "<xsl:value-of select="$chart_name"/>",
            "<xsl:value-of select="$selector_label"/>",
            "/img/charts/severity-bar-chart.png",
            1,
            "<xsl:value-of select="$chart_type"/>",
            "<xsl:value-of select="$chart_template"/>",
            <xsl:value-of select="$gen_params_js"/>,
            <xsl:value-of select="$init_params_js"/>);

  <!-- Data modifiers and stylers -->
  <xsl:choose>
    <xsl:when test="$chart_template = 'resource_type_counts'">
      gsa.generators ["<xsl:value-of select="$generator_name"/>"]
        .data_transform (resource_type_counts)
    </xsl:when>
    <xsl:when test="$chart_template = 'qod_type_counts'">
      gsa.generators ["<xsl:value-of select="$generator_name"/>"]
        .data_transform (qod_type_counts)
    </xsl:when>
    <xsl:when test="$chart_template = 'percentage_counts'">
      gsa.generators ["<xsl:value-of select="$generator_name"/>"]
        .data_transform (percentage_counts)
    </xsl:when>
    <xsl:when test="$chart_template = 'info_by_class' or $chart_template = 'recent_info_by_class'">
      gsa.generators ["<xsl:value-of select="$generator_name"/>"]
        .data_transform (data_severity_level_counts)
      <xsl:choose>
        <xsl:when test="$chart_type = 'donut'">
          .color_scale (severity_level_color_scale)
        </xsl:when>
        <xsl:otherwise>

        </xsl:otherwise>
      </xsl:choose>
    </xsl:when>
    <xsl:when test="$chart_template = 'info_by_cvss' or $chart_template = 'recent_info_by_cvss'">
      gsa.generators ["<xsl:value-of select="$generator_name"/>"]
        .data_transform (data_severity_histogram)
      <xsl:choose>
        <xsl:when test="$chart_type = 'donut'">

        </xsl:when>
        <xsl:otherwise>
          .bar_style (severity_bar_style ("value",
                                          gsa.severity_levels.max_log,
                                          gsa.severity_levels.max_low,
                                          gsa.severity_levels.max_medium))
        </xsl:otherwise>
      </xsl:choose>
    </xsl:when>
    <xsl:otherwise/>
  </xsl:choose>

  <xsl:if test="$auto_load">
    gsa.charts ["<xsl:value-of select="$chart_name"/>"].request_data ();
  </xsl:if>

</xsl:template>

<xsl:template name="js-tasks-chart">
  <xsl:param name="chart_name" select="'aggregate-chart'"/>
  <xsl:param name="data_source_name" select="concat($chart_name, '-source')"/>
  <xsl:param name="generator_name" select="concat($chart_name, '-generator')"/>
  <xsl:param name="display_name" select="'chart-box'"/>

  <xsl:param name="chart_type"/>
  <xsl:param name="init_params" select="''"/>
  <xsl:param name="gen_params" select="''"/>

  <xsl:param name="chart_template"/>
  <xsl:param name="auto_load" select="0"/>

  <xsl:variable name="init_params_js">
    {
      <xsl:for-each select="exslt:node-set ($init_params)/params/param">
        "<xsl:value-of select="gsa:escape-js (@name)"/>" : "<xsl:value-of select="gsa:escape-js (.)"/>"
        <xsl:if test="position() &lt; count(exslt:node-set ($init_params)/params/param)">, </xsl:if>
      </xsl:for-each>
    }
  </xsl:variable>

  <xsl:variable name="gen_params_js">
    {
      "extra" : {
        <xsl:for-each select="exslt:node-set ($gen_params)/params/param">
          "<xsl:value-of select="gsa:escape-js (@name)"/>" : "<xsl:value-of select="gsa:escape-js (.)"/>"
          <xsl:if test="position() &lt; count(exslt:node-set ($gen_params)/params/param)">, </xsl:if>
        </xsl:for-each>
        }
    }
  </xsl:variable>

  if (gsa.displays ["<xsl:value-of select="$display_name"/>"] == undefined)
    {
      console.error ("Display not found: <xsl:value-of select="$display_name"/>");
    }

  if (gsa.data_sources ["<xsl:value-of select="$data_source_name"/>"] == undefined)
    {
      console.error ("Data source not found: <xsl:value-of select="$data_source_name"/>");
    }

  <!-- Select selector label -->
  <xsl:variable name="selector_label">
    <xsl:choose>
      <xsl:when test="exslt:node-set ($init_params)/params/param[@name='title_text'] != ''">
        <xsl:value-of select="gsa:escape-js (exslt:node-set ($init_params)/params/param[@name='title_text'])"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="'Next scheduled tasks'"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <!-- Select title generator -->
  <xsl:variable name="title_generator">
    <xsl:choose>
      <xsl:when test="exslt:node-set ($init_params)/params/param[@name='title_text'] != ''">
        title_static ("<xsl:value-of select="gsa:escape-js (exslt:node-set ($init_params)/params/param[@name='title_text'])"/> (Loading...)", "<xsl:value-of select="gsa:escape-js (exslt:node-set ($init_params)/params/param[@name='title_text'])"/>")
      </xsl:when>
      <xsl:otherwise>
        title_static ("Next scheduled tasks (Loading...)", "Next scheduled tasks")
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <!-- Create chart generator -->
  <xsl:choose>
    <xsl:when test="0">
    </xsl:when>
    <xsl:otherwise>
      gsa.generators ["<xsl:value-of select="$generator_name"/>"]
        = GanttChartGenerator (gsa.data_sources ["<xsl:value-of select="$data_source_name"/>"])
            .title (<xsl:value-of select="$title_generator"/>)
    </xsl:otherwise>
  </xsl:choose>

  <!-- Create basic chart -->
  gsa.charts ["<xsl:value-of select="$chart_name"/>"] =
    Chart (gsa.data_sources ["<xsl:value-of select="$data_source_name"/>"],
            gsa.generators ["<xsl:value-of select="$generator_name"/>"],
            gsa.displays ["<xsl:value-of select="$display_name"/>"],
            "<xsl:value-of select="$chart_name"/>",
            "<xsl:value-of select="$selector_label"/>",
            "/img/charts/severity-bar-chart.png",
            1,
            "<xsl:value-of select="$chart_type"/>",
            "<xsl:value-of select="$chart_template"/>",
            <xsl:value-of select="$gen_params_js"/>,
            <xsl:value-of select="$init_params_js"/>);

  <xsl:if test="$auto_load">
    gsa.charts ["<xsl:value-of select="$chart_name"/>"].request_data ();
  </xsl:if>

</xsl:template>

<xsl:template name="js-scan-management-top-visualization">
  <xsl:param name="type" select="'task'"/>
  <xsl:param name="auto_load_left_pref_id">
    <xsl:choose>
      <xsl:when test="$type='task'">3d5db3c7-5208-4b47-8c28-48efc621b1e0</xsl:when>
      <xsl:when test="$type='report'">e599bb6b-b95a-4bb2-a6bb-fe8ac69bc071</xsl:when>
      <xsl:when test="$type='result'">0b8ae70d-d8fc-4418-8a72-e65ac8d2828e</xsl:when>
    </xsl:choose>
  </xsl:param>
  <xsl:param name="auto_load_right_pref_id">
    <xsl:choose>
      <xsl:when test="$type='task'">ce8608af-7e66-45a8-aa8a-76def4f9f838</xsl:when>
      <xsl:when test="$type='report'">fc875cd4-16bf-42d1-98ed-c0c9bd6015cd</xsl:when>
      <xsl:when test="$type='result'">cb7db2fe-3fe4-4704-9fa1-efd4b9e522a8</xsl:when>
    </xsl:choose>
  </xsl:param>
  <xsl:param name="auto_load_left_default" select="'left-by-cvss'"/>
  <xsl:param name="auto_load_right_default" select="'right-by-class'"/>

  <xsl:variable name="auto_load_left">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $auto_load_left_pref_id]">
        <xsl:value-of select="/envelope/chart_preferences/chart_preference[@id = $auto_load_left_pref_id]/value"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$auto_load_left_default"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:variable name="auto_load_right">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $auto_load_right_pref_id]">
        <xsl:value-of select="/envelope/chart_preferences/chart_preference[@id = $auto_load_right_pref_id]/value"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$auto_load_right_default"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="filter" select="/envelope/get_tasks/get_tasks_response/filters/term | /envelope/get_reports/get_reports_response/filters/term | /envelope/get_results/get_results_response/filters/term"/>
  <xsl:variable name="filt_id" select="/envelope/get_tasks/get_tasks_response/filters/@id | /envelope/get_reports/get_reports_response/filters/@id |  /envelope/get_results/get_results_response/filters/@id"/>

  <script type="text/javascript">
    <xsl:call-template name="js-create-chart-box">
      <xsl:with-param name="parent_id" select="'top-visualization-box-left'"/>
      <xsl:with-param name="container_id" select="'top-visualization-left'"/>
      <xsl:with-param name="select_pref_id" select="$auto_load_left_pref_id"/>
    </xsl:call-template>
    <xsl:call-template name="js-create-chart-box">
      <xsl:with-param name="parent_id" select="'top-visualization-box-right'"/>
      <xsl:with-param name="container_id" select="'top-visualization-right'"/>
      <xsl:with-param name="select_pref_id" select="$auto_load_right_pref_id"/>
    </xsl:call-template>

    <xsl:call-template name="js-aggregate-data-source">
      <xsl:with-param name="data_source_name" select="'severity-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
      <xsl:with-param name="group_column" select="'severity'"/>
      <xsl:with-param name="data_column" select="''"/>
      <xsl:with-param name="filter" select="$filter"/>
      <xsl:with-param name="filt_id" select="$filt_id"/>
      <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-data-source">
      <xsl:with-param name="data_source_name" select="'task-status-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
      <xsl:with-param name="group_column" select="'status'"/>
      <xsl:with-param name="data_column" select="''"/>
      <xsl:with-param name="filter" select="$filter"/>
      <xsl:with-param name="filt_id" select="$filt_id"/>
      <xsl:with-param name="chart_template" select="''"/>
    </xsl:call-template>

    <xsl:call-template name="js-aggregate-chart">
      <xsl:with-param name="chart_name" select="'left-by-cvss'"/>
      <xsl:with-param name="data_source_name" select="'severity-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
      <xsl:with-param name="display_name" select="'top-visualization-left'"/>
      <xsl:with-param name="chart_type" select="'bar'"/>
      <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart">
      <xsl:with-param name="chart_name" select="'right-by-cvss'"/>
      <xsl:with-param name="data_source_name" select="'severity-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
      <xsl:with-param name="display_name" select="'top-visualization-right'"/>
      <xsl:with-param name="chart_type" select="'bar'"/>
      <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
    </xsl:call-template>

    <xsl:call-template name="js-aggregate-chart">
      <xsl:with-param name="chart_name" select="'left-by-class'"/>
      <xsl:with-param name="data_source_name" select="'severity-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
      <xsl:with-param name="display_name" select="'top-visualization-left'"/>
      <xsl:with-param name="chart_type" select="'donut'"/>
      <xsl:with-param name="chart_template" select="'info_by_class'"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart">
      <xsl:with-param name="chart_name" select="'right-by-class'"/>
      <xsl:with-param name="data_source_name" select="'severity-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
      <xsl:with-param name="display_name" select="'top-visualization-right'"/>
      <xsl:with-param name="chart_type" select="'donut'"/>
      <xsl:with-param name="chart_template" select="'info_by_class'"/>
    </xsl:call-template>

    <xsl:if test="$type='report'">
      <xsl:call-template name="js-aggregate-data-source">
        <xsl:with-param name="data_source_name" select="'report-high-results-timeline-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'date'"/>
        <xsl:with-param name="data_columns" xmlns="">
          <data_columns>
            <column>high</column>
            <column>high_per_host</column>
          </data_columns>
        </xsl:with-param>
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
        <xsl:with-param name="display_name" select="'top-visualization-left'"/>
        <xsl:with-param name="chart_type" select="'line'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>

      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'left-report-high-results-timeline'"/>
        <xsl:with-param name="data_source_name" select="'report-high-results-timeline-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'date'"/>
        <xsl:with-param name="data_columns" xmlns="">
          <data_columns>
            <column>high</column>
            <column>high_per_host</column>
          </data_columns>
        </xsl:with-param>
        <xsl:with-param name="y_fields" xmlns="">
          <fields>
            <field>high_max</field>
          </fields>
        </xsl:with-param>
        <xsl:with-param name="z_fields" xmlns="">
          <fields>
            <field>high_per_host_max</field>
          </fields>
        </xsl:with-param>
        <xsl:with-param name="init_params" xmlns="">
          <params>
            <param name="title_text">Reports: 'High' results timeline</param>
          </params>
        </xsl:with-param>
        <xsl:with-param name="gen_params" xmlns="">
          <params>
            <param name="show_stat_type">0</param>
          </params>
        </xsl:with-param>
        <xsl:with-param name="display_name" select="'top-visualization-left'"/>
        <xsl:with-param name="chart_type" select="'line'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>
      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'right-report-high-results-timeline'"/>
        <xsl:with-param name="data_source_name" select="'report-high-results-timeline-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'date'"/>
        <xsl:with-param name="data_columns" xmlns="">
          <data_columns>
            <column>high</column>
            <column>high_per_host</column>
          </data_columns>
        </xsl:with-param>
        <xsl:with-param name="y_fields" xmlns="">
          <fields>
            <field>high_max</field>
          </fields>
        </xsl:with-param>
        <xsl:with-param name="z_fields" xmlns="">
          <fields>
            <field>high_per_host_max</field>
          </fields>
        </xsl:with-param>
        <xsl:with-param name="init_params" xmlns="">
          <params>
            <param name="title_text">Reports: 'High' results timeline</param>
          </params>
        </xsl:with-param>
        <xsl:with-param name="gen_params" xmlns="">
          <params>
            <param name="show_stat_type">0</param>
          </params>
        </xsl:with-param>
        <xsl:with-param name="display_name" select="'top-visualization-right'"/>
        <xsl:with-param name="chart_type" select="'line'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>
    </xsl:if>

    <xsl:if test="$type='task'">
      <xsl:call-template name="js-aggregate-data-source">
        <xsl:with-param name="data_source_name" select="'task-high-results-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'uuid'"/>
        <xsl:with-param name="data_columns" xmlns="">
          <data_columns>
            <column>severity</column>
            <column>high_per_host</column>
          </data_columns>
        </xsl:with-param>
        <xsl:with-param name="text_columns" xmlns="">
          <text_columns>
            <column>name</column>
          </text_columns>
        </xsl:with-param>
        <xsl:with-param name="sort_field" select="'high_per_host'"/>
        <xsl:with-param name="sort_order" select="'descending'"/>
        <xsl:with-param name="sort_stat" select="'max'"/>
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>

      <xsl:call-template name="js-tasks-data-source">
        <xsl:with-param name="data_source_name" select="'task-schedules-source'"/>
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
      </xsl:call-template>

      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'left-by-task-status'"/>
        <xsl:with-param name="data_source_name" select="'task-status-count-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'status'"/>
        <xsl:with-param name="display_name" select="'top-visualization-left'"/>
        <xsl:with-param name="chart_type" select="'donut'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>
      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'right-by-task-status'"/>
        <xsl:with-param name="data_source_name" select="'task-status-count-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'status'"/>
        <xsl:with-param name="display_name" select="'top-visualization-right'"/>
        <xsl:with-param name="chart_type" select="'donut'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>

      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'left-by-high-results'"/>
        <xsl:with-param name="data_source_name" select="'task-high-results-source'"/>
        <xsl:with-param name="display_name" select="'top-visualization-left'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="x_field" select="'name'"/>
        <xsl:with-param name="y_fields" xmlns="">
          <fields>
            <field>high_per_host_max</field>
          </fields>
        </xsl:with-param>
        <xsl:with-param name="z_fields" xmlns="">
          <fields>
            <field>severity_max</field>
          </fields>
        </xsl:with-param>
        <xsl:with-param name="init_params" xmlns="">
          <params>
            <param name="title_text">Tasks: 'High' results per host</param>
          </params>
        </xsl:with-param>
        <xsl:with-param name="gen_params" xmlns="">
          <params>
            <param name="empty_text">No Tasks with 'High' severity found</param>
          </params>
        </xsl:with-param>
        <xsl:with-param name="chart_type" select="'bubbles'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>
      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'right-by-high-results'"/>
        <xsl:with-param name="display_name" select="'top-visualization-right'"/>
        <xsl:with-param name="data_source_name" select="'task-high-results-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="x_field" select="'name'"/>
        <xsl:with-param name="y_fields" xmlns="">
          <fields>
            <field>high_per_host_max</field>
          </fields>
        </xsl:with-param>
        <xsl:with-param name="z_fields" xmlns="">
          <fields>
            <field>severity_max</field>
          </fields>
        </xsl:with-param>
        <xsl:with-param name="init_params" xmlns="">
          <params>
            <param name="title_text">Tasks: 'High' results per host</param>
          </params>
        </xsl:with-param>
        <xsl:with-param name="gen_params" xmlns="">
          <params>
            <param name="empty_text">No Tasks with 'High' severity found</param>
          </params>
        </xsl:with-param>
        <xsl:with-param name="chart_type" select="'bubbles'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>

      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'left-top-high-results'"/>
        <xsl:with-param name="display_name" select="'top-visualization-left'"/>
        <xsl:with-param name="data_source_name" select="'task-high-results-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="x_field" select="'name'"/>
        <xsl:with-param name="y_fields" xmlns="">
          <fields>
            <field>high_per_host_max</field>
          </fields>
        </xsl:with-param>
        <xsl:with-param name="z_fields" xmlns="">
          <fields>
            <field>severity_max</field>
          </fields>
        </xsl:with-param>
        <xsl:with-param name="init_params" xmlns="">
          <params>
            <param name="title_text">Tasks with most 'High' results per host</param>
          </params>
        </xsl:with-param>
        <xsl:with-param name="gen_params" xmlns="">
          <params>
            <param name="empty_text">No Tasks with 'High' severity found</param>
          </params>
        </xsl:with-param>
        <xsl:with-param name="chart_type" select="'horizontal_bar'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>
      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'right-top-high-results'"/>
        <xsl:with-param name="display_name" select="'top-visualization-right'"/>
        <xsl:with-param name="data_source_name" select="'task-high-results-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="x_field" select="'name'"/>
        <xsl:with-param name="y_fields" xmlns="">
          <fields>
            <field>high_per_host_max</field>
          </fields>
        </xsl:with-param>
        <xsl:with-param name="z_fields" xmlns="">
          <fields>
            <field>severity_max</field>
          </fields>
        </xsl:with-param>
        <xsl:with-param name="init_params" xmlns="">
          <params>
            <param name="title_text">Tasks with most 'High' results per host</param>
          </params>
        </xsl:with-param>
        <xsl:with-param name="gen_params" xmlns="">
          <params>
            <param name="empty_text">No Tasks with 'High' severity found</param>
          </params>
        </xsl:with-param>
        <xsl:with-param name="chart_type" select="'horizontal_bar'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>

      <xsl:call-template name="js-tasks-chart">
        <xsl:with-param name="chart_name" select="'left-task-schedules'"/>
        <xsl:with-param name="data_source_name" select="'task-schedules-source'"/>
        <xsl:with-param name="display_name" select="'top-visualization-left'"/>
        <xsl:with-param name="chart_type" select="'gantt'"/>
        <xsl:with-param name="gen_params" xmlns="">
          <params>
            <param name="empty_text">No scheduled Tasks found</param>
          </params>
        </xsl:with-param>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>
      <xsl:call-template name="js-tasks-chart">
        <xsl:with-param name="chart_name" select="'right-task-schedules'"/>
        <xsl:with-param name="data_source_name" select="'task-schedules-source'"/>
        <xsl:with-param name="display_name" select="'top-visualization-right'"/>
        <xsl:with-param name="chart_type" select="'gantt'"/>
        <xsl:with-param name="gen_params" xmlns="">
          <params>
            <param name="empty_text">No scheduled Tasks found</param>
          </params>
        </xsl:with-param>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>
    </xsl:if>

    <xsl:if test="$type='result'">
      <xsl:call-template name="js-aggregate-data-source">
        <xsl:with-param name="data_source_name" select="'result-vuln-words-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'vulnerability'"/>
        <xsl:with-param name="aggregate_mode" select="'word_counts'"/>
        <xsl:with-param name="sort_stat" select="'count'"/>
        <xsl:with-param name="sort_order" select="'descending'"/>
        <xsl:with-param name="max_groups" select="'250'"/>
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>
      <xsl:call-template name="js-aggregate-data-source">
        <xsl:with-param name="data_source_name" select="'result-desc-words-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'description'"/>
        <xsl:with-param name="aggregate_mode" select="'word_counts'"/>
        <xsl:with-param name="sort_stat" select="'count'"/>
        <xsl:with-param name="sort_order" select="'descending'"/>
        <xsl:with-param name="max_groups" select="'250'"/>
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>

      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'left-result-vuln-words'"/>
        <xsl:with-param name="data_source_name" select="'result-vuln-words-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'vulnerability'"/>
        <xsl:with-param name="display_name" select="'top-visualization-left'"/>
        <xsl:with-param name="chart_type" select="'cloud'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>
      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'right-result-vuln-words'"/>
        <xsl:with-param name="group_column" select="'vulnerability'"/>
        <xsl:with-param name="data_source_name" select="'result-vuln-words-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="display_name" select="'top-visualization-right'"/>
        <xsl:with-param name="chart_type" select="'cloud'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>

      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'left-result-desc-words'"/>
        <xsl:with-param name="data_source_name" select="'result-desc-words-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'description'"/>
        <xsl:with-param name="display_name" select="'top-visualization-left'"/>
        <xsl:with-param name="chart_type" select="'cloud'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>
      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'right-result-desc-words'"/>
        <xsl:with-param name="group_column" select="'description'"/>
        <xsl:with-param name="data_source_name" select="'result-desc-words-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="display_name" select="'top-visualization-right'"/>
        <xsl:with-param name="chart_type" select="'cloud'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>
    </xsl:if>

    gsa.displays ["top-visualization-left"].create_chart_selector ();
    gsa.displays ["top-visualization-right"].create_chart_selector ();

    <xsl:if test="$auto_load_left != ''">
    gsa.displays ["top-visualization-left"].select_chart ("<xsl:value-of select="$auto_load_left"/>", false, true);
    </xsl:if>
    <xsl:if test="$auto_load_right != ''">
    gsa.displays ["top-visualization-right"].select_chart ("<xsl:value-of select="$auto_load_right"/>", false, true);
    </xsl:if>
  </script>
</xsl:template>

<xsl:template name="js-secinfo-top-visualization">
  <xsl:param name="type" select="'nvt'"/>
  <xsl:param name="auto_load_left_pref_id">
    <xsl:choose>
      <xsl:when test="$type='nvt'">f68d9369-1945-477b-968f-121c6029971b</xsl:when>
      <xsl:when test="$type='cve'">815ddd2e-8654-46c7-a05b-d73224102240</xsl:when>
      <xsl:when test="$type='cpe'">9cff9b4d-b164-43ce-8687-f2360afc7500</xsl:when>
      <xsl:when test="$type='ovaldef'">9563efc0-9f4e-4d1f-8f8d-0205e32b90a4</xsl:when>
      <xsl:when test="$type='cert_bund_adv'">a6946f44-480f-4f37-8a73-28a4cd5310c4</xsl:when>
      <xsl:when test="$type='dfn_cert_adv'">9812ea49-682d-4f99-b3cc-eca051d1ce59</xsl:when>
      <xsl:when test="$type='allinfo'">4c7b1ea7-b7e6-4d12-9791-eb9f72b6f864</xsl:when>
    </xsl:choose>
  </xsl:param>
  <xsl:param name="auto_load_right_pref_id">
    <xsl:choose>
      <xsl:when test="$type='nvt'">af89a84a-d3ec-43a8-97a8-aa688bf093bc</xsl:when>
      <xsl:when test="$type='cve'">418a5746-d68a-4a2d-864a-0da993b32220</xsl:when>
      <xsl:when test="$type='cpe'">629fdb73-35fa-4247-9018-338c202f7c03</xsl:when>
      <xsl:when test="$type='ovaldef'">fe1610a3-4e87-4b0d-9b7a-f0f66fef586b</xsl:when>
      <xsl:when test="$type='cert_bund_adv'">469d50da-880a-4bfc-88ed-22e53764c683</xsl:when>
      <xsl:when test="$type='dfn_cert_adv'">72014b52-4389-435d-9438-8c13601ecbd2</xsl:when>
      <xsl:when test="$type='allinfo'">985f38eb-1a30-4a35-abb6-3eec05b5d54a</xsl:when>
    </xsl:choose>
  </xsl:param>
  <xsl:param name="auto_load_left_default" select="'left-by-cvss'"/>
  <xsl:param name="auto_load_right_default" select="'right-by-class'"/>

  <xsl:variable name="auto_load_left">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $auto_load_left_pref_id]">
        <xsl:value-of select="/envelope/chart_preferences/chart_preference[@id = $auto_load_left_pref_id]/value"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$auto_load_left_default"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:variable name="auto_load_right">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $auto_load_right_pref_id]">
        <xsl:value-of select="/envelope/chart_preferences/chart_preference[@id = $auto_load_right_pref_id]/value"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$auto_load_right_default"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="filter" select="/envelope/get_info/get_info_response/filters/term"/>
  <xsl:variable name="filt_id" select="/envelope/get_info/get_info_response/filters/@id"/>

  <script type="text/javascript">
    <xsl:call-template name="js-create-chart-box">
      <xsl:with-param name="parent_id" select="'top-visualization-box-left'"/>
      <xsl:with-param name="container_id" select="'top-visualization-left'"/>
      <xsl:with-param name="select_pref_id" select="$auto_load_left_pref_id"/>
    </xsl:call-template>
    <xsl:call-template name="js-create-chart-box">
      <xsl:with-param name="parent_id" select="'top-visualization-box-right'"/>
      <xsl:with-param name="container_id" select="'top-visualization-right'"/>
      <xsl:with-param name="select_pref_id" select="$auto_load_right_pref_id"/>
    </xsl:call-template>

    <xsl:call-template name="js-aggregate-data-source">
      <xsl:with-param name="data_source_name" select="'severity-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
      <xsl:with-param name="group_column" select="'severity'"/>
      <xsl:with-param name="data_column" select="''"/>
      <xsl:with-param name="filter" select="$filter"/>
      <xsl:with-param name="filt_id" select="$filt_id"/>
      <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-data-source">
      <xsl:with-param name="data_source_name" select="'created-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
      <xsl:with-param name="group_column" select="'created'"/>
      <xsl:with-param name="data_column" select="''"/>
      <xsl:with-param name="filter" select="$filter"/>
      <xsl:with-param name="filt_id" select="$filt_id"/>
      <xsl:with-param name="chart_template" select="''"/>
    </xsl:call-template>

    <xsl:call-template name="js-aggregate-chart">
      <xsl:with-param name="chart_name" select="'left-by-cvss'"/>
      <xsl:with-param name="data_source_name" select="'severity-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
      <xsl:with-param name="display_name" select="'top-visualization-left'"/>
      <xsl:with-param name="chart_type" select="'bar'"/>
      <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart">
      <xsl:with-param name="chart_name" select="'right-by-cvss'"/>
      <xsl:with-param name="data_source_name" select="'severity-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
      <xsl:with-param name="display_name" select="'top-visualization-right'"/>
      <xsl:with-param name="chart_type" select="'bar'"/>
      <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
    </xsl:call-template>

    <xsl:call-template name="js-aggregate-chart">
      <xsl:with-param name="chart_name" select="'left-by-class'"/>
      <xsl:with-param name="data_source_name" select="'severity-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
      <xsl:with-param name="display_name" select="'top-visualization-left'"/>
      <xsl:with-param name="chart_type" select="'donut'"/>
      <xsl:with-param name="chart_template" select="'info_by_class'"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart">
      <xsl:with-param name="chart_name" select="'right-by-class'"/>
      <xsl:with-param name="data_source_name" select="'severity-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
      <xsl:with-param name="display_name" select="'top-visualization-right'"/>
      <xsl:with-param name="chart_type" select="'donut'"/>
      <xsl:with-param name="chart_template" select="'info_by_class'"/>
    </xsl:call-template>

    <xsl:call-template name="js-aggregate-chart">
      <xsl:with-param name="chart_name" select="'left-by-created'"/>
      <xsl:with-param name="data_source_name" select="'created-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
      <xsl:with-param name="group_column" select="'created'"/>
      <xsl:with-param name="data_column" select="''"/>
      <xsl:with-param name="display_name" select="'top-visualization-left'"/>
      <xsl:with-param name="chart_type" select="'line'"/>
      <xsl:with-param name="chart_template" select="''"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart">
      <xsl:with-param name="chart_name" select="'right-by-created'"/>
      <xsl:with-param name="data_source_name" select="'created-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
      <xsl:with-param name="group_column" select="'created'"/>
      <xsl:with-param name="data_column" select="''"/>
      <xsl:with-param name="display_name" select="'top-visualization-right'"/>
      <xsl:with-param name="chart_type" select="'line'"/>
      <xsl:with-param name="chart_template" select="''"/>
    </xsl:call-template>

    <xsl:if test="$type = 'nvt'">
      <xsl:call-template name="js-aggregate-data-source">
        <xsl:with-param name="data_source_name" select="'nvt-by-family-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'family'"/>
        <xsl:with-param name="data_column" select="'severity'"/>
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>
      <xsl:call-template name="js-aggregate-data-source">
        <xsl:with-param name="data_source_name" select="'nvt-by-solution_type-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'solution_type'"/>
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>
      <xsl:call-template name="js-aggregate-data-source">
        <xsl:with-param name="data_source_name" select="'nvt-by-qod_type-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'qod_type'"/>
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
        <xsl:with-param name="chart_template" select="'qod_type_counts'"/>
      </xsl:call-template>
      <xsl:call-template name="js-aggregate-data-source">
        <xsl:with-param name="data_source_name" select="'nvt-by-qod-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'qod'"/>
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
        <xsl:with-param name="chart_template" select="'percentage_counts'"/>
      </xsl:call-template>

      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'left-nvt-by-family'"/>
        <xsl:with-param name="data_source_name" select="'nvt-by-family-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'family'"/>
        <xsl:with-param name="data_column" select="'severity'"/>
        <xsl:with-param name="display_name" select="'top-visualization-left'"/>
        <xsl:with-param name="chart_type" select="'bubbles'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>
      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'right-nvt-by-family'"/>
        <xsl:with-param name="data_source_name" select="'nvt-by-family-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'family'"/>
        <xsl:with-param name="data_column" select="'severity'"/>
        <xsl:with-param name="display_name" select="'top-visualization-right'"/>
        <xsl:with-param name="chart_type" select="'bubbles'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>

      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'left-nvt-by-solution_type'"/>
        <xsl:with-param name="data_source_name" select="'nvt-by-solution_type-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'solution_type'"/>
        <xsl:with-param name="display_name" select="'top-visualization-left'"/>
        <xsl:with-param name="chart_type" select="'donut'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>
      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'right-nvt-by-solution_type'"/>
        <xsl:with-param name="data_source_name" select="'nvt-by-solution_type-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'solution_type'"/>
        <xsl:with-param name="display_name" select="'top-visualization-right'"/>
        <xsl:with-param name="chart_type" select="'donut'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>

      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'left-nvt-by-qod_type'"/>
        <xsl:with-param name="data_source_name" select="'nvt-by-qod_type-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'qod_type'"/>
        <xsl:with-param name="display_name" select="'top-visualization-left'"/>
        <xsl:with-param name="chart_type" select="'donut'"/>
        <xsl:with-param name="chart_template" select="'qod_type_counts'"/>
      </xsl:call-template>
      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'right-nvt-by-qod_type'"/>
        <xsl:with-param name="data_source_name" select="'nvt-by-qod_type-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'qod_type'"/>
        <xsl:with-param name="display_name" select="'top-visualization-right'"/>
        <xsl:with-param name="chart_type" select="'donut'"/>
        <xsl:with-param name="chart_template" select="'qod_type_counts'"/>
      </xsl:call-template>

      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'left-nvt-by-qod'"/>
        <xsl:with-param name="data_source_name" select="'nvt-by-qod-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'qod'"/>
        <xsl:with-param name="display_name" select="'top-visualization-left'"/>
        <xsl:with-param name="chart_type" select="'donut'"/>
        <xsl:with-param name="chart_template" select="'percentage_counts'"/>
      </xsl:call-template>
      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'right-nvt-by-qod'"/>
        <xsl:with-param name="data_source_name" select="'nvt-by-qod-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'qod'"/>
        <xsl:with-param name="display_name" select="'top-visualization-right'"/>
        <xsl:with-param name="chart_type" select="'donut'"/>
        <xsl:with-param name="chart_template" select="'percentage_counts'"/>
      </xsl:call-template>
    </xsl:if>

    <xsl:if test="$type = 'ovaldef'">
      <xsl:call-template name="js-aggregate-data-source">
        <xsl:with-param name="data_source_name" select="'ovaldef-by-class-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'class'"/>
        <xsl:with-param name="data_column" select="''"/>
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>

      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'left-by-oval-class'"/>
        <xsl:with-param name="data_source_name" select="'ovaldef-by-class-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'class'"/>
        <xsl:with-param name="data_column" select="''"/>
        <xsl:with-param name="display_name" select="'top-visualization-left'"/>
        <xsl:with-param name="chart_type" select="'donut'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>
      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'right-by-oval-class'"/>
        <xsl:with-param name="data_source_name" select="'ovaldef-by-class-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'class'"/>
        <xsl:with-param name="data_column" select="''"/>
        <xsl:with-param name="display_name" select="'top-visualization-right'"/>
        <xsl:with-param name="chart_type" select="'donut'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>
    </xsl:if>

    <xsl:if test="$type = 'allinfo'">
      <xsl:call-template name="js-aggregate-data-source">
        <xsl:with-param name="data_source_name" select="'allinfo-by-type-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'type'"/>
        <xsl:with-param name="data_column" select="''"/>
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>

      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'left-by-info-type'"/>
        <xsl:with-param name="data_source_name" select="'allinfo-by-type-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'type'"/>
        <xsl:with-param name="data_column" select="''"/>
        <xsl:with-param name="display_name" select="'top-visualization-left'"/>
        <xsl:with-param name="chart_type" select="'donut'"/>
        <xsl:with-param name="chart_template" select="'resource_type_counts'"/>
      </xsl:call-template>
      <xsl:call-template name="js-aggregate-chart">
        <xsl:with-param name="chart_name" select="'right-by-info-type'"/>
        <xsl:with-param name="data_source_name" select="'allinfo-by-type-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'type'"/>
        <xsl:with-param name="data_column" select="''"/>
        <xsl:with-param name="display_name" select="'top-visualization-right'"/>
        <xsl:with-param name="chart_type" select="'donut'"/>
        <xsl:with-param name="chart_template" select="'resource_type_counts'"/>
      </xsl:call-template>
    </xsl:if>

    gsa.displays ["top-visualization-left"].create_chart_selector ();
    gsa.displays ["top-visualization-right"].create_chart_selector ();

    <xsl:if test="$auto_load_left != ''">
    gsa.displays ["top-visualization-left"].select_chart ("<xsl:value-of select="$auto_load_left"/>", false, true);
    </xsl:if>
    <xsl:if test="$auto_load_right != ''">
    gsa.displays ["top-visualization-right"].select_chart ("<xsl:value-of select="$auto_load_right"/>", false, true);
    </xsl:if>
  </script>
</xsl:template>

<xsl:template match="dashboard">
  <noscript>
    <div class="gb_window">
      <div class="gb_window_part_left_error"></div>
      <div class="gb_window_part_right_error"></div>
      <div class="gb_window_part_center_error">
        <xsl:value-of select="'JavaScript required'"/>
      </div>
      <div class="gb_window_part_content">
        <xsl:value-of select="'The Dashboard requires JavaScript. Please make sure JavaScript is supported by your browser and enabled.'"/>
      </div>
    </div>
  </noscript>

  <xsl:choose>
    <xsl:when test="name='' or name='secinfo'">
      <xsl:apply-templates select="." mode="secinfo"/>
    </xsl:when>
    <xsl:otherwise>
      <div class="gb_window">
        <div class="gb_window_part_left_error"></div>
        <div class="gb_window_part_right_error"></div>
        <div class="gb_window_part_center_error">
          <xsl:value-of select="'Dashboard not found'"/>
        </div>
        <div class="gb_window_part_content">
          <xsl:value-of select="concat('No dashboard named &quot;', name,'&quot; was found')"/>
        </div>
      </div>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="dashboard" mode="secinfo">
  <div class="section-header">
    <h1>
      <img id="big-icon" src="/img/secinfo.svg" border="0" style="margin-right:5px" alt="SecInfo Dashboard"/>
      <xsl:value-of select="gsa:i18n ('SecInfo Dashboard', 'Dashboard')"/>
    </h1>
  </div>

  <div class="visualization" id="dashboard">
    <div class="visualization-row">
      <div class="visualization-spacer"/>
      <div class="visualization-box" id="dashboard-box-1"/>
      <div class="visualization-spacer"/>
      <div class="visualization-box" id="dashboard-box-2"/>
      <div class="visualization-spacer"/>
    </div>
    <div class="visualization-row">
      <div class="visualization-spacer"/>
      <div class="visualization-box" id="dashboard-box-3"/>
      <div class="visualization-spacer"/>
      <div class="visualization-box" id="dashboard-box-4"/>
      <div class="visualization-spacer"/>
    </div>

    <xsl:call-template name="init-d3charts"/>

    <xsl:variable name="envelope" select="/envelope"/>
    <xsl:variable name="chart_defaults" xmlns="">
      <chart auto_load="secinfo_1_nvt_bar_chart">secinfo_1</chart>
      <chart auto_load="secinfo_2_nvt_donut_chart">secinfo_2</chart>
      <chart auto_load="secinfo_3_cve_bar_chart">secinfo_3</chart>
      <chart auto_load="secinfo_4_cve_donut_chart">secinfo_4</chart>
    </xsl:variable>

    <xsl:variable name="filters" select="get_filters_response/filter[type='SecInfo']"/>

    <script>
      <xsl:for-each select="exslt:node-set ($chart_defaults)/chart">
        <xsl:variable name="display_name" select="concat (text(), '_display')"/>
        <xsl:variable name="auto_load_pref_id">
          <xsl:choose>
            <xsl:when test="text() = 'secinfo_1'">84ab32da-fe69-44d8-8a8f-70034cf28d4e</xsl:when>
            <xsl:when test="text() = 'secinfo_2'">42d48049-3153-43bf-b30d-72ca5ab1eb49</xsl:when>
            <xsl:when test="text() = 'secinfo_3'">76f34fe0-254a-4481-97aa-c6f1da2f842b</xsl:when>
            <xsl:when test="text() = 'secinfo_4'">71106ed7-b677-414e-bf67-2e7716441db3</xsl:when>
          </xsl:choose>
        </xsl:variable>
        <xsl:variable name="auto_load">
          <xsl:choose>
            <xsl:when test="$envelope/chart_preferences/chart_preference[@id = $auto_load_pref_id]">
              <xsl:value-of select="$envelope/chart_preferences/chart_preference[@id = $auto_load_pref_id]/value"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="@auto_load"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <xsl:variable name="auto_filter_pref_id">
          <xsl:choose>
            <xsl:when test="text() = 'secinfo_1'">517d0efe-426e-49a9-baa7-eda2832c93e8</xsl:when>
            <xsl:when test="text() = 'secinfo_2'">3c693fb2-4f87-4b1f-a09e-cb9aa66440f4</xsl:when>
            <xsl:when test="text() = 'secinfo_3'">bffa72a5-8110-49f9-aa5e-f431ce834826</xsl:when>
            <xsl:when test="text() = 'secinfo_4'">268079c6-f353-414f-9b7c-43f5419edf2d</xsl:when>
          </xsl:choose>
        </xsl:variable>
        <xsl:variable name="auto_filter">
          <xsl:choose>
            <xsl:when test="$envelope/chart_preferences/chart_preference[@id = $auto_filter_pref_id]">
              <xsl:value-of select="$envelope/chart_preferences/chart_preference[@id = $auto_filter_pref_id]/value"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="''"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:variable>

        <xsl:call-template name="js-create-chart-box">
          <xsl:with-param name="container_id" select="$display_name"/>
          <xsl:with-param name="parent_id" select="concat ('dashboard-box-', position())"/>
          <xsl:with-param name="select_pref_id" select="$auto_load_pref_id"/>
          <xsl:with-param name="filter_pref_id" select="$auto_filter_pref_id"/>
        </xsl:call-template>

        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_nvt_bar_chart')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_nvt_severity_src')"/>
          <xsl:with-param name="aggregate_type" select="'nvt'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'bar'"/>
          <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
          <xsl:with-param name="auto_load" select="''"/>
          <xsl:with-param name="create_data_source" select="1"/>
        </xsl:call-template>
        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_nvt_donut_chart')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_nvt_severity_src')"/>
          <xsl:with-param name="aggregate_type" select="'nvt'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'donut'"/>
          <xsl:with-param name="chart_template" select="'info_by_class'"/>
          <xsl:with-param name="auto_load" select="0"/>
          <xsl:with-param name="create_data_source" select="0"/>
        </xsl:call-template>

        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_nvt_timeline_chart')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_nvt_timeline_src')"/>
          <xsl:with-param name="aggregate_type" select="'nvt'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'line'"/>
          <xsl:with-param name="group_column" select="'created'"/>
          <xsl:with-param name="data_column" select="''"/>
          <xsl:with-param name="chart_template" select="''"/>
          <xsl:with-param name="auto_load" select="0"/>
          <xsl:with-param name="create_data_source" select="1"/>
        </xsl:call-template>

        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_nvt_bubble_chart')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_nvt_families_src')"/>
          <xsl:with-param name="aggregate_type" select="'nvt'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'bubbles'"/>
          <xsl:with-param name="group_column" select="'family'"/>
          <xsl:with-param name="data_column" select="'severity'"/>
          <xsl:with-param name="chart_template" select="''"/>
          <xsl:with-param name="auto_load" select="0"/>
          <xsl:with-param name="create_data_source" select="1"/>
        </xsl:call-template>
        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_nvt_solution_type')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_nvt_solution_type_src')"/>
          <xsl:with-param name="aggregate_type" select="'nvt'"/>
          <xsl:with-param name="group_column" select="'solution_type'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'donut'"/>
          <xsl:with-param name="chart_template" select="''"/>
          <xsl:with-param name="auto_load" select="0"/>
          <xsl:with-param name="create_data_source" select="1"/>
        </xsl:call-template>
        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_nvt_qod_type')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_nvt_qod_type_src')"/>
          <xsl:with-param name="aggregate_type" select="'nvt'"/>
          <xsl:with-param name="group_column" select="'qod_type'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'donut'"/>
          <xsl:with-param name="chart_template" select="'qod_type_counts'"/>
          <xsl:with-param name="auto_load" select="0"/>
          <xsl:with-param name="create_data_source" select="1"/>
        </xsl:call-template>
        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_nvt_qod')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_nvt_qod_src')"/>
          <xsl:with-param name="aggregate_type" select="'nvt'"/>
          <xsl:with-param name="group_column" select="'qod'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'donut'"/>
          <xsl:with-param name="chart_template" select="'percentage_counts'"/>
          <xsl:with-param name="auto_load" select="0"/>
          <xsl:with-param name="create_data_source" select="1"/>
        </xsl:call-template>

        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_cve_bar_chart')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_cve_severity_src')"/>
          <xsl:with-param name="aggregate_type" select="'cve'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'bar'"/>
          <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
          <xsl:with-param name="auto_load" select="''"/>
          <xsl:with-param name="create_data_source" select="1"/>
        </xsl:call-template>
        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_cve_donut_chart')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_cve_severity_src')"/>
          <xsl:with-param name="aggregate_type" select="'cve'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'donut'"/>
          <xsl:with-param name="chart_template" select="'info_by_class'"/>
          <xsl:with-param name="auto_load" select="0"/>
          <xsl:with-param name="create_data_source" select="0"/>
        </xsl:call-template>
        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_cve_timeline_chart')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_cve_timeline_src')"/>
          <xsl:with-param name="aggregate_type" select="'cve'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'line'"/>
          <xsl:with-param name="group_column" select="'created'"/>
          <xsl:with-param name="data_column" select="''"/>
          <xsl:with-param name="chart_template" select="''"/>
          <xsl:with-param name="auto_load" select="0"/>
          <xsl:with-param name="create_data_source" select="1"/>
        </xsl:call-template>

        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_cpe_bar_chart')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_cpe_severity_src')"/>
          <xsl:with-param name="aggregate_type" select="'cpe'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'bar'"/>
          <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
          <xsl:with-param name="auto_load" select="''"/>
          <xsl:with-param name="create_data_source" select="1"/>
        </xsl:call-template>
        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_cpe_donut_chart')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_cpe_severity_src')"/>
          <xsl:with-param name="aggregate_type" select="'cpe'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'donut'"/>
          <xsl:with-param name="chart_template" select="'info_by_class'"/>
          <xsl:with-param name="auto_load" select="0"/>
          <xsl:with-param name="create_data_source" select="0"/>
        </xsl:call-template>
        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_cpe_timeline_chart')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_cpe_timeline_src')"/>
          <xsl:with-param name="aggregate_type" select="'cpe'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'line'"/>
          <xsl:with-param name="group_column" select="'created'"/>
          <xsl:with-param name="data_column" select="''"/>
          <xsl:with-param name="chart_template" select="''"/>
          <xsl:with-param name="auto_load" select="0"/>
          <xsl:with-param name="create_data_source" select="1"/>
        </xsl:call-template>

        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_ovaldef_bar_chart')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_ovaldef_severity_src')"/>
          <xsl:with-param name="aggregate_type" select="'ovaldef'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'bar'"/>
          <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
          <xsl:with-param name="create_data_source" select="1"/>
        </xsl:call-template>
        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_ovaldef_donut_chart')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_ovaldef_severity_src')"/>
          <xsl:with-param name="aggregate_type" select="'ovaldef'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'donut'"/>
          <xsl:with-param name="chart_template" select="'info_by_class'"/>
          <xsl:with-param name="create_data_source" select="0"/>
        </xsl:call-template>
        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_ovaldef_timeline_chart')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_ovaldef_timeline_src')"/>
          <xsl:with-param name="aggregate_type" select="'ovaldef'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'line'"/>
          <xsl:with-param name="group_column" select="'created'"/>
          <xsl:with-param name="data_column" select="''"/>
          <xsl:with-param name="chart_template" select="''"/>
          <xsl:with-param name="auto_load" select="0"/>
          <xsl:with-param name="create_data_source" select="1"/>
        </xsl:call-template>
        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_ovaldef_class_donut_chart')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_ovaldef_class_src')"/>
          <xsl:with-param name="aggregate_type" select="'ovaldef'"/>
          <xsl:with-param name="group_column" select="'class'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'donut'"/>
          <xsl:with-param name="create_data_source" select="1"/>
        </xsl:call-template>

        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_cert_bund_adv_bar_chart')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_cert_bund_adv_severity_src')"/>
          <xsl:with-param name="aggregate_type" select="'cert_bund_adv'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'bar'"/>
          <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
          <xsl:with-param name="create_data_source" select="1"/>
        </xsl:call-template>
        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_cert_bund_adv_donut_chart')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_cert_bund_adv_severity_src')"/>
          <xsl:with-param name="aggregate_type" select="'cert_bund_adv'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'donut'"/>
          <xsl:with-param name="chart_template" select="'info_by_class'"/>
          <xsl:with-param name="create_data_source" select="0"/>
        </xsl:call-template>
        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_cert_bund_adv_timeline_chart')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_cert_bund_adv_timeline_src')"/>
          <xsl:with-param name="aggregate_type" select="'cert_bund_adv'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'line'"/>
          <xsl:with-param name="group_column" select="'created'"/>
          <xsl:with-param name="data_column" select="''"/>
          <xsl:with-param name="chart_template" select="''"/>
          <xsl:with-param name="auto_load" select="0"/>
          <xsl:with-param name="create_data_source" select="1"/>
        </xsl:call-template>

        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_dfn_cert_adv_bar_chart')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_dfn_cert_adv_severity_src')"/>
          <xsl:with-param name="aggregate_type" select="'dfn_cert_adv'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'bar'"/>
          <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
          <xsl:with-param name="create_data_source" select="1"/>
        </xsl:call-template>
        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_dfn_cert_adv_donut_chart')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_dfn_cert_adv_severity_src')"/>
          <xsl:with-param name="aggregate_type" select="'dfn_cert_adv'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'donut'"/>
          <xsl:with-param name="chart_template" select="'info_by_class'"/>
          <xsl:with-param name="create_data_source" select="0"/>
        </xsl:call-template>
        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_dfn_cert_adv_timeline_chart')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_dfn_cert_adv_timeline_src')"/>
          <xsl:with-param name="aggregate_type" select="'dfn_cert_adv'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'line'"/>
          <xsl:with-param name="group_column" select="'created'"/>
          <xsl:with-param name="data_column" select="''"/>
          <xsl:with-param name="chart_template" select="''"/>
          <xsl:with-param name="auto_load" select="0"/>
          <xsl:with-param name="create_data_source" select="1"/>
        </xsl:call-template>

        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_allinfo_chart')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_allinfo_severity_src')"/>
          <xsl:with-param name="aggregate_type" select="'allinfo'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'bar'"/>
          <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
          <xsl:with-param name="create_data_source" select="1"/>
        </xsl:call-template>
        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_allinfo_donut_chart')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_allinfo_severity_src')"/>
          <xsl:with-param name="aggregate_type" select="'allinfo'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'donut'"/>
          <xsl:with-param name="chart_template" select="'info_by_class'"/>
          <xsl:with-param name="create_data_source" select="0"/>
        </xsl:call-template>
        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(), '_allinfo_timeline_chart')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_allinfo_timeline_src')"/>
          <xsl:with-param name="aggregate_type" select="'allinfo'"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'line'"/>
          <xsl:with-param name="group_column" select="'created'"/>
          <xsl:with-param name="data_column" select="''"/>
          <xsl:with-param name="chart_template" select="''"/>
          <xsl:with-param name="auto_load" select="0"/>
          <xsl:with-param name="create_data_source" select="1"/>
        </xsl:call-template>

        <xsl:call-template name="js-aggregate-chart">
          <xsl:with-param name="chart_name" select="concat(text(),'-allinfo-by-info-type')"/>
          <xsl:with-param name="data_source_name" select="concat(text(), '_allinfo-by-info-type-source')"/>
          <xsl:with-param name="aggregate_type" select="'allinfo'"/>
          <xsl:with-param name="group_column" select="'type'"/>
          <xsl:with-param name="data_column" select="''"/>
          <xsl:with-param name="display_name" select="$display_name"/>
          <xsl:with-param name="chart_type" select="'donut'"/>
          <xsl:with-param name="chart_template" select="'resource_type_counts'"/>
          <xsl:with-param name="create_data_source" select="1"/>
        </xsl:call-template>

        gsa.displays ["<xsl:value-of select="$display_name"/>"].create_chart_selector ();
        <xsl:if test="$filters">
          gsa.displays ["<xsl:value-of select="$display_name"/>"].create_filter_selector ();

          <xsl:for-each select="$filters">
            gsa.displays ["<xsl:value-of select="$display_name"/>"].add_filter ("<xsl:value-of select="@id"/>", "<xsl:value-of select="gsa:escape-js (name)"/>", "<xsl:value-of select="gsa:escape-js (term)"/>");
          </xsl:for-each>
          gsa.displays ["<xsl:value-of select="$display_name"/>"].select_filter ("<xsl:value-of select="$auto_filter"/>", false);
        </xsl:if>

        gsa.displays ["<xsl:value-of select="$display_name"/>"].select_chart ("<xsl:value-of select="$auto_load"/>", false, true);
      </xsl:for-each>
    </script>
  </div>
</xsl:template>

</xsl:stylesheet>
