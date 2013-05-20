(function ($) {

  // posisble values needs to be an array of objects which respond to uri and label.
  function CubeDimensionDropdown(dimensionUri, possibleValues, isValueDropDown) {

    // private vars
    ///////////////
    var elementId = null;
    var jQueryElement = null;
    var currentValue = null;

    // some setup
    //////////////////

    init();

    // private funcs
    /////////////////

    function init() {
      // work out its id
      elementId = generateId();

      // create the element
      jQueryElement = $("<select></select>");
      jQueryElement.addClass("dimension-dropdown");
      jQueryElement.attr('id', elementId);

      // add all the options
      populateOptions();
    }

    function populateOptions() {
      $.each(possibleValues, function (i, possVal) {
        var option = $("<option></option>");
        option.attr("value", possVal.uri);
        option.append(possVal.label || possVal.uri);
        jQueryElement.append(option);
      });
    }

    function generateId() {
      var theId = dimensionUri.replace(/[^a-zA-Z0-9\-\_]/gi, "-");

      theId += '-dimension';
      if(isValueDropDown) {
        theId += '-value';
      }
      return theId;
    }

    function setValue(value) {
      jQueryElement.val(value);
    }

    function getValue() {
      jQueryElement.val();
    }

    // public api.
    //////////////////
    return {
      // properties
      "elementId": elementId
    , "jQueryElement": jQueryElement

      // methods
    , "setValue": setValue
    , "getValue": getValue

      // events


    }

  }

 // Swirrl.DimensionDropdown
  $.extend(true, window, { Swirrl: { CubeDimensionDropdown: CubeDimensionDropdown }});
})(jQuery);