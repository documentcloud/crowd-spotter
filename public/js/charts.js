function Chart( options ){
  _.extend(this,options);
  for (var i = 0, l = this.plots.length; i < l; i++) {
    this.plots[i].data = [];
  }
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
    grid: {
      hoverable: true,
      clickable: true
    },
    xaxis: {
      mode: "time",
      timezone: "browser",
      timeformat: "%b %d %l:%M%p"
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
      },
      getLabel: function(date,y){
        if (y){
          return date + " UP";
        } else {
          return date + " DOWN";
        }
      }

    }

  ],

  charts: [],

  boot: function(){
    _.bindAll(this,'fetchData','loadData','showError','fetchData','redraw','toolTip');
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
    this.favicon = new Favico({animation:'popFade'});
    $("body").on('plothover', this.toolTip);
  },

  toolTip: function (event, pos, item) {
    if (item) {
      var date = $.plot.formatDate(new Date(item.datapoint[0]),"%b %d %l:%M%p"),
          y = item.datapoint[1],
          chart = $(event.target),
          label = y + " " + item.series.label + " on " + date;
      for (var ci = 0, cl = this.charts.length; ci < cl; ci++) {
        if ( chart.hasClass(this.charts[ci].id) && _.isFunction(this.charts[ci].getLabel) ){
          label = this.charts[ci].getLabel(date,y);
          break;
        }
      }
      var position = { top: item.pageY-25 },
          page_width = $(document).width();
      if ( page_width - 300 < item.pageX ){
        _.extend(position,{ right: page_width - item.pageX + 5, left: 'auto'});
      } else {
        _.extend(position,{ left: item.pageX+5,  right: 'auto'});
      }
      $(".tooltip").html(label)
        .css(position)
        .fadeIn(200);
    } else {
      $(".tooltip").hide();
    }
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

  loadData: function(sets){
    for (var ci = 0, cl = this.charts.length; ci < cl; ci++) {
      var chart = this.charts[ci],
           data = [];
      for (var i = 0, l = chart.plots.length; i < l; i++) {
        data.push(sets[chart.plots[i].key]);
      }
      chart.addData(data);
    }
    this.container.find('.error').hide();
    if ( sets.uptime_percentages ) {
      this.container.find('.uptime_percentages .7').html(sets.uptime_percentages[0]);
      this.container.find('.uptime_percentages .30').html(sets.uptime_percentages[1]);
    }
    var last = sets.processing[sets.processing.length-1];
    if ( last ) this.favicon.badge( last[1] );
    setTimeout(this.fetchData, 60000);

  }

};

$(function() {
  Charts.boot();
});
