var businesses=[];
var categories=[];
var circless=[];
var marked_circle = [];
var cat = "Doctors";
function center(lati,longi){
	this.lat = lati;
	this.lng = longi;
}
var data;

d3.json("business.json", function (error, loadeddata) {

    if (error) throw error;
    //console.log(loadeddata[0].categories);
    console.log('Completed');
    data=loadeddata;
    
    var category = document.getElementById("categories")
    for(var id in data){
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
	
});

 var mapDiv = null;
 var map = null;
 var data1;
 d3.json("reviews.json", function (error, loadeddata) {
    if (error) throw error;
    data1 = loadeddata
    console.log("completed");
    var target = document.getElementById('foo');
	target.style.display = 'none';
   
    });
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
    zoom: 10,
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
  console.log(cat);
  for (var id in data) {
    // Add the circle for this city to the map.
    //console.log(id);
    var tem=data[id].categories;
    var temp=[];
    for(var i in tem){
    	temp.push(tem[i]);
    }
    if(temp.indexOf(cat)!=-1){
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
    createClickableCircle(map, cityCircle, text,business_id);
    }
    
  }
  console.log(circless.length)
  
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
       spinner.spin();
    	setTimeout(generate_data, 3000);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function filter(){
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
        d3.select('#chart1')
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