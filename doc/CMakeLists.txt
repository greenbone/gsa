# OpenVAS
# $Id$
# Description: CMakefile for the Greenbone Security Manager documentation
#
# Authors:
# Matthew Mundell <matthew.mundell@greenbone.net>
#
# Copyright:
# Copyright (C) 2009 Greenbone Networks GmbH
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Library General Public
# License as published by the Free Software Foundation; either
# version 2 of the License, or (at your option) any later version.
#
# This library is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# Library General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.

## build

set_directory_properties (PROPERTIES CLEAN_NO_CUSTOM true)
set_directory_properties (PROPERTIES ADDITIONAL_MAKE_CLEAN_FILES ".built-html;.built-html_full")

include (FindDoxygen)

if (NOT DOXYGEN_EXECUTABLE)
  message (STATUS "WARNING: Doxygen is required to build the HTML docs.")
else (NOT DOXYGEN_EXECUTABLE)
  add_custom_target (doc COMMENT "Building documentation..."
    DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/Doxyfile ${CMAKE_CURRENT_BINARY_DIR}/.built-html)

  add_custom_command (OUTPUT .built-html
    COMMAND sh
    ARGS -c \"${DOXYGEN_EXECUTABLE} ${CMAKE_CURRENT_BINARY_DIR}/Doxyfile && touch ${CMAKE_CURRENT_BINARY_DIR}/.built-html\;\"
    DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/Doxyfile)

  add_custom_target (doc-full COMMENT "Building documentation..."
    DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/Doxyfile_full ${CMAKE_CURRENT_BINARY_DIR}/.built-html_full)

  add_custom_command (OUTPUT .built-html_full
    COMMAND sh
    ARGS -c \"${DOXYGEN_EXECUTABLE} ${CMAKE_CURRENT_BINARY_DIR}/Doxyfile_full && touch ${CMAKE_CURRENT_BINARY_DIR}/.built-html_full\;\"
    DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/Doxyfile_full)
endif (NOT DOXYGEN_EXECUTABLE)

## Find xml2man

message (STATUS "Looking for xmltoman...")

find_program (XMLTOMAN_EXECUTABLE xmltoman
  PATHS /bin /usr/bin /usr/local/bin/
  DOC "xmltoman location")

message (STATUS "Looking for xmltoman... ${XMLTOMAN_EXECUTABLE}")

find_program (XMLMANTOHTML_EXECUTABLE xmlmantohtml
  PATHS /bin /usr/bin /usr/local/bin/
  DOC "xmlmantohtml location")

message (STATUS "Looking for xmlmantohtml... ${XMLMANTOHTML_EXECUTABLE}")

# FIX find_program seems to follow symlink
if (XMLMANTOHTML_EXECUTABLE)
  set (XMLMANTOHTML_EXECUTABLE xmlmantohtml)
endif (XMLMANTOHTML_EXECUTABLE)

if (XMLTOMAN_EXECUTABLE)
  add_custom_target (man COMMENT "Building manual page..."
    DEPENDS gsad.8)

  add_custom_command (OUTPUT gsad.8
    COMMAND sh
    ARGS -c \"${XMLTOMAN_EXECUTABLE} ${CMAKE_CURRENT_SOURCE_DIR}/gsad.8.xml > ${CMAKE_CURRENT_BINARY_DIR}/gsad.8\;\"
    DEPENDS gsad.8.xml)
else (XMLTOMAN_EXECUTABLE)
  message (STATUS "WARNING: xmltoman is required to generate manpage.")
  add_custom_command (OUTPUT gsad.8
    COMMAND echo "[Error: xmltoman required to see manpage here]" > ${CMAKE_CURRENT_BINARY_DIR}/gsad.8)
endif (XMLTOMAN_EXECUTABLE)

if (XMLMANTOHTML_EXECUTABLE)
  add_custom_target (man-html COMMENT "Building manual page HTML..."
    DEPENDS gsad.html)

  add_custom_command (OUTPUT gsad.html
    COMMAND sh
    ARGS -c \"${XMLMANTOHTML_EXECUTABLE} ${CMAKE_CURRENT_SOURCE_DIR}/gsad.8.xml > ${CMAKE_CURRENT_BINARY_DIR}/gsad.html\;\"
    DEPENDS gsad.8.xml)
else (XMLMANTOHTML_EXECUTABLE)
  message (STATUS "WARNING: xmlmantohtml is required for manpage in HTML docs.")
  add_custom_command (OUTPUT gsad.html
    COMMAND echo "[Error: xmlmantohtml required to see manpage here]" > gsad.html)
endif (XMLMANTOHTML_EXECUTABLE)


## Install

install (FILES gsad.8
  DESTINATION ${DATADIR}/man/man8 )

