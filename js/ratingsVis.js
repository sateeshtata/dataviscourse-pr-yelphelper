
function RatingsVis(_parentElement, _data, _metaData, _eventHandler) {

    var self = this;

    self.parentElement = _parentElement;
    self.data = _data;
    self.metaData = _metaData;
    self.eventHandler = _eventHandler;
    self.displayData = [];

    self.initVis();
}

var testData = [
    {"business_id": 'Test1', "5_stars": 10, "4_stars": 20, "3_stars":15, "2_stars": 8, "1_stars": 5, "total": 58},
    {"business_id": 'dummy', "5_stars": 12, "4_stars": 22, "3_stars":17, "2_stars": 10, "1_stars": 7, "total": 68},
    {"business_id": 'random', "5_stars": 8, "4_stars": 18, "3_stars":13, "2_stars": 6, "1_stars": 3, "total": 48},
    {"business_id": 'Utah', "5_stars": 23, "4_stars": 30, "3_stars":10, "2_stars": 5, "1_stars": 2, "total": 70},
    {"business_id": 'Business1', "5_stars": 22, "4_stars": 32, "3_stars":12, "2_stars": 7, "1_stars": 5, "total": 78},
    {"business_id": 'NewVal', "5_stars": 12, "4_stars": 18, "3_stars":15, "2_stars": 10, "1_stars": 5, "total": 60},
    {"business_id": 'Chipotle', "5_stars": 15, "4_stars": 25, "3_stars":10, "2_stars": 10, "1_stars": 6, "total": 66}
];

RatingsVis.prototype.initVis = function () {
    var self = this;

    self.margin = {top: 20, right: 20, bottom: 100, left: 40};
    self.margin2 = {top: 300, right: 20, bottom: 20, left: 40};
    self.width = 600 - self.margin.left - self.margin.right;
    self.height = 350 - self.margin.top - self.margin.bottom;
    self.height2 = 350 - self.margin2.top - self.margin2.bottom;

    testData.map(function(d){
        var y0 = 0;
        var result = [];
        for(var key in d){
            if(key != 'total' && key != 'business_id') {
                result.push({name: key, y0: y0, y1: y0 += +d[key]});
            }
        }
        d.stars = result.reverse();
    });

    self.x = d3.scale.ordinal()
        .rangeRoundBands([0, self.width], .1);

    self.y = d3.scale.linear()
        .rangeRound([self.height, 0]);

    self.x2 = d3.scale.ordinal().rangeRoundBands([0, self.width],.1);

    self.y2 = d3.scale.linear().rangeRound([self.height2, 0]);

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

    self.xAxis2 = d3.svg.axis()
        .scale(self.x2)
        .orient("bottom");

    self.brush = d3.svg.brush().x(self.x2)
        .on("brushend", function(){
            self.brushed();
        });
        /*.on("brushend", function() {
        self.brushed();
    });*/

    self.svg = self.parentElement
        .attr("width", self.width + self.margin.left + self.margin.right)
        .attr("height", self.height + self.margin.top + self.margin.bottom)
        .append("g")

    self.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", self.width)
        .attr("height", self.height);

    self.focus = self.svg.append("g")
        .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

    self.barsGroup = self.focus.append("g")
        .attr('clip-path', 'url(#clip)');

    self.context = self.svg.append("g")
        .attr("transform", "translate(" + self.margin2.left + "," + self.margin2.top + ")");

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
    else{
        self.displayData = testData;
    }

    //self.updateVis()

    //console.log('Display Data : '+ JSON.stringify(self.displayData));

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

    self.x2.domain(testData.map(function(d) { return d.business_id; }));
    self.y2.domain([0, d3.max(testData, function(d) { return d.total; })]);

    self.contextState = self.context.selectAll(".businesses")
        .data(testData)
        .enter().append("g")
        .attr("class", "businesses")
        .attr("transform", function(d) {return "translate(" + self.x2(d.business_id) + ",0)";});

    self.contextState.selectAll("rect")
        .data(function(d){return d.stars;})
        .enter().append("rect")
        .attr("width", self.x2.rangeBand())
        .attr("y", function(d) { return self.y2(d.y1); })
        .attr("height", function(d) { return self.y2(d.y0) - self.y2(d.y1); })
        .style("fill", function(d) {return self.color(d.name);});

    self.focus.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + self.height + ")")
        .transition().duration(300)
        .call(self.xAxis);

    self.focus.append("g")
        .attr("class", "y axis")
        .call(self.yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Ratings");

    self.context.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + self.height2 + ")")
        .transition().duration(300)
        .call(self.xAxis2);

    self.context.append("g")
        .attr("class", "x brush")
        .call(self.brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", self.height2 + 7);

    self.updateFocus();

};

RatingsVis.prototype.brushed = function() {
    var self = this;

    self.brushedRange = self.brush.empty() ? self.x2.domain() : self.brush.extent();

    console.log('Brush Range: ' + self.brushedRange);

    self.selectedRange =  testData.filter(function(d){
        if(self.brush.empty()){
            return d;
        }
        else{
            if ((self.brush.extent()[0] <= self.x(d.business_id)) && (self.x(d.business_id) <= self.brush.extent()[1])){
                return d;
            }
        }
     });

    /*self.x.domain(self.brush.empty() ? self.x2.domain() : self.brush.extent());
    self.state.attr("transform", function(d) { return "translate(" + self.x(d.business_id) + ",0)"; });
    self.focusGraph.attr("width", self.x.rangeBand());

    self.focus.select(".x.axis").call(self.xAxis);*/

    self.wrangleData()

};

RatingsVis.prototype.updateFocus = function () {
    var self = this;

    self.x.domain(self.displayData.map(function(d) { return d.business_id; }));
    self.y.domain([0, d3.max(self.displayData, function(d) { return d.total; })]);

    self.barsGroup.selectAll(".business").remove();
    self.state = self.barsGroup.selectAll(".business")
        .data(self.displayData);

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
        .style("fill", function(d) {return self.color(d.name);});

    self.focus.select(".x.axis")
        .transition().duration(500)
        .call(self.xAxis);

    self.focus.select(".y.axis")
        .transition().duration(500)
        .call(self.yAxis);

};

