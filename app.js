//
// CONSTANT
//

const PLAYER_1 = 'player_1'
const PLAYER_2 = 'player_2'

//
// STATE
//

let p1_won = 0;
let p2_won = 0;

//
// FLOW
//

// TODO

//
// UI
//

function render_table(answers, numbers) {
  // circuit break
  if(numbers[0].length == 0) {
    $('.stadium').hide();
    return;
  }
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
        <td>${mark(a1, n1)}</td>
        <td>${n2}</td>
        <td>${mark(a2, n2)}</td>
      </tr>
    `;
  });
  // render table
  $('table tbody').html(html);
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
  return 'O'.repeat(count_match)
          + 'X'.repeat(count_found)
          + '-'.repeat(count_else);
}

//
// DEV
//

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
