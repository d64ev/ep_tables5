if (typeof (DatatablesRenderer) == 'undefined') var DatatablesRenderer = function () {
        var dRenderer = {
            render: function (context, element, attributes) {
                var renderer = new DatatablesRenderer.Renderer();
                // Strange behaviour from IE. 
                // It comes here 2 times per row, so I have to stop rendering a second time to avoid desctruction of the rendering
                // if (context != "timeslider" && element.innerHTML && element.innerHTML.indexOf("payload") != 2) { //console.log("DO NOTHING");
                //  return; }

                if (context == "timeslider") {
                    element.innerHTML = renderer.htmlspecialchars_decode(element.innerHTML);     
                } else if (context == "export") {
                  // For export, I need to send back the formatted text
                  return renderer.getHtml(element.text, attributes, context);
                }
                var str = renderer.preprocess(element.innerHTML);
                element.innerHTML = renderer.getHtml(str, attributes, context);
                
                var renderer = new DatatablesRenderer.Renderer();
            }
        }; // end of dRenderer
        dRenderer.Renderer = function () {
            //	
        };
        dRenderer.Renderer.prototype = {
            preprocess: function(innerHTML) {
            /*
                Move all of HTML tags(<span>) into payload array.
                Also replace any double quote(") with single quote(') within array to prevent JSON.parse error.
                (innerHTML will be sent to getHtml() to parse and define properties,
                after that, it will be sent to buildTabularData() to creat <table> tags.)
            */
            console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ preprocess;", innerHTML);
            var reg0 = /\[\["(.+)"\]\]/;
            var reg1 = /(^<.+?>){/;
            var reg2 = /}(<.+?>)$/;
            var reg3 = /author-a-\w+/;
            var reg4 = /<span class='author-a-\w+'>\s*<\/span>/g;
            var str = innerHTML.match(reg0);
            var head = innerHTML.match(reg1);
            var tail = innerHTML.match(reg2);
            var tblAuthor = innerHTML.match(reg3);
            var part;
            if (str == null){
                part = [];
            } else {
                part = str[1].split('","');
            }
            tblAuthor = "<span class='" + tblAuthor[0] + "'>";
            for(i in part){
            if(i == 0){
                part[i] = head[1] + part[i] + "</span>";
            } else if (i == part.length-1) {
                part[i] = tblAuthor + part[i] + tail[1];
            } else {
                part[i] = tblAuthor + part[i] + "</span>";
            }
            part[i] = part[i].replace(/"/g, "'");
            };
            part = '[["' + part.join('","') + '"]]';
            innerHTML = innerHTML.replace(reg0, part).replace(reg1, '{').replace(reg2, '}').replace(reg4, '');
            console.log("##################################### preprocess done;", innerHTML);
            return innerHTML;
            },
            createDefaultTblProperties: function (authors) {
                return {
                    borderWidth: "1",
                    cellAttrs: [],
                    width: "100",
                    rowAttrs: {},
                    colAttrs: [],
                    authors: {}
                };
            },
            buildTabularData: function (tblJSONObj, tblProperties, renderingContext) {
                var htmlTbl = "";
                var tblId = tblJSONObj.tblId;
                var tblClass = tblJSONObj.tblClass;
                var tdClass = tblJSONObj.tdClass;
                var trClass = tblJSONObj.trClass;
                var payload = tblJSONObj.payload;
          
                if (!tblProperties || tblProperties.length == 0) {
                    tblProperties = this.createDefaultTblProperties();
                }
                
                var isFirstRow = typeof (tblProperties) == 'undefined' || tblProperties == null || typeof (tblProperties.isFirstRow) == 'undefined'? false : tblProperties.isFirstRow;
                var rowAttrs = tblProperties.rowAttrs;
                var singleRowAttrs = rowAttrs.singleRowAttrs;
                var cellAttrs = tblProperties.cellAttrs;
                var colAttrs = tblProperties.colAttrs;
                var tblWidth = typeof (tblProperties) == 'undefined' || tblProperties == null ? "100" : tblProperties.width || "100";
                var tblHeight = typeof (tblProperties) == 'undefined' || tblProperties == null ? "15" : tblProperties.height || "15";
                var tblBorderWidth = typeof (tblProperties) == 'undefined' || tblProperties == null ? 0 : tblProperties.borderWidth || 0;
                var tblBorderColor = typeof (tblProperties) == 'undefined' || tblProperties == null ? "grey" : tblProperties.borderColor || "grey";
                var currRow = tblProperties.currRowAuthorIdx;
                var currCell = tblProperties.currCellAuthorIdx;
                var authors = tblProperties.authors;printViewTBlStyles
                var printViewTBlStyles = "table-layout:fixed !important;border-collapse:collapse!important;";
                if (renderingContext == "export") printViewTBlStyles += "margin-bottom: -17px;";
                var printViewTblTDStyles = "padding: 5px 7px;word-wrap: break-word!important;"
                var htmlTbl = "<table class='" + tblClass + "' style='" + printViewTBlStyles + "background-color:white;width:" + tblWidth + "%!important;height:" + tblHeight + "px!important;'><tbody>";
                var bordersBottom = "border-bottom:" + tblBorderWidth + "px solid " + tblBorderColor;
                var bordersTop = "border-top:" + tblBorderWidth + "px solid " + tblBorderColor;
                var rowVAlign = typeof (rowAttrs) == 'undefined' || rowAttrs == null ? "left" : rowAttrs.rowVAlign || "left";
                var rows = tblJSONObj.payload;
                var evenRowBgColor = typeof (rowAttrs) == 'undefined' || rowAttrs == null ? "#FFFFFF" : rowAttrs.evenBgColor || "#FFFFFF";
                var oddRowBgColor = typeof (rowAttrs) == 'undefined' || rowAttrs == null ? null : rowAttrs.oddBgColor || null;

                // the tables contains only one row, no need to do a FOR
                for (var j = 0, rl = rows.length; j < rl; j++) {
                    var tds = rows[j];
                    //console.log("draw table", tds, tblProperties);
                    var rowBgColor = oddRowBgColor;
                    if (!rowBgColor) {
                        rowBgColor = evenRowBgColor;
                    }
                    htmlTbl += "<tr style='vertical-align:" + rowVAlign + ";background-color:" + rowBgColor + "; " + bordersBottom + "!important;";
                    if (isFirstRow) htmlTbl += " " + bordersTop + "!important;";
                    htmlTbl += "' class='" + trClass + "'>";
                    var preHeader = j == 0 ? "{\"payload\":[[\"" : "";
                    htmlTbl += "<td class='regex-delete'  name='payload' class='hide-el overhead' style='display:none;'>" + preHeader + "</td>";
                    var singleRowAttr = typeof (singleRowAttrs) == 'undefined' || singleRowAttrs == null ? null : singleRowAttrs[j];
                    for (var i = 0, tl = tds.length; i < tl; i++) {
                        var cellAttr = typeof (cellAttrs[j]) == 'undefined' || cellAttrs[j] == null ? null : cellAttrs[j][i];
                        var cellStyles = this.getCellAttrs(singleRowAttr, cellAttr, colAttrs[i], authors, i, j);
                        
                        var borderTop = "";
                        if (tblBorderWidth == 0) {
                            borderTop = " border-top: 0px solid white !important;";
                        }
                        //col vAlign
                        var colVAlign = typeof (colAttrs[i]) == 'undefined' || colAttrs[i] == null ? "" : "align='" + colAttrs[i].colVAlign + "'" || "";
                        var quoteAndComma = "\",\"";
                        var cellDel = "";
                        var delimCell = "<td class='regex-delete' name='delimCell' id='" + "' class='hide-el overhead' style='display:none;'>" + quoteAndComma + "</td>";
                        var lastCellBorder = "";
                        if (i == tl - 1) {
                            delimCell = "";
                            lastCellBorder = "border-right:" + tblBorderWidth + "px solid " + tblBorderColor + "!important;";
                            quoteAndComma = "";
                        }
                        tds[i] = this.setLinks(tds[i]);
                        if (tds[i].indexOf('/r/n') != -1) {
                            cellsWithBr = "";
                            var tdText = tds[i].split('/r/n');
                            for (var k = 0; k < tdText.length; k++) {
                                if (k < tdText.length - 1) {
                                    cellsWithBr += tdText[k] + "<label value='tblBreak' class='hide-el' style='display:none;'>/r/n</label><label class='tblBreak' style='display:block;'></label>";
                                } else cellsWithBr += tdText[k];
                            }
                            htmlTbl += "<td  name='tData' " + colVAlign + " style='" + printViewTblTDStyles + cellStyles + " border-left:" + 
                            tblBorderWidth + "px solid " + tblBorderColor + ";" + borderTop + lastCellBorder + "' >" + cellsWithBr + 
                            "<br value='tblBreak'></td>" + delimCell;
                        } else {
                            htmlTbl += "<td name='tData' " + colVAlign + " style='" + printViewTblTDStyles + cellStyles + lastCellBorder + " border-left:" + tblBorderWidth + "px solid " + tblBorderColor + ";" + borderTop + "' >" + tds[i] + "" + "<br value='tblBreak'></td>" + delimCell
                        }
                    }
                    var bracketAndcomma = "\"]],\"tblId\":\"1\",\"tblClass\":\"data-tables\", \"tblProperties\":" + JSON.stringify(tblProperties) + "}";
                    htmlTbl += "<td class='regex-delete' name='bracketAndcomma' class=' hide-el overhead' style='display:none;'>" + bracketAndcomma + "</td>";
                    htmlTbl += "</tr>";
                }
                htmlTbl += "</tbody></table>";
                return htmlTbl;
            },
            getCellAttrs: function (singleRowAttr, cellAttr, colAttr, authors, cell, row) {
                var attrsJSO = {};
                var colWidth = typeof (colAttr) == 'undefined' || colAttr == null ? "" : colAttr.width || "";
                attrsJSO['width'] = colWidth + 'px';
                var cellBgColor = "";
                //row highlight
                if (typeof (singleRowAttr) != 'undefined' && singleRowAttr != null) {
                    var bgColor = singleRowAttr.bgColor;
                    if (typeof (bgColor) != 'undefined' && bgColor != null && bgColor != '#FFFFFF') {
                        cellBgColor = bgColor;
                    }
                }
                //col highlight
                if (typeof (colAttr) != 'undefined' && colAttr != null) {
                    var bgColor = colAttr.bgColor;
                    if (typeof (bgColor) != 'undefined' && bgColor != null && bgColor != '#FFFFFF') {
                        cellBgColor = bgColor;
                    }
                }
                cellBgColor = typeof (cellAttr) == 'undefined' || cellAttr == null ? cellBgColor : cellAttr.bgColor || cellBgColor;
                attrsJSO['background-color'] = cellBgColor;
                var cellHeight = typeof (cellAttr) == 'undefined' || cellAttr == null ? "" : cellAttr.height || "";
                attrsJSO['height'] = cellHeight + 'px';
                var cellVAlign = typeof (cellAttr) == 'undefined' || cellAttr == null ? "" : cellAttr.vAlign || "";
                attrsJSO['vertical-align'] = cellVAlign;
                var cellHAlign = typeof (cellAttr) == 'undefined' || cellAttr == null ? "" : cellAttr.hAlign || "";
                attrsJSO['text-align'] = cellHAlign;
                var cellFont = typeof (cellAttr) == 'undefined' || cellAttr == null ? "" : cellAttr.fontFamily || "";
                attrsJSO['font-family'] = cellFont;
                var cellFontSize = typeof (cellAttr) == 'undefined' || cellAttr == null ? "" : cellAttr.fontSize || "";
                attrsJSO['font-size'] = cellFontSize + 'px';
                var cellFontWeight = typeof (cellAttr) == 'undefined' || cellAttr == null || typeof (cellAttr.fontWeight) == 'undefined'? "" : cellAttr.fontWeight || "";
                attrsJSO['font-weight'] = cellFontWeight;
                var cellFontStyle = typeof (cellAttr) == 'undefined' || cellAttr == null || typeof (cellAttr.fontStyle) == 'undefined'? "" : cellAttr.fontStyle || "";
                attrsJSO['font-style'] = cellFontStyle;
                var cellTextDecoration = typeof (cellAttr) == 'undefined' || cellAttr == null || typeof (cellAttr.textDecoration) == 'undefined'? "" : cellAttr.textDecoration || "";
                attrsJSO['text-decoration'] = cellTextDecoration;
                var attrsString = "";
                for (var attrName in attrsJSO) {
                    if (attrName && attrsJSO[attrName] != "" && attrsJSO[attrName] != "NaNpx" && attrsJSO[attrName] != "px") attrsString += attrName + ":" + attrsJSO[attrName] + " !important;";
                }
                return attrsString;
            },
            htmlspecialchars_decode: function (string) {
              string = string.toString()
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&#0*39;/g, "'")
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&');

              return string;
            },
            setLinks: function (data) {
              data = data.replace(/(https?:\/\/[^\s]+)/ig, "<a href='\$1' target='blank'>\$1</a>");
              return data;
            },
            getHtml: function (code, attributes, renderingContext) {
                var JSONCode = "";
                var html = "";
                try {
                    JSONCode = JSON.parse(code);
                    tblProperties = JSONCode.tblProperties;
                    otherProps = attributes ? JSON.parse(attributes) : null;

                    if (tblProperties && attributes) {                        
                        tblProperties = Object.assign(tblProperties, otherProps);
                    }

                    if (!tblProperties && attributes) {
                        tblProperties = JSON.parse(attributes);
                    }
                    html = this.buildTabularData(JSONCode, tblProperties, renderingContext);
                } catch (error) {}
                return html;
            },
        };
        return dRenderer;
    }(); // end of anonymous function
// CommonJS
typeof (exports) != 'undefined' ? exports.DatatablesRenderer = DatatablesRenderer : null;
