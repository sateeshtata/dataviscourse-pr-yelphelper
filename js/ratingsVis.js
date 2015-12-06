
function RatingsVis(_parentElement, _contextElement, _data, _metaData, _eventHandler) {

    var self = this;

    self.parentElement = _parentElement;
    self.data = _data;
    self.metaData = _metaData;
    self.eventHandler = _eventHandler;
    self.displayData = [];
    self.contextElement = _contextElement;

    self.initVis();
}

var testData = [];

RatingsVis.prototype.initVis = function () {
    var self = this;
    console.log("kjsafjns");

    self.displayData = self.data;

    self.margin = {top: 20, right: 20, bottom: 100, left: 40};
    self.margin2 = {top: 280, right: 20, bottom: 20, left: 40};
    self.width = document.getElementById("barGraphID").offsetWidth- 20 - self.margin.left - self.margin.right;
    self.height = 300 - self.margin.top - self.margin.bottom;
    self.height2 = 450 - self.margin2.top - self.margin2.bottom;
    self.width2 = document.getElementById("barsContextDiv").offsetWidth - 20 - self.margin.left - self.margin.right;

    self.data.map(function(d){
        var y0 = 0;
        var result = [];
        for(var key in d){
            if(key != 'total' && key != 'business_id') {
                result.push({name: key, y0: y0, y1: y0 += +d[key]});
            }
        }
        d.stars = result.reverse();
    });

    //console.log(JSON.stringify(self.data[0]));

    self.x = d3.scale.ordinal()
        .rangeRoundBands([0, self.width], .1);

    self.y = d3.scale.linear()
        .rangeRound([self.height, 0]);

    self.x3 = d3.scale.ordinal().rangeRoundBands([0, self.width2], .005);

    self.y3 = d3.scale.linear().rangeRound([self.height2, 0]);

    self.color = d3.scale.ordinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    self.color.domain(['5_stars', '4_stars', '3_stars', '2_stars', '1_stars']);

    self.xAxis = d3.svg.axis()
        .scale(self.x)
        .orient("bottom");

    self.yAxis = d3.svg.axis()
        .scale(self.y)
        .orient("left")
        .tickFormat(d3.format(".2s"));

    self.xAxis3 = d3.svg.axis()
        .scale(self.x3)
        .ticks(0)
        .orient("bottom").tickFormat("");

    self.brush = d3.svg.brush().x(self.x3)
        .on("brushend", function(){
            self.brushed();
        });

    self.svg2 = self.contextElement
        .attr("width", self.width2 + self.margin.left + self.margin.right)
        .append("g");

    self.legend2 = self.svg2.append("text")
        .attr("x", self.width2 - 18)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text("Top 750 Businesses")
        .style("fill", "#fff");

    self.svg = self.parentElement
        .attr("width", self.width + self.margin.left + self.margin.right)
        .attr("height", self.height + self.margin.top + self.margin.bottom)
        .append("g");

    self.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", self.width)
        .attr("height", self.height);

    self.focus = self.svg.append("g")
        .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

    self.barsGroup = self.focus.append("g")
        .attr('clip-path', 'url(#clip)');

    self.legend = self.svg.selectAll(".legend")
        .data(self.color.domain().slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    self.legend.append("rect")
        .attr("x", self.width - 12)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", self.color);

    self.legend.append("text")
        .attr("x", self.width - 18)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });

    self.tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("a simple tooltip");

    // filter, aggregate, modify data
    self.wrangleData();

    self.updateVis();
};

/**
 * Method to wrangle the data
 */
RatingsVis.prototype.wrangleData = function () {
    var self = this;

    if(self.selectedRange && self.selectedRange.length > 0){
        self.displayData = self.selectedRange;
    }
    //else{
    //    self.displayData = testData;
    //}

    //self.updateVis()

    self.updateFocus();

};

/**
 * The main drawing function
 */
RatingsVis.prototype.updateVis = function () {

    var self = this;

    //self.color.domain(d3.keys(data[0]).filter(function(key) { console.log('Keys:'+key!=="State");return key !== "State"; }));
    //console.log('Color Domain: '+ d3.keys(data[0]).filter(function(key) { console.log('Keys:'+key!=="State");return key !== "State"; }))

    //testData.sort(function(a, b) { return b.total - a.total; });
    var temp_data = self.displayData.slice();
    testData = temp_data.splice(0,750);

    //testData = self.displayData.splice(0,10);

    self.x3.domain(testData.map(function(d) { return d.business_id; }));
    self.y3.domain([0, d3.max(testData, function(d) { return d.total; })]);

    self.context2 = self.svg2.append("g");

    self.svg2.selectAll(".businesses").remove();

    self.contextState2 = self.context2.selectAll(".businesses")
        .data(testData);

    self.contextState2.enter().append("rect")
        .attr("class", "businesses")
        .transition()
        .duration(500)
        .attr("x", function(d){return self.x3(d.business_id);})
        .attr("y", 0)
        .attr("width", self.x3.rangeBand())
        .attr("height", function(d){return self.height2-self.y3(d.total)})
        .style("fill", '#6b486b')
        .attr("transform", "translate(0," + self.height2 + "), scale(1,-1)");

    self.context2.select(".x.axis").remove();
    self.svg2.select(".x.brush").remove();

    self.context2.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + self.height2 + ")")
        .transition().duration(300)
        .call(self.xAxis3);

    self.context2.append("g")
        .attr("class", "x brush")
        .call(self.brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", self.height2 + 7);

    self.focus.select(".x.axis").remove();
    self.focus.select(".y.axis").remove();

    self.focus.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + self.height + ")")
        .transition().duration(300)
        .call(self.xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) {
            return "rotate(-65)"
        });

    self.focus.append("g")
        .attr("class", "y axis")
        .call(self.yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Ratings");

    self.updateFocus();

};

RatingsVis.prototype.brushed = function() {
    var self = this;
    sunburst_ids=[];
    self.selectedRange =  testData.filter(function(d){
        if(self.brush.empty()){
            return d;
        }
        else{
            if (( self.x3(d.business_id)) >= self.brush.extent()[0] && (self.x3(d.business_id) <= self.brush.extent()[1])){
                sunburst_ids.push(d.business_id);
                return d;
            }
        }
     });
    flag=1;

    initMap();
    /*self.x.domain(self.brush.empty() ? self.x2.domain() : self.brush.extent());
    self.state.attr("transform", function(d) { return "translate(" + self.x(d.business_id) + ",0)"; });
    self.focusGraph.attr("width", self.x.rangeBand());

    self.focus.select(".x.axis").call(self.xAxis);*/

    self.wrangleData()

};

RatingsVis.prototype.updateFocus = function () {
    var self = this;

    var dataVis=[];
    if(self.displayData.length<60000)
    dataVis =self.displayData;

    self.x.domain(dataVis.map(function(d) { return d.business_id; }));
    self.y.domain([0, d3.max(dataVis, function(d) { return d.total; })]);

    self.barsGroup.selectAll(".business").remove();
    self.state = self.barsGroup.selectAll(".business")
        .data(dataVis);

    //self.state.exit().remove();

    self.state.enter().append("g")
        .attr("class", "business")
        .transition()
        .duration(500)
        .attr("transform", function(d) { return "translate(" + self.x(d.business_id) + ",0)"; });

    self.focusGraph = self.state.selectAll("rect")
        .data(function(d){return d.stars;})
        .enter().append("rect")
        .attr("width", self.x.rangeBand())
        .attr("y", function(d) { return self.y(d.y1); })
        .attr("height", function(d) { return self.y(d.y0) - self.y(d.y1); })
        .style("fill", function(d) {return self.color(d.name);})
        .on("mouseover", function(d){
            return self.tooltip.style("visibility", "visible").text(d.name +': '+ (d.y1 - d.y0));
        })
        .on("mousemove", function(){return self.tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
        .on("mouseout", function(){
            return self.tooltip.style("visibility", "hidden");
        });

    self.focus.select(".x.axis")
        .transition().duration(500)
        .call(self.xAxis)
        .selectAll("text")
        .text(function(d){
            return(business_dict[d]);
        })
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function() {
            return "rotate(-65)"
        });

    self.focus.select(".y.axis")
        .transition().duration(500)
        .call(self.yAxis);

};

RatingsVis.prototype.onSelectionChange = function (updateData) {
    var self = this;

    self.displayData = self.data.filter(function(d){
        //console.log(d.business_id);
        return (updateData.indexOf(d.business_id) != -1);
    });

    self.updateVis();
};

