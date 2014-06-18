function Chart(plots, options ){
  this.plots = plots;
  for (var i = 0, l = this.plots.length; i < l; i++) {
    this.plots[i].data = [];
  }
  this.options = _.clone(options);
  this.element = $('<div class="chart"></div>');
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
  options: {
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
      plots: [
        { key: 'completed',  label: 'Completed', color: "#edc240" },
        { key: 'failures',   label: 'Failures',  color: "#afd8f8" },
        { key: 'started',    label: 'Started',   color: "#4da74d" }
      ]
    },{
      plots: [
        { key: 'processing', label: 'Processing',color: "#cb4b4b" }
      ]
    },{
      plots:[
        { key: 'latency', label: 'Latency',color: "#FF7E00" }
      ]
    },{
      plots:[
        { key: 'uptime', label: 'Up time',color: "#5D8AA8", steps: true }
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
    _.bindAll(this,'fetchData','loadData','showError','fetchData');
    this.container = $('.charts');
    this.container.on('click','button.retry', this.fetchData);

    for (var i = 0, l = this.chart_plots.length; i < l; i++) {
      var chart = new Chart(this.chart_plots[i].plots, _.extend(this.options,this.chart_plots[i].options) );
      this.charts.push(chart);
      this.container.append( chart.element );
    }
    this.fetchData('/statistics');
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
