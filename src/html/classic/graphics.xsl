<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
      version="1.0"
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
      xmlns:gsa="http://openvas.org"
      xmlns:gsa-i18n="http://openvas.org/i18n"
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
Björn Ricks <bjoern.ricks@greenbone.net>

Copyright:
Copyright (C) 2013-2016 Greenbone Networks GmbH

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
  <script src="/js/xml2json.js"></script>
  <script src="/js/d3.v3.js"></script>
  <script src="/js/d3.layout.cloud.js"></script>
  <script src="/js/d3.tip.js"></script>
  <script src="/js/gsa_chart_helpers.js"></script>
  <script src="/js/gsa_graphics_base.js"></script>
  <script src="/js/gsa_dashboard.js"></script>
  <script src="/js/gsa_bar_chart.js"></script>
  <script src="/js/gsa_bubble_chart.js"></script>
  <script src="/js/gsa_cloud_chart.js"></script>
  <script src="/js/gsa_donut_chart.js"></script>
  <script src="/js/gsa_gantt_chart.js"></script>
  <script src="/js/gsa_h_bar_chart.js"></script>
  <script src="/js/gsa_line_chart.js"></script>
  <script src="/js/gsa_topology_chart.js"></script>
  <script type="text/javascript">
    gsa.gsa_token = "<xsl:value-of select="gsa:escape-js (/envelope/params/token)"/>";

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

<xsl:template name="task-charts">
  <xsl:param name="filter"/>
  <xsl:param name="filt_id"/>

  <div class="dashboard-data-source"
    data-source-name="task-severity-count-source"
    data-group-column="severity"
    data-aggregate-type="task"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="task-by-cvss"
      data-chart-title="{gsa:i18n ('Tasks by CVSS')}"
      data-chart-title-count="count"
      data-chart-type="bar"
      data-chart-template="info_by_cvss"/>
    <span class="dashboard-chart"
      data-chart-name="task-by-severity-class"
      data-chart-title="{gsa:i18n ('Tasks by Severity Class')}"
      data-chart-title-count="count"
      data-chart-type="donut"
      data-chart-template="info_by_class"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="task-status-count-source"
    data-aggregate-type="task"
    data-group-column="status"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="task-by-status"
      data-chart-title="{gsa:i18n ('Tasks by status')}"
      data-chart-title-count="count"
      data-chart-type="donut"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="task-high-results-source"
    data-aggregate-type="task"
    data-group-column="uuid"
    data-columns="severity,high_per_host"
    data-text-columns="name,modified"
    data-sort-fields="high_per_host,modified"
    data-sort-orders="descending,descending"
    data-sort-stats="max,value"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="task-by-high-results"
      data-chart-type="bubbles"
      data-chart-title="{gsa:i18n ('Tasks: High results per host')}"
      data-x-field="name"
      data-y-fields="high_per_host_max"
      data-z-fields="severity_max"
      data-gen-params='{{"empty_text": "No Tasks with High severity found"}}'/>
    <span class="dashboard-chart"
      data-chart-name="task-by-most-high-results"
      data-chart-type="horizontal_bar"
      data-chart-title="{gsa:i18n ('Tasks with most High results per host')}"
      data-x-field="name"
      data-y-fields="high_per_host_max"
      data-z-fields="severity_max"
      data-gen-params='{{"empty_text": "No Tasks with High severity found"}}'/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="task-schedules-source"
    data-type="task"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="task-by-schedules"
      data-chart-type="gantt"
      data-chart-title="{gsa:i18n ('Next scheduled tasks')}"
      data-gen-params='{{"empty_text": "No scheduled Tasks found"}}'/>
  </div>
</xsl:template>

<xsl:template name="report-charts">
  <xsl:param name="filter"/>
  <xsl:param name="filt_id"/>

  <div class="dashboard-data-source"
    data-source-name="report-high-results-timeline-source"
    data-aggregate-type="report"
    data-group-column="date"
    data-columns="high,high_per_host"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="report-by-high-results"
      data-chart-type="line"
      data-y-fields="high_max"
      data-z-fields="high_per_host_max"
      data-chart-title="{gsa:i18n ('Reports: High results timeline')}"
      data-gen-params='{{"show_stat_type": 0}}'/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="report-severity-count-source"
    data-group-column="severity"
    data-aggregate-type="report"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="report-by-cvss"
      data-chart-type="bar"
      data-chart-title="{gsa:i18n ('Reports by CVSS')}"
      data-chart-title-count="count"
      data-chart-template="info_by_cvss"/>
    <span class="dashboard-chart"
      data-chart-name="report-by-severity-class"
      data-chart-type="donut"
      data-chart-title="{gsa:i18n ('Reports by Severity Class')}"
      data-chart-title-count="count"
      data-chart-template="info_by_class"/>
  </div>
</xsl:template>

<xsl:template name="result-charts">
  <xsl:param name="filter"/>
  <xsl:param name="filt_id"/>

  <div class="dashboard-data-source"
    data-source-name="results-severity-count-source"
    data-group-column="severity"
    data-aggregate-type="result"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="result-by-cvss"
      data-chart-type="bar"
      data-chart-title="{gsa:i18n ('Results by CVSS')}"
      data-chart-title-count="count"
      data-chart-template="info_by_cvss"/>
    <span class="dashboard-chart"
      data-chart-name="result-by-severity-class"
      data-chart-type="donut"
      data-chart-title="{gsa:i18n ('Results by Severity Class')}"
      data-chart-title-count="count"
      data-chart-template="info_by_class"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="result-vuln-words-source"
    data-aggregate-type="result"
    data-group-column="vulnerability"
    data-aggregate-mode="word_counts"
    data-sort-stat="count"
    data-sort-order="descending"
    data-max-groups="250"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="result-by-vuln-words"
      data-chart-type="cloud"
      data-chart-title="{gsa:i18n ('Results vulnerability word cloud')}"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="result-desc-words-source"
    data-aggregate-type="result"
    data-group-column="description"
    data-aggregate-mode="word_counts"
    data-sort-stat="count"
    data-sort-order="descending"
    data-max-groups="250"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="result-by-desc-words"
      data-chart-type="cloud"
      data-chart-title="{gsa:i18n ('Results description word cloud')}"/>
  </div>
</xsl:template>

<xsl:template name="host-charts">
  <xsl:param name="filter"/>
  <xsl:param name="filt_id"/>

  <div class="dashboard-data-source"
    data-source-name="host-severity-count-source"
    data-group-column="severity"
    data-aggregate-type="host"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="host-by-cvss"
      data-chart-type="bar"
      data-chart-title="{gsa:i18n ('Hosts by CVSS')}"
      data-chart-title-count="count"
      data-chart-template="info_by_cvss"/>
    <span class="dashboard-chart"
      data-chart-name="host-by-severity-class"
      data-chart-type="donut"
      data-chart-title="{gsa:i18n ('Hosts by Severity Class')}"
      data-chart-title-count="count"
      data-chart-template="info_by_class"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="host-most-vulnerable-source"
    data-aggregate-type="host"
    data-group-column="uuid"
    data-columns="severity"
    data-text-columns="name,modified"
    data-sort-fields="severity,modified"
    data-sort-orders="descending,descending"
    data-sort-stats="max,value"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="host-by-most-vulnerable"
      data-chart-type="horizontal_bar"
      data-x-field="name"
      data-y-fields="severity_max"
      data-z-fields="severity_max"
      data-gen-params='{{"empty_text": "No vulnerable Hosts found",
                         "extra_tooltip_field_1": "modified",
                         "extra_tooltip_label_1": "Updated" }}'
      data-chart-title="{gsa:i18n ('Most vulnerable hosts')}"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="host-counts-timeline-source"
    data-aggregate-type="host"
    data-group-column="modified"
    data-subgroup-column="severity_level"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="host-by-modification-time"
      data-chart-title="{gsa:i18n ('Hosts by modification time')}"
      data-chart-title-count="count"
      data-y-fields="c_count,c_count[High]"
      data-z-fields="count,count[High]"
      data-chart-type="line"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="host-topology-source"
    data-aggregate-type="host"
    data-type="host"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="host-by-topology"
      data-chart-title="{gsa:i18n ('Hosts topology')}"
      data-chart-type="topology"/>
  </div>
</xsl:template>

<xsl:template name="os-charts">
  <xsl:param name="filter"/>
  <xsl:param name="filt_id"/>

  <div class="dashboard-data-source"
    data-source-name="os-average-severity-count-source"
    data-group-column="average_severity"
    data-aggregate-type="os"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="os-by-cvss"
      data-chart-type="bar"
      data-chart-title="{gsa:i18n ('Operating Systems by CVSS')}"
      data-chart-title-count="count"
      data-chart-template="info_by_cvss"/>
    <span class="dashboard-chart"
      data-chart-name="os-by-severity-class"
      data-chart-title="{gsa:i18n ('Operating Systems by Severity Class')}"
      data-chart-title-count="count"
      data-chart-type="donut"
      data-chart-template="info_by_class"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="os-most-vulnerable-source"
    data-aggregate-type="os"
    data-group-column="uuid"
    data-columns="average_severity,average_severity_score,hosts"
    data-text-columns="name,modified"
    data-sort-fields="average_severity_score,modified"
    data-sort-orders="descending,descending"
    data-sort-stats="max,value"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="os-by-most-vulnerable"
      data-chart-type="horizontal_bar"
      data-x-field="name"
      data-y-fields="average_severity_score_max"
      data-z-fields="average_severity_max"
      data-gen-params='{{"empty_text": "No vulnerable Operating Systems found",
                         "score_severity" : "average_severity_max",
                         "score_assets" : "hosts_max",
                         "score_asset_type" : "hosts",
                         "extra_tooltip_field_1": "modified",
                         "extra_tooltip_label_1": "Updated"}}'
      data-chart-title="{gsa:i18n ('Operating Systems by Vulnerability Score')}"/>
  </div>
</xsl:template>

<xsl:template name="note-charts">
  <xsl:param name="filter"/>
  <xsl:param name="filt_id"/>

  <div class="dashboard-data-source"
    data-source-name="note-created-count-source"
    data-aggregate-type="note"
    data-aggregate-mode="count"
    data-group-column="created"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="note-by-created"
      data-chart-title="{gsa:i18n ('Notes by creation time')}"
      data-chart-title-count="count"
      data-chart-type="line"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="note-text-words-source"
    data-aggregate-type="note"
    data-group-column="text"
    data-aggregate-mode="word_counts"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="note-by-text-words"
      data-chart-title="{gsa:i18n ('Notes text word cloud')}"
      data-chart-type="cloud"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="note-active-status-source"
    data-aggregate-type="note"
    data-group-column="active_days"
    data-sort-stat="count"
    data-sort-order="descending"
    data-max-groups="250"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="note-by-active-days"
      data-chart-template="active_status"
      data-chart-title="{gsa:i18n ('Notes by active days')}"
      data-chart-title-count="count"
      data-chart-type="donut"/>
  </div>
</xsl:template>

<xsl:template name="override-charts">
  <xsl:param name="filter"/>
  <xsl:param name="filt_id"/>

  <div class="dashboard-data-source"
    data-source-name="override-created-count-source"
    data-aggregate-type="override"
    data-aggregate-mode="count"
    data-group-column="created"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="override-by-created"
      data-chart-title="{gsa:i18n ('Overrides by creation time')}"
      data-chart-title-count="count"
      data-chart-type="line"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="override-text-words-source"
    data-aggregate-type="override"
    data-group-column="text"
    data-aggregate-mode="word_counts"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="override-by-text-words"
      data-chart-title="{gsa:i18n ('Overrides text word cloud')}"
      data-chart-type="cloud"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="override-status-source"
    data-aggregate-type="override"
    data-group-column="active_days"
    data-sort-stat="count"
    data-sort-order="descending"
    data-max-groups="250"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="override-by-active-days"
      data-chart-template="active_status"
      data-chart-title="{gsa:i18n ('Overrides by active days')}"
      data-chart-title-count="count"
      data-chart-type="donut"/>
  </div>
</xsl:template>

<xsl:template name="common-charts">
  <xsl:param name="filter"/>
  <xsl:param name="filt_id"/>
  <xsl:param name="type"/>
  <xsl:param name="title_type"/>

  <div class="dashboard-data-source"
    data-source-name="{$type}-severity-count-source"
    data-aggregate-type="{$type}"
    data-group-column="severity"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="{$type}-by-cvss"
      data-chart-type="bar"
      data-chart-title="{gsa-i18n:strformat (gsa:i18n ('%1 by CVSS'), $title_type)}"
      data-chart-title-count="count"
      data-chart-template="info_by_cvss"/>
    <span class="dashboard-chart"
      data-chart-name="{$type}-by-severity-class"
      data-chart-type="donut"
      data-chart-title="{gsa-i18n:strformat (gsa:i18n ('%1 by Severity Class'), $title_type)}"
      data-chart-title-count="count"
      data-chart-template="info_by_class"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="{$type}-created-count-source"
    data-aggregate-type="{$type}"
    data-group-column="created"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="{$type}-by-created"
      data-chart-title="{gsa-i18n:strformat (gsa:i18n ('%1 by creation time'), $title_type)}"
      data-chart-title-count="count"
      data-chart-type="line"/>
  </div>
</xsl:template>

<xsl:template name="nvt-charts">
  <xsl:param name="filter"/>
  <xsl:param name="filt_id"/>

  <xsl:call-template name="common-charts">
    <xsl:with-param name="filter" select="$filter" />
    <xsl:with-param name="filt_id" select="$filt_id" />
    <xsl:with-param name="type" select="'nvt'" />
    <xsl:with-param name="title_type" select="'NVTs'" />
  </xsl:call-template>

  <div class="dashboard-data-source"
    data-source-name="nvt-by-family-source"
    data-aggregate-type="nvt"
    data-group-column="family"
    data-column="severity"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="nvt-by-family"
      data-chart-title="{gsa:i18n ('NVTs by Family')}"
      data-chart-title-count="size_value"
      data-chart-type="bubbles"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="nvt-by-qod-type-source"
    data-aggregate-type="nvt"
    data-group-column="qod_type"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="nvt-by-qod_type"
      data-chart-template="qod_type_counts"
      data-chart-title="{gsa:i18n ('NVTs by QoD type')}"
      data-chart-title-count="count"
      data-chart-type="donut"/>
  </div>
  <div class="dashboard-data-source"
    data-source-name="nvt-by-qod-source"
    data-aggregate-type="nvt"
    data-group-column="qod"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="nvt-by-qod"
      data-chart-template="percentage_counts"
      data-chart-title="{gsa:i18n ('NVTs by QoD')}"
      data-chart-title-count="count"
      data-chart-type="donut"/>
  </div>
</xsl:template>

<xsl:template name="ovaldef-charts">
  <xsl:param name="filter"/>
  <xsl:param name="filt_id"/>

  <xsl:call-template name="common-charts">
    <xsl:with-param name="filter" select="$filter" />
    <xsl:with-param name="filt_id" select="$filt_id" />
    <xsl:with-param name="type" select="'ovaldef'" />
    <xsl:with-param name="title_type" select="'OVAL Definitions'" />
  </xsl:call-template>

  <div class="dashboard-data-source"
    data-source-name="ovaldef-class-source"
    data-aggregate-type="ovaldef"
    data-group-column="class"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="ovaldef-by-class"
      data-chart-title="{gsa:i18n ('OVAL Definitions by class')}"
      data-chart-title-count="count"
      data-chart-type="donut"/>
  </div>
</xsl:template>

<xsl:template name="cert-bund-adv-charts">
  <xsl:param name="filter"/>
  <xsl:param name="filt_id"/>

  <xsl:call-template name="common-charts">
    <xsl:with-param name="filter" select="$filter" />
    <xsl:with-param name="filt_id" select="$filt_id" />
    <xsl:with-param name="type" select="'cert_bund_adv'" />
    <xsl:with-param name="title_type" select="'CERT-Bund Advisories'" />
  </xsl:call-template>
</xsl:template>

<xsl:template name="cve-charts">
  <xsl:param name="filter"/>
  <xsl:param name="filt_id"/>

  <xsl:call-template name="common-charts">
    <xsl:with-param name="filter" select="$filter" />
    <xsl:with-param name="filt_id" select="$filt_id" />
    <xsl:with-param name="type" select="'cve'" />
    <xsl:with-param name="title_type" select="'CVEs'" />
  </xsl:call-template>
</xsl:template>

<xsl:template name="cpe-charts">
  <xsl:param name="filter"/>
  <xsl:param name="filt_id"/>

  <xsl:call-template name="common-charts">
    <xsl:with-param name="filter" select="$filter" />
    <xsl:with-param name="filt_id" select="$filt_id" />
    <xsl:with-param name="type" select="'cpe'" />
    <xsl:with-param name="title_type" select="'CPEs'" />
  </xsl:call-template>
</xsl:template>

<xsl:template name="dfn-cert-adv-charts">
  <xsl:param name="filter"/>
  <xsl:param name="filt_id"/>

  <xsl:call-template name="common-charts">
    <xsl:with-param name="filter" select="$filter" />
    <xsl:with-param name="filt_id" select="$filt_id" />
    <xsl:with-param name="type" select="'dfn_cert_adv'" />
    <xsl:with-param name="title_type" select="'DFN-CERT Advisories'" />
  </xsl:call-template>
</xsl:template>

<xsl:template name="allinfo-charts">
  <xsl:param name="filter"/>
  <xsl:param name="filt_id"/>

  <xsl:call-template name="common-charts">
    <xsl:with-param name="filter" select="$filter" />
    <xsl:with-param name="filt_id" select="$filt_id" />
    <xsl:with-param name="type" select="'allinfo'" />
    <xsl:with-param name="title_type" select="'SecInfo Items'" />
  </xsl:call-template>

  <div class="dashboard-data-source"
    data-source-name="allinfo-by-type-source"
    data-aggregate-type="allinfo"
    data-group-column="type"
    data-filter="{$filter}"
    data-filter-id="{$filt_id}">
    <span class="dashboard-chart"
      data-chart-name="allinfo-by-type"
      data-chart-template="resource_type_counts"
      data-chart-title="{gsa:i18n ('SecInfo Items by type')}"
      data-chart-title-count="count"
      data-chart-type="donut"/>
  </div>
</xsl:template>

<xsl:template name="js-scan-management-top-visualization">
  <xsl:param name="type" select="'task'"/>
  <!-- Default chart selections:
        Controller names of boxes in a row separated with "|",
        rows separated with "#" -->
  <xsl:param name="default_controllers">
    <xsl:choose>
      <xsl:when test="$type='task'">task-by-severity-class|task-by-most-high-results|task-by-status</xsl:when>
      <xsl:when test="$type='report'">report-by-severity-class|report-by-high-results|report-by-cvss</xsl:when>
      <xsl:when test="$type='result'">result-by-severity-class|result-by-vuln-words|result-by-cvss</xsl:when>
      <!-- fallback for all other types -->
      <xsl:otherwise><xsl:value-of select="$type"/>-by-cvss|<xsl:value-of select="$type"/>-by-severity-class</xsl:otherwise>
    </xsl:choose>
  </xsl:param>
  <!-- Default row heights, rows separated with "#",
        number of rows must match default_controllers -->
  <xsl:param name="default_heights">
    <xsl:choose>
      <xsl:when test="$type='task'">280</xsl:when>
      <!-- fallback for all other types -->
      <xsl:otherwise>280</xsl:otherwise>
    </xsl:choose>
  </xsl:param>

  <!-- Setting UUIDs for chart selection preferences -->
  <xsl:param name="config_pref_id">
    <xsl:choose>
      <xsl:when test="$type='task'">3d5db3c7-5208-4b47-8c28-48efc621b1e0</xsl:when>
      <xsl:when test="$type='report'">e599bb6b-b95a-4bb2-a6bb-fe8ac69bc071</xsl:when>
      <xsl:when test="$type='result'">0b8ae70d-d8fc-4418-8a72-e65ac8d2828e</xsl:when>
    </xsl:choose>
  </xsl:param>

  <xsl:variable name="config">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $config_pref_id]">
        <xsl:value-of select="/envelope/chart_preferences/chart_preference[@id = $config_pref_id]/value"/>
      </xsl:when>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="filter" select="/envelope/get_tasks/get_tasks_response/filters/term | /envelope/get_reports/get_reports_response/filters/term | /envelope/get_results/get_results_response/filters/term"/>
  <xsl:variable name="filt_id" select="/envelope/get_tasks/get_tasks_response/filters/@id | /envelope/get_reports/get_reports_response/filters/@id |  /envelope/get_results/get_results_response/filters/@id"/>

  <div class="dashboard" id="top-dashboard"
    data-filter="{$filter}"
    data-filters-id="{$filt_id}"
    data-config="{$config}"
    data-config-pref-id="{$config_pref_id}"
    data-default-controllers="{$default_controllers}"
    data-default-heights="{$default_heights}"
    data-default-controller-string="{$type}-by-cvss"
    data-dashboard-controls="top-dashboard-controls"
    data-no-chart-links="{/envelope/params/no_chart_links}"
    data-max-components="4"
    data-hide-filter-select="1">

    <xsl:if test="$type='task'">
      <xsl:call-template name="task-charts">
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
      </xsl:call-template>
    </xsl:if>

    <xsl:if test="$type='report'">
      <xsl:call-template name="report-charts">
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
      </xsl:call-template>

      <div class="dashboard-data-source"
        data-source-name="report-duration-timeline-source"
        data-aggregate-type="report"
        data-group-column="date"
        data-columns="duration,duration_per_host"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="report-duration-timeline"
          data-chart-type="line"
          data-chart-title="{gsa:i18n ('Reports: Duration timeline')}"
          data-y-fields="duration_mean,duration_max"
          data-z-fields="duration_per_host_mean,duration_per_host_max"
          data-gen-params='{{"show_stat_type": 0, "y_format": "duration", "y2_format": "duration"}}'/>
      </div>
    </xsl:if>

    <xsl:if test="$type='result'">
      <xsl:call-template name="result-charts">
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
      </xsl:call-template>
    </xsl:if>

  </div>
</xsl:template>

<xsl:template name="js-assets-top-visualization">
  <xsl:param name="type" select="'host'"/>
  <!-- Default chart selections:
        Controller names of boxes in a row separated with "|",
        rows separated with "#" -->
  <xsl:param name="default_controllers">
    <xsl:choose>
      <xsl:when test="$type='host'">host-by-severity-class|host-by-topology|host-by-modification-time</xsl:when>
      <xsl:when test="$type='os'">os-by-severity-class|os-by-most-vulnerable|os-by-cvss</xsl:when>
      <!-- fallback for all other types -->
      <xsl:otherwise><xsl:value-of select="$type"/>-by-cvss|<xsl:value-of select="$type"/>-by-severity-class</xsl:otherwise>
    </xsl:choose>
  </xsl:param>
  <!-- Default row heights, rows separated with "#",
        number of rows must match default_controllers -->
  <xsl:param name="default_heights">
    <xsl:choose>
      <xsl:when test="$type='host'">280</xsl:when>
      <!-- fallback for all other types -->
      <xsl:otherwise>280</xsl:otherwise>
    </xsl:choose>
  </xsl:param>

  <!-- Setting UUIDs for chart selection preferences -->
  <xsl:param name="config_pref_id">
    <xsl:choose>
      <xsl:when test="$type='host'">d3f5f2de-a85b-43f2-a817-b127457cc8ba</xsl:when>
      <xsl:when test="$type='os'">e93b51ed-5881-40e0-bc4f-7d3268a36177</xsl:when>
    </xsl:choose>
  </xsl:param>

  <xsl:variable name="config">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $config_pref_id]">
        <xsl:value-of select="/envelope/chart_preferences/chart_preference[@id = $config_pref_id]/value"/>
      </xsl:when>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="filter" select="/envelope/get_assets/get_assets_response/filters/term"/>
  <xsl:variable name="filt_id" select="/envelope/get_assets/get_assets_response/filters/@id"/>

  <div class="dashboard" id="top-dashboard"
    data-dashboard-name="top-dashboard"
    data-filter="{$filter}"
    data-filters-id="{$filt_id}"
    data-config="{$config}"
    data-config-pref-id="{$config_pref_id}"
    data-default-controllers="{$default_controllers}"
    data-default-heights="{$default_heights}"
    data-default-controller-string="{$type}-by-cvss"
    data-dashboard-controls="top-dashboard-controls"
    data-no-chart-links="{/envelope/params/no_chart_links}"
    data-max-components="4"
    data-hide-filter-select="1">

    <xsl:if test="$type = 'host'">
      <xsl:call-template name="host-charts">
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
      </xsl:call-template>
    </xsl:if>

    <xsl:if test="$type = 'os'">
      <xsl:call-template name="os-charts">
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
      </xsl:call-template>
    </xsl:if>

  </div>
</xsl:template>

<xsl:template name="js-secinfo-top-visualization">
  <xsl:param name="type" select="'nvt'"/>
  <!-- Default chart selections:
        Controller names of boxes in a row separated with "|",
        rows separated with "#" -->
  <xsl:param name="default_controllers">
    <xsl:choose>
      <xsl:when test="$type='allinfo'"></xsl:when>
      <xsl:when test="$type='nvt'">nvt-by-severity-class|nvt-by-created|nvt-by-family</xsl:when>
      <xsl:when test="$type='ovaldef'">ovaldef-by-severity-class|ovaldef-by-created|ovaldef-by-class</xsl:when>
      <!-- fallback for all other types -->
      <xsl:otherwise><xsl:value-of select="$type"/>-by-severity-class|<xsl:value-of select="$type"/>-by-created|<xsl:value-of select="$type"/>-by-cvss</xsl:otherwise>
    </xsl:choose>
  </xsl:param>
  <!-- Default row heights, rows separated with "#",
        number of rows must match default_controllers -->
  <xsl:param name="default_heights">
    <xsl:choose>
      <xsl:when test="$type='allinfo'"></xsl:when>
      <!-- fallback for all other types -->
      <xsl:otherwise>280</xsl:otherwise>
    </xsl:choose>
  </xsl:param>

  <!-- Setting UUIDs for chart selection preferences -->
  <xsl:param name="config_pref_id">
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

  <xsl:variable name="config">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $config_pref_id]">
        <xsl:value-of select="/envelope/chart_preferences/chart_preference[@id = $config_pref_id]/value"/>
      </xsl:when>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="filter" select="/envelope/get_info/get_info_response/filters/term"/>
  <xsl:variable name="filt_id" select="/envelope/get_info/get_info_response/filters/@id"/>

  <div class="dashboard" id="top-dashboard"
    data-dashboard-name="top-dashboard"
    data-filter="{$filter}"
    data-filters-id="{$filt_id}"
    data-config="{$config}"
    data-config-pref-id="{$config_pref_id}"
    data-default-controllers="{$default_controllers}"
    data-default-controller-string="{$type}-by-cvss"
    data-default-heights="{$default_heights}"
    data-dashboard-controls="top-dashboard-controls"
    data-no-chart-links="{/envelope/params/no_chart_links}"
    data-max-components="4"
    data-hide-filter-select="1">

    <xsl:if test="$type = 'nvt'">
      <xsl:call-template name="nvt-charts">
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
      </xsl:call-template>

      <div class="dashboard-data-source"
        data-source-name="nvt-by-solution-type-source"
        data-aggregate-type="{$type}"
        data-group-column="solution_type"
        data-filter="{$filter}"
        data-filter-id="{$filt_id}">
        <span class="dashboard-chart"
          data-chart-name="nvt-by-solution-type"
          data-chart-title="NVTs by solution type"
          data-chart-title-count="count"
          data-chart-type="donut"/>
      </div>
    </xsl:if>

    <xsl:if test="$type = 'ovaldef'">
      <xsl:call-template name="ovaldef-charts">
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
      </xsl:call-template>
    </xsl:if>

    <xsl:if test="$type = 'cert_bund_adv'">
      <xsl:call-template name="cert-bund-adv-charts">
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
      </xsl:call-template>
    </xsl:if>

    <xsl:if test="$type = 'cve'">
      <xsl:call-template name="cve-charts">
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
      </xsl:call-template>
    </xsl:if>

    <xsl:if test="$type = 'cpe'">
      <xsl:call-template name="cpe-charts">
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
      </xsl:call-template>
    </xsl:if>

    <xsl:if test="$type = 'dfn_cert_adv'">
      <xsl:call-template name="dfn-cert-adv-charts">
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
      </xsl:call-template>
    </xsl:if>

    <xsl:if test="$type = 'allinfo'">
      <xsl:call-template name="allinfo-charts">
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
      </xsl:call-template>
    </xsl:if>

  </div>
</xsl:template>

<xsl:template name="js-notes-top-visualization">
  <xsl:variable name="default_controllers" select="'note-by-active-days|note-by-created|note-by-text-words'"/>
  <!-- Default row heights, rows separated with "#",
        number of rows must match default_controllers -->
  <xsl:variable name="default_heights" select="'280'"/>

  <!-- Setting UUID for chart selection preferences -->
  <xsl:variable name="config_pref_id" select="'ce7b121-c609-47b0-ab57-fd020a0336f4'"/>

  <xsl:variable name="envelope" select="/envelope"/>

  <xsl:variable name="config">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $config_pref_id]">
        <xsl:value-of select="/envelope/chart_preferences/chart_preference[@id = $config_pref_id]/value"/>
      </xsl:when>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="filter" select="/envelope/get_notes/get_notes_response/filters/term"/>
  <xsl:variable name="filt_id" select="/envelope/get_notes/get_notes_response/filters/@id"/>

  <div class="section-box">
    <div id="top-notes-dashboard">
    </div>
    <div class="dashboard" id="top-dashboard"
      data-dashboard-name="top-notes-dashboard"
      data-filter="{$filter}"
      data-filters-id="{$filt_id}"
      data-config="{$config}"
      data-config-pref-id="{$config_pref_id}"
      data-default-controllers="{$default_controllers}"
      data-default-heights="{$default_heights}"
      data-default-controller-string="note-by-active-days"
      data-dashboard-controls="top-dashboard-controls"
      data-max-components="4"
      data-hide-filter-select="1">

      <xsl:call-template name="note-charts">
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
      </xsl:call-template>

    </div>
  </div>
</xsl:template>

<xsl:template name="js-overrides-top-visualization">
  <xsl:variable name="default_controllers" select="'override-by-active-days|override-by-created|override-by-text-words'"/>
  <!-- Default row heights, rows separated with "#",
        number of rows must match default_controllers -->
  <xsl:variable name="default_heights" select="'280'"/>

  <!-- Setting UUID for chart selection preferences -->
  <xsl:variable name="config_pref_id" select="'054862fe-0781-4527-b1aa-2113bcd16ce7'"/>

  <xsl:variable name="envelope" select="/envelope"/>

  <xsl:variable name="config">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $config_pref_id]">
        <xsl:value-of select="/envelope/chart_preferences/chart_preference[@id = $config_pref_id]/value"/>
      </xsl:when>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="filter" select="/envelope/get_overrides/get_overrides_response/filters/term"/>
  <xsl:variable name="filt_id" select="/envelope/get_overrides/get_overrides_response/filters/@id"/>

  <div class="section-box">
    <div id="top-overrides-dashboard">
    </div>
    <div class="dashboard" id="top-dashboard"
      data-dashboard-name="top-overrides-dashboard"
      data-config="{$config}"
      data-config-pref-id="{$config_pref_id}"
      data-filter="{$filter}"
      data-filters-id="{$filt_id}"
      data-default-controllers="{$default_controllers}"
      data-default-heights="{$default_heights}"
      data-default-controller-string="override-by-active-days"
      data-dashboard-controls="top-dashboard-controls"
      data-max-components="4"
      data-hide-filter-select="1">

      <xsl:call-template name="override-charts">
        <xsl:with-param name="filter" select="$filter"/>
        <xsl:with-param name="filt_id" select="$filt_id"/>
      </xsl:call-template>

    </div>
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

  <xsl:if test="secinfo_test/get_info_response/@status != 200">
    <div>
      <xsl:call-template name="error_window">
        <xsl:with-param name="heading">Warning: SecInfo Database Missing</xsl:with-param>
        <xsl:with-param name="message">
          SCAP and/or CERT database missing on OMP server.
          <a href="/help/cpes.html?token={/envelope/token}#secinfo_missing"
              title="Help: SecInfo database missing" class="icon icon-sm">
            <img src="/img/help.svg"/>
          </a>
        </xsl:with-param>
      </xsl:call-template>
    </div>
  </xsl:if>

  <xsl:choose>
    <xsl:when test="name='' or name='main'">
      <xsl:apply-templates select="." mode="main"/>
    </xsl:when>
    <xsl:when test="name='scans'">
      <xsl:apply-templates select="." mode="scans"/>
    </xsl:when>
    <xsl:when test="name='assets'">
      <xsl:apply-templates select="." mode="assets"/>
    </xsl:when>
    <xsl:when test="name='secinfo'">
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

<xsl:template match="dashboard" mode="main">
  <xsl:variable name="filters" select="get_filters_response/filter"/>
  <!-- Default chart selections:
        Controller names of boxes in a row separated with "|",
        rows separated with "#" -->
  <xsl:variable name="default_controllers" select="'task-by-severity-class|task-by-status#cve-by-created|host-by-topology|nvt-by-severity-class'"/>
  <!-- Default row heights, rows separated with "#",
        number of rows must match default_controllers -->
  <xsl:variable name="default_heights" select="'280#280'"/>
  <!-- Default filter selections:
        Filter UUIDs or empty string for boxes in a row separated with "|",
        rows separated with "#",
        number of boxes and rows must match default_controllers -->
  <xsl:variable name="default_filters" select="'|#|'"/>

  <xsl:variable name="envelope" select="/envelope"/>

  <!-- Setting UUID for chart selection preferences -->
  <xsl:variable name="config_pref_id" select="'d97eca9f-0386-4e5d-88f2-0ed7f60c0646'"/>

  <xsl:variable name="config">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $config_pref_id]">
        <xsl:value-of select="/envelope/chart_preferences/chart_preference[@id = $config_pref_id]/value"/>
      </xsl:when>
    </xsl:choose>
  </xsl:variable>

  <div class="section-header">
    <h1>
      <img class="icon icon-lg" src="/img/dashboard.svg" alt="Dashboard"/>
      <xsl:value-of select="gsa:i18n ('Dashboard')"/>
    </h1>
    <div id="main-dashboard-controls" class="dashboard-controls">
    </div>
  </div>
  <div class="section-box">
    <div id="main-dashboard" class="dashboard" data-dashboard-name="main-dashboard"
      data-config="{$config}"
      data-config-pref-id="{$config_pref_id}"
      data-default-controllers="{$default_controllers}"
      data-default-filters="{$default_filters}"
      data-default-heights="{$default_heights}"
      data-default-controller-string="task-by-severity-class"
      data-dashboard-controls="main-dashboard-controls"
      data-no-chart-links="{/envelope/params/no_chart_links}"
      data-max-components="8">
      <xsl:for-each select="$filters">
        <span class="dashboard-filter" data-id="{@id}"
          data-name="{name}"
          data-term="{term}" data-type="{type}" />
      </xsl:for-each>

      <xsl:call-template name="scans-dashboard-data"/>
      <xsl:call-template name="assets-dashboard-data"/>
      <xsl:call-template name="secinfo-dashboard-data"/>
    </div>
  </div>

  <xsl:call-template name="init-d3charts"/>
</xsl:template>

<xsl:template name="scans-dashboard-data">
  <!-- Tasks -->
  <xsl:call-template name="task-charts"/>

  <!-- Reports -->
  <xsl:call-template name="report-charts"/>

  <!-- Results -->
  <xsl:call-template name="result-charts"/>

  <!-- Notes -->
  <xsl:call-template name="note-charts"/>

  <!-- Overrides -->
  <xsl:call-template name="override-charts"/>
</xsl:template>

<xsl:template match="dashboard" mode="scans">
  <xsl:variable name="filters" select="get_filters_response/filter"/>
  <!-- Default chart selections:
        Controller names of boxes in a row separated with "|",
        rows separated with "#" -->
  <xsl:variable name="default_controllers" select="'result-by-severity-class|report-by-severity-class#task-by-status|report-by-high-results|task-by-severity-class'"/>
  <!-- Default row heights, rows separated with "#",
        number of rows must match default_controllers -->
  <xsl:variable name="default_heights" select="'280#280'"/>
  <!-- Default filter selections:
        Filter UUIDs or empty string for boxes in a row separated with "|",
        rows separated with "#",
        number of boxes and rows must match default_controllers -->
  <xsl:variable name="default_filters" select="'|#||'"/>

  <xsl:variable name="envelope" select="/envelope"/>

  <!-- Setting UUID for chart selection preferences -->
  <xsl:variable name="config_pref_id" select="'c7584d7c-649f-4f8b-9ded-9e1dc20f24c8'"/>

  <xsl:variable name="config">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $config_pref_id]">
        <xsl:value-of select="/envelope/chart_preferences/chart_preference[@id = $config_pref_id]/value"/>
      </xsl:when>
    </xsl:choose>
  </xsl:variable>

  <div class="section-header">
    <h1>
      <img class="icon icon-lg" src="/img/scan.svg" alt="Scans Dashboard"/>
      <xsl:value-of select="gsa:i18n ('Scans Dashboard')"/>
    </h1>
    <div id="scans-dashboard-controls" class="dashboard-controls">
    </div>
  </div>
  <div class="section-box">
    <div id="scans-dashboard" class="dashboard" data-dashboard-name="scans-dashboard"
      data-config="{$config}"
      data-config-pref-id="{$config_pref_id}"
      data-default-controllers="{$default_controllers}"
      data-default-filters="{$default_filters}"
      data-default-heights="{$default_heights}"
      data-default-controller-string="task-by-severity-class"
      data-dashboard-controls="scans-dashboard-controls"
      data-no-chart-links="{/envelope/params/no_chart_links}"
      data-max-components="8">
      <xsl:for-each select="$filters">
        <span class="dashboard-filter" data-id="{@id}"
          data-name="{name}"
          data-term="{term}" data-type="{type}" />
      </xsl:for-each>

      <xsl:call-template name="scans-dashboard-data"/>
    </div>
  </div>

  <xsl:call-template name="init-d3charts"/>
</xsl:template>

<xsl:template name="assets-dashboard-data">
  <!-- Hosts -->
  <xsl:call-template name="host-charts"/>

  <!-- Operating Systems -->
  <xsl:call-template name="os-charts"/>
</xsl:template>

<xsl:template match="dashboard" mode="assets">
  <xsl:variable name="filters" select="get_filters_response/filter[type='Asset' or type='']"/>
  <!-- Default chart selections:
        Controller names of boxes in a row separated with "|",
        rows separated with "#" -->
  <xsl:variable name="default_controllers" select="'host-by-most-vulnerable|host-by-topology|os-by-most-vulnerable#os-by-severity-class|host-by-modification-time'"/>
  <!-- Default row heights, rows separated with "#",
        number of rows must match default_controllers -->
  <xsl:variable name="default_heights" select="'280#280'"/>
  <!-- Default filter selections:
        Filter UUIDs or empty string for boxes in a row separated with "|",
        rows separated with "#",
        number of boxes and rows must match default_controllers -->
  <xsl:variable name="default_filters" select="'|#|'"/>

  <xsl:variable name="envelope" select="/envelope"/>

  <!-- Setting UUID for chart selection preferences -->
  <xsl:variable name="controllers_pref_id" select="'0320e0db-bf30-4d4f-9379-b0a022d07cf7'"/>
  <!-- Setting UUID for chart selection preferences -->
  <xsl:variable name="filters_pref_id" select="'48c344eb-062e-4ff5-81db-28f7ab110ca1'"/>
  <!-- Setting UUIDs for row height preferences -->
  <xsl:variable name="heights_pref_id" select="'d52373d8-90d9-4921-b03f-1ffd11e03f49'"/>

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
  <xsl:variable name="filters_string">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $filters_pref_id]">
        <xsl:value-of select="gsa:escape-js (/envelope/chart_preferences/chart_preference[@id = $filters_pref_id]/value)"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$default_filters"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <div class="section-header">
    <h1>
      <img class="icon icon-lg" src="/img/asset.svg" alt="Assets Dashboard"/>
      <xsl:value-of select="gsa:i18n ('Assets Dashboard')"/>
    </h1>
    <div id="assets-dashboard-controls" class="dashboard-controls">
    </div>
  </div>
  <div class="section-box">
    <div id="assets-dashboard" class="dashboard" data-dashboard-name="assets-dashboard"
      data-config="{$controllers}"
      data-filters-string="{$filters_string}"
      data-heights="{$heights}"
      data-default-controllers="{$default_controllers}"
      data-default-filters="{$default_filters}"
      data-default-heights="{$default_heights}"
      data-config-pref-id="{$controllers_pref_id}"
      data-filters-pref-id="{$filters_pref_id}"
      data-heights-pref-id="{$heights_pref_id}"
      data-default-controller-string="host-by-severity-class"
      data-dashboard-controls="assets-dashboard-controls"
      data-no-chart-links="{/envelope/params/no_chart_links}"
      data-max-components="8">
      <xsl:for-each select="$filters">
        <span class="dashboard-filter" data-id="{@id}"
          data-name="{name}"
          data-term="{term}" data-type="{type}" />
      </xsl:for-each>

      <xsl:call-template name="assets-dashboard-data"/>
    </div>
  </div>

  <xsl:call-template name="init-d3charts"/>
</xsl:template>

<xsl:template name="secinfo-dashboard-data">
  <!-- NVTs -->
  <xsl:call-template name="nvt-charts"/>

  <!-- OVAL Definitions -->
  <xsl:call-template name="ovaldef-charts"/>

  <!-- CERT Bund -->
  <xsl:call-template name="cert-bund-adv-charts"/>

  <!-- CVEs -->
  <xsl:call-template name="cve-charts"/>

  <!-- CPEs -->
  <xsl:call-template name="cpe-charts"/>

  <!-- DFN CERT -->
  <xsl:call-template name="dfn-cert-adv-charts"/>

  <!-- All SecInfo -->
  <xsl:call-template name="allinfo-charts"/>
</xsl:template>

<xsl:template match="dashboard" mode="secinfo">
  <xsl:variable name="filters" select="get_filters_response/filter[type='SecInfo' or type='']"/>
  <!-- Default chart selections:
        Controller names of boxes in a row separated with "|",
        rows separated with "#" -->
  <xsl:variable name="default_controllers" select="'nvt-by-severity-class|cve-by-created|cve-by-severity-class#cert_bund_adv-by-created|cert_bund_adv-by-cvss'"/>
  <!-- Default row heights, rows separated with "#",
        number of rows must match default_controllers -->
  <xsl:variable name="default_heights" select="'280#280'"/>
  <!-- Default filter selections:
        Filter UUIDs or empty string for boxes in a row separated with "|",
        rows separated with "#",
        number of boxes and rows must match default_controllers -->
  <xsl:variable name="default_filters" select="'|#|'"/>

  <xsl:variable name="envelope" select="/envelope"/>

  <!-- Setting UUID for chart selection preferences -->
  <xsl:variable name="config_pref_id" select="'84ab32da-fe69-44d8-8a8f-70034cf28d4e'"/>

  <xsl:variable name="config">
    <xsl:choose>
      <xsl:when test="/envelope/chart_preferences/chart_preference[@id = $config_pref_id]">
        <xsl:value-of select="/envelope/chart_preferences/chart_preference[@id = $config_pref_id]/value"/>
      </xsl:when>
    </xsl:choose>
  </xsl:variable>

  <div class="section-header">
    <h1>
      <img class="icon icon-lg" src="/img/allinfo.svg" alt="SecInfo Dashboard"/>
      <xsl:value-of select="gsa:i18n ('SecInfo Dashboard')"/>
    </h1>
    <div id="secinfo-dashboard-controls" class="dashboard-controls">
    </div>
  </div>
  <div class="section-box">
    <div id="secinfo-dashboard" class="dashboard" data-dashboard-name="secinfo-dashboard"
      data-config="{$config}"
      data-config-pref-id="{$config_pref_id}"
      data-default-controllers="{$default_controllers}"
      data-default-filters="{$default_filters}"
      data-default-heights="{$default_heights}"
      data-default-controller-string="nvt-by-cvss"
      data-dashboard-controls="secinfo-dashboard-controls"
      data-no-chart-links="{/envelope/params/no_chart_links}"
      data-max-components="8">
      <xsl:for-each select="$filters">
        <span class="dashboard-filter" data-id="{@id}"
          data-name="{name}"
          data-term="{term}" data-type="{type}" />
      </xsl:for-each>

      <xsl:call-template name="secinfo-dashboard-data"/>
    </div>
  </div>

  <xsl:call-template name="init-d3charts"/>
</xsl:template>

</xsl:stylesheet>
