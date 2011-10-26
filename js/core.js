(function() {
  var a_p, add_function, animate, animations, axes_object, calculate_path, calculate_points, draw_axes, draw_border, draw_graph, draw_grid, example_functions, get_paper_x, get_paper_y, get_range_x, get_range_y, grid_object, paper, r, r_p, rand_nth, random, redraw, redraw_button, start_animation, viewModel;
  example_functions = ["sin(x)", "x * tan(x)", "pow(x, x)", "sin(1/x)", "tan(x) * sin(x)", "cos(tan(x))", "x * tan(x) * sin(x)", "sin(x) * x"];
  rand_nth = function(coll) {
    return coll[Math.floor(Math.random() * coll.length)];
  };
  random = function(max) {
    return Math.round(Math.random() * max);
  };
  viewModel = {
    functions: ko.observableArray([
      {
        source: rand_nth(example_functions),
        stroke: "#800"
      }
    ]),
    add_function: function() {
      return this.functions.push({
        source: "",
        stroke: "#" + random(9) + random(9) + random(9)
      });
    },
    range_x_min_raw: "-10",
    range_x_max_raw: "10",
    range_y_min_raw: "-10",
    range_y_max_raw: "10",
    grid_distance_x: "1",
    grid_distance_y: "1",
    resolution: 0.01
  };
  ko.applyBindings(viewModel);
  get_range_x = function() {
    return [parseInt(viewModel.range_x_min_raw), parseInt(viewModel.range_x_max_raw)];
  };
  get_range_y = function() {
    return [parseInt(viewModel.range_y_min_raw), parseInt(viewModel.range_y_max_raw)];
  };
  paper = Raphael("draw_area", 300, 300);
  animations = [];
  animate = function(obj, animation) {
    return animations.push({
      obj: obj,
      ani: animation
    });
  };
  start_animation = function() {
    var ani, animating_animation, animating_object, obj, _i, _len, _ref, _ref2;
    if (animations.length > 0) {
      animating_object = animations[0].obj;
      animating_animation = animations[0].ani;
      animating_object.animate(animating_animation);
      _ref = animations.slice(1);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        _ref2 = _ref[_i], obj = _ref2.obj, ani = _ref2.ani;
        obj.animateWith(animating_object, animating_animation, ani);
      }
      return animations = [];
    }
  };
  get_paper_x = function(x) {
    var dx;
    dx = Math.abs(get_range_x()[0] - get_range_x()[1]);
    return (x - get_range_x()[0]) * paper.width / dx;
  };
  get_paper_y = function(y) {
    var dy;
    dy = Math.abs(get_range_y()[0] - get_range_y()[1]);
    return paper.height - ((y - get_range_y()[0]) * paper.height / dy);
  };
  axes_object = null;
  draw_axes = function() {
    var p, p_x, p_y;
    p_x = "M0," + get_paper_y(0) + "L" + get_paper_x(get_range_x()[1]) + "," + get_paper_y(0);
    p_y = "M" + get_paper_x(0) + ",0L" + get_paper_x(0) + "," + get_paper_y(get_range_y()[0]);
    p = p_x + p_y;
    if (axes_object) {
      return animate(axes_object, Raphael.animation({
        path: p
      }, 300, "<>"));
    } else {
      axes_object = paper.path(p);
      return axes_object.attr("stroke-width", "2");
    }
  };
  grid_object = null;
  draw_grid = function() {
    var distance_x, distance_y, p, x, x_path_neg, x_path_pos, y, y_path_neg, y_path_pos;
    distance_x = parseFloat(viewModel.grid_distance_x);
    distance_y = parseFloat(viewModel.grid_distance_y);
    if (get_range_x()[0] < 0) {
      x_path_neg = (function() {
        var _ref, _results;
        _results = [];
        for (x = 0, _ref = get_range_x()[0]; 0 <= _ref ? x <= _ref : x >= _ref; x += -distance_x) {
          _results.push("M" + get_paper_x(x) + ",0" + "l0," + paper.height);
        }
        return _results;
      })();
    } else {
      x_path_neg = [];
    }
    if (get_range_x()[1] > 0) {
      x_path_pos = (function() {
        var _ref, _results;
        _results = [];
        for (x = 0, _ref = get_range_x()[1]; 0 <= _ref ? x <= _ref : x >= _ref; x += distance_x) {
          _results.push("M" + get_paper_x(x) + ",0" + "l0," + paper.height);
        }
        return _results;
      })();
    } else {
      x_path_pos = [];
    }
    if (get_range_y()[0] < 0) {
      y_path_neg = (function() {
        var _ref, _results;
        _results = [];
        for (y = 0, _ref = get_range_y()[0]; 0 <= _ref ? y <= _ref : y >= _ref; y += -distance_y) {
          _results.push("M0," + get_paper_y(y) + "l" + paper.width + ",0");
        }
        return _results;
      })();
    } else {
      y_path_neg = [];
    }
    if (get_range_y()[1] > 0) {
      y_path_pos = (function() {
        var _ref, _results;
        _results = [];
        for (y = 0, _ref = get_range_y()[1]; 0 <= _ref ? y <= _ref : y >= _ref; y += distance_y) {
          _results.push("M0," + get_paper_y(y) + "l" + paper.width + ",0");
        }
        return _results;
      })();
    } else {
      y_path_pos = [];
    }
    p = x_path_neg.join("") + x_path_pos.join("") + y_path_neg.join("") + y_path_pos.join("");
    if (grid_object) {
      return animate(grid_object, Raphael.animation({
        path: p
      }, 300, "<>"));
    } else {
      grid_object = paper.path(p);
      return grid_object.attr({
        "stroke-width": "2",
        "stroke": "#EEE"
      });
    }
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
    for (x = _ref = get_range_x()[0], _ref2 = get_range_x()[1], _ref3 = viewModel.resolution; _ref <= _ref2 ? x <= _ref2 : x >= _ref2; x += _ref3) {
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
    var animation, element, f, path_string;
    f = new Function('x', "return " + fn_object.source);
    path_string = "M" + paper.width / 2 + " " + paper.height / 2 + "M" + calculate_path(calculate_points(f)).substr(1);
    if (fn_object.element) {
      animation = Raphael.animation({
        path: path_string,
        stroke: fn_object.stroke
      }, 300, "<>");
      return animate(fn_object.element, animation);
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
    draw_grid();
    draw_axes();
    _ref = viewModel.functions();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      fn_object = _ref[_i];
      draw_graph(fn_object);
    }
    draw_border();
    return start_animation();
  };
  r = paper.rect(0, 0, paper.width, paper.height);
  r.attr("fill", "#fff");
  redraw();
  add_function = Raphael("add_function", 40, 40);
  a_p = add_function.path("M25.979,12.896 19.312,12.896 19.312,6.229 12.647,6.229 12.647,12.896 5.979,12.896 5.979,19.562 12.647,19.562 12.647,26.229 19.312,26.229 19.312,19.562 25.979,19.562z");
  a_p.attr({
    "fill": "#333",
    "stroke-opacity": "0"
  });
  $('#add_function').hover((function() {
    return a_p.attr({
      "fill": "#000"
    });
  }), (function() {
    return a_p.attr("fill", "#333");
  }));
  redraw_button = Raphael("redraw_button", 40, 40);
  r_p = redraw_button.path("M15.999,4.308c1.229,0.001,2.403,0.214,3.515,0.57L18.634,6.4h6.247l-1.562-2.706L21.758,0.99l-0.822,1.425c-1.54-0.563-3.2-0.878-4.936-0.878c-7.991,0-14.468,6.477-14.468,14.468c0,3.317,1.128,6.364,3.005,8.805l2.2-1.689c-1.518-1.973-2.431-4.435-2.436-7.115C4.312,9.545,9.539,4.318,15.999,4.308zM27.463,7.203l-2.2,1.69c1.518,1.972,2.431,4.433,2.435,7.114c-0.011,6.46-5.238,11.687-11.698,11.698c-1.145-0.002-2.24-0.188-3.284-0.499l0.828-1.432H7.297l1.561,2.704l1.562,2.707l0.871-1.511c1.477,0.514,3.058,0.801,4.709,0.802c7.992-0.002,14.468-6.479,14.47-14.47C30.468,12.689,29.339,9.643,27.463,7.203z");
  r_p.attr({
    "fill": "#333",
    "stroke-opacity": "0"
  });
  $('#redraw_button').hover((function() {
    return r_p.attr({
      "fill": "#000"
    });
  }), (function() {
    return r_p.attr("fill", "#333");
  }));
  $('#redraw_button').click(function() {
    return redraw();
  });
}).call(this);
