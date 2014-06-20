// A plugin for Flot that handles selection based zooming
// and toggles logarithmic display on the Y scale
(function ($) {


  $.plot.plugins.push({
    name: 'zoomer',
    version: '0.1',
    init: function(plot) {
      plot.hooks.draw.push(initialize);
    }
  });

  function initialize(plot, canvascontext) {
    var placeholder = plot.getPlaceholder(),
               data = placeholder.data();
    data.zoomer = ( data.zoomer || new ZoomChart(placeholder) );
    data.zoomer.onChartDraw();
  }

  function ZoomChart( placholder ){
    this.$el         = placholder;
    this.data        = this.$el.data();
    this.zooms       = [];
    this.logarithmic = false;
    this.controls = $("<tr><td class='scale' colspan='2'><label><input type='checkbox'>Logarithmic</label></td></tr>" +
                      "<tr><td class='zoom' colspan='2'><button>Zoom Out</button></td></tr>" );
    _.bindAll(this,'zoomIn','zoomOut','toggleScale');
    placholder
      .on("plotselected",          this.zoomIn )
      .on("click", ".zoom",        this.zoomOut )
      .on("change",".scale input", this.toggleScale );
  }

  ZoomChart.prototype.onChartDraw = function(){
    this.$el.find('.legend table tbody').append( this.controls );
    this.$el.find('.scale input')[0].checked = this.logarithmic;
    this.$el.find('.legend td.zoom').toggle( !!this.zooms.length );
    if ( ! this.manipulating ){
      if ( this.zooms.length ){
        var zoom = this.zooms[this.zooms.length-1];
        this.zoomTo(zoom.from, zoom.to );
      }
      if ( this.logarithmic ){
        this.setScale();
      }
    }
  };

  ZoomChart.prototype.zoomIn = function(event,ranges){
    var axis = this.data.plot.getAxes();
    this.zooms.push({
      from: ranges.xaxis.from,  to: ranges.xaxis.to,
      xmin: axis.xaxis.min,   xmax: axis.xaxis.max,
      ymin: axis.yaxis.min,   ymax: axis.yaxis.max
    });
    this.zoomTo(ranges.xaxis.from, ranges.xaxis.to);
  };

  ZoomChart.prototype.zoomTo = function(from, to){
    var plot = this.data.plot;
    $.each(plot.getYAxes(), function(_, axis) {
      var ymin, ymax;
      $.each(plot.getData(), function (e, val) {
        $.each(val.data, function (e1, val1) {

          if ((val1[0] >= from) && (val1[0] <= to)) {
            if (ymax == null || val1[1] > ymax) ymax = val1[1];
            if (ymin == null || val1[1] < ymin) ymin = val1[1];
          }
        });
      });
      axis.options.min = ymin * 1.1;
      axis.options.max = ymax * 1.1;
    });
    $.each(plot.getXAxes(), function(_, axis) {
      axis.options.min = from;
      axis.options.max = to;
    });
    this.redraw();
  };

  ZoomChart.prototype.redraw = function(){
    this.manipulating=true;
    this.data.plot.setupGrid();
    this.data.plot.draw();
    this.data.plot.clearSelection();
    this.manipulating=false;
  };

  var inverseLogarithmic = function(v) { return Math.exp(v);              };
  var scaleLogarithmic   = function(v) { return v == 0 ? v : Math.log(v); };

  ZoomChart.prototype.setScale = function(){
    this.data.plot.getAxes().yaxis.options.transform        = this.logarithmic ? scaleLogarithmic   : undefined;
    this.data.plot.getAxes().yaxis.options.inverseTransform = this.logarithmic ? inverseLogarithmic : undefined;
    this.redraw();
  };

  ZoomChart.prototype.toggleScale = function(){
    this.logarithmic = ! this.logarithmic;
    this.setScale();
  };

  ZoomChart.prototype.zoomOut = function(){
    var zoom = this.zooms.pop();
    if ( ! zoom ) return;
    var axis = this.data.plot.getAxes();
    axis.xaxis.options.min = zoom.xmin;
    axis.xaxis.options.max = zoom.xmax;
    axis.yaxis.options.min = zoom.ymin;
    axis.yaxis.options.max = zoom.ymax;
    this.redraw();
  };

})(jQuery);
