var LICENSES_CSV = "data/alcohol_locations.csv";


// Leaflet map object.
var map;

var activeLine;

var svgContainer = d3.select("body").append("svg")
                                     .attr("width", 1000)
                                     .attr("height", 700);

var svg = d3.select("svg");


// Setup the leaflet map and legend;
var setupMap = function(){
	loadCSVs();
};


var loadCSVs = function(){
	d3.csv(LICENSES_CSV, function(rows){
		rows = rows.sort(function(a,b) {
		    if(a.Orig_Iss_D < b.Orig_Iss_D) return -1;
		    if(a.Orig_Iss_D > b.Orig_Iss_D) return 1;
		    return 0;
		});
		rows = rows.filter(function(d){
			return d['License_Ty'] < 22 
		});
		console.log(rows.length);
		console.log(rows[0], rows[23])
		var multiplier = 2400;
		var color = d3.scale.category20();
		firstYear = rows[0].Orig_Iss_D.split('/')[0];
		console.log(firstYear);
		//console.log(firstYear);
		svg.selectAll("circle")
		    .data(rows)
		  .enter()
	      .append("circle")
	      // Filter to license types.
		    .attr("cx", function(d) { return ((-d.X *10000) % 2) < 1?0:1000; })
		    .attr("r", function(d) { return 0;})
		    .attr("cy", function(d) {return  ((d.Y)*multiplier) % 2 < 1?0 : 1000; })

		  	.transition().duration(function(d,i){return Math.min(9000, 4000+i*200)})//function(d){return d.X*50;})
			.delay(function(d,i){	
				return getDelay(d,i);
				})// off of year.
				.attr("fill",function(d,i){return color(d.zip);})
		    .attr("cy", function(d) { return  ((d.Y)*multiplier) % multiplier - 1600; })
		    .attr("cx", function(d) { return -1* ((d.X)*multiplier) % multiplier - 700; })
		    .attr("r", function(d) { return 2;});

		if(window.location.hash.indexOf("timeline")>=0){
			drawLine(rows, firstYear);
		}
	});
}

var getDelay = function(d,i){
	var year = +d.Orig_Iss_D.split('/')[0];
	//	console.log(year-firstYear);
	return (year-firstYear) * (year<1976?500+20*i:1000) + (+d.Orig_Iss_D.split('/')[1])*30
}

var drawLine = function(rows, firstYear){
	    //Add the SVG Text Element to the svgContainer
		var text = svgContainer.selectAll("text")
                        .data(rows)
                        .enter()
	                    .append("text");

		//Add SVG Text Element Attributes
		/*
		var textLabel = svgContainer.selectAll("text")
                 .attr("x", function(d,i){return i*30})
                 .attr("y", 20)
                 .text('text')
                 .attr("font-family", "sans-serif")
                 .attr("font-size", "15px")
                 .text( function (d) { return d.Orig_Iss_D; })
			     .style("opacity", 0)	         
                 .transition().duration(9000).delay(function(d,i){return i*1000;})
				.style("opacity", 1)
    				*/

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
        .duration(rows.length * 30 + (2013 - firstYear) * 800)
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
