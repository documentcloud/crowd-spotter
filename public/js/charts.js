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
    _.bindAll(this,'zoomIn','zoomOut','fetchData','loadData');
    $('#zoom-out').click(this.zoomOut);
    this.container = $('.graph');
    this.container.bind("plotselected", this.zoomIn);

    // this.container.bind("plotunselected", function (event) {
    //   $("#selection").text("");
    // });
    this.zooms=[];
    var me =this;
    this.fetchData('/statistics');
  },

  fetchData: function(url){
    if ( ! url )
      url = '/statistics/most-recent';
    $.get(url)
      .done( this.loadData )
      .fail( this.showError );
  },

  processData: function(rawdata){
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
    return sets;
  },

  loadData: function(rawdata){
    var sets = this.processData(rawdata);
    if ( ! this.sets ){
      this.sets = sets;
    } else {
      _.each(sets,function(value,key){
        this.sets[key] = this.sets[key].concat( value );
      },this);
    }
    this.plot = $.plot(this.container, [
      { label: "Started",    data: this.sets.started    },
      { label: "Completed",  data: this.sets.completed  },
      { label: "Failures",   data: this.sets.failures   },
      { label: "Processing", data: this.sets.processing }
    ], this.options);

    setTimeout(this.fetchData, 1000);

  }

};

$(function() {
  Chart.boot();
});
