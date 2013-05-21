(function ($) {

  // posisble values needs to be an array of objects which respond to uri and label.
  function CubeDimensionDropdown(possibleValues, elementId, isLockedDimension) {

    // private vars
    ///////////////
    var jQueryElement = null
      , currentValue = null
      ;

    // some setup
    //////////////////
    isLockedDimension = !!isLockedDimension;

    init();

    // private funcs
    /////////////////

    function init() {
      // create the element
      jQueryElement = $("<select></select>");
      jQueryElement.addClass("dimension-dropdown");
      jQueryElement.attr('id', elementId);

      // add all the options
      populateOptions(possibleValues);
    }

    function disable() {
      jQueryElement.attr("disabled", "disabled");
      return jQueryElement;
    }

    function enable() {
      jQueryElement.removeAttr("disabled");
      return jQueryElement;
    }

    function populateOptions(possibleValues) {
      empty();
      $.each(possibleValues, function (i, possVal) {
        var option = $("<option></option>");
        option.attr("value", possVal.uri);
        option.append(possVal.label || possVal.uri);
        jQueryElement.append(option);
      });
    }

    function setValue(value) {
      jQueryElement.val(value);
      return jQueryElement;
    }

    function getValue() {
      return jQueryElement.val();
    }

    function empty() {
      jQueryElement.empty();
    }

    // public api.
    //////////////////
    return {
      // properties
      "elementId": elementId
    , "jQueryElement": jQueryElement
    , "isLockedDimension": isLockedDimension

      // methods
    , "setValue": setValue
    , "getValue": getValue
    , "empty": empty
    , "populateOptions": populateOptions
    , "disable": disable
    , "enable": enable
      // events

    }

  }

 // Swirrl.DimensionDropdown
  $.extend(true, window, { Swirrl: { CubeDimensionDropdown: CubeDimensionDropdown }});
})(jQuery);