var GoogleSpreadsheet = require("google-spreadsheet");
var moment = require("moment");
var async = require("async");

// ------------ Temporary Google Docs Part ---------------- //
var doc = new GoogleSpreadsheet("1LzkjED4csw64Lq6X3i1ogA1Vd3LGcxDXtNvjp-p93_o");
var sheet, currentRow;

async.series(
  [
    function setAuth(step) {
      var creds = require("./seungjinTimeManagemenet-0bf0d783115f.json");
      doc.useServiceAccountAuth(creds, step);
    },
    function getInfoAndWorksheets(step) {
      doc.getInfo((err, info) => {
        console.log("Loaded doc: " + info.title + " by " + info.author.email);
        sheet = info.worksheets[0];
        console.log(
          "sheet 1: " +
            sheet.title +
            " " +
            sheet.rowCount +
            "x" +
            sheet.colCount
        );
        step();
      });
    },
    function workingWithRows(step) {
      sheet.getRows(
        {
          offset: 1,
          limit: 500,
          orderby: "col2"
        },
        function(err, rows) {
          currentRow = rows.length;
          console.log("Read " + rows.length + " rows");
          rows[0].colname = "new val";
          rows[0].save(); // this is async
          step();
        }
      );
    },
    function workingWithCells(step) {
      sheet.getCells(
        {
          "min-row": currentRow + 1,
          "max-row": currentRow + 2,
          "return-empty": true
        },
        function(err, cells) {
          var cell = cells[0];
          console.log(
            "Cell R" + cell.row + "C" + cell.col + " = " + cell.value
          );

          var newCells = cells.length / 2;
          var formula = `=B` + `${currentRow + 1}`;

          cells[newCells].formula = formula;
          cells[newCells + 1].value = `${moment().format("YY-MM-DD hh:mm")}`;
          cells[newCells + 2].value = "몰라";
          sheet.bulkUpdateCells(cells); //async
          step();
        }
      );
    }
  ],
  function err(err) {
    if (err) {
      console.log("Error: " + err);
    }
  }
);

// ------------------- Google Docs part -------------------- //
