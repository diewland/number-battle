const POLLING_SEC = 5 * 1000; // 5 seconds

const MSG_ENTER_ANS = "Enter SECRET unique 4 digit number.";
const MSG_SECRET_ADDED = "SECRET added, Please wait to start game.";
const MSG_GAME_START = "GAME START!";
const MSG_YOU_WIN = "YOU WIN!";
const MSG_YOU_LOSE = "YOU LOSE!";
const MSG_DRAW_GAME = "DRAW!";

//const HINT_FULL = "O";
//const HINT_HALF = "X";
//const HINT_NONE = "-";
const HINT_FULL = "<img class='mx-1' height='24' src='./img/heart_full.png'>";
const HINT_HALF = "<img class='mx-1' height='24' src='./img/heart_half.png'>";
const HINT_NONE = "<img class='mx-1' height='24' src='./img/heart_blank.png'>";

// ---------- MAIN ----------

// game config
let api = null;
let room_data = null;
let room_no = get_qs('r');
let player_no = +get_qs('p');

// validate room no
if (!room_no) {
  location.href = './index.html';
}
else {
  // update api url
  api = get_api_url(room_no);

  // join room
  join_room();

  // handle inputs
  $('body').on('keyup', '.input-num', handle_input);
  $('body').on('click', '.btn-send', handle_send);
  $('body').on('click', '.btn-exit', handle_exit);
}

// ---------- FUNCTIONS ----------

// input
function validate_number(num) {
  return !!num.match(/^\d{4}$/) &&    // 4 digit number
         !(/([0-9]).*?\1/).test(num); // not duplicate
}
function handle_input(evt) {
  let $input = $(evt.target);
  let num = $input.val();
  let valid = validate_number(num);
  if (valid) {
    $input.removeClass('is-error');
    $input.addClass('is-success');
  }
  else {
    $input.removeClass('is-success');
    $input.addClass('is-error');
  }
}
function handle_send(evt) {
  let $input = $('.input-num');
  let num = $input.val();

  // validate number
  let valid = validate_number(num);
  if (!valid) return;

  // remove value from input
  $input.val('');

  // (1) input player answer
  let answer = get_player_answer();
  if (!answer) {
    set_info_msg(MSG_SECRET_ADDED);
    set_player_answer(num, _ => sync_room_data(polling));
  }
  // (2) guess friend number
  else {
    let turn = get_player_number().length;
    let hint = create_hint(get_friend_answer(), num);
    add_log_msg(turn+1, num, hint);
    set_player_number(num);
    sync_room_data(polling);
  }

  // switch to friend turn
  friend_turn();
}
function handle_exit(evt) {
  // empty room
  ajax_post(api, null, _ => {
    location.href = './index.html';
  });
}

// api
function fetch_room_data(callback) {
  $.ajax(api).done(resp => {
    // update global room data
    room_data = resp.data || get_default_data();
    // callback
    callback(room_data);
  });
}
function sync_room_data(callback=null) {
  room_data.ts = now();
  ajax_post(api, room_data, callback);
}

// data
function set_player_answer(num, callback) {
  fetch_room_data(_ => {
    room_data.answer[player_no-1] = num;
    callback();
  });
}
function get_player_answer() {
  return room_data.answer[{ 1: 0, 2: 1 }[player_no]];
}
function get_friend_answer() {
  return room_data.answer[{ 1: 1, 2: 0 }[player_no]];
}
function set_player_number(num) {
  return room_data.number[player_no-1].push(num);
}
function get_player_number() {
  return room_data.number[player_no-1];
}

// gameplay
function join_room() {
  fetch_room_data(_ => {
    // update online player
    room_data.online += 1;
    player_no = player_no || room_data.online;

    // reject if room full
    if (player_no > 2) {
      location.href = './index.html';
      return;
    }

    // sync data
    sync_room_data();

    // update ui
    $('.label-player').html(`Player ${player_no}`);
    $('.label-room').html(`Room ${room_no}`);

    // (1) enter secret
    let answer = get_player_answer();
    if (!answer) {
      set_info_msg(MSG_ENTER_ANS);
      your_turn();
    }
    // (2) continue play
    else {
      // start msg
      set_info_msg(MSG_SECRET_ADDED);
      // start message
      if (ready2play())
        add_success_msg(MSG_GAME_START);
      // restore log
      let friend_ans = get_friend_answer();
      get_player_number().forEach((num, turn) => {
        let hint = create_hint(get_friend_answer(), num);
        add_log_msg(turn+1, num, hint);
      });
      // flow
      setTimeout(polling, POLLING_SEC);
      friend_turn();
    }
  });
}
function polling() {
  fetch_room_data(_ => {
    // both players enter their number
    if (!ready2play()) {
      setTimeout(polling, POLLING_SEC);
    }
    // ready to play
    else {
      // just start
      if (just_start())
        add_success_msg(MSG_GAME_START);

      // game over
      if (check_game_over()) {
        game_over();
      }
      // your turn
      else if (check_your_turn()) {
        your_turn();
      }
      // friend turn -> polling
      else {
        setTimeout(polling, POLLING_SEC);
      }
    }
  });
}
function ready2play() {
  return room_data.answer.every(r => !!r);
}
function just_start() {
  let latest_msg = $('.record.container div').first().text();
  let p1_size = room_data.number[0].length;
  let p2_size = room_data.number[1].length;
  return ready2play()
    && (p1_size + p2_size == 0)
    && (latest_msg == MSG_SECRET_ADDED);
}
function your_turn() {
  $('.btn-send').show();
  $('.btn-wait').hide();
  $('.btn-exit').hide();
  //
  $('.input-num').focus();
}
function friend_turn() {
  $('.btn-send').hide();
  $('.btn-wait').show();
  $('.btn-exit').hide();
}
function game_over() {
  // show message
  let wins = check_win_status();
  if (wins.every(r => r)) { // draw
    add_success_msg(MSG_DRAW_GAME);
  }
  else { // win or lose
    let win = wins[player_no-1];
    win ? add_success_msg(MSG_YOU_WIN)
        : add_error_msg(MSG_YOU_LOSE);
  }
  $('.btn-send').hide();
  $('.btn-wait').hide();
  $('.btn-exit').show();
}
function check_your_turn() {
  let p1_size = room_data.number[0].length;
  let p2_size = room_data.number[1].length;
  if (player_no == 1) {
    return p1_size == p2_size;
  }
  else if (player_no == 2) {
    return p1_size > p2_size;
  }
  return false;
}
function check_win_status() {
  let [p1_ans, p2_ans] = room_data.answer;
  let [p1_num, p2_num] = room_data.number;

  // turn not complete
  if (p1_num.length != p2_num.length)
    return [false, false];

  let p1_win = p1_num.indexOf(p2_ans) > -1;
  let p2_win = p2_num.indexOf(p1_ans) > -1;
  return [ p1_win, p2_win ];
}
function check_game_over() {
  return check_win_status().some(s => s);
}
function create_hint(ans, num) {
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

// message
function clear_msg() { $('.record.container').html(''); }
function add_msg(html) { $('.record.container').prepend(html); }
function add_html_msg(msg, clz=null) { add_msg(`<div class='text-${clz}'>${msg}</div>`); }
function add_success_msg(msg) { add_html_msg(msg, 'success'); }
function add_error_msg(msg) { add_html_msg(msg, 'danger'); }
function add_info_msg(msg) { add_html_msg(msg, 'primary'); }
function set_info_msg(msg) {
  clear_msg();
  add_info_msg(msg);
}
function add_log_msg(turn, num, hint) {
  let html = `
    <div class='row'>
      <div class='col-3'>[${turn}]</div>
      <div class='col-3'>${num}</div>
      <div class='col-6'>${hint}</div>
    </div>`;
  add_html_msg(html);
}
