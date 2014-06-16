function Chart(plots, options){
  this.plots = plots;
  for (var i = 0, l = this.plots.length; i < l; i++) {
    this.plots[i].data = [];
  }
  this.options = _.clone(options);
  // this.options.series = _.clone(chart_options.series);
  //   this.options.series.color = options.color;

  this.element = $('<div class="chart"></div>');
}

Chart.prototype.addData = function(data){
  for (var i = 0, l = this.plots.length; i < l; i++) {
    this.plots[i].data = this.plots[i].data.concat( data[i] );
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
  options: {
    series: {
      lines: {
        show: true
      }
    },
    xaxis: {
      tickSize: [8,"hour"],
      mode: "time"
    },
    yaxis: {
    },
    selection: {
      mode: "x"
    }
  },

  chart_plots: [
    [
      { key: 'completed',  label: 'Completed', color: "#edc240" },
      { key: 'failures',   label: 'Failures',  color: "#afd8f8" },
      { key: 'started',    label: 'Started',   color: "#4da74d" }
    ],[
      { key: 'processing', label: 'Processing',color: "#cb4b4b" }
    ]
  ],

  charts: [],

  boot: function(){
    _.bindAll(this,'fetchData','loadData');
    this.container = $('.charts');

//    $.get("http://api.uptimerobot.com/getMonitors?apiKey=m776152683-48dd47ea1fca7d9a96c7d64b&logs=1&alertContacts=1&responseTimes=1&responseTimesAverage=180&monitors=15830-32696&format=json")

    for (var i = 0, l = this.chart_plots.length; i < l; i++) {
      var chart = new Chart(this.chart_plots[i], this.options);
      this.charts.push(chart);
      this.container.append( chart.element );
    }
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
    for (var ci = 0, l = this.charts.length; ci < l; ci++) {
      var chart = this.charts[ci],
           data = [];
      for (var i = 0, l = chart.plots.length; i < l; i++) {
        data.push(sets[chart.plots[i].key]);
      }
      chart.addData(data);
    }

    setTimeout(this.fetchData, 1000);

  }

};

$(function() {
  Charts.boot();
});
