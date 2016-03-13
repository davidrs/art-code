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
		var multiplier = 2400;
		var color = d3.scale.category20();
		svg.selectAll("circle")
		    .data(rows)
		  .enter()
	      .append("circle")
	      // Filter to license types.
	      .filter(function(d) { return d['License_Ty'] < 22 })
		    .attr("cx", function(d) { console.log(d.Orig_Iss_D); return ((-d.X *10000) % 2) < 1?0:1000; })
		    .attr("r", function(d) { return 0;})
		    .attr("cy", function(d) {return  ((d.Y)*multiplier) % 2 < 1?0 : 1000; })

		  	.transition().duration(9000)//function(d){return d.X*50;})
			.delay(function(d,i){return i*50;})
 			.attr("fill",function(d,i){return color(d.zip);})
		    .attr("cy", function(d) { return  ((d.Y)*multiplier) % multiplier - 1600; })
		    .attr("cx", function(d) { return -1* ((d.X)*multiplier) % multiplier - 700; })
		    .attr("r", function(d) { return 2;});

		//drawLine(rows);
	});
}

var drawLine = function(rows){
		    //Add the SVG Text Element to the svgContainer
			var text = svgContainer.selectAll("text")
	                        .data(rows)
	                        .enter()
 	                        .append("text")
	      					.filter(function(d) { return d['License_Ty'] < 22 });
	
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
//TODO add data filter
	    var line = d3.svg.line()
      .interpolate("cardinal")	      
      .x(function(d,i) {return i*3/4;})
      .y(function(d) {return 5*Math.random();})

    var path = svg.append("path")
      .attr("d", line(rows))
      .attr("stroke", "steelblue")
      .attr("stroke-width", "2")
      .attr("fill", "none");

    var totalLength = path.node().getTotalLength();

    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
        .duration(rows.length *50+9000)
        .ease("linear")
        .attr("stroke-dashoffset", 0);

		
		//TODO add axis line and text, line grows with tinme.
		//Add the SVG Text Element to the svgContainer
		var text = svgContainer.append('text')
                 .attr("x", 10)
                 .attr("y", 20)
                 .text(rows[0].Orig_Iss_D);
		var text = svgContainer.append('text')
                 .attr("x", 500)
                 .attr("y", 20)
                 .text(rows[rows.length-1].Orig_Iss_D);

};

// Determines colour of map polygons.
var getColor = function(d) {
	return d > 1.5 ? '#800012' :
	       d >= 1.01  ? '#FC532A' :
	       d >= 1.0  ? '#FDFD3C' :
	       d > 0.5   ? '#D9FE76' :
	       d >= 0.0   ? '#B2FE4C' :
	                  '#EEE';
}


var resetHighlight = function(e) {
	geojson.resetStyle(e.target);
	info.update();
}

var zoomToFeature = function(e) {
	map.fitBounds(e.target.getBounds());
}


var onEachFeature = function(feature, layer) {
	var censusTract = +feature.properties.TRACT;
	feature.properties.censusTract = censusTract;
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: zoomToFeature
	});
}

// Pretty round a # to 2 decimal digits.
var prettyRound = function(number){
	return Math.round(number * 100);
}

// Get the ratio of actual to quota for a specific census tract.
var getRatio = function(censusTract, label){
	return (combinedData[censusTract][label].actual / combinedData[censusTract][label].quota);
}

// Get the difference between the quote and actual # of licenses for a specific census tract.
var getDelta = function(censusTract, label){
	return (combinedData[censusTract][label].quota - combinedData[censusTract][label].actual);
}

