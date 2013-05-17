(function ($) {

  function CubeDimension(uri, label, urlBase) {

    // private vars
    var size = null
      , values = null // will contain an array of objects with uri and label keys
      , sizeReady = new Slick.Event()
      , valuesReady = new Slick.Event()
      ;

    // private functions.
    function getUri() {
      return uri;
    }

    // private functions.
    function getLabel() {
      return label;
    }

    // memoized lookup of the size of this dimension.
    function getSizeAsync() {
      if (!size) {
        $.ajax({
          url: urlBase + "/dimension_size.json?dimension=" + encodeURIComponent(uri),
          success: function(responseData, _, _) {
            size = responseData['size'];
            sizeReady.notify({size: size});
          }
        });
      } else {
        sizeReady.notify({size: size});
      }
    }

    // memoized lookup of all the values in this dimension
    function getValuesAsync() {
      if (!values) {
        $.ajax({
          url: urlBase + "/dimension_values.json?dimension=" + encodeURIComponent(uri),
          success: function(responseData, _, _) {
            values = responseData;
            valuesReady.notify({values: values});
          }
        });
      } else {
        valuesReady.notify({values: values});
      }
    }

    // public api.
    return {
      // methods
    , "getLabel": getLabel
    , "getUri": getUri
    , "getSizeAsync": getSizeAsync // raises the sizeReady event, with the size as the arg.
    , "getValuesAsync": getValuesAsync // raises the valuesReady event with the values as the arg.

      // events
    , "sizeReady": sizeReady
    , "valuesReady": valuesReady // contains the new values.
    };
  }

  // Swirrl.CubeDimension

  $.extend(true, window, { Swirrl: { CubeDimension: CubeDimension }});
})(jQuery);