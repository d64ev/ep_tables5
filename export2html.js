
var DatatablesRendererExport = require('ep_tables5/static/js/datatables-renderer.js');

exports.getLineHTMLForExport = function (hook, context) {
  if (context.text.indexOf("data-tables") != -1) {
    var json = JSON.parse(context.text);
    if(json.tblProperties){
      console.log("tblProperties", json.tblProperties);
      context.lineContent = DatatablesRendererExport.DatatablesRenderer.render("export", context, null);      
    } else {
      var attribIndex = retrieveIndex(context.attribLine);
      if (attribIndex != null) {
        var dtAttrs = context.apool.numToAttrib[attribIndex][1];
        context.lineContent = DatatablesRendererExport.DatatablesRenderer.render("export", context, dtAttrs);
      }
    }
  }
  return true;
};

retrieveIndex = function (attribLine) {
  var arr_indices = {0 : 0, 1 : 1, 2 : 2, 3 : 3, 4 : 4, 5 : 5, 6 : 6, 7 : 7, 8 : 8, 9 : 9, 'a' : 10, 'b' : 11, 'c' : 12, 'd' : 13, 'e' : 14, 'f' : 15, 'g' : 16, 'h' : 17, 'i' : 18, 'j' : 19, 'k' : 20, 'l' : 21, 'm' : 22, 'n' : 23, 'o' : 24, 'p' : 25, 'q' : 26, 'r' : 27, 's' : 28, 't' : 29, 'u' : 30, 'v' : 31, 'w' : 32, 'x' : 33, 'y' : 34, 'z' : 35};
  var attribIndex = 0;
  attribLine = attribLine.split("*");
  var index = 1;
  if (attribLine.length >= 3) {
    index = 2;
  }
  attribLine = attribLine[index].split('+');
  attribLine = attribLine[0] + "";
  var attribLine = parseInt(attribLine[0], 36);
  return attribLine;
}
