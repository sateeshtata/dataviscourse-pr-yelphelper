/**
 * Created by Sateesh on 11/28/15.
 */
/**
 * Created by Sateesh on 11/19/15.
 */
/*globals d3, jQuery*/

function SunBurstVis(_parentElement, _data, _metaData, _eventHandler) {

    var self = this;

    self.parentElement = _parentElement;
    self.data = _data;
    self.metaData = _metaData;
    self.eventHandler = _eventHandler;
    self.displayData = [];

    self.initVis();

    console.log('sunburst : ' + self.data);
}


SunBurstVis.prototype.expandLegend = function (){
    var exp = chart.legend.expanded();
    chart.legend.expanded(!exp);
    chart.update();
}

/**
 * Method should be called as soon as data is available. Sets up the SVG and the variables
 * @param _data -- the data array
 * @param _metaData -- the meta-data / data description object
 */
SunBurstVis.prototype.initVis = function () {
    var self = this;

    self.width = 350;
    self.height = 350;

    self.radius = Math.min(self.width, self.height) / 2;

    self.x = d3.scale.linear()
        .range([0, 2 * Math.PI]);

    self.y = d3.scale.linear()
        .range([0, self.radius]);

    self.color = d3.scale.category20c();

    self.updateVis();
};

SunBurstVis.prototype.brushed = function() {
    var self = this;

    self.eventHandler.selectionChanged(self.brush.extent()[0], self.brush.extent()[1]);
}

/**
 * Method to wrangle the data
 */
SunBurstVis.prototype.wrangleData = function () {
    var self = this;

    // displayData should hold the data which is visualized
    // pretty simple in this case -- no modifications needed
    self.displayData = self.data;
};

/**
 * The main drawing function
 */
SunBurstVis.prototype.updateVis = function () {

    var self = this;

    self.svg = self.parentElement
        .attr("width", self.width)
        .attr("height", self.height)
        .datum(self.data)
        .append("g")
        .attr("transform", "translate(" + self.width / 2 + "," + (self.height / 2 + 10) + ")");

    self.partition = d3.layout.partition()
        .value(function(d) { return d.size; });

    self.arc = d3.svg.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, self.x(d.x))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, self.x(d.x + d.dx))); })
        .innerRadius(function(d) { return Math.max(0, self.y(d.y)); })
        .outerRadius(function(d) { return Math.max(0, self.y(d.y + d.dy)); });

    self.g = self.svg.selectAll("g")
        .data(self.partition.nodes)
        .enter().append("g");

    self.path = self.g.append("path")
        .attr("d", self.arc)
        .style("fill", function(d) { return self.color((d.children ? d : d.parent).name); })
        .on("click", function(d) {
            self.click(d);
        });

    /*self.text = self.g.append("text")
        .attr("transform", function(d) { return "rotate(" + self.computeTextRotation(d) + ")"; })
        .attr("x", function(d) { return self.y(d.y); })
        .attr("dx", "6") // margin
        .attr("dy", ".35em") // vertical-align
        .text(function(d) { return d.name; });*/

    d3.select(self.frameElement).style("height", self.height + "px");
};

SunBurstVis.prototype.click = function (d) {
    var self = this;
    // fade out all text elements
    //self.text.transition().attr("opacity", 0);
    var keys = d.name.split('>^<');
    var key = keys[1];

    console.log('Clicked: '+ keys[0]);
    console.log('Data: ' + JSON.stringify(self.metaData[0][key]));

    self.path.transition()
        .duration(750)
        .attrTween("d", self.arcTween(d))
        .each("end", function(e, i) {
            // check if the animated element's data e lies within the visible angle span given in d
            if (e.x >= d.x && e.x < (d.x + d.dx)) {
                // get a selection of the associated text element
                self.arcText = d3.select(this.parentNode).select("text");
                // fade in the text element and recalculate positions
                self.arcText.transition().duration(750)
                    .attr("opacity", 1)
                    .attr("x", function(d) { return self.y(d.y); });
            }
        });
};


SunBurstVis.prototype.arcTween = function (d) {
    var self = this;

    self.xd = d3.interpolate(self.x.domain(), [d.x, d.x + d.dx]);
    self.yd = d3.interpolate(self.y.domain(), [d.y, 1]);
    self.yr = d3.interpolate(self.y.range(), [d.y ? 20 : 0, self.radius]);
    return function(d, i) {
        return i
            ? function(t) { return self.arc(d); }
            : function(t) { self.x.domain(self.xd(t)); self.y.domain(self.yd(t)).range(self.yr(t)); return self.arc(d); };
    };
}

/*SunBurstVis.prototype.computeTextRotation = function (d) {
    var self = this;

    return (self.x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
}*/

SunBurstVis.prototype.draw = function () {
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
SunBurstVis.prototype.addSlider = function (svg) {
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