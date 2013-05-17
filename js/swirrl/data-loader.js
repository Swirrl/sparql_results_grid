(function ($) {

  function DataLoader(totalCount, pageSize) {

    var self = this;
    var pageSize = pageSize;
    var data = {length: 0}; // the data rows, which we'll fill in, plus an extra property for total length
    var pagesToLoad = {};

    // events
    var onDataLoading = new Slick.Event();
    var onDataLoaded = new Slick.Event();
    var onPageLoading = new Slick.Event();
    var onPageLoaded = new Slick.Event();

    function clear() {
      for (var key in data) {
        delete data[key];
      }
      data.length = totalCount;
      pagesToLoad = {};
    }

    // from and to are 0-based row indices.
    function ensureData(from, to, loaderFunction){

      data.length = totalCount;

      if (from < 0) {
        from = 0;
      }
      if (to > data.length-1) {
        to = data.length -1;
      }

      // tell the world we're trying to load.
      onDataLoading.notify({from: from, to: to});

      var fromPage = Math.floor(from / pageSize);
      var toPage = Math.floor(to / pageSize);

      for (var page = fromPage; page <= toPage; page++ ){
        if (pagesToLoad[page] == undefined) {
          pagesToLoad[page] = null;
        }
      }

      // do a bunch of queries to get the data for the range.
      for (var page = fromPage; page <= toPage; page++ ){
        if (pagesToLoad[page] == null) {
          console.log('loading a page');
          onPageLoading.notify({page: page});
          loaderFunction.call(self, page);
        }
      }
    }

    // given a page index, and an array of row data, set the data for the page
    function setPageOfData(page, rows) {

      pagesToLoad[page] = true; // set the page as loaded.
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

      onPageLoaded.notify({page: page});
      onDataLoaded.notify({from: thisPageFrom, to: thisPageTo});
    }

    // public api.
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
      "onPageLoading": onPageLoading,
      "onPageLoaded": onPageLoaded
    };
  }

  // Swirrl.DataLoader
  $.extend(true, window, { Swirrl: { DataLoader: DataLoader }});
})(jQuery);