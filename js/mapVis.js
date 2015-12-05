/**
 * Created by Sateesh on 11/19/15.
 */
/*globals d3, jQuery*/

function MapVis(_parentElement, _data, _metaData, _eventHandler) {

    var self = this;

    self.parentElement = _parentElement;
    self.data = _data;
    self.metaData = _metaData;
    self.eventHandler = _eventHandler;
    self.displayData = [];

    self.initVis();
}

MapVis.prototype.expandLegend = function (){
    var exp = chart.legend.expanded();
    chart.legend.expanded(!exp);
    chart.update();
}

MapVis.prototype.initVis = function () {
    var self = this;

    self.svg = self.parentElement;


    //self.updateVis();
};

MapVis.prototype.brushed = function() {
    var self = this;

    self.eventHandler.selectionChanged(self.brush.extent()[0], self.brush.extent()[1]);
}

/**
 * Method to wrangle the data
 */
MapVis.prototype.wrangleData = function () {
    var self = this;

    // displayData should hold the data which is visualized
    // pretty simple in this case -- no modifications needed
    self.displayData = self.data;
};

/**
 * The main drawing function
 */
MapVis.prototype.updateVis = function () {

    var self = this;

    // update the scales :
    self.yAxis.scale(self.yScale);
    self.xAxis.scale(self.xScale);

    // draw the scales :
    self.visG.select(".xAxis").call(self.xAxis);
    self.visG.select(".yAxis").call(self.yAxis);

    // ******* TASK 2a *******
    // update the brush


    // ******* BONUS TASK 2c *******
    // add zoom, and block two events
    //self.zoom.self.xScale(self.xScale);

    self.area = d3.svg.area()
        .x(function (d) {
            return self.xScale(d.time);
        })
        .y0(270)
        .y1(function (d) {
            return self.yScale(d.count);
        });
    self.area.interpolate("step");

    // ******* BONUS TASK 2c (you will need to edit this code) *******
    var areaGraph = self.visG.selectAll(".area").data([self.displayData]);
    areaGraph.enter()
        .append("path")
        .attr("class", "area");
    areaGraph
        .attr("d", self.area);
};

MapVis.prototype.draw = function () {
    var self = this;

    self.visG.selectAll(".area").attr("d", self.area);
    self.visG.select(".xAxis.axis").call(self.xAxis);

}


MapVis.prototype.addSlider = function (svg) {
    var self = this;

    // Think of what is domain and what is range for the y axis slider !!

    var sliderScale = d3.scale.linear().domain([1, 0.1]).range([200, 0]);

    var sliderDragged = function () {
        var value = Math.max(0, Math.min(200, d3.event.y));

        var sliderValue = sliderScale.invert(value);

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