var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var GoogleSpreadsheet = require("google-spreadsheet");
var moment = require("moment");
var async = require("async");

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

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
