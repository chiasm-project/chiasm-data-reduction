var assert = require("assert"),
    Chiasm = require("chiasm"),
    ChiasmDataReduction = require("./index"),
    ChiasmDataset = require("chiasm-dataset");

describe("chiasm-data-reduction", function () {

  it("Should reduce data.", function(done) {
    var chiasm = Chiasm();
    chiasm.plugins.dataReduction = ChiasmDataReduction;
    
    chiasm.setConfig({
      reduction: {
        plugin: "dataReduction",
        state: {
          aggregate: {
            dimensions: [{
              column: "foo"
            }],
            measures: [{
              outColumn: "total", 
              operator: "count"
            }]
          }
        }
      }
    });

    chiasm.getComponent("reduction").then(function (reduction){
      reduction.datasetIn = {
        data: [
          { foo: "A", bar: 1 },
          { foo: "A", bar: 8 },
          { foo: "A", bar: 6 }, // A sum = 15, count = 3
          { foo: "B", bar: 4 },
          { foo: "B", bar: 3 }, // B sum = 7, count = 2
          { foo: "C", bar: 6 },
          { foo: "C", bar: 1 },
          { foo: "C", bar: 3 },
          { foo: "C", bar: 6 },
          { foo: "C", bar: 4 } // C sum = 20, count = 5
        ],
        metadata: {
          columns:[
            { name: "foo", type: "string" },
            { name: "bar", type: "number" }
          ]
        }
      };

      ChiasmDataset.validate(reduction.datasetIn).then(function (){
        reduction.when("datasetOut", function (result){
          assert.equal(result.data.length, 3);
          assert.equal(where(result, "foo", "A")[0].total, 3);
          assert.equal(where(result, "foo", "B")[0].total, 2);
          assert.equal(where(result, "foo", "C")[0].total, 5);
          assert.equal(where(result, "foo", "A")[0].total, 3);

          ChiasmDataset.validate(result).then(done, console.log);
        });
      });
    });
  });
});

function where(result, column, value){
  return result.data.filter(function (d) {
    return d[column] === value;
  });
}
