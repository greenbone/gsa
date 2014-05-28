<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
      version="1.0"
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
      xmlns:gsa="http://openvas.org"
      extension-element-prefixes="gsa">
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
Copyright (C) 2013 Greenbone Networks GmbH

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License version 2,
or, at your option, any later version as published by the Free
Software Foundation

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
-->

<xsl:template name="init-d3charts">
  <script src="/js/d3.v3.min.js"></script>
  <script src="/js/d3.tip.min.js"></script>
  <script src="/js/gsa_bar_chart.js"></script>
</xsl:template>

<xsl:template name="severity-chart">
  <xsl:param name="type" />
  <xsl:param name="id" select="'severity_chart'"/>
  <xsl:param name="filter" />

  <xsl:param name="title_prefix">
    <xsl:choose>
      <xsl:when test="$filter">
        <xsl:value-of select="concat('Filtered ', gsa:type-name-plural ($type), ' by severity (Total: ')"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="concat('All ', gsa:type-name-plural ($type), ' by severity (Total: ')"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:param>
  <xsl:param name="title_suffix" select="')'"/>
  <xsl:param name="title_loading">
    <xsl:choose>
      <xsl:when test="$filter">
        <xsl:value-of  select="concat('Filtered ', gsa:type-name-plural ($type), ' by severity (loading...)')"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="concat('All ', gsa:type-name-plural ($type),' by severity (loading...)')"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:param>

  <!-- TODO: Hide completely when JS is disabled -->
  <div class="dashboard_box">
    <div id="{$id}"></div>

    <script type="text/javascript">
      var bar_chart = gsa_bar_chart()
                        .record_selector ("get_aggregate get_aggregates_response group")
                        .x_field ("value")
                        .y_field ("count")
                        .x_label ("Severity")
                        .y_label ("")
                        .data_to_title (title_y_total ("<xsl:value-of select="$title_prefix"/>", "<xsl:value-of select="$title_suffix"/>", "<xsl:value-of select="$title_loading"/>"))
                        .data_transform (data_severity_histogram)
                        .bar_style (severity_bar_style (<xsl:value-of select="gsa:risk-factor-max-cvss('low')"/>, <xsl:value-of select="gsa:risk-factor-max-cvss('medium')"/>));

      bar_chart(d3.select("#<xsl:value-of select="$id"/>"))
        .load_xml_url (encodeURI ("/omp?cmd=get_aggregate&amp;xml=1&amp;aggregate_type=<xsl:value-of select="$type"/>&amp;group_column=severity&amp;filter=<xsl:value-of select="$filter" />&amp;token=<xsl:value-of select="/envelope/token"/>"));
    </script>
  </div>
</xsl:template>

<xsl:template name="counts-chart">
  <xsl:param name="type" />
  <xsl:param name="group_column" />
  <xsl:param name="group_label" select="$group_column" />
  <div class="dashboard_box">
    <div id="counts_chart"></div>

    <script type="text/javascript">
      var bar_chart = gsa_bar_chart()
                        .record_selector ("get_aggregate get_aggregates_response aggregate group")
                        .x_field ("value")
                        .y_field ("count")
                        .x_label ("<xsl:value-of select="$group_label"/>")

      bar_chart(d3.select("#counts_chart"))
        .load_xml_url ("/omp?cmd=get_aggregate&amp;xml=1&amp;aggregate_type=<xsl:value-of select="$type"/>&amp;group_column=<xsl:value-of select="$group_column"/>&amp;token=<xsl:value-of select="/envelope/token"/>");
    </script>
  </div>
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
  <xsl:variable name="filter" select="'modified&gt;-7d sort-reverse=severity'"/>

  <div class="gb_window">
    <div class="gb_window_part_left"></div>
    <div class="gb_window_part_right"></div>
    <div class="gb_window_part_center">
      <xsl:value-of select="'SecInfo Dashboard'"/>
    </div>
    <div class="gb_window_part_content">
      <center>
        <xsl:call-template name="init-d3charts"/>
        <a href="/omp?cmd=get_info&amp;info_type=nvt&amp;token={/envelope/token}">
          <xsl:call-template name="severity-chart">
            <xsl:with-param name="type" select="'nvt'"/>
            <xsl:with-param name="id" select="'nvt_severity_chart'"/>
          </xsl:call-template>
        </a>
        <a href="/omp?cmd=get_info&amp;info_type=nvt&amp;filter={$filter}&amp;token={/envelope/token}">
          <xsl:call-template name="severity-chart">
            <xsl:with-param name="type" select="'nvt'"/>
            <xsl:with-param name="id" select="'nvt_severity_chart_2'"/>
            <xsl:with-param name="filter" select="$filter"/>
            <xsl:with-param name="title_prefix" select="'NVTs of the last 7 days (Total: '"/>
            <xsl:with-param name="title_loading" select="'NVTs of the last 7 days (loading...)'"/>
          </xsl:call-template>
        </a>

        <a href="/omp?cmd=get_info&amp;info_type=cve&amp;token={/envelope/token}">
          <xsl:call-template name="severity-chart">
            <xsl:with-param name="type" select="'cve'"/>
            <xsl:with-param name="id" select="'cve_severity_chart'"/>
          </xsl:call-template>
        </a>
        <a href="/omp?cmd=get_info&amp;info_type=cve&amp;filter={$filter}&amp;token={/envelope/token}">
          <xsl:call-template name="severity-chart">
            <xsl:with-param name="type" select="'cve'"/>
            <xsl:with-param name="id" select="'cve_severity_chart_2'"/>
            <xsl:with-param name="filter" select="$filter"/>
            <xsl:with-param name="title_prefix" select="'CVEs of the last 7 days (Total: '"/>
            <xsl:with-param name="title_loading" select="'CVEs of the last 7 days (loading...)'"/>
          </xsl:call-template>
        </a>

        <a href="/omp?cmd=get_info&amp;info_type=cpe&amp;token={/envelope/token}">
          <xsl:call-template name="severity-chart">
            <xsl:with-param name="type" select="'cpe'"/>
            <xsl:with-param name="id" select="'cpe_severity_chart'"/>
          </xsl:call-template>
        </a>
        <a href="/omp?cmd=get_info&amp;info_type=cpe&amp;filter={$filter}&amp;token={/envelope/token}">
          <xsl:call-template name="severity-chart">
            <xsl:with-param name="type" select="'cpe'"/>
            <xsl:with-param name="id" select="'cpe_severity_chart_2'"/>
            <xsl:with-param name="filter" select="$filter"/>
            <xsl:with-param name="title_prefix" select="'CPEs of the last 7 days (Total: '"/>
            <xsl:with-param name="title_loading" select="'CPEs of the last 7 days (loading...)'"/>
          </xsl:call-template>
        </a>

        <a href="/omp?cmd=get_info&amp;info_type=ovaldef&amp;token={/envelope/token}">
          <xsl:call-template name="severity-chart">
            <xsl:with-param name="type" select="'ovaldef'"/>
            <xsl:with-param name="id" select="'ovaldef_severity_chart'"/>
          </xsl:call-template>
        </a>
        <a href="/omp?cmd=get_info&amp;info_type=ovaldef&amp;filter={$filter}&amp;token={/envelope/token}">
          <xsl:call-template name="severity-chart">
            <xsl:with-param name="type" select="'ovaldef'"/>
            <xsl:with-param name="id" select="'ovaldef_severity_chart_2'"/>
            <xsl:with-param name="filter" select="$filter"/>
            <xsl:with-param name="title_prefix" select="'OVAL Definitions of the last 7 days (Total: '"/>
            <xsl:with-param name="title_loading" select="'OVAL Definitions of the last 7 days (loading...)'"/>
          </xsl:call-template>
        </a>

        <a href="/omp?cmd=get_info&amp;info_type=dfn_cert_adv&amp;token={/envelope/token}">
          <xsl:call-template name="severity-chart">
            <xsl:with-param name="type" select="'dfn_cert_adv'"/>
            <xsl:with-param name="id" select="'dfn_cert_adv_severity_chart'"/>
          </xsl:call-template>
        </a>
        <a href="/omp?cmd=get_info&amp;info_type=dfn_cert_adv&amp;filter={$filter}&amp;token={/envelope/token}">
          <xsl:call-template name="severity-chart">
            <xsl:with-param name="type" select="'dfn_cert_adv'"/>
            <xsl:with-param name="id" select="'dfn_cert_adv_severity_chart_2'"/>
            <xsl:with-param name="filter" select="$filter"/>
            <xsl:with-param name="title_prefix" select="'DFN-CERT Advisories of the last 7 days (Total: '"/>
            <xsl:with-param name="title_loading" select="'DFN-CERT Advisories of the last 7 days (loading...)'"/>
          </xsl:call-template>
        </a>
      </center>
    </div>
  </div>
</xsl:template>

</xsl:stylesheet>
