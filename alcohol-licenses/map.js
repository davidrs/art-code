var LICENSES_CSV = "data/alcohol_locations.csv";
//var LICENSES_CSV = "data/poposStripped.csv";


// Leaflet map object.
var map;

var activeLine;
var margin = 20;
var height = Math.max(400,$( window ).height()) - margin;
var width = Math.min(height,$( window ).width()) - margin;
var svgContainer = d3.select("#canvas").append("svg")
                                     .attr("width", width)
                                     .attr("height", height);

var svg = d3.select("svg");
var global_delay = 500;


// Setup the leaflet map and legend;
var setupMap = function(){
	drawTitle();	
	loadCSVs();

	if(window.location.hash.indexOf("fast")>=0){
		global_delay = 100;
	}
};


var loadCSVs = function(){
	d3.csv(LICENSES_CSV, function(rows){
		rows = rows.sort(function(a,b) {
		    if(a.Orig_Iss_D < b.Orig_Iss_D) return -1;
		    if(a.Orig_Iss_D > b.Orig_Iss_D) return 1;
		    return 0;
		});
		rows = rows.filter(function(d){
			var tmp= d.X;
			d.X=d.X;
			d.Y= -d.Y;//tmp;
			return  d['License_Ty'] < 22 ;
		});
		devRows = rows; // intentional global for row debugging.
		console.log(rows.length);
		console.log(rows[0], rows[23]);
		var xScale = d3.scale.linear()
                     .domain([d3.min(rows, function(d) { return d.X; })
                     	, d3.max(rows, function(d) { return d.X; })])
                     .range([ width - margin, margin]);
		var yScale = d3.scale.linear()
                     .domain([d3.min(rows, function(d) { return d.Y; }), 
                     	d3.max(rows, function(d) { return d.Y; })])
                     .range([0, height-margin]);

		var multiplier = 2400;
		var color = d3.scale.category20();
		firstYear = rows[0].Orig_Iss_D.split('/')[0];
		console.log(firstYear);
		//console.log(firstYear);
		svg.selectAll("circle")
		    .data(rows)
		  .enter()
	      .append("circle")
		    .attr("cx", function(d) { return  ((d.X)*multiplier) % 2 < 1 ? 0 : 1000; })
		    .attr("cy", function(d) { return  ((-d.Y)*multiplier) % 2 < 1 ? 0 : 1000; })
		    .attr("r", function(d) { return 0;})
		  	.transition()
		  	.duration(function(d,i){return Math.min(9000, 3000 + i*200)})//function(d){return d.X*50;})
			.delay(function(d,i){	
				return getDelay(d,i);
				})
			.attr("fill",function(d,i){return color(d.zip);})
		    .attr("cx", function(d) { return xScale(d.X); })
		    .attr("cy", function(d) { return yScale(d.Y); })
		    .attr("r", function(d) { return 2;});

		if(window.location.hash.indexOf("timeline")>=0){
			drawLine(rows, firstYear);
		}
	});
}

var getDelay = function(d,i){
	var year = +d.Orig_Iss_D.split('/')[0];
	if (year<1976){
		return 1500 + i*250;
	}
	return (year - firstYear) *  global_delay/1.2
		+ (+d.Orig_Iss_D.split('/')[1])*30 - 4000;
}

var drawTitle = function(){
    var text = svgContainer.append('text')
     .attr("x", width/2 - 45)
     .attr("y", height/2 - 40)
     .attr("font-family", "sans-serif")
	 .attr("fill", "white")
     .attr("font-size", "25px")
     .text("SF Alcohol licenses")
     .style("opacity", 1)	         
     .transition().duration(4000)
     .style("opacity", 0);

    var text = svgContainer.append('text')
     .attr("x", width/2)
     .attr("y", height/2)
     .attr("font-family", "sans-serif")
	 .attr("fill", "white")
     .attr("font-size", "25px")
     .text("1949-2013")
     .style("opacity", 1)	         
     .transition().duration(5500).delay(1500)
     .style("opacity", 0);

}

var drawLine = function(rows, firstYear){
    //Add the SVG Text Element to the svgContainer
	var text = svgContainer.selectAll("text")
                    .data(rows)
                    .enter()
                    .append("text");

	var line = d3.svg.line()
      .interpolate("cardinal")	   
      .x(function(d,i) {
      	var multiplier = 9
      	return 36 +(+d.Orig_Iss_D.split('/')[0]- firstYear) * multiplier +d.Orig_Iss_D.split('/')[1]*multiplier/12;})
      .y(function(d,i) {return 69 - i * 60.0/rows.length})

    var path = svg.append("path")
      .attr("d", line(rows))
      .attr("stroke", "steelblue")
      .attr("stroke-width", "1")
      .attr("fill", "none");

    var totalLength = path.node().getTotalLength();

    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
        .duration(rows.length * 30*(global_delay/1000) + (2013 - firstYear) * global_delay*.8)
        .ease("linear")
        .attr("stroke-dashoffset", 0);

		
		//TODO add axis line and text, line grows with tinme.
		//Add the SVG Text Element to the svgContainer
		var text = svgContainer.append('text')
                 .attr("x", 13)
                 .attr("y", 68)
	             .attr("font-family", "sans-serif")
      			 .attr("fill", "steelblue")
	             .attr("font-size", "15px")
                 .text(firstYear);
		var text = svgContainer.append('text')
                 .attr("x", 590)
                 .attr("y", 20)
      			 .attr("fill", "steelblue")
                 .attr("font-family", "sans-serif")
                 .attr("font-size", "15px")
                 .text(rows[rows.length-1].Orig_Iss_D.split('/')[0]);

};


setupMap();