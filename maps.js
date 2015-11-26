var businesses=[];
var categories=[];
var circless=[];
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
 
function initMap(){
 if(!mapDiv){
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
    var cityCircle = new google.maps.Marker({
      position: new google.maps.LatLng(data[id].latitude,data[id].longitude),
      map: map,
      title: data[id].name,
      customInfo: "Marker A"
    });
    cityCircle.setIcon(pinIcon);
    circless.push(cityCircle);
    var business_id = []
    business_id.push(data[id].business_id);
    business_id.push(data[id].name);
    var text = "Name: ".concat(data[id].name).concat("<br>Stars: ")
    //console.log(data[id].stars)
    for(var i=0;i<data[id].stars;i++) {
    text=text.concat('★');
    }
    createClickableCircle(map, cityCircle, text,business_id);
    }
    
  }
  console.log(circless.length)
  
  var geocoder = new google.maps.Geocoder();
  document.getElementById('submit').addEventListener('click', function() {
    geocodeAddress(geocoder, map);
  });
  
}
function createClickableCircle(map, circle, info,business_id){
       var infowindow =new google.maps.InfoWindow({
            content: info
        });  
        var infowindow1 =new google.maps.InfoWindow({
            content: "Already five businesses are chosen for comparsion"
        }); 
        google.maps.event.addListener(circle, 'click', function(ev) {
            if(circle.customInfo == "Marker A"){
            if(businesses.length<5){
            businesses.push(business_id)
            circle.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
            circle.customInfo = "Marker B"
            infowindow.setPosition(ev.latLng);
            infowindow.open(map);
            generate_data();
            }
            else{
            infowindow1.setPosition(ev.latLng);
            infowindow1.open(map);
            }
            
            console.log(businesses);
            
            }
            else
            {
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
 			   new google.maps.Size(22, 22)
			);  
            circle.setIcon(pinIcon);
            circle.customInfo = "Marker A"
            console.log(businesses);
            generate_data();
            }
            
        });
 }


function geocodeAddress(geocoder, resultsMap) {
  var address = document.getElementById('address').value;
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      resultsMap.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
        map: resultsMap,
        position: results[0].geometry.location
      });
       businesses=[];
    	generate_data();
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function filter(){
	cat = document.getElementById('categories').value;
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
console.log(business_id);
 d3.json("reviews.json", function (error, loadeddata) {
    if (error) throw error;
    var data = loadeddata
	allData = data.map(function (d) {
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
	var business = []
	for(var i in business_id){
		var key_temp =business_id[i]
		if(typeof key_temp == 'string'){
		var values_temp = []
		for(var j in allData){
			if( key_temp === allData[j].key){
				var temp = allData[j].values
				var flag=0;
				for(var k in values_temp){
					//console.log(values_temp[k][0]);
					if(values_temp[k][0] == temp[0]){
						values_temp[k][0] = (temp[0]+values_temp[k][0])/2;
						flag=1;
						break;
					}	
				}
				if(flag==0)
				values_temp.push(allData[j].values)
			}
		}
		var res = {
                	key: key_temp,
                	values: values_temp
                   };
		business.push(res)
		}
	}
	console.log(business);
	for(var i in business){
		if(business[i].key){
		var list = business[i].values;
		for(var j in Dates ){
			var flag=0
			for(var k in list){
				if(list[k][0]== Dates[j]){
					flag=1;
					break;
				}
			}
			if(flag==0){
				var temp_list = [];
				if(typeof Dates[j]!='function'){
				temp_list.push(Dates[j])
				temp_list.push(0);
				list.push(temp_list);
				}
			}
		}
		list.sort(function(a, b) {
    return parseFloat(a[0]) - parseFloat(b[0]);
});
		var temp = business
		business[i].key = businesses[i][1];
		business[i].values=list;
		}
	}
	histcatexplong = business;
    console.log(business)
    console.log(Dates.length)
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
    
    });
}