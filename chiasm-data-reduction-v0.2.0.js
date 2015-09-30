(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ChiasmDataReduction = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
// chiasm-data-reduction
// v0.2.0
// https://github.com/chiasm-project/chiasm-data-reduction

var DataReduction = require("data-reduction");
var ChiasmComponent = (typeof window !== "undefined" ? window['ChiasmComponent'] : typeof global !== "undefined" ? global['ChiasmComponent'] : null);
var Model = (typeof window !== "undefined" ? window['Model'] : typeof global !== "undefined" ? global['Model'] : null);

function ChiasmDataReduction (){

  var my = new ChiasmComponent({
    filter: Model.None,
    aggregate: Model.None
  });

  my.when(["filter", "aggregate", "datasetIn"], function (filter, aggregate, datasetIn) {
    var options = {};

    if(filter !== Model.None){
      options.filter = filter;
    }
    if(aggregate !== Model.None){
      options.aggregate = aggregate;
    }

    my.datasetOut = DataReduction(datasetIn.data, options);
  });

  return my;
}
module.exports = ChiasmDataReduction;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"data-reduction":2}],2:[function(require,module,exports){
(function (global){
var d3 = (typeof window !== "undefined" ? window['d3'] : typeof global !== "undefined" ? global['d3'] : null);

function filter(data, predicates){
  predicates.forEach(function (predicate){
    var column = predicate.column;
    if("min" in predicate){
      var min = predicate.min;
      data = data.filter(function (d){
        return d[column] >= min;
      });
    }
    if("max" in predicate){
      var max = predicate.max;
      data = data.filter(function (d){
        return d[column] <= max;
      });
    }
    if("equal" in predicate){
      var equal = predicate.equal;
      data = data.filter(function (d){
        return d[column] == equal;
      });
    }
  });
  return data;
}

function aggregate(data, options){

  var dataByKey = {};

  function getRow(d, dimensions){
    var key = makeKey(d, dimensions);
    if(key in dataByKey){
      return dataByKey[key];
    } else {
      var row = makeRow(d, dimensions);
      dataByKey[key] = row;
      return row;
    }
  }

  data.forEach(function (d){
    var row = getRow(d, options.dimensions);
    options.measures.forEach(function (measure){
      var outColumn = measure.outColumn;
      if(measure.operator === "count"){
        row[outColumn] = (row[outColumn] || 0) + 1;
      }
    });
  });

  return Object.keys(dataByKey).map(function (key){
    return dataByKey[key];
  });
}

function makeKey(d, dimensions){
  return dimensions.map(function (dimension){
    return dimension.accessor(d);
  }).join(";");
}

function makeRow(d, dimensions){
  var row = {};
  dimensions.forEach(function (dimension){
    row[dimension.column] = dimension.accessor(d);
  });
  return row;
}

// Implements a filter -> aggregate data flow.
function dataReduction(data, options){

  var metadata = {};

  if("filter" in options){
    data = filter(data, options.filter);
  }

  if("aggregate" in options){
    options.aggregate.dimensions.forEach(function (dimension){

      dimension.accessor = accessor(dimension.column);

      if(dimension.histogram){

        var count = dimension.numBins + 1;

        var ticks = d3.scale.linear()
          .domain(d3.extent(data, dimension.accessor))
          .nice(count)
          .ticks(count);

        var n = ticks.length - 1;
        var min = ticks[0];
        var max = ticks[n];
        var span = max - min;
        var step = span / n;

        var rawAccessor = dimension.accessor;

        var binAccessor = function(d){
          var value = rawAccessor(d);
          var normalized = (value - min) / span; // Varies between 0 and 1
          var i = Math.floor(normalized * n);

          // Handle the special case of the max value,
          // making the last bin inclusive of the max.
          if( i === n ){
            i--;
          }

          return ticks[i];
        };

        dimension.accessor = binAccessor;

        metadata[dimension.column] = {

          // The step metadata is exported for a Histogram or HeatMap implementation to use.
          // see https://gist.github.com/mbostock/3202354#file-index-html-L42
          step: step,

          // The min and max depend on the nice tick interval computation,
          // and are not the same as min/max of the original data.
          domain: [min, max]
        };

      }
    });
    data = aggregate(data, options.aggregate);
  }

  return {
    data: data,
    metadata: metadata
  };
};

function accessor(column){
  return function (d){
    return d[column];
  };
}

module.exports = dataReduction;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});