/*globals d3, queue, CountVis, AgeVis, PrioVis, CompareVis*/
var businesses=[];
var categories=[];
var circless=[];
var sunburst_ids=[]
var flag=0;
var marked_circle = [];
var cat = "Doctors";
function center(lati,longi){
    this.lat = lati;
    this.lng = longi;
}
var data;
var business_dict=[];
/*d3.json("./data/business.json", function (error, loadeddata) {
    if (error) throw error;
    //console.log(loadeddata[0].categories);
    console.log('Completed');
    data=loadeddata;

    var category = document.getElementById("categories")
    for(var id in data){
        business_dict.push({
            key: data[id].business_id,
            value: data[id].name
        });

        temp=data[id].categories;
        for (var index in temp){
            if(categories.indexOf(temp[index]) == -1){
                var check=typeof temp[index];
                if(check=="string"){
                    categories.push(temp[index]);
                    category.innerHTML += "<option value="+temp[index]+">"+temp[index]+"</option>"
                }
            }
        }}
    initMap();
});*/

var mapDiv = null;
var map = null;
var data1;
/*d3.json("./data/reviews.json", function (error, loadeddata) {
    if (error) throw error;
    data1 = loadeddata
    console.log("completed");
    var target = document.getElementById('foo');
    target.style.display = 'none';
});
*/
function initMap(){
    if(!mapDiv){
        var opts = {
            lines: 13 // The number of lines to draw
            , length: 14 // The length of each line
            , width: 14 // The line thickness
            , radius: 42 // The radius of the inner circle
            , scale: 1 // Scales overall size of the spinner
            , corners: 1 // Corner roundness (0..1)
            , color: '#000' // #rgb or #rrggbb or array of colors
            , opacity: 0.25 // Opacity of the lines
            , rotate: 0 // The rotation offset
            , direction: 1 // 1: clockwise, -1: counterclockwise
            , speed: 1 // Rounds per second
            , trail: 60 // Afterglow percentage
            , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
            , zIndex: 2e9 // The z-index (defaults to 2000000000)
            , className: 'spinner' // The CSS class to assign to the spinner
            , top: '50%' // Top position relative to parent
            , left: '50%' // Left position relative to parent
            , shadow: false // Whether to render a shadow
            , hwaccel: false // Whether to use hardware acceleration
            , position: 'absolute' // Element positioning
        }
        var target = document.getElementById('foo')
        var spinner = new Spinner(opts).spin(target);
        mapDiv = document.getElementById('map');
        map = new google.maps.Map(document.getElementById('map') ,{
            zoom: 12,
            center: {lat: 33.499313, lng: -111.983758}
        })}
    // Construct the circle for each value in citymap.
    // Note: We scale the area of the circle based on the population.

    for(var i=0;i<circless.length;i++){
        //console.log(index);
        circless[i].setMap(null);
    }
    businesses=[]
    circless=[];
    var final_loc;
    if(flag!=1) {
        console.log(cat);
        for (var id in data) {
            // Add the circle for this city to the map.
            //console.log(id);
            var tem = data[id].categories;
            var temp = [];
            for (var i in tem) {
                temp.push(tem[i]);
            }
            if (temp.indexOf(cat) != -1) {
                var pinIcon = new google.maps.MarkerImage(
                    "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                    null, /* size is determined at runtime */
                    null, /* origin is 0,0 */
                    null, /* anchor is bottom center of the scaled image */
                    new google.maps.Size(22, 22)
                );
                var text = "Name: ".concat(data[id].name).concat("\n Stars: ")
                //console.log(data[id].stars)
                for(var i=0;i<data[id].stars;i++) {
                    text=text.concat('★');
                }
                final_loc= new google.maps.LatLng(data[id].latitude,data[id].longitude);
                var cityCircle = new google.maps.Marker({
                    position: new google.maps.LatLng(data[id].latitude,data[id].longitude),
                    map: map,
                    title: text,
                    customInfo: "Marker A"
                });
                cityCircle.setIcon(pinIcon);
                circless.push(cityCircle);
                var business_id = []
                business_id.push(data[id].business_id);
                business_id.push(data[id].name);

                text=text.replace('\n','<br>')
                createClickableCircle(map, cityCircle, text, business_id);
            }
        }
        map.panTo(final_loc);
    }
    else{
        if(sunburst_ids.length==0){
            alert("Please select a state");
        }
        else{
            for(var id in data)
            {
                if(sunburst_ids.indexOf(data[id].business_id)==-1)
                    continue;
                var pinIcon = new google.maps.MarkerImage(
                    "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                    null, /* size is determined at runtime */
                    null, /* origin is 0,0 */
                    null, /* anchor is bottom center of the scaled image */
                    new google.maps.Size(22, 22)
                );
                var text = "Name: ".concat(data[id].name).concat("\n Stars: ")
                //console.log(data[id].stars)
                for(var i=0;i<data[id].stars;i++) {
                    text=text.concat('★');
                }
                final_loc= new google.maps.LatLng(data[id].latitude,data[id].longitude);
                var cityCircle = new google.maps.Marker({
                    position: new google.maps.LatLng(data[id].latitude,data[id].longitude),
                    map: map,
                    title: text,
                    customInfo: "Marker A"
                });
                cityCircle.setIcon(pinIcon);
                circless.push(cityCircle);
                var business_id = []
                business_id.push(data[id].business_id);
                business_id.push(data[id].name);

                text=text.replace('\n','<br>')
                createClickableCircle(map, cityCircle, text, business_id);
            }
            map.panTo(final_loc);

        }

    }
    console.log(circless.length);
    var geocoder = new google.maps.Geocoder();
    document.getElementById('submit').addEventListener('click', function() {
        geocodeAddress(geocoder, map);
    });

}
var infowindow_global;
function createClickableCircle(map, circle, info,business_id){

    var infowindow =new google.maps.InfoWindow({
        content: info
    });
    var infowindow1 =new google.maps.InfoWindow({
        content: "Already five businesses are chosen for comparsion"
    });
    google.maps.event.addListener(circle, 'click', function(ev) {
        if(infowindow_global){
            infowindow_global.close();
        }
        var target = document.getElementById('foo');
        target.style.display = 'block';
        if(circle.customInfo == "Marker A"){
            if(businesses.length<5){
                circle.setAnimation(google.maps.Animation.BOUNCE);
                businesses.push(business_id)
                circle.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
                circle.customInfo = "Marker B"
                infowindow.setPosition(ev.latLng);
                infowindow_global = infowindow;
                infowindow_global.open(map);
                //infowindow.open(map);
                //generate_data();
                // spinner.spin();
                generate_data();
                var business_list_id=[];
                for(var i in businesses){
                    business_list_id.push(businesses[i][0])
                    console.log(business_list_id);
                }
                ratingsVis.onSelectionChange(business_list_id);
                //spinner.stop();
                marked_circle.push(circle);
            }
            else{

                infowindow1.setPosition(ev.latLng);
                infowindow_global = infowindow1;
                infowindow_global.open(map);
            }

            console.log(businesses);

        }
        else
        {
            circle.setAnimation(null);
            for(var i in businesses){
                if(businesses[i][0] == business_id[0]){
                    businesses.splice(i,1);
                }
            }
            var pinIcon = new google.maps.MarkerImage(
                "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                null, /* size is determined at runtime */
                null, /* origin is 0,0 */
                null, /* anchor is bottom center of the scaled image */
                new google.maps.Size(33, 33)
            );
            circle.setIcon(pinIcon);
            circle.customInfo = "Marker A"
            console.log(businesses);
            var business_list_id=[];
            for(var i in businesses){
                business_list_id.push(businesses[i][0])
            }
            ratingsVis.onSelectionChange(business_list_id);
            generate_data();
        }
        target.style.display = 'none';
    });

}


function geocodeAddress(geocoder, resultsMap) {
    var address = document.getElementById('address').value;
    geocoder.geocode({'address': address}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            resultsMap.panTo(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: resultsMap,
                position: results[0].geometry.location
            });
            //initMap();
            var pinIcon = new google.maps.MarkerImage(
                "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                null, /* size is determined at runtime */
                null, /* origin is 0,0 */
                null, /* anchor is bottom center of the scaled image */
                new google.maps.Size(33, 33)
            );
            console.log(marked_circle.length);
            for(var i in marked_circle){
                if(i=="_sfl")
                    continue;
                marked_circle[i].setIcon(pinIcon);
                marked_circle[i].customInfo = "Marker A"
            }
            businesses=[];
            generate_data();
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function filter(){
    flag=0;
    cat = document.getElementById('categories').options[document.getElementById('categories').selectedIndex].text;
    console.log(cat);
    initMap();

}



function generate_data(){
    var business_id=[];
    var Dates=[];
    for(var i in businesses){
        var temp = businesses[i];
        if(temp[0])
            business_id.push(temp[0]);
    }
    console.log(businesses);
    var Dates=[]

    allData = data1.map(function (d) {
        if(business_id.indexOf(d.business_id)!=-1){
            if(Dates.indexOf(Date.parse(d.date))==-1){
                Dates.push(Date.parse(d.date))
            }
        }
        var res = {
            key: d.business_id,
            values: [Date.parse(d.date), d.stars]
        };
        return res;
    });
    function isBusiness_in_list(value) {
        return (business_id.indexOf(value.key)!=-1);
    }
    allData=allData.filter(isBusiness_in_list);
    //console.log(Dates.length);
    var business = []
    for(var i in business_id){
        var val_list = []
        for(var j in Dates){
            if(typeof Dates[j] == 'function')
                break;
            var val_temp_list = [];
            val_temp_list.push(Dates[j]);
            val_temp_list.push(0);
            val_list.push(val_temp_list);
        }
        val_list.sort(function(a, b) {
            return parseFloat(a[0]) - parseFloat(b[0]);
        });
        var res = {
            key: business_id[i],
            values: val_list
        };

        business.push(res);

    }
    //console.log(business[0].values.length)
    for(var i in allData){
        if(typeof allData[i] != 'function')
        {
            //console.log(allData[i]);
            var business_index = business_id.indexOf(allData[i].key);
            var date_index = Dates.indexOf(allData[i].values[0])
            business[business_index].values[date_index][1] = allData[i].values[1];
        }
    }
    //console.log(business.length);
    var business_list=[];
    for( var i in businesses){
        if(typeof business[i] != 'function' && business[i]){
            //console.log(business[i]);
            var temp = businesses[i];
            console.log(temp);
            var keys = temp[1];
            var list_val = business[i].values;
            var filler = 0;
            for(var i in list_val){
                if(list_val[i][1]!=0)
                    filler = list_val[i][1];
                else
                    list_val[i][1] = filler;
            }
            var res = {
                key: keys,
                values: list_val
            };
            business_list.push(res);
        }
    }

    histcatexplong = business_list.splice(0,business_id.length);
    //console.log(business_list)
    //console.log(Dates.length)
    var colors = d3.scale.category20();
    var chart;
    nv.addGraph(function() {
        chart = nv.models.stackedAreaChart()
            .useInteractiveGuideline(true)
            .x(function(d) { return d[0] })
            .y(function(d) { return d[1] })
            .controlLabels({stacked: "Stacked"})
            .duration(300);
        chart.xAxis.tickFormat(function(d) { return d3.time.format('%x')(new Date(d)) });
        chart.yAxis.tickFormat(d3.format(',.4f'));
        chart.legend.vers('furious');
        d3.select('#areaGraph')
            .datum(histcatexplong)
            .transition().duration(1000)
            .call(chart)
            .each('start', function() {
                setTimeout(function() {
                    d3.selectAll('#chart1 *').each(function() {
                        if(this.__transition__)
                            this.__transition__.duration = 1;
                    })
                }, 0)
            });
        nv.utils.windowResize(chart.update);
        return chart;
    });
}
var ratingVis;
(function () {
    // some variables
    var allData = [];
    var sunBurstData;
    var lookUpData;
    var barGraphData;
    var mapPlotData;
    var areaGraphData;
    var metaData = {};
    var mapVis, sunBurstVis, areaVis;

    // this function can convert Date objects to a string
    // it can also convert strings to Date objects
    // see: https://github.com/mbostock/d3/wiki/Time-Formatting
    var dateFormatter = d3.time.format("%Y-%m-%d");

    // call this function after Data is loaded, reformatted and bound to the variables
    function initVis() {
        // ******* TASK 3b, 3c *******
        // Create a handler that will deal with a custom event named "selectionChanged"
        // (you will need to edit this line)
        var eventHandler = d3.dispatch("selectionChanged");

        // Instantiate all Vis Objects here
        var dataGraph = allData.splice(1, 6);
        //console.log('IntiViz spliced data: ' + JSON.stringify(dataGraph));
        //console.log(allData);
        //mapVis = new MapVis(d3.select("#mapPlot"), sunBurstData, metaData);
        //areaVis = new AreaVis(d3.select("#areaGraph"), dataGraph, metaData);
        ratingsVis = new RatingsVis(d3.select("#barGraph"), d3.select("#barsContext"), barGraphData, metaData);
        sunBurstVis = new SunBurstVis(d3.select("#sunBurst"), sunBurstData, lookUpData, eventHandler);
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
        initMap();
        var target = document.getElementById('foo');
        target.style.display = 'none';
        function eventHandlerBinder(data){
            //prioVis.onSelectionChange(start, end);
            sunburst_ids = data;
            console.log(sunburst_ids[0]);
            flag=1;
            initMap();
            ratingsVis.onSelectionChange(data);
            target = document.getElementById('foo');
            target.style.display = 'none';
        }

        eventHandler.on("selectionChanged", eventHandlerBinder);
        
    }

    // call this function after both files are loaded -- error should be "null" if no error
    function dataLoaded(error, perDayData, sbData, lkUpData, barData, mapPlotData, areaGraphData, _metaData) {
        if (!error) {
            sunBurstData = sbData;

            lookUpData = lkUpData;

            //mapPlotData = mapData;

            barGraphData = barData;

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

            console.log('Completed');
            data = mapPlotData;

            var category = document.getElementById("categories")
            for(var id in data){
                business_dict[data[id].business_id] = data[id].name;

                temp=data[id].categories;
                for (var index in temp){
                    if(categories.indexOf(temp[index]) == -1){
                        var check=typeof temp[index];
                        if(check=="string"){
                            categories.push(temp[index]);
                            category.innerHTML += "<option value="+temp[index]+">"+temp[index]+"</option>"
                        }
                    }
                }}

                data1 = areaGraphData;


            initVis();

        }
    }

    function startHere() {
        queue().defer(d3.json, './data/test.json')
            .defer(d3.json, './data/sunBurst.json')
            .defer(d3.json, './data/idLookUp.json')
            .defer(d3.json, './data/barGraph.json')
            .defer(d3.json, './data/business.json')
            .defer(d3.json, './data/reviews.json')
            .await(dataLoaded);
    }

    startHere();
})();
