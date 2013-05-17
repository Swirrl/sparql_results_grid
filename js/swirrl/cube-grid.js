(function ($) {

  // constructor
  function CubeGrid(elementSelector, siteDomain, datasetSlug, pageSize) {

    // some constants.
    var SLICKGRIDOPTIONS = {
          enableCellNavigation: false
        , enableColumnReorder: false
        , syncColumnCellResize: true
        , rowHeight: 24
        }
      ;

    // object-level vars.
    var loader = new Swirrl.DataLoader(gridSize, pageSize)
      , grid = new Slick.Grid(elementSelector, loader.data, columns, SLICKGRIDOPTIONS)
      , urlBase = "http://" +  siteDomain + "/data/" + datasetSlug + "/cube"
      , cubeDimensions = null // an array of cubeDimension objects.
      , rowsDimension = null
      , columnsDimension = null
      ;

    // events
    var cubeDimensionsReady = new Slick.Event()
      ;

    // memoized lookup of all cube dimensions.
    function getAllDimensionsAsync(){

      if (!cubeDimensions) {
        cubeDimensions = [];
        $.ajax({
          dataType: 'json',
          url: urlBase + "/dimensions.json",
          success: function(responseData, textStatus, jqXHR) {
            $.each(dimensions, function(i, dimension) {
              cubeDimension = new Swirrl.CubeDimension(dimension.uri, dimension.label, urlBase);
              cubeDimensions.push(cubeDimension);
            });
            cubeDimensionsReady.notify(cubeDimensions);
          }
        });
      } else {
        cubeDimensionsReady.notify(cubeDimensions);
      }
    }

    // set the rows dimension to a cubeDimension object passed in.
    function setRowsDimension(cubeDimension) {
      rowsDimension = cubeDimension;
    }

    // set the columns dimension to a cubeDimension object passed in.
    function setColumnsDimension(cubeDimension) {
      rowsDimension = cubeDimension;

      rowsDimension.valuesReady.subscribe(function(e, args) {
        // this is the list of values for this column
        console.log(args.values);

        // TODO: set the columns on the grid!
      });

      rowsDimension.getValuesAsync();
    }

    // public api.
    return {

      // methods
    , "getGrid": getGrid
    , "getAllDimensionsAsync": getAllDimensionsAsync // raises cubeDimensionsReady with cubeDimensions as the arg
    , "setRowsDimension": setRowsDimension
    , "setColumnsDimension": setColumnsDimension

      // events
    , "cubeDimensionsReady": cubeDimensionsReady
    };
  }

  // Swirrl.CubeGrid

  $.extend(true, window, { Swirrl: { CubeGrid: CubeGrid }});
})(jQuery);