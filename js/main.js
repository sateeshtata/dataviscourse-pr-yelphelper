/*globals d3, queue, CountVis, AgeVis, PrioVis, CompareVis*/

(function () {
    // some variables
    var allData = [];
    var sunBurstData;
    var lookUpData;
    var metaData = {};
    var mapVis, ratingsVis, sunBurstVis, areaVis;

    // this function can convert Date objects to a string
    // it can also convert strings to Date objects
    // see: https://github.com/mbostock/d3/wiki/Time-Formatting
    var dateFormatter = d3.time.format("%Y-%m-%d");

    // call this function after Data is loaded, reformatted and bound to the variables
    function initVis() {
        // ******* TASK 3b, 3c *******
        // Create a handler that will deal with a custom event named "selectionChanged"
        // (you will need to edit this line)
        //var eventHandler = d3.dispatch("selectionChanged");

        // Instantiate all Vis Objects here
        var dataGraph = allData.splice(1, 6);
        //console.log('IntiViz spliced data: ' + JSON.stringify(dataGraph));
        //console.log(allData);
        mapVis = new MapVis(d3.select("#mapPlot"), sunBurstData, metaData);
        areaVis = new AreaVis(d3.select("#areaGraph"), dataGraph, metaData);
        ratingsVis = new RatingsVis(d3.select("#barGraph"), dataGraph, metaData);
        sunBurstVis = new SunBurstVis(d3.select("#sunBurst"), sunBurstData, lookUpData);
        //var ageVis = new AgeVis(d3.select("#ageVis"), allData, metaData);
        //var prioVis = new PrioVis(d3.select("#prioVis"), allData, metaData);
        //var compareVis = new CompareVis(d3.select("#compareVis"), allData, metaData);
        // ******** TASK 3b, 3c *******
        // Bind the eventHandler to the Vis Objects
        // events will be created from the CountVis object (TASK 4b)
        // events will be consumed by the PrioVis and AgeVis object
        // (you should bind the appropriate functions here)
        // Also make sure to display something reasonable about
        // the brush in #brushInfo
        /*function eventHandlerBinder(start, end){
            prioVis.onSelectionChange(start, end);
            ageVis.onSelectionChange(start, end);
            compareVis.onSelectionChange(start, end);
        }

        eventHandler.on("selectionChanged", eventHandlerBinder);*/
        
    }

    //Call this function to initialize loading of sun burst data.
    function dataLoadSB(error, data, sbData){
        if(!error){
            sunBurstData = sbData;
        }
    }



    // call this function after both files are loaded -- error should be "null" if no error
    function dataLoaded(error, perDayData, sbData, lkUpData, _metaData) {
        if (!error) {
            sunBurstData = sbData;

            lookUpData = lkUpData;

            allData = perDayData.map(function (d) {

                var res = {
                    key: d.business_id,
                    values: [[Date.parse(d.date), d.stars]]
                };

                return res;
            });

            //console.log('Data :' + JSON.stringify(allData));
            var temp = {};
            var values = [];

            for (var i=0; i<allData.length; i++) {
                temp[allData[i].key] =
                    temp[allData[i].key] === undefined ?
                        [allData[i].values] :
                    temp[allData[i].key] + ';' + [allData[i].values];
            }

            allData = [];

            for (var key in temp) {
                values = temp[key].split(';');
                var dates = {};

                for (var j=0; j<values.length; j++){
                    var dateVals = [];
                    dateVals = values[j].split(',');

                    dates[dateVals[0]] =
                        dates[dateVals[0]] === undefined ?
                            parseInt(dateVals[1]) :
                        dates[dateVals[0]]  + parseInt(dateVals[1]);
                }

                values = [];

                for(var dKey in dates){
                    values.push([dKey, dates[dKey]]);
                }

                allData.push({key: key, values:values})
            }

            //console.log('Sliced Data: ' + JSON.stringify(allData.splice(1,6)));

            metaData = _metaData;

            initVis();
        }
    }

    function startHere() {
        queue().defer(d3.json, './data/test.json').defer(d3.json, './data/sunBurst.json').defer(d3.json, './data/idLookUp.json')
            .await(dataLoaded);
    }

    startHere();
})();
