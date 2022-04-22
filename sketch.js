let formantTable;
let displayFont;

let checkbox3D;


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

let dataURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQWknPGSkd4sGgjSSs1ajnRZnmPcX58spNmN1v8zeM5VQxkm4AjwIPSU-9KNAVicU_HaKU0T0bIBbwu/pub?output=csv';

function preload() {
  //formantTable = loadTable('data/formants.csv', 'csv', 'header');
  formantTable = loadTable(dataURL, 'csv', 'header');
  displayFont = loadFont('assets/Inconsolata-Regular.ttf');
}

function setup() {
  createCanvas(1280, 720, WEBGL);

  textFont(displayFont);

  c_green = color(50, 200, 10);
  c_aqua = color(10,240,170);
  c_blue = color(10,150,250);


  checkbox3D = createCheckbox('3D View', false);


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

function adjustF1bounds(f1) {
    min_f1 = min(min_f1, 100*floor(f1/100));
    max_f1 = max(max_f1, 100*ceil(f1/100));
}

function adjustF2bounds(f2) {
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

function drawDataPoint(f1, f2, f0, c, size) {

  let x = f2ToX(f2);
  let y = f1ToY(f1);
  let z = f0ToZ(f0);



  push();

  stroke(200);
  line(x, y, 0, x, y, z);

  fill(220);
  noStroke();
  circle(x, y, 20);

  translate(x, y, z);
  fill(c);
  sphere(size,8,8);
  pop();
}

function draw() {
  background(240);


  let rotateX_target = 0;

  if(checkbox3D.checked()) {

    rotateX_target = PI/3;
    graph_rotateZ += 0.0002*deltaTime;
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

  strokeWeight(1);

  textAlign(LEFT, CENTER);
  textSize(24);
  textBillboard("F1", graph_x+graph_w + 35, graph_y+graph_h/2, 0);
  textSize(12);
  for (let f1 = floor(min_f1/100)*100; f1 <= max_f1; f1 += 100) {
    let y = f1ToY(f1);
    stroke(220);
    line(graph_x, y, graph_x + graph_w, y);
    noStroke();
    fill(180);
    textBillboard(f1, graph_x+graph_w + 5, y, 0);
  }

  textAlign(CENTER, BOTTOM);
  textSize(24);
  textBillboard("F2", graph_x+graph_w/2, graph_y - 25, 0);
  textSize(12);
  for (let f2 = floor(min_f2/200)*200; f2 <= max_f2; f2 += 200) {
    let x = f2ToX(f2);
    stroke(220);
    line(x, graph_y, x, graph_y + graph_h);
    noStroke();
    fill(180);


    textBillboard(f2, x, graph_y - 5, 0);
  }

  for (let i = 0; i < formantTable.getRowCount(); i++) {
    drawDataPoint(formantTable.getNum(i, 1), formantTable.getNum(i, 2), formantTable.getNum(i, 3), c_green, 5);
    drawDataPoint(formantTable.getNum(i, 4), formantTable.getNum(i, 5), formantTable.getNum(i, 6), c_blue, 5);
    drawDataPoint(formantTable.getNum(i, 7), formantTable.getNum(i, 8), formantTable.getNum(i, 9), c_aqua, 5);
  }
}
