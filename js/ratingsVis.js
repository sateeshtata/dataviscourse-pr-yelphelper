
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
    {"business_id": 'Utah', "5_stars": 23, "4_stars": 30, "3_stars":10, "2_stars": 5, "1_stars": 2, "total": 70}
];

RatingsVis.prototype.initVis = function () {
    var self = this;

    self.margin = {top: 20, right: 20, bottom: 30, left: 40};
    self.width = 600 - self.margin.left - self.margin.right;
    self.height = 350 - self.margin.top - self.margin.bottom;

    self.x = d3.scale.ordinal()
        .rangeRoundBands([0, self.width], .1);

    self.y = d3.scale.linear()
        .rangeRound([self.height, 0]);

    self.color = d3.scale.ordinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    self.xAxis = d3.svg.axis()
        .scale(self.x)
        .orient("bottom");

    self.yAxis = d3.svg.axis()
        .scale(self.y)
        .orient("left")
        .tickFormat(d3.format(".2s"));

    self.svg = self.parentElement
        .attr("width", self.width + self.margin.left + self.margin.right)
        .attr("height", self.height + self.margin.top + self.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

    // filter, aggregate, modify data
    self.wrangleData();

    self.updateVis();
};

RatingsVis.prototype.brushed = function() {
    var self = this;

    self.eventHandler.selectionChanged(self.brush.extent()[0], self.brush.extent()[1]);
}

/**
 * Method to wrangle the data
 */
RatingsVis.prototype.wrangleData = function () {
    var self = this;

    // displayData should hold the data which is visualized
    // pretty simple in this case -- no modifications needed
    self.displayData = self.data;
};

/**
 * The main drawing function
 */
RatingsVis.prototype.updateVis = function () {

    var self = this;

    self.color.domain(['5_stars', '4_stars', '3_stars', '2_stars', '1_stars']);
    console.log('Domain Values Initial:'+ self.color.domain());
    //self.color.domain(d3.keys(data[0]).filter(function(key) { console.log('Keys:'+key!=="State");return key !== "State"; }));
    //console.log('Color Domain: '+ d3.keys(data[0]).filter(function(key) { console.log('Keys:'+key!=="State");return key !== "State"; }))

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

    testData.sort(function(a, b) { return b.total - a.total; });

    self.x.domain(testData.map(function(d) { return d.business_id; }));
    self.y.domain([0, d3.max(testData, function(d) { return d.total; })]);

    self.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + self.height + ")")
        .call(self.xAxis);

    self.svg.append("g")
        .attr("class", "y axis")
        .call(self.yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Ratings");

    self.state = self.svg.selectAll(".state")
        .data(testData)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform", function(d) { return "translate(" + self.x(d.business_id) + ",0)"; });

    self.state.selectAll("rect")
        .data(function(d) { return d.stars; })
        .enter().append("rect")
        .attr("width", self.x.rangeBand())
        .attr("y", function(d) { return self.y(d.y1); })
        .attr("height", function(d) { return self.y(d.y0) - self.y(d.y1); })
        .style("fill", function(d) { return self.color(d.name); });

    console.log('Domain Values: '+ self.color.domain().slice().reverse());

    self.legend = self.svg.selectAll(".legend")
        .data(self.color.domain().slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    self.legend.append("rect")
        .attr("x", self.width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", self.color);

    self.legend.append("text")
        .attr("x", self.width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });


};

RatingsVis.prototype.draw = function () {
    var self = this;

    self.visG.selectAll(".area").attr("d", self.area);
    self.visG.select(".xAxis.axis").call(self.xAxis);
    // Force changing brush range
    //brush.extent(x.domain());
    //svg.select(".brush").call(brush);
}

/**
 * Creates the y axis slider
 * @param svg -- the svg element to which the slider is attached
 * See http://bl.ocks.org/mbostock/6452972 for an example
 * TODO: implement the update of the scale according to the value of the slider in this function
 */
RatingsVis.prototype.addSlider = function (svg) {
    var self = this;

    // Think of what is domain and what is range for the y axis slider !!

    var sliderScale = d3.scale.linear().domain([1, 0.1]).range([200, 0]);

    var sliderDragged = function () {
        var value = Math.max(0, Math.min(200, d3.event.y));

        var sliderValue = sliderScale.invert(value);

        // ******* TASK 2b *******
        // the current value of the slider:
        //console.log("Y Axis Slider value: ", sliderValue);

        // do something here to deform the y scale
        self.yScale.exponent(sliderValue);

        d3.select(this)
            .attr("y", function () {
                return sliderScale(sliderValue);
            });

        self.updateVis({});
    };
    var sliderDragBehaviour = d3.behavior.drag()
        .on("drag", sliderDragged);

    var sliderGroup = svg.append("g").attr({
        class: "sliderGroup",
        "transform": "translate(" + 0 + "," + 30 + ")"
    });

    sliderGroup.append("rect").attr({
        class: "sliderBg",
        x: 5,
        width: 10,
        height: 200
    }).style({
        fill: "lightgray"
    });

    sliderGroup.append("rect").attr({
        "class": "sliderHandle",
        y: sliderScale(1),
        width: 20,
        height: 10,
        rx: 2,
        ry: 2
    }).style({
        fill: "#333333"
    }).call(sliderDragBehaviour);
};