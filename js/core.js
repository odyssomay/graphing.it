(function() {
  var a_p, add_function, animate, animations, axes_object, calculate_parametric_points, calculate_points, calculate_polar_points, calculate_standard_points, construct_path, draw_axes, draw_border, draw_grid, draw_path, get_paper_x, get_paper_y, get_range_x, get_range_y, grid_object, init_button, init_fn_object, new_fn_object, options_string, paper, polar_example_functions, r, r_p, rand_nth, random, redraw, redraw_button, s_b, save_button, standard_example_functions, start_animation, transform_points, v_o_p, viewModel, view_options;
  standard_example_functions = ["sin(x)", "x * tan(x)", "pow(x, x)", "sin(1/x)", "tan(x) * sin(x)", "cos(tan(x))", "x * tan(x) * sin(x)", "sin(x) * x", "cos(tan(x)) / sin(x)", "pow(abs(x), cos(x))", "pow(abs(x), sin(x))"];
  polar_example_functions = ["pow(x, 1.5) * sin(x) * cos(x)", "x * sin(x)"];
  rand_nth = function(coll) {
    return coll[Math.floor(Math.random() * coll.length)];
  };
  new_fn_object = function(prev_id) {
    return {
      polar_range_min: 0,
      polar_range_max: 10,
      polar_step_size: 0.01,
      para_range_min: 0,
      para_range_max: 10,
      para_step_size: 0.01,
      type: ko.observable("Standard"),
      source: rand_nth(standard_example_functions),
      source_polar: rand_nth(polar_example_functions),
      source_para_x: "sin(t)",
      source_para_y: "cos(t)",
      stroke: "#" + random(9) + random(9) + random(9),
      id: 1 + prev_id
    };
  };
  random = function(max) {
    return Math.round(Math.random() * max);
  };
  viewModel = {
    functions: ko.observableArray([]),
    add_function: function() {
      var f, obj, prev_id;
      prev_id = Math.max.apply(null, (function() {
        var _i, _len, _ref, _results;
        _ref = this.functions();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          obj = _ref[_i];
          _results.push(obj.id);
        }
        return _results;
      }).call(this));
      if (this.functions().length === 0) {
        prev_id = 0;
      }
      f = new_fn_object(prev_id);
      this.functions.push(f);
      return init_fn_object(f);
    },
    range_x_min: ko.observable(-10),
    range_x_max: ko.observable(10),
    range_y_min: ko.observable(-10),
    range_y_max: ko.observable(10),
    grid_distance_x: ko.observable(1),
    grid_distance_y: ko.observable(1),
    step_size: ko.observable(0.01)
  };
  ko.bindingHandlers.number_value = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
      return $(element).focusout(function() {
        var ab, v;
        ab = allBindingsAccessor();
        v = parseFloat($(element).val());
        if (isNaN(v)) {
          return $(element).val(String(valueAccessor()()));
        } else {
          if (ab.min != null) {
            v = Math.max(ab.min, v);
          }
          if (ab.max != null) {
            v = Math.min(v, ab.max);
          }
          return valueAccessor()(v);
        }
      });
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
      return $(element).val(String(valueAccessor()()));
    }
  };
  ko.applyBindings(viewModel);
  get_range_x = function() {
    return [viewModel.range_x_min(), viewModel.range_x_max()];
  };
  get_range_y = function() {
    return [viewModel.range_y_min(), viewModel.range_y_max()];
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
    distance_x = viewModel.grid_distance_x();
    distance_y = viewModel.grid_distance_y();
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
  calculate_standard_points = function(f) {
    var x, _ref, _ref2, _ref3, _results;
    _results = [];
    for (x = _ref = get_range_x()[0], _ref2 = get_range_x()[1], _ref3 = viewModel.step_size(); _ref <= _ref2 ? x <= _ref2 : x >= _ref2; x += _ref3) {
      _results.push([x, f(x)]);
    }
    return _results;
  };
  calculate_polar_points = function(fn_object, f) {
    var r, x, _ref, _ref2, _ref3, _results;
    _results = [];
    for (x = _ref = fn_object.polar_range_min, _ref2 = fn_object.polar_range_max, _ref3 = fn_object.polar_step_size; _ref <= _ref2 ? x <= _ref2 : x >= _ref2; x += _ref3) {
      r = f(x);
      _results.push([r * Math.cos(x), r * Math.sin(x)]);
    }
    return _results;
  };
  calculate_parametric_points = function(fn_object, f_x, f_y) {
    var t, _ref, _ref2, _ref3, _results;
    _results = [];
    for (t = _ref = fn_object.para_range_min, _ref2 = fn_object.para_range_max, _ref3 = fn_object.para_step_size; _ref <= _ref2 ? t <= _ref2 : t >= _ref2; t += _ref3) {
      _results.push([f_x(t), f_y(t)]);
    }
    return _results;
  };
  calculate_points = function(fn_object) {
    var f, f_x, f_y;
    switch (fn_object.type()) {
      case 'Standard':
        f = new Function('x', "return " + fn_object.source);
        return calculate_standard_points(f);
      case 'Polar':
        f = new Function('x', "return " + fn_object.source_polar);
        return calculate_polar_points(fn_object, f);
      case 'Parametric':
        f_x = new Function('t', "return " + fn_object.source_para_x);
        f_y = new Function('t', "return " + fn_object.source_para_y);
        return calculate_parametric_points(fn_object, f_x, f_y);
    }
  };
  transform_points = function(points) {
    var x, y, _i, _len, _ref, _results;
    _results = [];
    for (_i = 0, _len = points.length; _i < _len; _i++) {
      _ref = points[_i], x = _ref[0], y = _ref[1];
      _results.push([get_paper_x(x), get_paper_y(y)]);
    }
    return _results;
  };
  construct_path = function(points, last_point) {
    var move_or_line, x, y;
    if (points.length > 0) {
      x = points[0][0];
      y = points[0][1];
      if (last_point && Math.abs(y - last_point[1]) > paper.height) {
        move_or_line = "M";
      } else {
        move_or_line = "L";
      }
      return move_or_line + x + "," + y + construct_path(points.slice(1), [x, y]);
    } else {
      return "";
    }
  };
  draw_path = function(fn_object) {
    var animation, path_string, points, t_points;
    points = calculate_points(fn_object);
    t_points = transform_points(points);
    path_string = 'M' + construct_path(t_points).substr(1);
    animation = Raphael.animation({
      path: path_string,
      stroke: fn_object.stroke
    }, 300, "<>");
    return animate(fn_object.element, animation);
  };
  redraw = function() {
    var fn_object, _i, _len, _ref;
    draw_grid();
    draw_axes();
    _ref = viewModel.functions();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      fn_object = _ref[_i];
      draw_path(fn_object);
    }
    draw_border();
    return start_animation();
  };
  r = paper.rect(0, 0, paper.width, paper.height);
  r.attr("fill", "#fff");
  draw_grid();
  draw_axes();
  options_string = "M26.834,14.693c1.816-2.088,2.181-4.938,1.193-7.334l-3.646,4.252l-3.594-0.699L19.596,7.45l3.637-4.242c-2.502-0.63-5.258,0.13-7.066,2.21c-1.907,2.193-2.219,5.229-1.039,7.693L5.624,24.04c-1.011,1.162-0.888,2.924,0.274,3.935c1.162,1.01,2.924,0.888,3.935-0.274l9.493-10.918C21.939,17.625,24.918,16.896,26.834,14.693z";
  init_button = function(path, id) {
    path.attr({
      "fill": "#333",
      "stroke-opacity": "0"
    });
    return $(id).hover((function() {
      return path.attr({
        "fill": "#000"
      });
    }), (function() {
      return path.attr("fill", "#333");
    }));
  };
  init_fn_object = function(fn_object) {
    var cw, element, fn_options_button, html_id, p;
    html_id = 'fn_options_button' + fn_object.id;
    fn_options_button = Raphael(html_id, 30, 30);
    p = fn_options_button.path(options_string);
    init_button(p, '#' + html_id);
    p.scale(0.8);
    $('#' + html_id).click(function() {
      return $('#' + 'fn_options_content' + fn_object.id).slideToggle(200);
    });
    cw = Raphael.colorwheel($('#' + 'fn_stroke_color' + fn_object.id), 90, 80);
    cw.color(fn_object.stroke);
    cw.onchange(function(color) {
      var s;
      s = Raphael.rgb(color.r, color.g, color.b);
      fn_object.stroke = s;
      if (fn_object.element) {
        return fn_object.element.attr("stroke", s);
      }
    });
    element = paper.path("");
    element.attr({
      "stroke": fn_object.stroke,
      "stroke-linecap": "butt",
      "stroke-linejoin": "miter",
      "stroke-width": "2",
      "stroke-dasharray": "none"
    });
    return fn_object.element = element;
  };
  viewModel.add_function();
  redraw();
  redraw_button = Raphael("redraw_button", 40, 40);
  r_p = redraw_button.path("M15.999,4.308c1.229,0.001,2.403,0.214,3.515,0.57L18.634,6.4h6.247l-1.562-2.706L21.758,0.99l-0.822,1.425c-1.54-0.563-3.2-0.878-4.936-0.878c-7.991,0-14.468,6.477-14.468,14.468c0,3.317,1.128,6.364,3.005,8.805l2.2-1.689c-1.518-1.973-2.431-4.435-2.436-7.115C4.312,9.545,9.539,4.318,15.999,4.308zM27.463,7.203l-2.2,1.69c1.518,1.972,2.431,4.433,2.435,7.114c-0.011,6.46-5.238,11.687-11.698,11.698c-1.145-0.002-2.24-0.188-3.284-0.499l0.828-1.432H7.297l1.561,2.704l1.562,2.707l0.871-1.511c1.477,0.514,3.058,0.801,4.709,0.802c7.992-0.002,14.468-6.479,14.47-14.47C30.468,12.689,29.339,9.643,27.463,7.203z");
  init_button(r_p, '#redraw_button');
  $('#redraw_button').click(function() {
    return redraw();
  });
  view_options = Raphael("view_options", 40, 40);
  v_o_p = view_options.path(options_string);
  init_button(v_o_p, '#view_options');
  $('#view_options').click(function() {
    return $('#draw_options_content').slideToggle(200);
  });
  save_button = Raphael("save_button", 40, 40);
  s_b = save_button.path("M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466zM16,28.792c-1.549,0-2.806-1.256-2.806-2.806s1.256-2.806,2.806-2.806c1.55,0,2.806,1.256,2.806,2.806S17.55,28.792,16,28.792zM16,21.087l-7.858-6.562h3.469V5.747h8.779v8.778h3.468L16,21.087z");
  init_button(s_b, '#save_button');
  add_function = Raphael("add_function", 40, 40);
  a_p = add_function.path("M25.979,12.896 19.312,12.896 19.312,6.229 12.647,6.229 12.647,12.896 5.979,12.896 5.979,19.562 12.647,19.562 12.647,26.229 19.312,26.229 19.312,19.562 25.979,19.562z");
  init_button(a_p, '#add_function');
}).call(this);
