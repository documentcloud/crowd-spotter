function Chart( options ){
    //.plots, _.extend(this.options,this.chart_plots[i].options
  _.extend(this,options);
  for (var i = 0, l = this.plots.length; i < l; i++) {
    this.plots[i].data = [];
  }
//  this.options = _.clone(options);
  //this.element = $('<div class="chart"></div>');
}

Chart.prototype.addData = function(data){
  for (var i = 0, l = this.plots.length; i < l; i++) {
    if ( data[i] ){
      this.plots[i].data = _.sortBy(this.plots[i].data.concat( data[i] ), function(event){
        return event[0];
      });
    }
  }
  this.draw();
};

Chart.prototype.plots = function(){
  var ret = [];
  for (i = 0, l = this.plots.length; i < l; i++) {
    var plot = this.plots[i];
  }
};

Chart.prototype.draw = function(){
  this.plot = $.plot(this.element, this.plots, this.options);
};


Charts = {
  default_options: {
    series: {
      lines: {
        show: true
      }
    },
    xaxis: {
      mode: "time",
      timezone: "browser",
      timeformat: "%b %d %h:%M%p"
    },
    yaxis: {
    },
    selection: {
      mode: "x"
    }
  },

  chart_plots: [
    {
      id: 'activity',
      plots: [
        { key: 'completed',  label: 'Completed', color: "#edc240" },
        { key: 'failures',   label: 'Failures',  color: "#afd8f8" },
        { key: 'started',    label: 'Started',   color: "#4da74d" }
      ]
    },{
      id: 'processing',
      plots: [
        { key: 'processing', label: 'Processing',color: "#cb4b4b" }
      ]
    },{
      id: 'latency',
      plots:[
        { key: 'latency', label: 'Latency',color: "#FF7E00" }
      ]
    },{
      id: 'uptime',
      plots:[
        { key: 'uptime', label: 'Uptime',color: "#5D8AA8", steps: true }
      ],
      options: {
        series: {
          lines: {
            show: true,
            steps: true
          }
        },
        xaxis: {
          mode: "time"
        }

      }

    }

  ],

  charts: [],

  boot: function(){
    _.bindAll(this,'fetchData','loadData','showError','fetchData','redraw');
    this.container = $('.charts');
    this.container.on('click','button.retry', this.fetchData);

    for (var i = 0, l = this.chart_plots.length; i < l; i++) {
      this.chart_plots[i].options = ( this.chart_plots[i].options || {} );
      _.defaults( this.chart_plots[i].options, this.default_options );
      var chart = new Chart( this.chart_plots[i] );

      this.charts.push(chart);

      var div = this.container.find(".chart."+chart.id);
      if ( div.length )
        chart.element = div;
      else
        throw "Unable to find container for " + chart.id;
    }
    this.fetchData('/statistics');
    $(window).on('resize', _.debounce(this.redraw,300) );
  },
  redraw: function(){
    for (var ci = 0, cl = this.charts.length; ci < cl; ci++) {
      this.charts[ci].draw();
    }
  },
  fetchData: function(url){
    if ( !_.isString(url) )
      url = '/statistics/most-recent';
    $.get(url)
      .done( this.loadData )
      .fail( this.showError );
  },

  showError: function(){
    this.container.find('.error').show();
  },

  loadData: function(rawdata){
    var sets = rawdata;
    for (var ci = 0, cl = this.charts.length; ci < cl; ci++) {
      var chart = this.charts[ci],
           data = [];
      for (var i = 0, l = chart.plots.length; i < l; i++) {
        data.push(sets[chart.plots[i].key]);
      }
      chart.addData(data);
    }
    this.container.find('.error').hide();

    setTimeout(this.fetchData, 60000);

  }

};

$(function() {
  Charts.boot();
});
