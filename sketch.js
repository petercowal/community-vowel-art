let formantTable;
let displayFont;

let checkbox3D, checkboxFullscreen, checkboxViewRecent;

let c_green, c_green_transparent, c_aqua, c_aqua_transparent, c_blue, c_blue_transparent;

let graph_x = -500;
let graph_y = -250;
let graph_w = 1000;
let graph_h = 500;

let graph_rotateX = 0;
let graph_rotateZ = 0;

let graph_zscale = 40;

let min_f1 = 200;
let max_f1 = 1200;

let min_f2 = 400;
let max_f2 = 4000;

const VOWEL_I = 1;
const VOWEL_U = 2;
const VOWEL_A = 3;

// view recent animation code
let viewRecentTimer = 0;

const dataURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQWknPGSkd4sGgjSSs1ajnRZnmPcX58spNmN1v8zeM5VQxkm4AjwIPSU-9KNAVicU_HaKU0T0bIBbwu/pub?output=csv';
const googleSheetURL = 'https://sheets.googleapis.com/v4/spreadsheets/1d9lbDIsLw6rhTJwtOdmujzTiBPexV9Nr_0qH4hdmLsw/values/Form%20Responses%201?key=AIzaSyBY-hngRiU7OoIeruB0WuIXycsE2ufbHa0';

function loadGoogleSheetData(data) {
  formantTable = new p5.Table();
  header = data.values[0];
  for (let i = 0; i < header.length; i++) {
    formantTable.addColumn(header[i]);
  }
  for (let i = 1; i < data.values.length; i++) {
    row = data.values[i];
    formantTable.addRow();
    for (let j = 0; j < row.length; j++) {
      formantTable.set(i-1, j, row[j]);
    }
  }
}

function smoothstep(x) {
  if (x<0) return 0;
  if (x>1) return 1;
  return 3*x*x - 2*x*x*x;
}


function preload() {
  //formantTable = loadTable('data/formants.csv', 'csv', 'header');
  //formantTable = loadTable(dataURL, 'csv', 'header');
  formantTable = new p5.Table();
  loadJSON(googleSheetURL, loadGoogleSheetData);
  displayFont = loadFont('assets/Questrial-Regular.ttf');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  graph_w = width*0.75;
  graph_h = height*0.8;
  graph_x = -graph_w/2;
  graph_y = -graph_h/2;
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  graph_w = width*0.75;
  graph_h = height*0.8;
  graph_x = -graph_w/2;
  graph_y = -graph_h/2;

  textFont(displayFont);

  c_green = color(50, 255, 10);
  c_green_transparent = color(80, 255, 40, 128);
  c_aqua = color(10,255,170);
  c_aqua_transparent = color(40, 255, 200, 128);
  c_blue = color(10,150,255);
  c_blue_transparent = color(40, 180, 255, 128);


  checkbox3D = createCheckbox('3D View', false);
  checkbox3D.position(5,25);

  checkboxFullscreen = createCheckbox('Fullscreen', false);
  checkboxFullscreen.position(5, 5);
  checkboxFullscreen.changed(toggleFullscreen);

  checkboxViewRecent = createCheckbox('View Recent', false);
  checkboxViewRecent.position(5,45);
  checkboxViewRecent.changed(highlightRecent);

  print(formantTable.getRowCount() + ' total rows in table');
  print(formantTable.getColumnCount() + ' total columns in table');

  // set bounds for data display
  min_f1 = 500;
  max_f1 = 600;
  min_f2 = 2000;
  max_f2 = 2200;
  for (let i = 0; i < formantTable.getRowCount(); i++) {
    adjustF1bounds(formantTable.getNum(i, 1));
    adjustF1bounds(formantTable.getNum(i, 4));
    adjustF1bounds(formantTable.getNum(i, 7));

    adjustF2bounds(formantTable.getNum(i, 2));
    adjustF2bounds(formantTable.getNum(i, 5));
    adjustF2bounds(formantTable.getNum(i, 8));
  }
}

function findColumnAverage(table, col) {
    let count = table.getRowCount();
    let sum = 0;
    for (let i = 0; i < count; i++) {
      sum += table.getNum(i, col);
    }
    return sum/count;
}


function adjustF1bounds(f1) {
    f1 = max(f1, 100);
    min_f1 = min(min_f1, 100*floor(f1/100));
    max_f1 = max(max_f1, 100*ceil(f1/100));
}

function adjustF2bounds(f2) {
    f2 = max(f2, 200);
    min_f2 = min(min_f2, 200*floor(f2/200));
    max_f2 = max(max_f2, 200*ceil(f2/200));
}


function f1ToY(f1) {
  return graph_y + graph_h * log(f1/min_f1)/log(max_f1/min_f1);
}

function f2ToX(f2) {
  return graph_x + graph_w - graph_w * log(f2/min_f2)/log(max_f2/min_f2);
}

function f0ToZ(f0) {
  return graph_zscale * log(f0/60);
}


function faceCamera() {
  rotateZ(-graph_rotateZ);
  rotateX(-graph_rotateX);
}

function textBillboard(str, x, y, z) {
  push();
  translate(x, y, z);
  faceCamera();
  text(str, 0, 0);
  pop();
}

function drawDataPoint(f1, f2, f0, vowel, size, solid) {

  let x = f2ToX(f2);
  let y = f1ToY(f1);
  let z = f0ToZ(f0);

  push();
  noFill();
  stroke(100);
  line(x, y, 0, x, y, z);

  //fill(220);
  //circle(x, y, 20);

  translate(x, y, z);
  faceCamera();

  if (vowel == VOWEL_A) {
    stroke(c_aqua);
    if (solid) {
      fill(c_aqua);
    }
    square(-size/2, -size/2, size);
  } else if (vowel == VOWEL_I) {
    stroke(c_green);
    if (solid) {
      fill(c_green);
    }
    triangle(-size/2, -size*0.29, size/2, -size*0.29, 0, size*0.58);
  } else if (vowel == VOWEL_U) {
    stroke(c_blue);
    if (solid) {
      fill(c_blue);
    }
    circle(0, 0, size);
  }
  pop();
}

function draw() {
  background(40);
  let rotateX_target = 0;

  if(checkbox3D.checked()) {
    rotateX_target = PI/3;
    graph_rotateZ += 0.0001*deltaTime;
    if (graph_rotateZ > PI) {

      graph_rotateZ -= 2*PI;
    }
  } else {
    graph_rotateZ *= 0.95;
  }
  graph_rotateX += 0.05 * (rotateX_target - graph_rotateX);
  graph_zscale = 100 * graph_rotateX;

  rotateX(graph_rotateX);
  rotateZ(graph_rotateZ);

  strokeWeight(1.5);
  fill(140);
  textAlign(LEFT, CENTER);
  textSize(24);
  textBillboard("F1", graph_x+graph_w + 35, graph_y+graph_h/2, 0);
  textSize(12);
  for (let f1 = floor(min_f1/100)*100; f1 <= max_f1; f1 += 100) {
    let y = f1ToY(f1);
    stroke(100);
    line(graph_x, y, graph_x + graph_w, y);
    noStroke();

    textBillboard(f1, graph_x+graph_w + 5, y, 0);
  }

  textAlign(CENTER, BOTTOM);
  textSize(24);
  textBillboard("F2", graph_x+graph_w/2, graph_y - 25, 0);
  textSize(12);
  for (let f2 = floor(min_f2/200)*200; f2 <= max_f2; f2 += 200) {
    let x = f2ToX(f2);
    stroke(100);
    line(x, graph_y, x, graph_y + graph_h);
    noStroke();
    textBillboard(f2, x, graph_y - 5, 0);
  }


  let n = formantTable.getRowCount()-1;

  let recentSolid = false;
  let recentSize = 8;

  if (checkboxViewRecent.checked()) {
    recentSize = 15 - 7 * cos(viewRecentTimer*30) * exp(-2*viewRecentTimer);
  } else {
    recentSize = 8 + 7 * smoothstep(20 - viewRecentTimer);
  }

  recentSolid = true;

  drawDataPoint(formantTable.getNum(n, 1), formantTable.getNum(n, 2), formantTable.getNum(n, 3), VOWEL_I, recentSize, recentSolid);
  drawDataPoint(formantTable.getNum(n, 4), formantTable.getNum(n, 5), formantTable.getNum(n, 6), VOWEL_U, recentSize, recentSolid);
  drawDataPoint(formantTable.getNum(n, 7), formantTable.getNum(n, 8), formantTable.getNum(n, 9), VOWEL_A, recentSize, recentSolid);


  if (!checkboxViewRecent.checked()) {
    for (let i = 0; i < formantTable.getRowCount()-1; i++) {
      let tween = pow(smoothstep(1 + 0.1*i - viewRecentTimer), 5);
      let f1 = formantTable.getNum(i, 1) * (1-tween) + formantTable.getNum(n, 1) * tween;
      let f2 = formantTable.getNum(i, 2) * (1-tween) + formantTable.getNum(n, 2) * tween;
      let f0 = formantTable.getNum(i, 3) * (1-tween) + formantTable.getNum(n, 3) * tween;
      drawDataPoint(f1, f2, f0, VOWEL_I, 8, false);

      f1 = formantTable.getNum(i, 4) * (1-tween) + formantTable.getNum(n, 4) * tween;
      f2 = formantTable.getNum(i, 5) * (1-tween) + formantTable.getNum(n, 5) * tween;
      f0 = formantTable.getNum(i, 6) * (1-tween) + formantTable.getNum(n, 6) * tween;
      drawDataPoint(f1, f2, f0, VOWEL_U, 8, false);

      f1 = formantTable.getNum(i, 7) * (1-tween) + formantTable.getNum(n, 7) * tween;
      f2 = formantTable.getNum(i, 8) * (1-tween) + formantTable.getNum(n, 8) * tween;
      f0 = formantTable.getNum(i, 9) * (1-tween) + formantTable.getNum(n, 9) * tween;
      drawDataPoint(f1, f2, f0, VOWEL_A, 8, false);
    }
  }

  textSize(50);
  fill(c_green_transparent);
  textBillboard("[i]", f2ToX(findColumnAverage(formantTable, 2)), f1ToY(findColumnAverage(formantTable, 1)), f0ToZ(findColumnAverage(formantTable, 3) + 100) + 1);
  fill(c_blue_transparent);
  textBillboard("[u]", f2ToX(findColumnAverage(formantTable, 5)), f1ToY(findColumnAverage(formantTable, 4)), f0ToZ(findColumnAverage(formantTable, 6) + 100) + 1);
  fill(c_aqua_transparent);
  textBillboard("[a]", f2ToX(findColumnAverage(formantTable, 8)), f1ToY(findColumnAverage(formantTable, 7)), f0ToZ(findColumnAverage(formantTable, 9) + 100) + 1);
  //drawDataPoint(findColumnAverage(formantTable, 1), findColumnAverage(formantTable, 2),, VOWEL_I, 22);


  viewRecentTimer += deltaTime/1000;
}

function highlightRecent() {
  // whenever this is toggled, update data
  if (checkboxViewRecent.checked()) {
      loadJSON(googleSheetURL, loadGoogleSheetData);
  }
  viewRecentTimer = 0;
}


function toggleFullscreen() {
  fullscreen(checkboxFullscreen.checked());
}
