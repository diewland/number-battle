const POLLING_SEC = 5 * 1000; // 5 seconds

const MSG_ENTER_ANS = "Enter your number.";
const MSG_ANS_ADDED = "Your number added, Please wait to start game.";

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
}

// ---------- FUNCTIONS ----------

// input
function validate_number(num) {
  return !!num.match(/^\d{4}$/);
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

  // submit number
  let answer = get_player_answer();
  // input player answer
  if (!answer) {
    set_info_msg(MSG_ANS_ADDED);
    set_player_answer(num, _ => sync_room_data(polling));
    friend_turn();
  }
  // guess friend number
  else {
    // TODO
  }
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
  $('.btn-send').hide();
  $('.btn-wait').hide();
  $('.btn-exit').show();
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

    // check player answer
    let answer = get_player_answer();
    if (!answer) {
      set_info_msg(MSG_ENTER_ANS);
      your_turn();
    }
    else {
      set_info_msg(MSG_ANS_ADDED);
      setTimeout(polling, POLLING_SEC);
      friend_turn();
    }
  });
}
function polling() {
  fetch_room_data(_ => {
    // ready to play
    let ready2play = room_data.answer.every(r => !!r);
    if (!ready2play) {
      setTimeout(polling, POLLING_SEC);
    }
    else {
      // ready to play
      // TODO whose turn ?
      // TODO game end ?
    }
  });
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
      <div class='col'>#${turn}</div>
      <div class='col'>${num}</div>
      <div class='col'>${hint}</div>
    </div>`;
  add_html_msg(html);
}
