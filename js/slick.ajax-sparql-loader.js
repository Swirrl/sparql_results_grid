(function ($) {

  // add object key couting for old browsers.
  if (!Object.keys) {
    Object.keys = function (obj) {
        var keys = [],
            k;
        for (k in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, k)) {
                keys.push(k);
            }
        }
        return keys;
    };
  }

  function AjaxSparqlLoader() {

    var PAGESIZE = 500;
    var SPARQLENDPOINT = 'http://opendatacommunities.org/sparql';
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
    }

    // from and to are 0-based row indices.
    function ensureData(from, to){

      console.log('Ensuring data for rows');
      console.log("from: " + from.toString() + " to: " + to.toString());

      // before getting the actual data, get the total count
      // TODO: make this a query
      var totalCount = 10000;
      data.length = totalCount;

      if (from < 0) {
        from = 0;
      }
      if (to > data.length-1) {
        to = data.length -1;
      }

      var fromPage = Math.floor(from / PAGESIZE);
      var toPage = Math.floor(to / PAGESIZE);

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

          console.log('CALLING AJAX!!');

          // our sparql pages are 1-based.
          var sparqlPage = page+1
          var url = SPARQLENDPOINT + ".json?query=" + encodeURIComponent(sparqlQuery) + "&page=" + (sparqlPage).toString() + "&per_page=" + PAGESIZE.toString();

          var req = $.ajax({
            dataType: 'json',
            url: url,
            callbackParameter: "callback",
            success: function(responseData, textStatus, jqXHR) {
              // take a copy of page, so we can use it in the async success closure.
              onSuccess(responseData, jqXHR);
            },
            error: function() {
              onError(fromPage, toPage);
            }
          });
          req.page = page; // ad a property onto teh jqXHR obj
        } else {
          console.log('PAGE ALREADY LOADED!!!');
        }
      }

      // tell the world we're trying to load.
      onDataLoading.notify({from: from, to: to});

    }

     function allPagesLoaded(){
      // if we find a missing one, return false.
      for(var page in pagesToLoad){
        if (pagesToLoad[page] != true){
          return false;
        }
      }

      // if we get to here, they're all loaded.
      return true;
    }

    function onSuccess(responseData, jqXHR) {
      var page = jqXHR.page;

      console.log('success for: ' + page.toString());

      var thisPageFrom = page * PAGESIZE;
      var results = responseData["results"]["bindings"];

      var noOfResults = results.length;
      var thisPageTo = thisPageFrom + noOfResults -1;

      // fill the results in in data.
      for (var i = 0; i < noOfResults; i++) {

        // extract just the values of the results (i.e. don't care about uri/literal field)
        var resultsRow = {};
        for (var col in results[i]) {
          resultsRow[col] = results[i][col]["value"];
        }
        // assign the row of results;
        data[thisPageFrom + i] = resultsRow;

        // set row num (1-based)
        var rowNum = thisPageFrom + i + 1;
        data[thisPageFrom + i]["__row_num"] = rowNum;
      }

      pagesToLoad[page] = true;
      onDataLoaded.notify({from: thisPageFrom, to: thisPageTo});

    }

    function onError(fromPage, toPage) {
      // what to do here??!?
      alert("error loading pages " + fromPage + " to " + toPage);
    }

    function setQuery(str) {
      sparqlQuery = str;
      clear();
    }

    return {
      // properties
      "data": data,

      // methods
      "clear": clear,
      "ensureData": ensureData,
      "setQuery": setQuery,

      // events
      "onDataLoading": onDataLoading,
      "onDataLoaded": onDataLoaded
    };
  }

  // Slick.Data.AjaxSparqlLoader
  $.extend(true, window, { Slick: { Data: { AjaxSparqlLoader: AjaxSparqlLoader }}});
})(jQuery);