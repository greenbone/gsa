<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="1.0"
    xmlns="http://www.w3.org/1999/xhtml"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:str="http://exslt.org/strings"
    xmlns:func="http://exslt.org/functions"
    xmlns:gsa="http://openvas.org"
    xmlns:gsa-i18n="http://openvas.org/i18n"
    xmlns:vuln="http://scap.nist.gov/schema/vulnerability/0.4"
    xmlns:cpe-lang="http://cpe.mitre.org/language/2.0"
    xmlns:scap-core="http://scap.nist.gov/schema/scap-core/0.1"
    xmlns:cve="http://scap.nist.gov/schema/feed/vulnerability/2.0"
    xmlns:cvss="http://scap.nist.gov/schema/cvss-v2/0.2"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:patch="http://scap.nist.gov/schema/patch/0.1"
    xmlns:meta="http://scap.nist.gov/schema/cpe-dictionary-metadata/0.2"
    xmlns:ns6="http://scap.nist.gov/schema/scap-core/0.1"
    xmlns:config="http://scap.nist.gov/schema/configuration/0.1"
    xmlns:cpe="http://cpe.mitre.org/dictionary/2.0"
    xmlns:oval="http://oval.mitre.org/XMLSchema/oval-common-5"
    xmlns:oval_definitions="http://oval.mitre.org/XMLSchema/oval-definitions-5"
    xmlns:dfncert="http://www.dfn-cert.de/dfncert.dtd"
    xmlns:atom="http://www.w3.org/2005/Atom"
    xsi:schemaLocation="http://scap.nist.gov/schema/configuration/0.1 http://nvd.nist.gov/schema/configuration_0.1.xsd http://scap.nist.gov/schema/scap-core/0.3 http://nvd.nist.gov/schema/scap-core_0.3.xsd http://cpe.mitre.org/dictionary/2.0 http://cpe.mitre.org/files/cpe-dictionary_2.2.xsd http://scap.nist.gov/schema/scap-core/0.1 http://nvd.nist.gov/schema/scap-core_0.1.xsd http://scap.nist.gov/schema/cpe-dictionary-metadata/0.2 http://nvd.nist.gov/schema/cpe-dictionary-metadata_0.2.xsd"
    xmlns:date="http://exslt.org/dates-and-times"
    xmlns:exslt="http://exslt.org/common"
    exclude-result-prefixes="vuln cpe-lang scap-core cve cvss xsi patch meta ns6 config cpe oval oval_definitions dfncert atom"
    extension-element-prefixes="str func date exslt gsa gsa-i18n">
  <xsl:output
      method="html"
      doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
      doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN"
      encoding="UTF-8"/>

<!--
Greenbone Security Assistant
$Id$
Description: Greenbone Management Protocol (GMP) stylesheet

Authors:
Matthew Mundell <matthew.mundell@greenbone.net>
Jan-Oliver Wagner <jan-oliver.wagner@greenbone.net>
Michael Wiegand <michael.wiegand@greenbone.net>
Timo Pollmeier <timo.pollmeier@greenbone.net>

Copyright:
Copyright (C) 2009-2015 Greenbone Networks GmbH

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


<!-- BEGIN GLOBAL VARIABLES -->

<xsl:variable name="icon-width" select="19"/>
<xsl:variable name="trash-actions-width" select="3 + (2 * $icon-width)"/>

<!-- BEGIN XPATH FUNCTIONS -->

<func:function name="gsa:envelope-filter">
  <xsl:choose>
    <xsl:when test="string-length (/envelope/params/filter) &gt; 0 and string-length (/envelope/params/filter_extra) &gt; 0">
      <func:result select="concat (/envelope/params/filter, ' ', /envelope/params/filter_extra)"/>
    </xsl:when>
    <xsl:otherwise>
      <func:result select="concat (/envelope/params/filter, /envelope/params/filter_extra)"/>
    </xsl:otherwise>
  </xsl:choose>
</func:function>

<func:function name="gsa:may">
  <xsl:param name="name"/>
  <xsl:param name="permissions" select="permissions"/>
  <func:result select="gsa:may-op ($name) and (boolean ($permissions/permission[name='Everything']) or boolean ($permissions/permission[name=$name]))"/>
</func:function>

<xsl:variable name="capabilities" select="/envelope/capabilities/help_response/schema"/>

<func:function name="gsa:may-op">
  <xsl:param name="name"/>
  <func:result select="boolean ($capabilities/command[gsa:lower-case (name) = gsa:lower-case ($name)])"/>
</func:function>

<func:function name="gsa:may-clone">
  <xsl:param name="type"/>
  <xsl:param name="owner" select="owner"/>
  <func:result select="gsa:may-op (concat ('create_', $type))"/>
</func:function>

<func:function name="gsa:may-get-trash">
  <func:result select="boolean ($capabilities/command[substring (gsa:lower-case (name), 1, 4) = 'get_' and gsa:lower-case (name) != 'get_version' and gsa:lower-case (name) != 'get_info' and gsa:lower-case (name) != 'get_nvts' and gsa:lower-case (name) != 'get_system_reports'  and gsa:lower-case (name) != 'get_settings'])"/>
</func:function>

<func:function name="gsa:build-levels">
  <xsl:param name="filters"></xsl:param>
  <func:result>
    <xsl:for-each select="$filters/filter">
      <xsl:choose>
        <xsl:when test="text()='High'">h</xsl:when>
        <xsl:when test="text()='Medium'">m</xsl:when>
        <xsl:when test="text()='Low'">l</xsl:when>
        <xsl:when test="text()='Log'">g</xsl:when>
        <xsl:when test="text()='False Positive'">f</xsl:when>
      </xsl:choose>
    </xsl:for-each>
  </func:result>
</func:function>

<func:function name="gsa:build-filter">
  <xsl:param name="filters"></xsl:param>
  <xsl:param name="replace"></xsl:param>
  <xsl:param name="with"></xsl:param>

  <func:result>
    <xsl:for-each select="$filters/keywords/keyword">
      <xsl:choose>
        <xsl:when test="column = $replace">
          <xsl:value-of select="$with"/>
          <xsl:text> </xsl:text>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="column"/>
          <xsl:value-of select="relation"/>
          <xsl:value-of select="value"/>
          <xsl:text> </xsl:text>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:for-each>
  </func:result>
</func:function>

<func:function name="gsa:join">
  <xsl:param name="nodes"/>
  <func:result>
    <xsl:for-each select="$nodes">
      <xsl:value-of select="name"/>
      <xsl:text> </xsl:text>
    </xsl:for-each>
  </func:result>
</func:function>

<func:function name="gsa:build-css-classes">
  <xsl:param name="prefix"/>
  <xsl:param name="nodes"/>

  <xsl:variable name="classes" select="exslt:node-set($nodes)/classes"/>

  <func:result>
    <xsl:for-each select="$classes/class">
      <xsl:value-of select="$prefix"/><xsl:value-of select="."/><xsl:text> </xsl:text>
    </xsl:for-each>
  </func:result>
</func:function>

<func:function name="gsa:actions-width">
  <xsl:param name="icon-count"/>
  <func:result select="15 + ($icon-count * $icon-width)"/>
</func:function>

<func:function name="gsa:token">
  <xsl:choose>
    <xsl:when test="string-length (/envelope/params/debug) = 0">
      <func:result select="concat ('&amp;token=', /envelope/token)"/>
    </xsl:when>
    <xsl:otherwise>
      <func:result select="concat ('&amp;token=', /envelope/token, '&amp;debug=', /envelope/params/debug)"/>
    </xsl:otherwise>
  </xsl:choose>
</func:function>

<func:function name="gsa:capitalise">
  <xsl:param name="string"/>
  <func:result select="concat (gsa:upper-case (substring ($string, 1, 1)), substring ($string, 2))"/>
</func:function>

<func:function name="gsa:lower-case">
  <xsl:param name="string"/>
  <func:result select="translate($string, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')"/>
</func:function>

<func:function name="gsa:upper-case">
  <xsl:param name="string"/>
  <func:result select="translate($string, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
</func:function>

<func:function name="gsa:escape-js">
  <xsl:param name="string"/>
  <xsl:variable name='apos'>'</xsl:variable>
  <!-- Escape as XML entities where applicable -->
  <func:result select="str:replace (str:replace (str:replace (str:replace (str:replace (str:replace (
                       $string, '&amp;', '&amp;amp;'), '\', '\x2F'), '&quot;', '&amp;quot;'), $apos, '&amp;apos;'), '&lt;', '&amp;lt;'), '&gt;', '&amp;gt;')"/>
</func:function>

<func:function name="gsa:date-tz">
  <xsl:param name="time"></xsl:param>
  <func:result>
    <!-- 2013-03-26T13:15:00-04:00 -->
    <!-- 2013-03-26T13:15:00Z -->
    <!-- 2013-03-26T13:15:00+04:00 -->
    <xsl:variable name="length" select="string-length ($time)"/>
    <xsl:if test="$length &gt; 0">
      <xsl:choose>
        <xsl:when test="substring ($time, $length) = 'Z'">
          <xsl:value-of select="'UTC'"/>
        </xsl:when>
        <xsl:when test="contains ('+-', substring ($time, $length - 5, 1)) and (substring ($time, $length - 2, 1) = ':')">
          <xsl:value-of select="substring ($time, $length - 5)"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="'ERROR'"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:if>
  </func:result>
</func:function>

<func:function name="gsa:long-time-tz">
  <xsl:param name="time"></xsl:param>
  <func:result>
    <xsl:if test="string-length ($time) &gt; 0">
      <xsl:value-of select="concat (date:day-abbreviation ($time), ' ', date:month-abbreviation ($time), ' ', date:day-in-month ($time), ' ', format-number(date:hour-in-day($time), '00'), ':', format-number(date:minute-in-hour($time), '00'), ':', format-number(date:second-in-minute($time), '00'), ' ', date:year($time), ' ', gsa:date-tz($time))"/>
    </xsl:if>
  </func:result>
</func:function>

<func:function name="gsa:long-time">
  <xsl:param name="time"></xsl:param>
  <func:result>
    <xsl:if test="string-length ($time) &gt; 0">
      <xsl:value-of select="concat (date:day-abbreviation ($time), ' ', date:month-abbreviation ($time), ' ', date:day-in-month ($time), ' ', format-number(date:hour-in-day($time), '00'), ':', format-number(date:minute-in-hour($time), '00'), ':', format-number(date:second-in-minute($time), '00'), ' ', date:year($time))"/>
    </xsl:if>
  </func:result>
</func:function>

<func:function name="gsa:date">
  <xsl:param name="datetime"></xsl:param>
  <func:result>
    <xsl:if test="string-length ($datetime) &gt; 0">
      <xsl:value-of select="concat (date:day-abbreviation ($datetime), ' ', date:month-abbreviation ($datetime), ' ', date:day-in-month ($datetime), ' ', date:year($datetime))"/>
    </xsl:if>
  </func:result>
</func:function>

<func:function name="gsa:type-many">
  <xsl:param name="type"></xsl:param>
  <func:result>
    <xsl:choose>
      <xsl:when test="$type = 'info' or $type = 'allinfo'">
        <xsl:value-of select="$type"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$type"/><xsl:text>s</xsl:text>
      </xsl:otherwise>
    </xsl:choose>
  </func:result>
</func:function>

<func:function name="gsa:html-attribute-quote">
  <xsl:param name="text"/>
  <func:result>
    <xsl:value-of select="translate ($text, '&quot;', '&amp;quot;')"/>
  </func:result>
</func:function>

<!-- This is only safe for HTML attributes. -->
<func:function name="gsa:param-or">
  <xsl:param name="name"/>
  <xsl:param name="alternative"/>
  <xsl:choose>
    <xsl:when test="/envelope/params/node()[name()=$name]">
      <func:result>
        <xsl:value-of select="gsa:html-attribute-quote (/envelope/params/node()[name()=$name])"/>
      </func:result>
    </xsl:when>
    <xsl:when test="/envelope/params/_param[name=$name]">
      <func:result>
        <xsl:value-of select="gsa:html-attribute-quote (/envelope/params/_param[name=$name]/value)"/>
      </func:result>
    </xsl:when>
    <xsl:otherwise>
      <func:result>
        <xsl:value-of select="$alternative"/>
      </func:result>
    </xsl:otherwise>
  </xsl:choose>
</func:function>

<func:function name="gsa:get-nvt-tag">
    <xsl:param name="tags"/>
    <xsl:param name="name"/>
  <xsl:variable name="after">
    <xsl:value-of select="substring-after (nvt/tags, concat ($name, '='))"/>
  </xsl:variable>
  <xsl:choose>
      <xsl:when test="contains ($after, '|')">
        <func:result select="substring-before ($after, '|')"/>
      </xsl:when>
      <xsl:otherwise>
        <func:result select="$after"/>
      </xsl:otherwise>
  </xsl:choose>
</func:function>

<func:function name="gsa:cvss-risk-factor">
  <xsl:param name="cvss_score"/>
  <xsl:variable name="type" select="/envelope/severity"/>
  <xsl:variable name="threat">
    <xsl:choose>
      <xsl:when test="$type = 'classic'">
        <xsl:choose>
          <xsl:when test="$cvss_score = 0.0">Log</xsl:when>
          <xsl:when test="$cvss_score &gt;= 0.1 and $cvss_score &lt;= 2.0">Low</xsl:when>
          <xsl:when test="$cvss_score &gt;= 2.1 and $cvss_score &lt;= 5.0">Medium</xsl:when>
          <xsl:when test="$cvss_score &gt;= 5.1 and $cvss_score &lt;= 8.0">High</xsl:when>
          <xsl:when test="$cvss_score &gt;= 8.1 and $cvss_score &lt;= 10.0">High</xsl:when>
          <xsl:otherwise>None</xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$type = 'pci-dss'">
        <xsl:choose>
          <xsl:when test="$cvss_score &gt;= 0.0 and $cvss_score &lt; 4.0">Log</xsl:when>
          <xsl:when test="$cvss_score &gt;= 4.0">High</xsl:when>
          <xsl:otherwise>None</xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <!-- Default to nist/bsi -->
      <xsl:otherwise>
        <xsl:choose>
          <xsl:when test="$cvss_score = 0.0">Log</xsl:when>
          <xsl:when test="$cvss_score &gt;= 0.1 and $cvss_score &lt;= 3.9">Low</xsl:when>
          <xsl:when test="$cvss_score &gt;= 4.0 and $cvss_score &lt;= 6.9">Medium</xsl:when>
          <xsl:when test="$cvss_score &gt;= 7.0 and $cvss_score &lt;= 10.0">High</xsl:when>
          <xsl:otherwise>None</xsl:otherwise>
        </xsl:choose>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <func:result select="$threat"/>
</func:function>

<func:function name="gsa:result-cvss-risk-factor">
  <xsl:param name="cvss_score"/>
  <xsl:variable name="threat">
    <xsl:choose>
      <xsl:when test="$cvss_score &gt; 0.0">
        <xsl:value-of select="gsa:cvss-risk-factor($cvss_score)"/>
      </xsl:when>
      <xsl:when test="$cvss_score = 0.0">Log</xsl:when>
      <xsl:when test="$cvss_score = -1.0">False Positive</xsl:when>
      <xsl:when test="$cvss_score = -2.0">Debug</xsl:when>
      <xsl:when test="$cvss_score = -3.0">Error</xsl:when>
      <xsl:otherwise>N/A</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <func:result select="$threat"/>
</func:function>

<func:function name="gsa:risk-factor-max-cvss">
  <xsl:param name="threat"/>
  <xsl:param name="type"><xsl:value-of select="/envelope/severity"/></xsl:param>
  <xsl:variable name="cvss">
    <xsl:choose>
      <xsl:when test="$type = 'classic'">
        <xsl:choose>
          <xsl:when test="gsa:lower-case($threat) = 'none' or gsa:lower-case($threat) = 'log'">0.0</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'low'">2.0</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'medium'">5.0</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'high'">10.0</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'critical'">10.0</xsl:when>
          <xsl:otherwise>0.0</xsl:otherwise>
        </xsl:choose>
      </xsl:when>

      <xsl:when test="$type = 'pci-dss'">
        <xsl:choose>
          <xsl:when test="gsa:lower-case($threat) = 'none' or gsa:lower-case($threat) = 'log'">3.9</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'low'">3.9</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'medium'">3.9</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'high'">10.0</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'critical'">10.0</xsl:when>
          <xsl:otherwise>0.0</xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <!-- Default to nist/bsi -->
      <xsl:otherwise>
        <xsl:choose>
          <xsl:when test="gsa:lower-case($threat) = 'none' or gsa:lower-case($threat) = 'log'">0.0</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'low'">3.9</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'medium'">6.9</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'high'">10.0</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'critical'">10.0</xsl:when>
          <xsl:otherwise>0.0</xsl:otherwise>
        </xsl:choose>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <func:result select="$cvss"/>
</func:function>

<func:function name="gsa:risk-factor-min-cvss">
  <xsl:param name="threat"/>
  <xsl:param name="type"><xsl:value-of select="/envelope/severity"/></xsl:param>
  <xsl:variable name="cvss">
    <xsl:choose>
      <xsl:when test="$type = 'classic'">
        <xsl:choose>
          <xsl:when test="gsa:lower-case($threat) = 'none' or gsa:lower-case($threat) = 'log'">0.0</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'low'">0.1</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'medium'">2.1</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'high'">5.1</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'critical'">10.0</xsl:when>
          <xsl:otherwise>0.0</xsl:otherwise>
        </xsl:choose>
      </xsl:when>

      <xsl:when test="$type = 'pci-dss'">
        <xsl:choose>
          <xsl:when test="gsa:lower-case($threat) = 'none' or gsa:lower-case($threat) = 'none'">0.0</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'low'">3.9</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'medium'">3.9</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'high'">4.0</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'critical'">10.0</xsl:when>
          <xsl:otherwise>0.0</xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <!-- Default to nist/bsi -->
      <xsl:otherwise>
        <xsl:choose>
          <xsl:when test="gsa:lower-case($threat) = 'none' or gsa:lower-case($threat) = 'log'">0.0</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'low'">0.1</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'medium'">4.0</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'high'">7.0</xsl:when>
          <xsl:when test="gsa:lower-case($threat) = 'critical'">10.0</xsl:when>
          <xsl:otherwise>0.0</xsl:otherwise>
        </xsl:choose>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <func:result select="$cvss"/>
</func:function>

<func:function name="gsa:threat-color">
  <xsl:param name="threat"/>
  <xsl:variable name="color">
    <xsl:choose>
      <xsl:when test="gsa:lower-case($threat) = 'high'">red</xsl:when>
      <xsl:when test="gsa:lower-case($threat) = 'medium'">orange</xsl:when>
      <xsl:when test="gsa:lower-case($threat) = 'low'">lightskyblue</xsl:when>
      <xsl:when test="gsa:lower-case($threat) = 'none' or gsa:lower-case($threat) = 'log'">silver</xsl:when>
      <xsl:otherwise></xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <func:result select="$color"/>
</func:function>

<func:function name="gsa:column-filter-name">
  <xsl:param name="type"/>
  <func:result select="str:replace (str:replace (gsa:lower-case ($type), '&#xa0;', '_'), ' ', '_')"/>
</func:function>

<func:function name="gsa:type-string">
  <xsl:param name="type"/>
  <func:result select="str:replace (gsa:lower-case ($type), ' ', '_')"/>
</func:function>

<func:function name="gsa:command-type-plural">
  <xsl:param name="command"/>
  <xsl:variable name="type"
                select="gsa:command-type ($command)"/>
  <xsl:choose>
    <xsl:when test="$type = 'NVT family'">
      <func:result select="'NVT families'"/>
    </xsl:when>
    <xsl:otherwise>
      <func:result select="concat ($type, 's')"/>
    </xsl:otherwise>
  </xsl:choose>
</func:function>

<func:function name="gsa:command-type">
  <xsl:param name="command"/>
  <xsl:variable name="after"
                select="substring-after (str:replace (gsa:lower-case ($command), '_', ' '), ' ')"/>
  <xsl:variable name="type">
    <xsl:choose>
      <xsl:when test="substring ($after, string-length ($after)) = 's'">
        <xsl:value-of select="substring ($after, 1, string-length ($after) - 1)"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$after"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:choose>
    <xsl:when test="$type = 'lsc credential'">
      <func:result select="'credential'"/>
    </xsl:when>
    <xsl:when test="$type = 'config'">
      <func:result select="'scan config'"/>
    </xsl:when>
    <xsl:when test="$type = 'nvt'">
      <func:result select="'NVT'"/>
    </xsl:when>
    <xsl:when test="$type = 'nvt familie'">
      <func:result select="'NVT family'"/>
    </xsl:when>
    <xsl:otherwise>
      <func:result select="$type"/>
    </xsl:otherwise>
  </xsl:choose>
</func:function>

<func:function name="gsa:join-capital">
  <xsl:param name="nodes"/>
  <func:result>
    <xsl:for-each select="$nodes">
      <xsl:value-of select="gsa:capitalise (text ())"/>
      <xsl:if test="position() != last()">
        <xsl:text> </xsl:text>
      </xsl:if>
    </xsl:for-each>
  </func:result>
</func:function>

<func:function name="gsa:command-type-label">
  <xsl:param name="command"/>
  <func:result select="gsa:capitalise (gsa:command-type ($command))"/>
</func:function>

<func:function name="gsa:type-name">
  <xsl:param name="type"/>
  <xsl:choose>
    <xsl:when test="$type = 'nvt' or $type = 'cve' or $type = 'cpe'">
      <func:result select="gsa:upper-case ($type)"/>
    </xsl:when>
    <xsl:when test="$type = 'os'">
      <func:result select="'Operating System'"/>
    </xsl:when>
    <xsl:when test="$type = 'ovaldef'">
      <func:result select="'OVAL Definition'"/>
    </xsl:when>
    <xsl:when test="$type = 'vuln'">
      <func:result select="'Vulnerability'"/>
    </xsl:when>
    <xsl:when test="$type = 'cert_bund_adv'">
      <func:result select="'CERT-Bund Advisory'"/>
    </xsl:when>
    <xsl:when test="$type = 'dfn_cert_adv'">
      <func:result select="'DFN-CERT Advisory'"/>
    </xsl:when>
    <xsl:when test="$type = 'allinfo'">
      <func:result select="'All SecInfo'"/>
    </xsl:when>
    <xsl:otherwise>
      <func:result select="gsa:join-capital (str:split ($type, '_'))"/>
    </xsl:otherwise>
  </xsl:choose>
</func:function>

<func:function name="gsa:type-name-plural">
  <xsl:param name="type"/>
  <xsl:choose>
    <xsl:when test="$type = 'vuln'">
      <func:result select="'Vulnerabilities'"/>
    </xsl:when>
    <xsl:when test="$type = 'cert_bund_adv'">
      <func:result select="'CERT-Bund Advisories'"/>
    </xsl:when>
    <xsl:when test="$type = 'dfn_cert_adv'">
      <func:result select="'DFN-CERT Advisories'"/>
    </xsl:when>
    <xsl:when test="$type = 'allinfo'">
      <func:result select="'All SecInfo'"/>
    </xsl:when>
    <xsl:otherwise>
      <func:result select="concat(gsa:type-name ($type), 's')"/>
    </xsl:otherwise>
  </xsl:choose>
</func:function>

<func:function name="gsa:field-name">
  <xsl:param name="field"/>
  <xsl:choose>
    <xsl:when test="$field = 'created'">
      <func:result select="'creation time'"/>
    </xsl:when>
    <xsl:when test="$field = 'modified'">
      <func:result select="'modification time'"/>
    </xsl:when>
    <xsl:when test="$field = 'qod'">
      <func:result select="'QoD'"/>
    </xsl:when>
    <xsl:when test="$field = 'qod_type'">
      <func:result select="'QoD type'"/>
    </xsl:when>
    <xsl:otherwise>
      <func:result select="translate ($field, '_', ' ')"/>
    </xsl:otherwise>
  </xsl:choose>
</func:function>

<func:function name="gsa:alert-in-trash">
  <xsl:for-each select="alert">
    <xsl:if test="trash/text() != '0'">
      <func:result>1</func:result>
    </xsl:if>
  </xsl:for-each>
  <func:result>0</func:result>
</func:function>

<func:function name="gsa:table-row-class">
  <xsl:param name="position"/>
  <func:result>
    <xsl:choose>
      <xsl:when test="$position &lt; 0"></xsl:when>
      <xsl:when test="$position mod 2 = 0">even</xsl:when>
      <xsl:otherwise>odd</xsl:otherwise>
    </xsl:choose>
  </func:result>
</func:function>

<func:function name="gsa:date-diff-text">
  <xsl:param name="difference"/>

  <xsl:variable name="fromepoch"
                select="date:add ('1970-01-01T00:00:00Z', $difference)"/>
  <xsl:variable name="seconds"
                select="date:second-in-minute($fromepoch)"/>
  <xsl:variable name="minutes"
                select="date:minute-in-hour($fromepoch)"/>
  <xsl:variable name="hours"
                select="date:hour-in-day($fromepoch)"/>
  <xsl:variable name="days"
                select="date:day-in-year($fromepoch) - 1"/>

  <func:result>
      <xsl:if test="$days">
          <xsl:value-of select="concat (gsa-i18n:strformat (gsa:n-i18n ('%1 day', '%1 days', $days, ''), $days), ' ')"/>
      </xsl:if>
      <xsl:if test="$hours">
          <xsl:value-of select="concat (gsa-i18n:strformat (gsa:n-i18n ('%1 hour', '%1 hours', $hours, ''), $hours), ' ')"/>
      </xsl:if>
      <xsl:if test="$minutes">
          <xsl:value-of select="concat (gsa-i18n:strformat (gsa:n-i18n ('%1 minute', '%1 minutes', $minutes, ''), $minutes), ' ')"/>
      </xsl:if>
      <xsl:if test="$seconds">
          <xsl:value-of select="concat (gsa-i18n:strformat (gsa:n-i18n ('%1 second', '%1 seconds', $seconds, ''), $seconds), ' ')"/>
      </xsl:if>
  </func:result>
</func:function>

<func:function name="gsa:date-diff">
  <xsl:param name="start"/>
  <xsl:param name="end"/>

  <xsl:variable name="difference" select="date:difference ($start, $end)"/>
  <func:result>
    <xsl:value-of select="gsa:date-diff-text ($difference)"/>
  </func:result>
</func:function>

<func:function name="gsa:report-host-has-os">
  <xsl:param name="report"/>
  <xsl:param name="ip"/>
  <xsl:param name="os"/>
  <func:result>
    <xsl:choose>
      <xsl:when test="$report/host[ip = $ip and detail/name = 'best_os_cpe' and detail/value = $os]">1</xsl:when>
      <xsl:otherwise>0</xsl:otherwise>
    </xsl:choose>
  </func:result>
</func:function>

<func:function name="gsa:host-has-unknown-os">
  <xsl:param name="report"/>
  <xsl:param name="ip"/>
  <func:result>
    <xsl:choose>
      <xsl:when test="$report/host[ip = $ip and ((detail/name = 'best_os_cpe') = 0)]">1</xsl:when>
      <xsl:otherwise>0</xsl:otherwise>
    </xsl:choose>
  </func:result>
</func:function>

<func:function name="gsa:report-section-title">
  <xsl:param name="section"/>
  <xsl:param name="type"/>
  <func:result>
    <xsl:choose>
      <xsl:when test="$section = 'results' and $type = 'delta'"><xsl:value-of select="gsa:i18n ('Report: Delta Results')"/></xsl:when>
      <xsl:when test="$section = 'results'"><xsl:value-of select="gsa:i18n ('Report: Results')"/></xsl:when>
      <xsl:when test="$section = 'summary' and $type = 'delta'"><xsl:value-of select="gsa:i18n ('Report: Delta Summary and Download')"/></xsl:when>
      <xsl:when test="$section = 'summary'"><xsl:value-of select="gsa:i18n ('Report: Summary and Download')"/></xsl:when>
      <xsl:when test="$section = 'hosts'"><xsl:value-of select="gsa:i18n ('Report: Hosts')"/></xsl:when>
      <xsl:when test="$section = 'ports'"><xsl:value-of select="gsa:i18n ('Report: Ports')"/></xsl:when>
      <xsl:when test="$section = 'os'"><xsl:value-of select="gsa:i18n ('Report: Operating Systems')"/></xsl:when>
      <xsl:when test="$section = 'apps'"><xsl:value-of select="gsa:i18n ('Report: Applications')"/></xsl:when>
      <xsl:when test="$section = 'cves'"><xsl:value-of select="gsa:i18n ('Report: CVEs')"/></xsl:when>
      <xsl:when test="$section = 'closed_cves'"><xsl:value-of select="gsa:i18n ('Report: Closed CVEs')"/></xsl:when>
      <xsl:when test="$section = 'topology'"><xsl:value-of select="gsa:i18n ('Report: Topology')"/></xsl:when>
      <xsl:when test="$section = 'ssl_certs'"><xsl:value-of select="gsa:i18n ('Report: SSL Certificates')"/></xsl:when>
      <xsl:when test="$section = 'errors'"><xsl:value-of select="gsa:i18n ('Report: Error Messages')"/></xsl:when>
    </xsl:choose>
  </func:result>
</func:function>

<func:function name="gsa:has-long-word">
  <xsl:param name="string"/>
  <xsl:param name="max" select="44"/>
  <func:result select="count (str:split ($string, ' ')[string-length (.) &gt; $max]) &gt; 0"/>
</func:function>

<func:function name="gsa:permission-description">
  <xsl:param name="name"/>
  <xsl:param name="resource"/>
  <xsl:variable name="lower" select="gsa:lower-case ($name)"/>
  <xsl:variable name="has-resource" select="boolean ($resource) and string-length ($resource/type) &gt; 0"/>
  <func:result>
    <xsl:choose>
      <xsl:when test="$has-resource and $lower = 'super'">
        <xsl:value-of select="gsa:i18n ('has super access to ')"/>
        <xsl:value-of select="gsa:i18n (gsa:command-type ($lower), 'Type Lower')"/>
        <xsl:text> </xsl:text>
        <xsl:value-of select="$resource/type"/>
        <xsl:text> </xsl:text>
        <xsl:value-of select="$resource/name"/>
      </xsl:when>
      <xsl:when test="$lower = 'super'">
        <xsl:value-of select="gsa:i18n ('has super access to all users')"/>
      </xsl:when>
      <xsl:when test="$lower = 'authenticate'">
        <xsl:value-of select="gsa:i18n ('may login')"/>
      </xsl:when>
      <xsl:when test="$lower = 'commands'">
        <xsl:value-of select="gsa:i18n ('may run multiple GMP commands in one')"/>
      </xsl:when>
      <xsl:when test="$lower = 'everything'">
        <xsl:value-of select="gsa:i18n ('has all permissions')"/>
      </xsl:when>
      <xsl:when test="$lower = 'empty_trashcan'">
        <xsl:value-of select="gsa:i18n ('may empty the trashcan')"/>
      </xsl:when>
      <xsl:when test="$lower = 'get_dependencies'">
        <xsl:value-of select="gsa:i18n ('may get the dependencies of NVTs')"/>
      </xsl:when>
      <xsl:when test="$lower = 'get_version'">
        <xsl:value-of select="gsa:i18n ('may get version information')"/>
      </xsl:when>
      <xsl:when test="$lower = 'help'">
        <xsl:value-of select="gsa:i18n ('may get the help text')"/>
      </xsl:when>
      <xsl:when test="$lower = 'modify_auth'">
        <xsl:value-of select="gsa:i18n ('has write access to the authentication configuration')"/>
      </xsl:when>
      <xsl:when test="$lower = 'restore'">
        <xsl:value-of select="gsa:i18n ('may restore items from the trashcan')"/>
      </xsl:when>
      <!-- i18n with concat : see dynamic_strings.xsl - permission-descriptions -->
      <xsl:when test="substring-before ($lower, '_') = 'create'">
        <xsl:value-of select="gsa:i18n (concat ('may create a new ', gsa:command-type ($lower)))"/>
      </xsl:when>
      <xsl:when test="$lower = 'get_info'">
        <xsl:value-of select="gsa:i18n ('has read access to SecInfo')"/>
      </xsl:when>
      <xsl:when test="$has-resource and substring-before ($lower, '_') = 'delete'">
        <xsl:value-of select="gsa-i18n:strformat (gsa:i18n (concat ('may delete ', gsa:command-type ($lower), ' %1')), $resource/name)"/>
      </xsl:when>
      <xsl:when test="substring-before ($lower, '_') = 'delete'">
        <xsl:value-of select="gsa:i18n (concat ('may delete an existing ', gsa:command-type ($lower)))"/>
      </xsl:when>
      <xsl:when test="$has-resource and substring-before ($lower, '_') = 'get'">
        <xsl:value-of select="gsa-i18n:strformat (gsa:i18n (concat ('has read access to ', gsa:command-type ($lower), ' %1')), $resource/name)"/>
      </xsl:when>
      <xsl:when test="substring-before ($lower, '_') = 'get'">
        <xsl:value-of select="gsa:i18n (concat ('has read access to ', gsa:command-type-plural ($lower)))"/>
      </xsl:when>
      <xsl:when test="$has-resource and substring-before ($lower, '_') = 'modify'">
        <xsl:value-of select="gsa-i18n:strformat (gsa:i18n (concat ('has write access to ', gsa:command-type ($lower), ' %1')), $resource/name)"/>
      </xsl:when>
      <xsl:when test="substring-before ($lower, '_') = 'modify'">
        <xsl:value-of select="gsa:i18n (concat ('has write access to ', gsa:command-type-plural ($lower)))"/>
      </xsl:when>

      <xsl:when test="substring-before ($lower, '_') = 'describe'">
        <xsl:variable name="described" select="substring-after ($lower, '_')"/>
        <xsl:variable name="text">
          <xsl:choose>
            <xsl:when test="$described = 'auth'">
              <xsl:value-of select="gsa:i18n ('may get details about the authentication configuration')"/>
            </xsl:when>
            <xsl:otherwise>
              <!-- This should only be a fallback for unexpected output -->
              <xsl:value-of select="gsa-i18n:strformat (gsa:i18n ('may get details about %1') , $described)"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <xsl:value-of select="$text"/>
      </xsl:when>

      <xsl:when test="substring-before ($lower, '_') = 'sync'">
        <xsl:variable name="to_sync" select="substring-after ($lower, '_')"/>
        <xsl:variable name="text">
          <xsl:choose>
            <xsl:when test="$to_sync = 'cert'">
              <xsl:value-of select="gsa:i18n ('may sync the CERT feed')"/>
            </xsl:when>
            <xsl:when test="$to_sync = 'feed'">
              <xsl:value-of select="gsa:i18n ('may sync the NVT feed')"/>
            </xsl:when>
            <xsl:when test="$to_sync = 'scap'">
              <xsl:value-of select="gsa:i18n ('may sync the SCAP feed')"/>
            </xsl:when>
            <xsl:otherwise>
              <!-- This should only be a fallback for unexpected output -->
              <xsl:value-of select="gsa-i18n:strformat (gsa:i18n ('may sync %1'), $to_sync)"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <xsl:value-of select="$text"/>
      </xsl:when>

      <xsl:when test="contains ($lower, '_')">
        <!-- see dynamic_strings.xsl - permission-descriptions (verify_...) -->
        <xsl:value-of select="gsa:i18n (concat ('may ', substring-before ($lower, '_'), ' ', gsa:command-type-plural ($lower)))"/>
      </xsl:when>
      <xsl:otherwise><xsl:value-of select="$lower"/></xsl:otherwise>
    </xsl:choose>
  </func:result>
</func:function>

<func:function name="gsa:view_details_title">
  <xsl:param name="type"/>
  <xsl:param name="name"/>
  <xsl:variable name="cap_type" select="gsa:type-name($type)"/>
  <func:result>
    <!-- i18n with concat : see dynamic_strings.xsl - type-details-long -->
    <xsl:value-of select="gsa-i18n:strformat (gsa:i18n (concat ('View details of ', $cap_type, ' %1')), $name)"/>
  </func:result>
</func:function>

<func:function name="gsa:is_absolute_path">
  <xsl:param name="path"/>

  <xsl:variable name="first"
    select="substring ($path, 1, 1)"/>

  <xsl:choose>
    <xsl:when test="$first = '/'">
      <func:result select="true()"/>
    </xsl:when>
    <xsl:otherwise>
      <func:result select="false()"/>
    </xsl:otherwise>
  </xsl:choose>
</func:function>

<func:function name="gsa:column_is_extra">
  <xsl:param name="column"/>
  <xsl:choose>
    <xsl:when test="$column = 'apply_overrides' or $column = 'autofp' or $column = 'rows' or $column = 'first' or $column = 'sort' or $column = 'sort-reverse' or $column = 'notes' or $column = 'overrides' or $column = 'timezone' or $column = 'result_hosts_only' or $column = 'levels' or $column = 'min_qod' or $column = 'delta_states'">
      <func:result select="true()"/>
    </xsl:when>
    <xsl:otherwise>
      <func:result select="false()"/>
    </xsl:otherwise>
  </xsl:choose>
</func:function>

<!-- BEGIN GENERIC MANAGEMENT -->

<xsl:template match="gsad_msg">
  <xsl:call-template name="command_result_dialog">
    <xsl:with-param name="operation">
      <xsl:value-of select="@operation"/>
    </xsl:with-param>
    <xsl:with-param name="status">
      <xsl:value-of select="@status"/>
    </xsl:with-param>
    <xsl:with-param name="msg">
      <xsl:value-of select="@status_text"/>
    </xsl:with-param>
    <xsl:with-param name="details">
      <xsl:value-of select="text()"/>
    </xsl:with-param>
  </xsl:call-template>
</xsl:template>

<xsl:template match="commands_response">
  <xsl:apply-templates/>
</xsl:template>

<!-- BEGIN PROTOCOL DOC MANAGEMENT -->

<xsl:include href="omp-doc.xsl"/>

<xsl:template name="protocol">
  <div class="toolbar">
    <div class="small_inline_form" style="display: inline; font-weight: normal;">
      <form action="" method="get">
        <input type="hidden" name="token" value="{/envelope/token}"/>
        <input type="hidden" name="cmd" value="export_omp_doc"/>
        <select style="margin-bottom: 0px;" name="protocol_format" size="1">
          <option value="html" selected="1">HTML</option>
          <option value="rnc">RNC</option>
          <option value="xml">XML</option>
        </select>
        <input type="image"
          name="Download GMP documentation"
          src="/img/download.svg"
          class="icon icon-sm"
          alt="Download"/>
      </form>
    </div>
  </div>

  <div class="section-header">
    <h1>
      <a href="/omp?cmd=get_protocol_doc&amp;token={/envelope/token}"
         title="{gsa:i18n ('Help: GMP')}">
        <img class="icon icon-lg" src="/img/help.svg" alt="Help: GMP"/>
      </a>
      <xsl:value-of select="gsa:i18n ('Help: GMP')"/>
    </h1>
  </div>

  <div class="section-box">
    <div>
      <a href="/help/contents.html?token={/envelope/token}">Help Contents</a>i
    </div>
    <div style="text-align:left">
      <h1>GMP</h1>

      <xsl:if test="version">
        <p>Version: <xsl:value-of select="normalize-space(version)"/></p>
      </xsl:if>

      <xsl:if test="summary">
        <p><xsl:value-of select="normalize-space(summary)"/>.</p>
      </xsl:if>

      <h2 id="contents">Contents</h2>
      <ol>
        <li><a href="#type_summary">Summary of Data Types</a></li>
        <li><a href="#element_summary">Summary of Elements</a></li>
        <li><a href="#command_summary">Summary of Commands</a></li>
        <li><a href="#rnc_preamble">RNC Preamble</a></li>
        <li><a href="#type_details">Data Type Details</a></li>
        <li><a href="#element_details">Element Details</a></li>
        <li><a href="#command_details">Command Details</a></li>
        <li>
          <a href="#changes">
            Compatibility Changes in Version
            <xsl:value-of select="version"/>
          </a>
        </li>
      </ol>

      <xsl:call-template name="type-summary"/>
      <xsl:call-template name="element-summary"/>
      <xsl:call-template name="command-summary"/>
      <xsl:call-template name="rnc-preamble"/>
      <xsl:call-template name="type-details"/>
      <xsl:call-template name="element-details"/>
      <xsl:call-template name="command-details"/>
      <xsl:call-template name="changes"/>
    </div>
  </div>
</xsl:template>

<xsl:template match="get_protocol_doc">
  <xsl:apply-templates select="gsad_msg"/>
  <xsl:for-each select="help_response/schema/protocol">
    <xsl:call-template name="protocol"/>
  </xsl:for-each>
</xsl:template>

</xsl:stylesheet>
