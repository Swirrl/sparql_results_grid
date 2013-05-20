(function ($) {

  function CubeDimension(uri, label, urlBase) {

    // private vars
    //////////////////

    var size = null
      , values = null // will contain an array of objects with uri and label keys
      , onSizeReady = new Slick.Event()
      , onValuesReady = new Slick.Event()
      ;

    // private functions.
    //////////////////

    // memoized lookup of the size of this dimension.
    function getSizeAsync() {
      if (!size) {
        $.ajax({
          url: urlBase + "/dimension_size.json?dimension=" + encodeURIComponent(uri),
          success: function(responseData, _, _) {
            size = responseData['size'];
            onSizeReady.notify({size: size});
          }
        });
      } else {
        onSizeReady.notify({size: size});
      }
    }

    // memoized lookup of all the values in this dimension
    function getValuesAsync() {
      if (!values) {
        $.ajax({
          url: urlBase + "/dimension_values.json?dimension=" + encodeURIComponent(uri),
          success: function(responseData, _, _) {
            values = responseData;
            onValuesReady.notify({values: values});
          }
        });
      } else {
        onValuesReady.notify({values: values});
      }
    }

    // public api.
    //////////////////

    return {

      //properties
      "label": label
    , "uri": uri

      // methods
    , "getSizeAsync": getSizeAsync // raises the onSizeReady event, with the size as the arg.
    , "getValuesAsync": getValuesAsync // raises the onValuesReady event with the values as the arg.

      // events
    , "onSizeReady": onSizeReady
    , "onValuesReady": onValuesReady // contains the new values.
    };
  }

  // Swirrl.CubeDimension

  $.extend(true, window, { Swirrl: { CubeDimension: CubeDimension }});
})(jQuery);