function add_items(target, data, color = "danger", game_type = "powerball") {
  let edge;
  if (game_type == "powerball") edge = 34;
  if (game_type == "satlotto") edge = 44;

  for (let i = 0; i < data.length; i++) {
    td = document.createElement("td");
    if (i == edge) td.setAttribute("style", "border-right: 1px solid grey");
    child = document.createElement("div");
    if (data[i] === 0) {
      child.textContent = i + 1 >= 10 ? `${i + 1}` : `0${i + 1}`;
      child.setAttribute(
        "class",
        `border border-${color} bg-${color} text-light rounded-circle square`
      );
    } else if (data[i] === -1) {
      child.textContent = i + 1 >= 10 ? `${i + 1}` : `0${i + 1}`;
      child.setAttribute(
        "class",
        `border border-success bg-success text-light rounded-circle square`
      );
    } else if (data[i] === -2) {
      child.textContent = i + 1 >= 10 ? `${i + 1}` : `0${i + 1}`;
      child.setAttribute(
        "class",
        `border border-success bg-primary text-light rounded-circle square`
      );
    } else {
      child.textContent = data[i];
      child.setAttribute("class", "txt-light square");
    }
    td.appendChild(child);
    target.appendChild(td);
  }
}

function get_templete_row(custom_no, game_type = "powerball") {
  let edge;
  if (game_type == "powerball") edge = 35;
  if (game_type == "satlotto") edge = 45;

  toggle_color = (a, color) => {
    toggled = a.getAttribute("toggled");
    if (toggled == true) {
      a.setAttribute("class", "border rounded-circle square");
      a.setAttribute("toggled", 0);
    } else {
      a.setAttribute(
        "class",
        `border border-${color} bg-${color} rounded-circle text-light square`
      );
      a.setAttribute("toggled", 1);
    }
  };
  append_numbers = (target, number, color = "danger", empty = false) => {
    for (let i = 1; i <= number; i++) {
      td = document.createElement("td");
      if (i == edge) td.setAttribute("style", "border-right: 1px solid grey");
      else td.setAttribute("class", "b-bottom");
      child = document.createElement("div");
      child.setAttribute("type", "button");
      child.setAttribute("class", "border rounded-circle square");
      child.setAttribute("onclick", `toggle_color(this, '${color}')`);
      child.setAttribute("toggled", 0);
      if (!empty) child.textContent = i >= 10 ? `${i}` : `0${i}`;
      td.appendChild(child);
      target.appendChild(td);
    }
  };

  templete_row = document.createElement("tr");
  head = document.createElement("th");
  head.setAttribute("class", "bg-warning");
  head.textContent = `自定选号${custom_no}`;
  templete_row.appendChild(head);
  if (game_type == "powerball") {
    append_numbers(templete_row, 35);
    append_numbers(templete_row, 20, "info");
  }
  if (game_type == "satlotto") {
    append_numbers(templete_row, 45);
    append_numbers(templete_row, 10, "warning", true);
  }

  return templete_row;
}

function clear_table(element) {
  while (element.childElementCount > 1) {
    if (element.lastChild["id"] != "header")
      element.removeChild(element.lastChild);
  }
}

const change_color_for_consecutive = (data, row_idx, col_idx) => {
  const is_primary = (data, [row_idx, col_idx]) => {
    if (data[row_idx] === undefined) return false;
    if (data[row_idx]["PrimaryNumbers"][col_idx] === undefined) return false;
    return (
      data[row_idx]["PrimaryNumbers"][col_idx] === 0 ||
      data[row_idx]["PrimaryNumbers"][col_idx] === -1
    );
  };

  pairs = [
    [
      [1, 0],
      [-1, 0],
    ],
    [
      [0, 1],
      [0, -1],
    ],
    [
      [1, -1],
      [-1, 1],
    ],
    [
      [-1, -1],
      [1, 1],
    ],
  ];

  for (pair of pairs) {
    for (coord of pair) {
      coord[0] += row_idx;
      coord[1] += col_idx;
    }
  }

  for (pair of pairs) {
    if (is_primary(data, pair[0]) && is_primary(data, pair[1])) {
      data[pair[0][0]]["PrimaryNumbers"][pair[0][1]] = -1;
      data[row_idx]["PrimaryNumbers"][col_idx] = -1;
      data[pair[1][0]]["PrimaryNumbers"][pair[1][1]] = -1;
    }
  }
};

// add historical data
function add_data_to_table(size, game_type = "powerball") {
  var data;
  if (game_type == "powerball"){
    data = POWERBALL_DATA.slice(0 - size)
  }
  if (game_type == "satlotto") {
    data = SATLOTTO_DATA.slice(0 - size)
  }
  table = document.getElementById("table");
  clear_table(table);

  if (game_type == "powerball") {
    // find consecutive PrimaryNumbers
    for ([row_index, row] of data.entries()) {
      for ([col_index, col_num] of row["PrimaryNumbers"].entries()) {
        if (col_num == 0 || col_num == -1) {
          change_color_for_consecutive(data, row_index, col_index);
        }
      }
    }
  }

  for ([index, row] of data.entries()) {
    tr = document.createElement("tr");
    // for each row create date
    if ((index + 1) % 5 == 0)
      tr.setAttribute("style", "border-bottom-color:grey;");
    date = document.createElement("th");
    date.setAttribute("class", "bg-secondary text-light");
    date.textContent = row.date.slice(0, 8);
    tr.appendChild(date);

    if (game_type == "powerball") {
      // for each row add numbers
      add_items(tr, row["PrimaryNumbers"]);
      // for each row add powerball
      add_items(tr, row["SecondaryNumbers"], "primary");
    }
    if (game_type == "satlotto") {
      // for each row add numbers
      for (number of row["SecondaryNumbers"])
        row["Frequencies"][number - 1] = -2;
      add_items(tr, row["Frequencies"], "danger", game_type);
    }

    table.appendChild(tr);
  }
  table.appendChild(get_templete_row(1, game_type));
  table.appendChild(get_templete_row(2, game_type));
}

function change_size(size, current, type, game_type = "powerball") {
  let nav_name;

  if (type == "pagechange") {
    add_data_to_table(size, game_type);
    current_page = game_type;
    nav_name = "page-nav";
  } else if (type == "sizechange") {
    add_data_to_table(size, current_page);
    nav_name = "nav";
  }

  let nav = document.getElementById(nav_name);
  btns = nav.children;
  for (btn of btns) {
    btn.classList.remove("active");
  }
  current.classList.add("active");
}

function add_templete() {
  table = document.getElementById("table");
  table.appendChild(get_templete_row(current_tem_num));
  current_tem_num += 1;
}

var current_tem_num = 3;
var current_page = "powerball";
add_data_to_table(20);
