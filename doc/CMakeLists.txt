# OpenVAS
# $Id$
# Description: CMakefile for the Greenbone Security Manager documentation
#
# Authors:
# Matthew Mundell <matt@mundell.ukfsn.org>
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

include (FindDoxygen)

if (NOT DOXYGEN_EXECUTABLE)
  message (FATAL_ERROR "Doxygen is required to build the HTML docs.")
endif (NOT DOXYGEN_EXECUTABLE)

## TODO make the doc target depend on all source and header files.

add_custom_target (doc COMMENT "Building documentation..."
                   DEPENDS Doxyfile .built-html)

add_custom_command (OUTPUT .built-html
                    COMMAND sh
					ARGS -c \"cd .. && ${DOXYGEN_EXECUTABLE} doc/Doxyfile && touch doc/.built-html\;\"
					DEPENDS Doxyfile
							../README)

add_custom_target (doc-full COMMENT "Building documentation..."
                   DEPENDS Doxyfile_full .built-html_full)

add_custom_command (OUTPUT .built-html
                    COMMAND sh
					ARGS -c \"cd .. && ${DOXYGEN_EXECUTABLE} doc/Doxyfile && touch doc/.built-html\;\"
					DEPENDS Doxyfile
							../README)

add_custom_command (OUTPUT .built-html_full
                    COMMAND sh
					ARGS -c \"cd .. && ${DOXYGEN_EXECUTABLE} doc/Doxyfile_full && touch doc/.built-html_full\;\"
					DEPENDS Doxyfile_full
							../README)


## Install

file (MAKE_DIRECTORY generated/)
