(function ($) {

  // object to marshall communication between the grid and all the dimension controls
  function CubeDimensionsControls(cubeGrid, containerSelector) {

    // private vars
    var rowsDimensionDropdown = null
      , columnsDimenesionDropdown = null
      , lockedDimensionsDropdowns = []
      , lockedDimensionValuesDropdowns = []
      ;

    // events
    var onDimensionsReady = new Slick.Event();
    var onDimensionsBusy = new Slick.Event();

    // set up:
    /////////////////////
    init();

    // private functions
    /////////////////////

    function init() {

      onDimensionsBusy.notify();

      // make sure we've got all the dimensions we need. We assume that the cube has retrieved it's dimensions before starting here.
      if (!checkDimensions() ){
        return false;
      }

      //  drop downs for the row and col dimensions.
      createRowsDimensionDropdown();
      createColumnsDimensionDropdown();
      createLockedDimensionsDropdownsAnync();
    }

    function createRowsDimensionDropdown() {
      rowsDimensionDropdown = new Swirrl.CubeDimensionDropdown(cubeGrid.getCubeDimensions(), 'rows-dimension-dropdown');
      $('div#rows-dimension-container').append(rowsDimensionDropdown.jQueryElement);
      rowsDimensionDropdown.setValue(cubeGrid.getRowsDimension().uri);
      rowsDimensionDropdown.disable(); // create as disabled
      wireUpDimensionDropDownChanged(rowsDimensionDropdown);
    }

    function createColumnsDimensionDropdown() {
      columnsDimensionDropdown = new Swirrl.CubeDimensionDropdown(cubeGrid.getCubeDimensions(), 'columns-dimension-dropdown');
      $('div#columns-dimension-container').append(columnsDimensionDropdown.jQueryElement);
      columnsDimensionDropdown.setValue(cubeGrid.getColumnsDimension().uri);
      columnsDimensionDropdown.disable(); // create as disabled
      wireUpDimensionDropDownChanged(columnsDimensionDropdown);
    }

    function createLockedDimensionsDropdownsAnync() {
      // make drop downs for the locked dimensions
      var lockedDimensionsSelector = containerSelector + " .locked-dimensions";

      $.each(cubeGrid.getLockedDimensionObjects(), function(i, lockedDim) {

        var valuesReadyHandler = function (e, args) {
          console.log('handling onvalues ready!');

          // 1. the possible dimensions
          ////////////////////
          var dimensionsDropdown = new Swirrl.CubeDimensionDropdown(cubeGrid.getCubeDimensions(), 'locked-dimension-dropdown' + i.toString(), true);
          $(lockedDimensionsSelector).append(dimensionsDropdown.jQueryElement);
          $(lockedDimensionsSelector).append(": ");
          dimensionsDropdown.setValue(lockedDim.uri);
          dimensionsDropdown.disable(); // create as disbaled

          // add it to our collection
          lockedDimensionsDropdowns.push(dimensionsDropdown);

          // 2. the values for this dimension
          ////////////////////
          var valuesDropdown = new Swirrl.CubeDimensionDropdown(args.values, 'locked-dimension-dropdown' + i.toString() + '-value');
          $(lockedDimensionsSelector).append(valuesDropdown.jQueryElement);
          $(lockedDimensionsSelector).append("<br/>");
          valuesDropdown.setValue(cubeGrid.getLockedDimensionValue(lockedDim.uri));
          valuesDropdown.disable(); // create as disbaled

          // add it to our collection
          lockedDimensionValuesDropdowns.push(valuesDropdown);

          // use the special locked dimension wirer-upper for the locked dims.
          wireUpLockedDimensionDropdownChanged(dimensionsDropdown, valuesDropdown);
          wireUpLockedDimensionValuesChanged(valuesDropdown);

          // now unsubscribe: we only want to do this setup once
          lockedDim.onValuesReady.unsubscribe(valuesReadyHandler);

          onDimensionsReady.notify();
        }

        lockedDim.onValuesReady.subscribe(valuesReadyHandler);
        lockedDim.getValuesAsync();

      });
    }

    function disable() {
      $.each(getAllDropdowns(), function(i, dd) {
        dd.disable();
      });
    }

    function enable() {
      console.log(getAllDropdowns())
      $.each(getAllDropdowns(), function(i, dd) {
        dd.enable();
      });
    }

    function getRowsDimension() {
      var rowsDimensionUri = rowsDimensionDropdown.getValue();
      return findCubeDimensionWithUri(rowsDimensionUri);
    }

    function getColumnsDimension() {
      var columnsDimensionUri = columnsDimensionDropdown.getValue();
      return findCubeDimensionWithUri(columnsDimensionUri);
    }

    function getLockedDimensionUris() {
      return $.map( lockedDimensionsDropdowns, function(dd, i) {
        return dd.uri;
      });
    }

    function getLockedDimensionValues() {
      return $.map( lockedDimensionValuesDropdowns, function(dd, i) {
        return dd.uri;
      });
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

    function getAllDropdowns() {
      var dropdowns = [];
      if(rowsDimensionDropdown){ dropdowns = dropdowns.concat(rowsDimensionDropdown); }
      if(rowsDimensionDropdown){ dropdowns = dropdowns.concat(columnsDimensionDropdown); }
      dropdowns = dropdowns.concat(lockedDimensionsDropdowns);
      dropdowns = dropdowns.concat(lockedDimensionValuesDropdowns);
      return dropdowns;
    }

    function findDropdownWithValue(value, excludeControlWithId) {
      var allDropDowns = getAllDropdowns();
      var theDropDown = null;

      $.each(allDropDowns, function(i, dd) {
        if(dd.getValue() == value && dd.elementId != excludeControlWithId) {
          theDropDown = dd;
          return false;
        }
      });
      return theDropDown;
    }

    function findUnusedDimensionUri() {
      var allDropDowns = getAllDropdowns();
      var allDimensions = cubeGrid.getCubeDimensions();

      var allDimensionUris = $.map(allDimensions, function(dim, i) {
        return dim.uri;
      });
      var usedDimensionUris = [];

      var unusedDimension = null;

      $.each(allDropDowns, function(i, dd) {
        usedDimensionUris.push(dd.getValue());
      });

      $.grep(allDimensionUris, function(el) {
        if (jQuery.inArray(el, usedDimensionUris) == -1) unusedDimension = el;
      });

      // there should be at most one unused dimension
      return unusedDimension;
    }

    function wireUpDimensionDropDownChanged(dropdown) {

      $(dropdown.jQueryElement).change(function(e) {

        onDimensionsBusy.notify();

        // Update the other drop downs accordingly...
        var newValue = $(this).val(); // what's the new value of this dropdown?
        var prevDropdown = findDropdownWithValue(newValue, $(this).attr('id')); // now find where the new value was previously used.
        var unusedDimensionUri = findUnusedDimensionUri(); // what dimension uri is now unused?

        // this won't be set '2nd time round'.
        if(prevDropdown){
          prevDropdown.setValue(unusedDimensionUri); // set that drop down to have the only unused dimension

          // fire the changed event for other drop down too.
          $(prevDropdown.jQueryElement).change();
        } else {
          // if this isn't a locked dimension we're done.
          // (locked ones do a follow-up extra bit).
          if(!dropdown.isLockedDimension) {
            onDimensionsReady.notify();
          }
        }

      });
    }

    function findCubeDimensionWithUri(uri) {
      var dim = null;

      $.each( cubeGrid.getCubeDimensions(), function (i, cubeDim) {
        if(uri == cubeDim.uri) {
          dim = cubeDim;
          return false;
        }
      });

      return dim;
    }

    function wireUpLockedDimensionDropdownChanged(lockedDimDropdown, valuesDropdown) {
      // do the normal stuff
      wireUpDimensionDropDownChanged(lockedDimDropdown);

      // plus:
      // we also want to update this drop-down's associated value dropdown
      $(lockedDimDropdown.jQueryElement).change(function(e) {

        var lockedDimensionUri = $(this).val(); // the new value.

        console.log(lockedDimensionUri);

        // find the dimension object with the uri
        var lockedDimension = findCubeDimensionWithUri(lockedDimensionUri);

        var onReadyHandler = function (e, args) {
          console.log('new values ready!');
          console.log(args);
          valuesDropdown.populateOptions(args.values);
          onDimensionsReady.notify();
          lockedDimension.onValuesReady.unsubscribe(onReadyHandler); // only respond once.
        }

        // update the options when the values arrive.
        lockedDimension.onValuesReady.subscribe(onReadyHandler);
        lockedDimension.getValuesAsync();
      });
    }

    function wireUpLockedDimensionValuesChanged(valuesDropdown) {
      console.log('wireup values change');
      $(valuesDropdown.jQueryElement).change(function(e) {
        console.log('dimension values changed');
        onDimensionsReady.notify();
      });
    }

  return {

      // methods
      "getRowsDimension": getRowsDimension // returns a cube dimension object
    , "getColumnsDimension": getColumnsDimension // returns a cube dimension object
    , "getLockedDimensionUris": getLockedDimensionUris
    , "getLockedDimensionValues": getLockedDimensionValues
    , "enable": enable
    , "disable": disable

      // events
    , "onDimensionsBusy": onDimensionsBusy
    , "onDimensionsReady": onDimensionsReady // contains the new values.
    };
  }


  $.extend(true, window, { Swirrl: { CubeDimensionsControls: CubeDimensionsControls }});
})(jQuery);