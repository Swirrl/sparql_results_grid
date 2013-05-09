(function ($) {

  function DataLoader(totalCount, pageSize) {

    var self = this;
    var pageSize = pageSize;
    var data = {length: 0}; // the data rows, which we'll fill in, plus an extra property for total length
    var sparqlQuery = null;
    var pagesToLoad = {};

    // events
    var onDataLoading = new Slick.Event();
    var onDataLoaded = new Slick.Event();

    function clear() {
      for (var key in data) {
        delete data[key];
      }
      data.length = totalCount;
    }

    // from and to are 0-based row indices.
    function ensureData(from, to, loaderFunction){

      console.log('Ensuring data for rows');
      console.log("from: " + from.toString() + " to: " + to.toString());

      data.length = totalCount;

      if (from < 0) {
        from = 0;
      }
      if (to > data.length-1) {
        to = data.length -1;
      }

      var fromPage = Math.floor(from / pageSize);
      var toPage = Math.floor(to / pageSize);

      for (var page = fromPage; page <= toPage; page++ ){
        if (pagesToLoad[page] == undefined) {
          pagesToLoad[page] = null;
        }
      }

      console.log(pagesToLoad);
      console.log('from page: ' + fromPage);
      console.log('to page: ' + toPage);

      // do a bunch of queries to get the data for the range.
      for (var page = fromPage; page <= toPage; page++ ){

        console.log("PAGE: " + page.toString());

        if (pagesToLoad[page] == null) {
          console.log('CALLING PAGE LOADER');
          loaderFunction.call(self, page);
        } else {
          console.log('PAGE ALREADY LOADED!!!');
        }
      }

      // tell the world we're trying to load.
      onDataLoading.notify({from: from, to: to});

    }

    // given a page index, and an array of row data, set the data for the page
    function setPageOfData(page, rows) {

      var noOfRows = rows.length;
      var thisPageFrom = page * pageSize;
      var thisPageTo = thisPageFrom + noOfRows -1;

      // fill the results in in data.
      for (var i = 0; i < noOfRows; i++) {

        // assign the row of results;
        data[thisPageFrom + i] = rows[i];

        // set row num (1-based)
        var rowNum = thisPageFrom + i + 1;
        data[thisPageFrom + i]["__row_num"] = rowNum;
      }

      onDataLoaded.notify({from: thisPageFrom, to: thisPageTo});
    }

    return {
      // properties
      "data": data,

      // methods
      "clear": clear,
      "ensureData": ensureData,
      "setPageOfData": setPageOfData,

      // events
      "onDataLoading": onDataLoading,
      "onDataLoaded": onDataLoaded,
    };
  }

  // Slick.Data.DataLoader
  $.extend(true, window, { Slick: { Data: { DataLoader: DataLoader }}});
})(jQuery);