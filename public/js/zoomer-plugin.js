// A plugin for Flot that handles selection based zooming
// and toggles logarithmic display on the Y scale
(function ($) {

  function init(plot) {
    plot.hooks.draw.push(initialize);
  };

  function initialize(plot, canvascontext) {
    var scale = "<tr><td class='scale' colspan='2'><label><input type='checkbox'>Logarithmic</label></td></tr>",
        zoom  = "<tr><td class='zoom' colspan='2'><button>Zoom Out</button></td></tr>";
    var $placeholder = plot.getPlaceholder();
    $placeholder.find('.legend table tbody').append( scale + zoom );
    if ( ! _.isArray(plot.zooms) ){ // prevent double binding
      $placeholder.on('click',".zoom", function(){zoomOut(plot);});

      $placeholder.on('change','.scale input', function(){toggleScale(plot);});

      plot.zooms = [];
      plot.logarithmic = false;
      $placeholder.on("plotselected", function(event,ranges){ zoomIn(plot,ranges);});
    }
    $placeholder.find('.scale input')[0].checked = plot.logarithmic;
    $placeholder.find('.legend td.zoom').toggle( !!plot.zooms.length );
  }

  function redraw(plot){
    plot.setupGrid();
    plot.draw();
    plot.clearSelection();
  }

  function scaleLogarithmic(v) {
    return v == 0 ? v : Math.log(v);
  }

  function toggleScale(plot){
    plot.logarithmic = ! plot.logarithmic;
    plot.getAxes().yaxis.options.transform = plot.logarithmic ? scaleLogarithmic : undefined;
    redraw(plot);
  }

  function zoomIn(plot,ranges){
    var axis = plot.getAxes();
    plot.zooms.push({ xmin: axis.xaxis.min, xmax: axis.xaxis.max, ymin: axis.yaxis.min, ymax: axis.yaxis.max });
    $.each(plot.getYAxes(), function(_, axis) {
      var ymin, ymax;
      $.each(plot.getData(), function (e, val) {
        $.each(val.data, function (e1, val1) {

          if ((val1[0] >= ranges.xaxis.from) && (val1[0] <= ranges.xaxis.to)) {
            if (ymax == null || val1[1] > ymax) ymax = val1[1];
            if (ymin == null || val1[1] < ymin) ymin = val1[1];
          }
        });
      });
      axis.options.min = ymin;
      axis.options.max = ymax;
    });

    $.each(plot.getXAxes(), function(_, axis) {
      axis.options.min = ranges.xaxis.from;
      axis.options.max = ranges.xaxis.to;
    });
    redraw(plot);
  }

  function zoomOut(plot){
    var zoom = plot.zooms.pop();
    if ( ! zoom ) return;
    var axis = plot.getAxes();
    axis.xaxis.options.min = zoom.xmin;
    axis.xaxis.options.max = zoom.xmax;
    axis.yaxis.options.min = zoom.ymin;
    axis.yaxis.options.max = zoom.ymax;
    redraw(plot);
  }

  $.plot.plugins.push({
    init: init,
    name: 'zoomer',
    version: '0.1'
  });


})(jQuery);
