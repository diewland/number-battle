//
// CONSTANT
//

const PLAYER_1 = true;
const PLAYER_2 = false;

const PATT_INPUT = /^\d{4}$/;

const HINT_FULL = "O"; //"<img height='24' src='./img/heart_full.png'> ";
const HINT_HALF = "X"; //"<img height='24' src='./img/heart_half.png'> ";
const HINT_NONE = "-"; //"<img height='24' src='./img/heart_blank.png'> ";

//
// STATE
//

let p1_won = 0;
let p2_won = 0;
let p1_ans = "";
let p2_ans = "";
let p1_num = [];
let p2_num = [];
let input_num = "";
let next_turn = PLAYER_1;

//
// FLOW
//

function engine() {
  // enter answers
  while (!p1_ans.match(PATT_INPUT)) { p1_ans = prompt("*** SECRET ***\nEnter Player 1 number (4 digits)") || ""; }
  while (!p2_ans.match(PATT_INPUT)) { p2_ans = prompt("*** SECRET ***\nEnter Player 2 number (4 digits)") || ""; }

  // guess number
  if (next_turn == PLAYER_1) {
    while (!input_num.match(PATT_INPUT)) { input_num = prompt("TURN: Player 1\nWhat is Player 2 number ?") || ""; }
    p1_num.unshift(input_num);
  }
  else { // PLAYER_2
    while (!input_num.match(PATT_INPUT)) { input_num = prompt("TURN: Player 2\nWhat is Player 1 number ?") || ""; }
    p2_num.unshift(input_num);
  }

  // render table
  let gameover = render_table([ p1_ans, p2_ans ], [ p1_num, p2_num ]);

  // next turn
  if (gameover) {
    // game over
    $('.btn-play').hide();
    let player_label = next_turn ? "Player 1" : "Player 2";
    alert(`🎉🎉🎉 ${player_label} WIN 🎉🎉🎉`);
  }
  else {
    // switch player
    input_num = "";
    next_turn = !next_turn;
  }
}

//
// BUTTONS
//

$('.btn-play').click(engine);
$('.btn-restart').click(_ => location.reload());

//
// UI
//

function render_table(answers, numbers) {
  let [a1, a2] = answers;
  // loading
  let loading = `<tr><td colspan='4'>Loading...</td></tr>`;
  $('table tbody').html(loading);
  // build html
  let html = '';
  numbers[0].forEach((n1, idx) => {
    let n2 = numbers[1][idx] || '';
    html += `
      <tr>
        <td>${n1}</td>
        <td>${mark(a2, n1)}</td>
        <td>${n2}</td>
        <td>${mark(a1, n2)}</td>
      </tr>
    `;
  });
  // render table
  $('table tbody').html(html);
  // gameover flag
  return html.indexOf(HINT_FULL.repeat(4)) > -1;
}

//
// ALGORITHM
//

function mark(ans, num) {
  if (!num) return '';

  // prepare data
  let pad_ans = String(ans).padStart(4, '0');
  let pad_num = String(num).padStart(4, '0');
  let left_ans = [];
  let left_num = [];

  // find match
  let count_match = 0;
  for (let i=0; i<pad_ans.length; i++) {
    let a = pad_ans[i];
    let n = pad_num[i];
    if (a == n) {
      count_match += 1;
    }
    else {
      left_ans.push(a);
      left_num.push(n);
    }
  }

  // find found
  let count_found = 0;
  left_num.forEach(n => {
    let idx = left_ans.indexOf(n);
    if (idx > -1) {
      count_found += 1;
      left_ans.splice(idx, 1);
    }
  });

  // else dash
  let count_else = 4 - count_match - count_found;

  // return
  return HINT_FULL.repeat(count_match)
         + HINT_HALF.repeat(count_found)
         + HINT_NONE.repeat(count_else);
}

//
// DEV
//

/*
function rand_num () { // 4 digits
  return Math.floor(1000 + Math.random() * 9000);
}
let rows = 10;
let answers = [
  rand_num(),
  rand_num(),
];
let numbers = [
  [...Array(rows)].map(r => rand_num()),
  [...Array(rows)].map(r => rand_num()),
];
render_table(answers, numbers);
$('h1').html(answers.join(","));
*/
