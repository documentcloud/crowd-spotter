Chart = {

  options: {
    series: {
      lines: {
        show: true
      }//,
      // points: {
      //   show: true
      // }
    },
    legend: {
      noColumns: 2
    },
    xaxis: {
      tickSize: [6,"hour"],
      mode: "time"
    },
    yaxis: {
      min: 0,
      transform: function (v) {
        return v == 0 ? v : Math.log(v);
      },
    },
    selection: {
      mode: "x"
    }
  },

  zoomIn: function(event, ranges) {

    this.zooms.push({ min: this.plot.getAxes().xaxis.min, max: this.plot.getAxes().xaxis.max });

    $.each(this.plot.getXAxes(), function(_, axis) {
      axis.options.min = ranges.xaxis.from;
      axis.options.max = ranges.xaxis.to;
    });
    this.redraw();
  },

  zoomOut: function(){
    var zoom = this.zooms.pop();
    if ( ! zoom ) return;
    $.each(this.plot.getXAxes(), function(_, axis) {
      axis.options.min = zoom.min;
      axis.options.max = zoom.max;
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
      completed  :[],
      failures   :[],
      processing :[],
      started    :[]
    };
    var re=/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/;
    events = [];

    _.each(rawdata, function(stats,ts){
      ts=Date.parse(ts.replace(re,"$1-$2-$3T$4:$5"));
      _.each(sets,function(value,key){
        sets[key].push([ts, stats[key]]);
      });
    });
    // sort values by timestamp
    _.each(sets,function(value,key){
      sets[key] = _.sortBy(sets[key], function(event){
        return event[0];
      });
    });

    var data = [
      { label: "Completed",  data: sets.completed  },
      { label: "Failures",   data: sets.failures   },
      //{ label: "Processing", data: sets.processing },
      { label: "Started",    data: sets.started    }
    ];
    console.dir(data);
    this.plot = $.plot(this.container, data, this.options);
    this.zooms=[];
    this.processing = $.plot( $('.processing'), [{ label: "Processing", data: sets.processing }], this.options);
  }

};

$(function() {
  Chart.boot();
});
