(function ($) {

  // object to marshall communication between the grid and all the dimension controls
  function CubeDimensionsControls(cubeGrid, containerSelector) {

    // set up:
    /////////////////////
    init();

    // private functions
    /////////////////////

    function init() {
      // make sure we've got all the dimensions we need.
      if (!checkDimensions() ){
        return false;
      }

      var lockedDimensionsSelector = containerSelector + " .locked-dimensions";

      // make drop downs for the locked dimensions
      $.each(cubeGrid.getLockedDimensionObjects(), function(i, lockedDim) {
        // 1. a drop down for the dimensions
        // TODO:

        // 2.  a drop down for the possible values of this dimension
        lockedDim.onValuesReady.subscribe( function (e, args) {
          var cdd = new Swirrl.CubeDimensionDropdown(lockedDim.uri, args.values, true);
          $(lockedDimensionsSelector).append(cdd.jQueryElement);
        });

        lockedDim.getValuesAsync();
      });

      // TODO: drop downs for the row and col dimensions.

      wireUpDropDownEvents();
    }

    function checkDimensions() {

      if (!cubeGrid.getCubeDimensions()) {
        alert("You can't initialise the cube dimension controls unless the cube's dimensions have been initialised");
        return false;
      }

      if (!cubeGrid.getRowsDimension) {
        alert("You can't initialise the cube dimension controls unless the cube's rowsDimensions has been set");
        return false;
      }

      if (!cubeGrid.getColumnsDimension) {
        alert("You can't initialise the cube dimension controls unless the cube's columnsDimensions has been set");
        return false;
      }

      if(!cubeGrid.checkLockedDimensions()) {
        alert('missing locked dimensions');
        return false;
      }

      return true;
    }

    function wireUpDropDownEvents() {
      // when the drop downs change,
      //   update the other drop downs accordingly
      //   update the grid
    }

  }

  $.extend(true, window, { Swirrl: { CubeDimensionsControls: CubeDimensionsControls }});
})(jQuery);