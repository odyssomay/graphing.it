var calculate_path, calculate_points, draw_border, draw_graph, draw_grid, draw_scales, element, get_paper_x, get_paper_y, paper, r, redraw, viewModel;
viewModel = {
  functions: ko.observableArray([
    {
      source: "Math.sin(x)",
      stroke: "#800"
    }
  ]),
  add_function: function() {
    return this.functions.push({
      source: "",
      stroke: "#888"
    });
  },
  range_x_min: -8,
  range_x_max: 8,
  range_y_min: -10,
  range_y_max: 10,
  resolution: 0.01
};
ko.applyBindings(viewModel);
paper = Raphael("draw_area", 300, 300);
element = null;
get_paper_x = function(x) {
  return x * paper.width / Math.abs(viewModel.range_x_min - viewModel.range_x_max) + paper.width / 2;
};
get_paper_y = function(y) {
  return paper.height - (y * paper.height / Math.abs(viewModel.range_y_min - viewModel.range_y_max) + paper.height / 2);
};
draw_scales = function() {
  paper.rect(0, paper.height / 2, paper.width, 0.5);
  return paper.rect(paper.width / 2, 0, 0.5, paper.height);
};
draw_grid = function() {
  var p, x, y, _ref, _ref2, _ref3, _ref4, _results;
  for (x = _ref = viewModel.range_x_min, _ref2 = viewModel.range_x_max; x <= _ref2; x += 1) {
    p = paper.path("M" + get_paper_x(x) + ",0" + "l0," + paper.height);
    p.attr("stroke", "#DDD");
  }
  _results = [];
  for (y = _ref3 = viewModel.range_y_min, _ref4 = viewModel.range_y_max; y <= _ref4; y += 1) {
    p = paper.path("M0," + get_paper_y(y) + "l" + paper.width + ",0");
    _results.push(p.attr("stroke", "#DDD"));
  }
  return _results;
};
draw_border = function() {
  var r;
  r = paper.rect(0, 0, paper.width, paper.height);
  r.attr("fill-opacity", "0");
  r.attr("stroke", "#555");
  return r.attr("stroke-width", "10");
};
calculate_points = function(f) {
  var x, _ref, _ref2, _ref3, _results;
  _results = [];
  for (x = _ref = viewModel.range_x_min, _ref2 = viewModel.range_x_max, _ref3 = viewModel.resolution; _ref <= _ref2 ? x <= _ref2 : x >= _ref2; x += _ref3) {
    _results.push([get_paper_x(x), get_paper_y(f(x))]);
  }
  return _results;
};
calculate_path = function(points, last_point) {
  var move_or_line, x, y;
  if (points.length > 0) {
    x = points[0][0];
    y = points[0][1];
    if (last_point && Math.abs(y - last_point[1]) > paper.height) {
      move_or_line = "M";
    } else {
      move_or_line = "L";
    }
    return move_or_line + x + " " + y + calculate_path(points.slice(1), [x, y]);
  } else {
    return "";
  }
};
draw_graph = function(fn_object) {
  var f, path_string;
  f = new Function('x', "return " + fn_object.source);
  path_string = "M" + paper.width / 2 + " " + paper.height / 2 + "M" + calculate_path(calculate_points(f)).substr(1);
  if (fn_object.element) {
    return fn_object.element.animate({
      path: path_string,
      stroke: fn_object.stroke
    }, 300, "<>");
  } else {
    element = paper.path(path_string);
    element.attr("stroke", fn_object.stroke);
    element.attr("stroke-linecap", "butt");
    element.attr("stroke-linejoin", "miter");
    element.attr("stroke-width", "2");
    return fn_object.element = element;
  }
};
redraw = function() {
  var fn_object, _i, _len, _ref;
  _ref = viewModel.functions();
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    fn_object = _ref[_i];
    draw_graph(fn_object);
  }
  return draw_border();
};
r = paper.rect(0, 0, paper.width, paper.height);
r.attr("fill", "#fff");
draw_grid();
draw_scales();
redraw();
$('#redraw_button').click(function() {
  return redraw();
});