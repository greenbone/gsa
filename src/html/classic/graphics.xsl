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
    gsa.gsa_token = "<xsl:value-of select="gsa:escape-js (/envelope/params/token)"/>";
    gsa.dashboards = {};
    gsa.data_sources = {};

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
  create_chart_box ("<xsl:value-of select="gsa:escape-js ($parent_id)"/>",
                    "<xsl:value-of select="gsa:escape-js ($container_id)"/>",
                    <xsl:value-of select="number ($width)"/>,
                    <xsl:value-of select="number ($height)"/>,
                    "<xsl:value-of select="gsa:escape-js ($container_width)"/>",
                    "<xsl:value-of select="gsa:escape-js ($select_pref_id)"/>",
                    "<xsl:value-of select="gsa:escape-js ($filter_pref_id)"/>")
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
  <xsl:param name="chart_template" select="gsa:escape-js (/envelope/params/chart_template)"/>

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

  if (gsa.data_sources ["<xsl:value-of select="gsa:escape-js ($data_source_name)"/>"] == undefined)
    {
      gsa.data_sources ["<xsl:value-of select="gsa:escape-js ($data_source_name)"/>"]
        =
        <xsl:choose>
          <xsl:when test="$chart_template = 'info_by_cvss' or $chart_template = 'info_by_class'">
            DataSource ("get_aggregate",
                        {xml:1,
                         aggregate_type:"<xsl:value-of select="gsa:escape-js ($aggregate_type)"/>",
                         group_column:"severity",
                         filter: unescapeXML ("<xsl:value-of select="gsa:escape-js ($filter)"/>"),
                         filt_id:"<xsl:value-of select="gsa:escape-js ($filt_id)"/>"});
          </xsl:when>
          <xsl:otherwise>
            DataSource ("get_aggregate",
                        {xml:1,
                         aggregate_type:"<xsl:value-of select="gsa:escape-js ($aggregate_type)"/>",
                         group_column:"<xsl:value-of select="gsa:escape-js ($group_column)"/>",
                         data_column:"<xsl:value-of select="gsa:escape-js ($data_column)"/>",
                         data_columns: [<xsl:value-of select="$data_columns_array"/>],
                         text_columns: [<xsl:value-of select="$text_columns_array"/>],
            <xsl:if test="$sort_field != ''">
                         sort_field:"<xsl:value-of select="gsa:escape-js ($sort_field)"/>",
            </xsl:if>
            <xsl:if test="$sort_order != ''">
                         sort_order:"<xsl:value-of select="gsa:escape-js ($sort_order)"/>",
            </xsl:if>
            <xsl:if test="$sort_stat != ''">
                         sort_stat:"<xsl:value-of select="gsa:escape-js ($sort_stat)"/>",
            </xsl:if>
            <xsl:if test="$first_group != ''">
                         first_group:"<xsl:value-of select="gsa:escape-js ($first_group)"/>",
            </xsl:if>
            <xsl:if test="$max_groups != ''">
                         max_groups:"<xsl:value-of select="gsa:escape-js ($max_groups)"/>",
            </xsl:if>
            <xsl:if test="$aggregate_mode != ''">
                         aggregate_mode:"<xsl:value-of select="gsa:escape-js ($aggregate_mode)"/>",
            </xsl:if>
                         filter: unescapeXML ("<xsl:value-of select="gsa:escape-js ($filter)"/>"),
                         filt_id:"<xsl:value-of select="gsa:escape-js ($filt_id)"/>"});
          </xsl:otherwise>
        </xsl:choose>
    }
</xsl:template>

<xsl:template name="js-tasks-data-source">
  <xsl:param name="data_source_name" select="'tasks-source'"/>
  <xsl:param name="filter"/>
  <xsl:param name="filt_id"/>

  if (gsa.data_sources ["<xsl:value-of select="gsa:escape-js ($data_source_name)"/>"] == undefined)
    {
      gsa.data_sources ["<xsl:value-of select="gsa:escape-js ($data_source_name)"/>"]
        =
        <xsl:choose>
          <xsl:when test="0">
          </xsl:when>
          <xsl:otherwise>
            DataSource ("get_tasks",
                        {xml:1,
                         ignore_pagination : 1,
                         schedules_only : 1,
                         filter: unescapeXML ("<xsl:value-of select="gsa:escape-js ($filter)"/>"),
                         filt_id:"<xsl:value-of select="gsa:escape-js ($filt_id)"/>"});
          </xsl:otherwise>
        </xsl:choose>
    }
</xsl:template>

<xsl:template name="js-aggregate-chart-factory">
  <xsl:param name="chart_name" select="'aggregate-chart'"/>
  <xsl:param name="data_source_name" select="concat($chart_name, '-source')"/>
  <xsl:param name="dashboard_name" select="'dashboard'"/>

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
        "<xsl:value-of select="gsa:escape-js (@name)"/>" : unescapeXML ("<xsl:value-of select="gsa:escape-js (.)"/>")
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
          "<xsl:value-of select="gsa:escape-js (@name)"/>" : unescapeXML ("<xsl:value-of select="gsa:escape-js (.)"/>")
          <xsl:if test="position() &lt; count(exslt:node-set ($gen_params)/params/param)">, </xsl:if>
        </xsl:for-each>
        }
    }
  </xsl:variable>

  <!-- Select selector label -->
  <xsl:variable name="selector_label">
    <xsl:choose>
      <xsl:when test="exslt:node-set ($init_params)/params/param[@name='title_text'] != ''">
        <xsl:value-of select="exslt:node-set ($init_params)/params/param[@name='title_text']"/>
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
        title_static (unescapeXML ("<xsl:value-of select="gsa:escape-js (exslt:node-set ($init_params)/params/param[@name='title_text'])"/> (Loading...)"), unescapeXML ("<xsl:value-of select="gsa:escape-js (exslt:node-set ($init_params)/params/param[@name='title_text'])"/>"))
      </xsl:when>
      <xsl:when test="$chart_template = 'info_by_class' or $chart_template = 'info_by_cvss'">
        title_total (unescapeXML ("<xsl:value-of select="gsa:escape-js (concat(gsa:type-name-plural ($aggregate_type), ' by severity'))"/>"),
                     "count")
      </xsl:when>
      <xsl:when test="$chart_type = 'bubbles'">
        title_total (unescapeXML ("<xsl:value-of select="gsa:escape-js (concat(gsa:type-name-plural ($aggregate_type), ' by ', gsa:field-name ($group_column)))"/>"),
                     "size_value")
      </xsl:when>
      <xsl:when test="$chart_type = 'cloud'">
        title_static (unescapeXML ("<xsl:value-of select="gsa:escape-js (concat(gsa:type-name-plural ($aggregate_type), ' ', gsa:field-name ($group_column), ' word cloud (Loading...)'))"/>"), unescapeXML ("<xsl:value-of select="gsa:escape-js (concat(gsa:type-name-plural ($aggregate_type), ' ', gsa:field-name ($group_column), ' word cloud'))"/>"))
      </xsl:when>
      <xsl:otherwise>
        title_total (unescapeXML ("<xsl:value-of select="gsa:escape-js (concat(gsa:type-name-plural ($aggregate_type), ' by ', gsa:field-name ($group_column)))"/>"),
                     "count")
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <!-- Create chart generator -->
  <xsl:variable name="chart_generator">
    <xsl:choose>
      <xsl:when test="$chart_type = 'donut'">
        DonutChartGenerator (gsa.data_sources ["<xsl:value-of select="gsa:escape-js ($data_source_name)"/>"])
              .title (<xsl:value-of select="$title_generator"/>)
      </xsl:when>
      <xsl:when test="$chart_type = 'bubbles'">
        BubbleChartGenerator (gsa.data_sources ["<xsl:value-of select="gsa:escape-js ($data_source_name)"/>"])
              .title (<xsl:value-of select="$title_generator"/>)
      </xsl:when>
      <xsl:when test="$chart_type = 'cloud'">
        CloudChartGenerator (gsa.data_sources ["<xsl:value-of select="gsa:escape-js ($data_source_name)"/>"])
              .title (<xsl:value-of select="$title_generator"/>)
      </xsl:when>
      <xsl:when test="$chart_type = 'horizontal_bar'">
        HorizontalBarChartGenerator (gsa.data_sources ["<xsl:value-of select="gsa:escape-js ($data_source_name)"/>"])
              .title (<xsl:value-of select="$title_generator"/>)
      </xsl:when>
      <xsl:when test="$chart_type = 'line'">
        LineChartGenerator (gsa.data_sources ["<xsl:value-of select="gsa:escape-js ($data_source_name)"/>"])
              .title (<xsl:value-of select="$title_generator"/>)
      </xsl:when>
      <xsl:otherwise>
        BarChartGenerator (gsa.data_sources ["<xsl:value-of select="gsa:escape-js ($data_source_name)"/>"])
              .title (<xsl:value-of select="$title_generator"/>)
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <!-- Create basic chart -->
  gsa.dashboards ["<xsl:value-of select="gsa:escape-js ($dashboard_name)"/>"]
        .addControllerFactory
          ("<xsl:value-of select="gsa:escape-js ($chart_name)"/>",
           function (forComponent)
            {
              var dashboard = forComponent.dashboard ();
              // Check data source
              <xsl:choose>
                <xsl:when test="$create_data_source">
                  <xsl:call-template name="js-aggregate-data-source">
                    <xsl:with-param name="data_source_name" select="gsa:escape-js ($data_source_name)"/>
                    <xsl:with-param name="aggregate_type" select="gsa:escape-js ($aggregate_type)"/>
                    <xsl:with-param name="group_column" select="gsa:escape-js ($group_column)"/>
                    <xsl:with-param name="data_column" select="gsa:escape-js ($data_column)"/>
                    <xsl:with-param name="filter" select="gsa:escape-js ($filter)"/>
                    <xsl:with-param name="filt_id" select="gsa:escape-js ($filt_id)"/>
                    <xsl:with-param name="chart_template" select="gsa:escape-js ($chart_template)"/>
                  </xsl:call-template>
                </xsl:when>
                <xsl:otherwise>
                  if (gsa.data_sources ["<xsl:value-of select="gsa:escape-js ($data_source_name)"/>"] == undefined)
                    {
                      console.error ("Data source not found: <xsl:value-of select="gsa:escape-js ($data_source_name)"/>");
                    }
                </xsl:otherwise>
              </xsl:choose>
              var dataSource = gsa.data_sources ["<xsl:value-of select="gsa:escape-js ($data_source_name)"/>"];

              // Check dashboard
              if (forComponent == undefined)
                console.error ("Component not defined");

              // Create generator
              // Basic generator
              var generator = <xsl:value-of select="$chart_generator"/>;
              // Data modifiers and stylers
              <xsl:choose>
                <xsl:when test="$chart_template = 'resource_type_counts'">
                  generator.data_transform (resource_type_counts)
                </xsl:when>
                <xsl:when test="$chart_template = 'qod_type_counts'">
                  generator.data_transform (qod_type_counts)
                </xsl:when>
                <xsl:when test="$chart_template = 'percentage_counts'">
                  generator.data_transform (percentage_counts)
                </xsl:when>
                <xsl:when test="$chart_template = 'info_by_class' or chart_template = 'recent_info_by_class'">
                  generator.data_transform (data_severity_level_counts)
                  <xsl:choose>
                    <xsl:when test="$chart_type = 'donut'">
                      .color_scale (severity_level_color_scale)
                    </xsl:when>
                    <xsl:otherwise>

                    </xsl:otherwise>
                  </xsl:choose>
                </xsl:when>
                <xsl:when test="$chart_template = 'info_by_cvss' or $chart_template = 'recent_info_by_cvss'">
                  generator.data_transform (data_severity_histogram)
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

              // Create chart
              return Chart (dataSource,
                            generator,
                            forComponent,
                            "<xsl:value-of select="gsa:escape-js ($chart_name)"/>",
                            unescapeXML ("<xsl:value-of select="gsa:escape-js ($selector_label)"/>"),
                            "/img/charts/severity-bar-chart.png",
                            1,
                            "<xsl:value-of select="gsa:escape-js ($chart_type)"/>",
                            "<xsl:value-of select="gsa:escape-js ($chart_template)"/>",
                            <xsl:value-of select="$gen_params_js"/>,
                            <xsl:value-of select="$init_params_js"/>);
            });

</xsl:template>

<xsl:template name="js-tasks-chart-factory">
  <xsl:param name="chart_name" select="'aggregate-chart'"/>
  <xsl:param name="dashboard_name" select="'dashboard'"/>
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
        "<xsl:value-of select="gsa:escape-js (@name)"/>" : unescapeXML ("<xsl:value-of select="gsa:escape-js (.)"/>")
        <xsl:if test="position() &lt; count(exslt:node-set ($init_params)/params/param)">, </xsl:if>
      </xsl:for-each>
    }
  </xsl:variable>

  <xsl:variable name="gen_params_js">
    {
      "extra" : {
        <xsl:for-each select="exslt:node-set ($gen_params)/params/param">
          "<xsl:value-of select="gsa:escape-js (@name)"/>" : unescapeXML ("<xsl:value-of select="gsa:escape-js (.)"/>")
          <xsl:if test="position() &lt; count(exslt:node-set ($gen_params)/params/param)">, </xsl:if>
        </xsl:for-each>
        }
    }
  </xsl:variable>

  <!-- Select selector label -->
  <xsl:variable name="selector_label">
    <xsl:choose>
      <xsl:when test="exslt:node-set ($init_params)/params/param[@name='title_text'] != ''">
        <xsl:value-of select="exslt:node-set ($init_params)/params/param[@name='title_text']"/>
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
        title_static (unescapeXML ("<xsl:value-of select="gsa:escape-js (exslt:node-set ($init_params)/params/param[@name='title_text'])"/> (Loading...)"), unescapeXML ("<xsl:value-of select="gsa:escape-js (exslt:node-set ($init_params)/params/param[@name='title_text'])"/>")
      </xsl:when>
      <xsl:otherwise>
        title_static ("Next scheduled tasks (Loading...)", "Next scheduled tasks")
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <!-- Create chart generator -->
  <xsl:variable name="chart_generator">
    <xsl:choose>
      <xsl:when test="0">
      </xsl:when>
      <xsl:otherwise>
        GanttChartGenerator (gsa.data_sources ["<xsl:value-of select="gsa:escape-js ($data_source_name)"/>"])
              .title (<xsl:value-of select="$title_generator"/>)
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <!-- Create basic chart -->
  gsa.dashboards ["<xsl:value-of select="gsa:escape-js ($dashboard_name)"/>"]
        .addControllerFactory
          ("<xsl:value-of select="gsa:escape-js ($chart_name)"/>",
           function (forComponent)
            {
              // Get and check DataSource
              var dataSource = gsa.data_sources ["<xsl:value-of select="gsa:escape-js ($data_source_name)"/>"]
              if (dataSource == undefined)
                {
                  console.error ("Data source not found: <xsl:value-of select="gsa:escape-js ($data_source_name)"/>");
                }

              // Create generator
              // Basic generator
              var generator = <xsl:value-of select="$chart_generator"/>;

              // Create chart controller
              return Chart (dataSource,
                            generator,
                            forComponent,
                            "<xsl:value-of select="gsa:escape-js ($chart_name)"/>",
                            unescapeXML ("<xsl:value-of select="gsa:escape-js ($selector_label)"/>"),
                            "/img/charts/severity-bar-chart.png",
                            1,
                            "<xsl:value-of select="gsa:escape-js ($chart_type)"/>",
                            "<xsl:value-of select="gsa:escape-js ($chart_template)"/>",
                            <xsl:value-of select="$gen_params_js"/>,
                            <xsl:value-of select="$init_params_js"/>);
            });
</xsl:template>

<xsl:template name="js-scan-management-top-visualization">
  <xsl:param name="type" select="'task'"/>
  <xsl:param name="controllers_pref_id">
    <xsl:choose>
      <xsl:when test="$type='task'">3d5db3c7-5208-4b47-8c28-48efc621b1e0</xsl:when>
      <xsl:when test="$type='report'">e599bb6b-b95a-4bb2-a6bb-fe8ac69bc071</xsl:when>
      <xsl:when test="$type='result'">0b8ae70d-d8fc-4418-8a72-e65ac8d2828e</xsl:when>
    </xsl:choose>
  </xsl:param>
  <xsl:param name="heights_pref_id">
    <xsl:choose>
      <xsl:when test="$type='task'">ce8608af-7e66-45a8-aa8a-76def4f9f838</xsl:when>
      <xsl:when test="$type='report'">fc875cd4-16bf-42d1-98ed-c0c9bd6015cd</xsl:when>
      <xsl:when test="$type='result'">cb7db2fe-3fe4-4704-9fa1-efd4b9e522a8</xsl:when>
    </xsl:choose>
  </xsl:param>
  <xsl:param name="default_controllers" select="'by-cvss|by-class'"/>
  <xsl:param name="default_heights" select="'280'"/>

  <xsl:variable name="controllers">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $controllers_pref_id]">
        <xsl:value-of select="/envelope/chart_preferences/chart_preference[@id = $controllers_pref_id]/value"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$default_controllers"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:variable name="heights">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $heights_pref_id]">
        <xsl:value-of select="/envelope/chart_preferences/chart_preference[@id = $heights_pref_id]/value"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$default_heights"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="filter" select="/envelope/get_tasks/get_tasks_response/filters/term | /envelope/get_reports/get_reports_response/filters/term | /envelope/get_results/get_results_response/filters/term"/>
  <xsl:variable name="filt_id" select="/envelope/get_tasks/get_tasks_response/filters/@id | /envelope/get_reports/get_reports_response/filters/@id |  /envelope/get_results/get_results_response/filters/@id"/>

  <script type="text/javascript">
    gsa.dashboards ["top-dashboard"]
      = Dashboard ("top-dashboard",
                   "<xsl:value-of select="gsa:escape-js ($controllers)"/>",
                   "<xsl:value-of select="gsa:escape-js ($heights)"/>",
                   null,
                   {
                     "controllersPrefID": "<xsl:value-of select="gsa:escape-js ($controllers_pref_id)"/>",
                     "heightsPrefID": "<xsl:value-of select="gsa:escape-js ($heights_pref_id)"/>",
                     "filter": "<xsl:value-of select="gsa:escape-js ($filter)"/>",
                     "filt_id": "<xsl:value-of select="gsa:escape-js ($filt_id)"/>",
                     "max_components": 4,
                     "dashboardControls": $("#top-dashboard-controls")[0]
                   });

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

    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'by-cvss'"/>
      <xsl:with-param name="dashboard_name" select="'top-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'severity-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
      <xsl:with-param name="chart_type" select="'bar'"/>
      <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'by-class'"/>
      <xsl:with-param name="dashboard_name" select="'top-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'severity-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
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
        <xsl:with-param name="chart_type" select="'line'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>

      <xsl:call-template name="js-aggregate-chart-factory">
        <xsl:with-param name="chart_name" select="'report-high-results-timeline'"/>
        <xsl:with-param name="dashboard_name" select="'top-dashboard'"/>
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

      <xsl:call-template name="js-aggregate-chart-factory">
        <xsl:with-param name="chart_name" select="'by-task-status'"/>
        <xsl:with-param name="dashboard_name" select="'top-dashboard'"/>
        <xsl:with-param name="data_source_name" select="'task-status-count-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'status'"/>
        <xsl:with-param name="chart_type" select="'donut'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>

      <xsl:call-template name="js-aggregate-chart-factory">
        <xsl:with-param name="chart_name" select="'by-high-results'"/>
        <xsl:with-param name="dashboard_name" select="'top-dashboard'"/>
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

      <xsl:call-template name="js-aggregate-chart-factory">
        <xsl:with-param name="chart_name" select="'top-high-results'"/>
        <xsl:with-param name="dashboard_name" select="'top-dashboard'"/>
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

      <xsl:call-template name="js-tasks-chart-factory">
        <xsl:with-param name="chart_name" select="'task-schedules'"/>
        <xsl:with-param name="dashboard_name" select="'top-dashboard'"/>
        <xsl:with-param name="data_source_name" select="'task-schedules-source'"/>
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

      <xsl:call-template name="js-aggregate-chart-factory">
        <xsl:with-param name="chart_name" select="'result-vuln-words'"/>
        <xsl:with-param name="dashboard_name" select="'top-dashboard'"/>
        <xsl:with-param name="data_source_name" select="'result-vuln-words-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'vulnerability'"/>
        <xsl:with-param name="chart_type" select="'cloud'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>

      <xsl:call-template name="js-aggregate-chart-factory">
        <xsl:with-param name="chart_name" select="'result-desc-words'"/>
        <xsl:with-param name="dashboard_name" select="'top-dashboard'"/>
        <xsl:with-param name="data_source_name" select="'result-desc-words-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'description'"/>
        <xsl:with-param name="chart_type" select="'cloud'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>
    </xsl:if>

<!--
    gsa.displays ["top-visualization-left"].create_chart_selector ();
    gsa.displays ["top-visualization-right"].create_chart_selector ();

    <xsl:if test="$auto_load_left != ''">
    gsa.displays ["top-visualization-left"].select_chart ("<xsl:value-of select="gsa:escape-js ($auto_load_left)"/>", false, true);
    </xsl:if>
    <xsl:if test="$auto_load_right != ''">
    gsa.displays ["top-visualization-right"].select_chart ("<xsl:value-of select="gsa:escape-js ($auto_load_right)"/>", false, true);
    </xsl:if>
-->
    gsa.dashboards["top-dashboard"].initComponentsFromString ();
  </script>
</xsl:template>

<xsl:template name="js-secinfo-top-visualization">
  <xsl:param name="type" select="'nvt'"/>
  <xsl:param name="controllers_pref_id">
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
  <xsl:param name="heights_pref_id">
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
  <xsl:param name="default_controllers" select="'by-cvss|by-class'"/>
  <xsl:param name="default_heights" select="'280'"/>

  <xsl:variable name="controllers">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $controllers_pref_id]">
        <xsl:value-of select="/envelope/chart_preferences/chart_preference[@id = $controllers_pref_id]/value"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$default_controllers"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:variable name="heights">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $heights_pref_id]">
        <xsl:value-of select="gsa:escape-js (/envelope/chart_preferences/chart_preference[@id = $heights_pref_id]/value)"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$default_heights"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="filter" select="/envelope/get_info/get_info_response/filters/term"/>
  <xsl:variable name="filt_id" select="/envelope/get_info/get_info_response/filters/@id"/>

  <script type="text/javascript">
    gsa.dashboards ["top-dashboard"]
      = Dashboard ("top-dashboard",
                   "<xsl:value-of select="gsa:escape-js ($controllers)"/>",
                   "<xsl:value-of select="gsa:escape-js ($heights)"/>",
                   null,
                   {
                     "controllersPrefID": "<xsl:value-of select="gsa:escape-js ($controllers_pref_id)"/>",
                     "heightsPrefID": "<xsl:value-of select="gsa:escape-js ($heights_pref_id)"/>",
                     "filter": "<xsl:value-of select="gsa:escape-js ($filter)"/>",
                     "filt_id": "<xsl:value-of select="gsa:escape-js ($filt_id)"/>",
                     "max_components": 4,
                     "dashboardControls": $("#top-dashboard-controls")[0]
                   });

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

    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'by-cvss'"/>
      <xsl:with-param name="dashboard_name" select="'top-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'severity-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
      <xsl:with-param name="chart_type" select="'bar'"/>
      <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
    </xsl:call-template>

    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'by-class'"/>
      <xsl:with-param name="dashboard_name" select="'top-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'severity-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
      <xsl:with-param name="chart_type" select="'donut'"/>
      <xsl:with-param name="chart_template" select="'info_by_class'"/>
    </xsl:call-template>

    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="dashboard_name" select="'top-dashboard'"/>
      <xsl:with-param name="chart_name" select="'by-created'"/>
      <xsl:with-param name="data_source_name" select="'created-count-source'"/>
      <xsl:with-param name="aggregate_type" select="$type"/>
      <xsl:with-param name="group_column" select="'created'"/>
      <xsl:with-param name="data_column" select="''"/>
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

      <xsl:call-template name="js-aggregate-chart-factory">
        <xsl:with-param name="dashboard_name" select="'top-dashboard'"/>
        <xsl:with-param name="chart_name" select="'nvt-by-family'"/>
        <xsl:with-param name="data_source_name" select="'nvt-by-family-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'family'"/>
        <xsl:with-param name="data_column" select="'severity'"/>
        <xsl:with-param name="chart_type" select="'bubbles'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>
      <xsl:call-template name="js-aggregate-chart-factory">
        <xsl:with-param name="dashboard_name" select="'top-dashboard'"/>
        <xsl:with-param name="chart_name" select="'nvt-by-solution_type'"/>
        <xsl:with-param name="data_source_name" select="'nvt-by-solution_type-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'solution_type'"/>
        <xsl:with-param name="chart_type" select="'donut'"/>
        <xsl:with-param name="chart_template" select="''"/>
      </xsl:call-template>
      <xsl:call-template name="js-aggregate-chart-factory">
        <xsl:with-param name="dashboard_name" select="'top-dashboard'"/>
        <xsl:with-param name="chart_name" select="'nvt-by-qod_type'"/>
        <xsl:with-param name="data_source_name" select="'nvt-by-qod_type-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'qod_type'"/>
        <xsl:with-param name="display_name" select="'top-visualization-left'"/>
        <xsl:with-param name="chart_type" select="'donut'"/>
        <xsl:with-param name="chart_template" select="'qod_type_counts'"/>
      </xsl:call-template>
      <xsl:call-template name="js-aggregate-chart-factory">
        <xsl:with-param name="dashboard_name" select="'top-dashboard'"/>
        <xsl:with-param name="chart_name" select="'nvt-by-qod'"/>
        <xsl:with-param name="data_source_name" select="'nvt-by-qod-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'qod'"/>
        <xsl:with-param name="display_name" select="'top-visualization-left'"/>
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

      <xsl:call-template name="js-aggregate-chart-factory">
        <xsl:with-param name="dashboard_name" select="'top-dashboard'"/>
        <xsl:with-param name="chart_name" select="'by-oval-class'"/>
        <xsl:with-param name="data_source_name" select="'ovaldef-by-class-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'class'"/>
        <xsl:with-param name="data_column" select="''"/>
        <xsl:with-param name="display_name" select="'top-visualization-left'"/>
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

      <xsl:call-template name="js-aggregate-chart-factory">
        <xsl:with-param name="dashboard_name" select="'top-dashboard'"/>
        <xsl:with-param name="chart_name" select="'by-info-type'"/>
        <xsl:with-param name="data_source_name" select="'allinfo-by-type-source'"/>
        <xsl:with-param name="aggregate_type" select="$type"/>
        <xsl:with-param name="group_column" select="'type'"/>
        <xsl:with-param name="data_column" select="''"/>
        <xsl:with-param name="display_name" select="'top-visualization-left'"/>
        <xsl:with-param name="chart_type" select="'donut'"/>
        <xsl:with-param name="chart_template" select="'resource_type_counts'"/>
      </xsl:call-template>
    </xsl:if>

    <!--
    gsa.displays ["top-visualization-left"].create_chart_selector ();
    gsa.displays ["top-visualization-right"].create_chart_selector ();

    <xsl:if test="$auto_load_left != ''">
    gsa.displays ["top-visualization-left"].select_chart ("<xsl:value-of select="gsa:escape-js ($auto_load_left)"/>", false, true);
    </xsl:if>
    <xsl:if test="$auto_load_right != ''">
    gsa.displays ["top-visualization-right"].select_chart ("<xsl:value-of select="gsa:escape-js ($auto_load_right)"/>", false, true);
    </xsl:if>
    -->
    gsa.dashboards["top-dashboard"].initComponentsFromString ();
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
  <div class="section-box">
    <div id="secinfo-dashboard-controls" style="text-align:right;">
    </div>
    <div id="secinfo-dashboard">
    </div>
  </div> 

  <xsl:call-template name="init-d3charts"/>
  <xsl:variable name="default_controllers" select="'nvt_bar_chart|nvt_donut_chart#cve_bar_chart|cve_donut_chart'"/>
  <xsl:variable name="default_heights" select="'280#280'"/>

  <xsl:variable name="envelope" select="/envelope"/>
  <xsl:variable name="filters" select="get_filters_response/filter[type='SecInfo']"/>

  <xsl:variable name="controllers_pref_id" select="'84ab32da-fe69-44d8-8a8f-70034cf28d4e'"/>
  <xsl:variable name="heights_pref_id" select="'42d48049-3153-43bf-b30d-72ca5ab1eb49'"/>
  <xsl:variable name="filters_pref_id" select="'517d0efe-426e-49a9-baa7-eda2832c93e8'"/>

  <xsl:variable name="controllers">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $controllers_pref_id]">
        <xsl:value-of select="/envelope/chart_preferences/chart_preference[@id = $controllers_pref_id]/value"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$default_controllers"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:variable name="heights">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $heights_pref_id]">
        <xsl:value-of select="gsa:escape-js (/envelope/chart_preferences/chart_preference[@id = $heights_pref_id]/value)"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$default_heights"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <!-- TODO: Update data sources to support multiple filters and
             add filter selection to chart boxes again -->

  <script>
    gsa.dashboards ["secinfo-dashboard"]
      = Dashboard ("secinfo-dashboard",
                   "<xsl:value-of select="gsa:escape-js ($controllers)"/>",
                   "<xsl:value-of select="gsa:escape-js ($heights)"/>",
                   null,
                   {
                     "controllersPrefID": "<xsl:value-of select="gsa:escape-js ($controllers_pref_id)"/>",
                     "heightsPrefID": "<xsl:value-of select="gsa:escape-js ($heights_pref_id)"/>",
                     "filter": "",
                     "filt_id": "",
                     "max_components": 8,
                     "dashboardControls": $("#secinfo-dashboard-controls")[0]
                   });

    // NVTs
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'nvt_bar_chart'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'nvt_severity_src'"/>
      <xsl:with-param name="aggregate_type" select="'nvt'"/>
      <xsl:with-param name="chart_type" select="'bar'"/>
      <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
      <xsl:with-param name="create_data_source" select="1"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'nvt_donut_chart'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'nvt_severity_src'"/>
      <xsl:with-param name="aggregate_type" select="'nvt'"/>
      <xsl:with-param name="chart_type" select="'donut'"/>
      <xsl:with-param name="chart_template" select="'info_by_class'"/>
      <xsl:with-param name="create_data_source" select="0"/>
    </xsl:call-template>

    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'nvt_timeline_chart'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'nvt_timeline_src'"/>
      <xsl:with-param name="aggregate_type" select="'nvt'"/>
      <xsl:with-param name="chart_type" select="'line'"/>
      <xsl:with-param name="group_column" select="'created'"/>
      <xsl:with-param name="data_column" select="''"/>
      <xsl:with-param name="chart_template" select="''"/>
      <xsl:with-param name="create_data_source" select="1"/>
    </xsl:call-template>

    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'nvt_bubble_chart'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'nvt_families_src'"/>
      <xsl:with-param name="aggregate_type" select="'nvt'"/>
      <xsl:with-param name="chart_type" select="'bubbles'"/>
      <xsl:with-param name="group_column" select="'family'"/>
      <xsl:with-param name="data_column" select="'severity'"/>
      <xsl:with-param name="chart_template" select="''"/>
      <xsl:with-param name="create_data_source" select="1"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'nvt_solution_type'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'nvt_solution_type_src'"/>
      <xsl:with-param name="aggregate_type" select="'nvt'"/>
      <xsl:with-param name="group_column" select="'solution_type'"/>
      <xsl:with-param name="chart_type" select="'donut'"/>
      <xsl:with-param name="chart_template" select="''"/>
      <xsl:with-param name="create_data_source" select="1"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'nvt_qod_type'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'nvt_qod_type_src'"/>
      <xsl:with-param name="aggregate_type" select="'nvt'"/>
      <xsl:with-param name="group_column" select="'qod_type'"/>
      <xsl:with-param name="chart_type" select="'donut'"/>
      <xsl:with-param name="chart_template" select="'qod_type_counts'"/>
      <xsl:with-param name="create_data_source" select="1"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'nvt_qod'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'nvt_qod_src'"/>
      <xsl:with-param name="aggregate_type" select="'nvt'"/>
      <xsl:with-param name="group_column" select="'qod'"/>
      <xsl:with-param name="chart_type" select="'donut'"/>
      <xsl:with-param name="chart_template" select="'percentage_counts'"/>
      <xsl:with-param name="create_data_source" select="1"/>
    </xsl:call-template>

    // CVEs
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'cve_bar_chart'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'cve_severity_src'"/>
      <xsl:with-param name="aggregate_type" select="'cve'"/>
      <xsl:with-param name="chart_type" select="'bar'"/>
      <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
      <xsl:with-param name="auto_load" select="''"/>
      <xsl:with-param name="create_data_source" select="1"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'cve_donut_chart'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'cve_severity_src'"/>
      <xsl:with-param name="aggregate_type" select="'cve'"/>
      <xsl:with-param name="chart_type" select="'donut'"/>
      <xsl:with-param name="chart_template" select="'info_by_class'"/>
      <xsl:with-param name="auto_load" select="0"/>
      <xsl:with-param name="create_data_source" select="0"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'cve_timeline_chart'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'cve_timeline_src'"/>
      <xsl:with-param name="aggregate_type" select="'cve'"/>
      <xsl:with-param name="chart_type" select="'line'"/>
      <xsl:with-param name="group_column" select="'created'"/>
      <xsl:with-param name="data_column" select="''"/>
      <xsl:with-param name="chart_template" select="''"/>
      <xsl:with-param name="auto_load" select="0"/>
      <xsl:with-param name="create_data_source" select="1"/>
    </xsl:call-template>

    // CPEs
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'cpe_bar_chart'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'cpe_severity_src'"/>
      <xsl:with-param name="aggregate_type" select="'cpe'"/>
      <xsl:with-param name="chart_type" select="'bar'"/>
      <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
      <xsl:with-param name="auto_load" select="''"/>
      <xsl:with-param name="create_data_source" select="1"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'cpe_donut_chart'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'cpe_severity_src'"/>
      <xsl:with-param name="aggregate_type" select="'cpe'"/>
      <xsl:with-param name="chart_type" select="'donut'"/>
      <xsl:with-param name="chart_template" select="'info_by_class'"/>
      <xsl:with-param name="auto_load" select="0"/>
      <xsl:with-param name="create_data_source" select="0"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'cpe_timeline_chart'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'cpe_timeline_src'"/>
      <xsl:with-param name="aggregate_type" select="'cpe'"/>
      <xsl:with-param name="chart_type" select="'line'"/>
      <xsl:with-param name="group_column" select="'created'"/>
      <xsl:with-param name="data_column" select="''"/>
      <xsl:with-param name="chart_template" select="''"/>
      <xsl:with-param name="auto_load" select="0"/>
      <xsl:with-param name="create_data_source" select="1"/>
    </xsl:call-template>

    // OVAL Definitions
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'ovaldef_bar_chart'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'ovaldef_severity_src'"/>
      <xsl:with-param name="aggregate_type" select="'ovaldef'"/>
      <xsl:with-param name="chart_type" select="'bar'"/>
      <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
      <xsl:with-param name="create_data_source" select="1"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'ovaldef_donut_chart'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'ovaldef_severity_src'"/>
      <xsl:with-param name="aggregate_type" select="'ovaldef'"/>
      <xsl:with-param name="chart_type" select="'donut'"/>
      <xsl:with-param name="chart_template" select="'info_by_class'"/>
      <xsl:with-param name="create_data_source" select="0"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'ovaldef_timeline_chart'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'ovaldef_timeline_src'"/>
      <xsl:with-param name="aggregate_type" select="'ovaldef'"/>
      <xsl:with-param name="chart_type" select="'line'"/>
      <xsl:with-param name="group_column" select="'created'"/>
      <xsl:with-param name="data_column" select="''"/>
      <xsl:with-param name="chart_template" select="''"/>
      <xsl:with-param name="auto_load" select="0"/>
      <xsl:with-param name="create_data_source" select="1"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'ovaldef_class_donut_chart'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'ovaldef_class_src'"/>
      <xsl:with-param name="aggregate_type" select="'ovaldef'"/>
      <xsl:with-param name="group_column" select="'class'"/>
      <xsl:with-param name="chart_type" select="'donut'"/>
      <xsl:with-param name="create_data_source" select="1"/>
    </xsl:call-template>

    // CERT Bund
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'cert_bund_adv_bar_chart'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'cert_bund_adv_severity_src'"/>
      <xsl:with-param name="aggregate_type" select="'cert_bund_adv'"/>
      <xsl:with-param name="chart_type" select="'bar'"/>
      <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
      <xsl:with-param name="create_data_source" select="1"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'cert_bund_adv_donut_chart'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'cert_bund_adv_severity_src'"/>
      <xsl:with-param name="aggregate_type" select="'cert_bund_adv'"/>
      <xsl:with-param name="chart_type" select="'donut'"/>
      <xsl:with-param name="chart_template" select="'info_by_class'"/>
      <xsl:with-param name="create_data_source" select="0"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'cert_bund_adv_timeline_chart'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'cert_bund_adv_timeline_src'"/>
      <xsl:with-param name="aggregate_type" select="'cert_bund_adv'"/>
      <xsl:with-param name="chart_type" select="'line'"/>
      <xsl:with-param name="group_column" select="'created'"/>
      <xsl:with-param name="data_column" select="''"/>
      <xsl:with-param name="chart_template" select="''"/>
      <xsl:with-param name="auto_load" select="0"/>
      <xsl:with-param name="create_data_source" select="1"/>
    </xsl:call-template>

    // DFN CERT
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'dfn_cert_adv_bar_chart'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'dfn_cert_adv_severity_src'"/>
      <xsl:with-param name="aggregate_type" select="'dfn_cert_adv'"/>
      <xsl:with-param name="chart_type" select="'bar'"/>
      <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
      <xsl:with-param name="create_data_source" select="1"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'dfn_cert_adv_donut_chart'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'dfn_cert_adv_severity_src'"/>
      <xsl:with-param name="aggregate_type" select="'dfn_cert_adv'"/>
      <xsl:with-param name="chart_type" select="'donut'"/>
      <xsl:with-param name="chart_template" select="'info_by_class'"/>
      <xsl:with-param name="create_data_source" select="0"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'dfn_cert_adv_timeline_chart'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'dfn_cert_adv_timeline_src'"/>
      <xsl:with-param name="aggregate_type" select="'dfn_cert_adv'"/>
      <xsl:with-param name="chart_type" select="'line'"/>
      <xsl:with-param name="group_column" select="'created'"/>
      <xsl:with-param name="data_column" select="''"/>
      <xsl:with-param name="chart_template" select="''"/>
      <xsl:with-param name="auto_load" select="0"/>
      <xsl:with-param name="create_data_source" select="1"/>
    </xsl:call-template>

    // All SecInfo
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'allinfo_chart'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'allinfo_severity_src'"/>
      <xsl:with-param name="aggregate_type" select="'allinfo'"/>
      <xsl:with-param name="chart_type" select="'bar'"/>
      <xsl:with-param name="chart_template" select="'info_by_cvss'"/>
      <xsl:with-param name="create_data_source" select="1"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'allinfo_donut_chart'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'allinfo_severity_src'"/>
      <xsl:with-param name="aggregate_type" select="'allinfo'"/>
      <xsl:with-param name="chart_type" select="'donut'"/>
      <xsl:with-param name="chart_template" select="'info_by_class'"/>
      <xsl:with-param name="create_data_source" select="0"/>
    </xsl:call-template>
    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'allinfo_timeline_chart'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'allinfo_timeline_src'"/>
      <xsl:with-param name="aggregate_type" select="'allinfo'"/>
      <xsl:with-param name="chart_type" select="'line'"/>
      <xsl:with-param name="group_column" select="'created'"/>
      <xsl:with-param name="data_column" select="''"/>
      <xsl:with-param name="chart_template" select="''"/>
      <xsl:with-param name="auto_load" select="0"/>
      <xsl:with-param name="create_data_source" select="1"/>
    </xsl:call-template>

    <xsl:call-template name="js-aggregate-chart-factory">
      <xsl:with-param name="chart_name" select="'allinfo-by-info-type'"/>
      <xsl:with-param name="dashboard_name" select="'secinfo-dashboard'"/>
      <xsl:with-param name="data_source_name" select="'allinfo-by-info-type-source'"/>
      <xsl:with-param name="aggregate_type" select="'allinfo'"/>
      <xsl:with-param name="group_column" select="'type'"/>
      <xsl:with-param name="data_column" select="''"/>
      <xsl:with-param name="chart_type" select="'donut'"/>
      <xsl:with-param name="chart_template" select="'resource_type_counts'"/>
      <xsl:with-param name="create_data_source" select="1"/>
    </xsl:call-template>

    gsa.dashboards["secinfo-dashboard"].initComponentsFromString ();
  </script>

</xsl:template>

</xsl:stylesheet>
