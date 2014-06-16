// A plugin for Flot that handles selection based zooming
// 
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
//    var scale = plot.getPlaceholder().find('td.scale');

    plot.logarithmic = ! plot.logarithmic;
    console.log( "toggle: " + plot.logarithmic );
    plot.getAxes().yaxis.options.transform = plot.logarithmic ? scaleLogarithmic : undefined;
    redraw(plot);
  }

  function zoomIn(plot,ranges){
    plot.zooms.push({ min: plot.getAxes().xaxis.min, max: plot.getAxes().xaxis.max });
    $.each(plot.getXAxes(), function(_, axis) {
      axis.options.min = ranges.xaxis.from;
      axis.options.max = ranges.xaxis.to;
    });
    redraw(plot);
  }

  function zoomOut(plot){
    var zoom = plot.zooms.pop();
    if ( ! zoom ) return;
    $.each(plot.getXAxes(), function(_, axis) {
      axis.options.min = zoom.min;
      axis.options.max = zoom.max;
    });
    redraw(plot);
  }

  $.plot.plugins.push({
    init: init,
    name: 'zoomer',
    version: '0.1'
  });


})(jQuery);
