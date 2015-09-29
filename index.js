// chiasm-data-reduction
// v__VERSION__
// https://github.com/chiasm-project/chiasm-data-reduction

var DataReduction = require("data-reduction");
var ChiasmComponent = require("chiasm-component");
var Model = require("model-js");

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
