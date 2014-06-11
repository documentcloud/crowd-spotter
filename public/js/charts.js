Chart = {

  // data: [{
  //   label: "United States",
  //   data: [[1990, 18.9], [1991, 18.7], [1992, 18.4], [1993, 19.3], [1994, 19.5], [1995, 19.3], [1996, 19.4], [1997, 20.2], [1998, 19.8], [1999, 19.9], [2000, 20.4], [2001, 20.1], [2002, 20.0], [2003, 19.8], [2004, 20.4]]
  // }, {
  //   label: "Russia",
  //   data: [[1992, 13.4], [1993, 12.2], [1994, 10.6], [1995, 10.2], [1996, 10.1], [1997, 9.7], [1998, 9.5], [1999, 9.7], [2000, 9.9], [2001, 9.9], [2002, 9.9], [2003, 10.3], [2004, 10.5]]
  // }, {
  //   label: "United Kingdom",
  //   data: [[1990, 10.0], [1991, 11.3], [1992, 9.9], [1993, 9.6], [1994, 9.5], [1995, 9.5], [1996, 9.9], [1997, 9.3], [1998, 9.2], [1999, 9.2], [2000, 9.5], [2001, 9.6], [2002, 9.3], [2003, 9.4], [2004, 9.79]]
  // }, {
  //   label: "Germany",
  //   data: [[1990, 12.4], [1991, 11.2], [1992, 10.8], [1993, 10.5], [1994, 10.4], [1995, 10.2], [1996, 10.5], [1997, 10.2], [1998, 10.1], [1999, 9.6], [2000, 9.7], [2001, 10.0], [2002, 9.7], [2003, 9.8], [2004, 9.79]]
  // }, {
  //   label: "Denmark",
  //   data: [[1990, 9.7], [1991, 12.1], [1992, 10.3], [1993, 11.3], [1994, 11.7], [1995, 10.6], [1996, 12.8], [1997, 10.8], [1998, 10.3], [1999, 9.4], [2000, 8.7], [2001, 9.0], [2002, 8.9], [2003, 10.1], [2004, 9.80]]
  // }, {
  //   label: "Sweden",
  //   data: [[1990, 5.8], [1991, 6.0], [1992, 5.9], [1993, 5.5], [1994, 5.7], [1995, 5.3], [1996, 6.1], [1997, 5.4], [1998, 5.4], [1999, 5.1], [2000, 5.2], [2001, 5.4], [2002, 6.2], [2003, 5.9], [2004, 5.89]]
  // }, {
  //   label: "Norway",
  //   data: [[1990, 8.3], [1991, 8.3], [1992, 7.8], [1993, 8.3], [1994, 8.4], [1995, 5.9], [1996, 6.4], [1997, 6.7], [1998, 6.9], [1999, 7.6], [2000, 7.4], [2001, 8.1], [2002, 12.5], [2003, 9.9], [2004, 19.0]]
  // }],

  options: {
    series: {
      lines: {
	show: true
      },
      points: {
	show: true
      }
    },
    legend: {
      noColumns: 2
    },
    xaxis: {
      tickSize: [2,"hour"],
      mode: "time"
    },
    yaxis: {
      min: 0
    },
    selection: {
      mode: "x"
    }
  },

  zoomIn: function(event, ranges) {
//    $("#selection").text(ranges.xaxis.from.toFixed(1) + " to " + ranges.xaxis.to.toFixed(1));

    $.each(this.plot.getXAxes(), function(_, axis) {
      axis.options.min = ranges.xaxis.from;
      axis.options.max = ranges.xaxis.to;
    });
    this.redraw();
  },

  zoomOut: function(){
    
    var plot = this.plot, axes = this.plot.getAxes();
    $.each(this.plot.getXAxes(), function(_, axis) {

      axis.options.min = axes.xaxis.min;
      axis.options.max = axes.xaxis.max;
    });
    this.redraw();
  },
  redraw: function(){
    this.plot.setupGrid();
    this.plot.draw();
    this.plot.clearSelection();
  },
  boot: function(){
    $('#zoom-out').click(_.bind(this.zoomOut,this));
    this.container = $('.graph');
    this.container.bind("plotselected", _.bind(this.zoomIn,this));

    // this.container.bind("plotunselected", function (event) {
    //   $("#selection").text("");
    // });
    $.get('/statistics')
      .done( _.bind(this.loadData,this) )
      .fail( this.showError );
  },
  
  loadData: function(rawdata){
    var sets = {
      completed:[]
    };
    var re=/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/;
    events = [];
    _.each(rawdata, function(stats,ts){
      ts=Date.parse(ts.replace(re,"$1-$2-$3T$4:$5"));
      events.push([ts,stats.completed]);
    });
    sets.completed = _.sortBy(events, function(ev){
      return ev[0];
    });
    var data = [
      { label: "Completed", data: sets.completed }
    ];
    console.dir(data);
    this.plot = $.plot(this.container, data, this.options);
  }

};

$(function() {
  Chart.boot();
});
