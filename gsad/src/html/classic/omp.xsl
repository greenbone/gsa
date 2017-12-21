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

<!-- BEGIN XPATH FUNCTIONS -->

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

<func:function name="gsa:lower-case">
  <xsl:param name="string"/>
  <func:result select="translate($string, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')"/>
</func:function>


<func:function name="gsa:escape-js">
  <xsl:param name="string"/>
  <xsl:variable name='apos'>'</xsl:variable>
  <!-- Escape as XML entities where applicable -->
  <func:result select="str:replace (str:replace (str:replace (str:replace (str:replace (str:replace (
                       $string, '&amp;', '&amp;amp;'), '\', '\x2F'), '&quot;', '&amp;quot;'), $apos, '&amp;apos;'), '&lt;', '&amp;lt;'), '&gt;', '&amp;gt;')"/>
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
