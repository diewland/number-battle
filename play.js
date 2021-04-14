// ---------- MAIN ----------

// game config
let api = null;
let room_data = null;
let room_no = get_qs('r');
let player_no = 0;

// validate room no
if (!room_no) {
  location.href = './index.html';
}
else {
  // update api url
  api = get_api_url(room_no);

  // join room
  join_room(api);
}

// TODO test only
/*
for(let i=1; i<=40; i++) {
  $('.record.container').prepend(`
    <div class='row'><div class='col'>#${i}</div><div class='col'>1234</div><div class='col'>OOXX</div></div>
  `);
}
$('.record.container').prepend(`<div class='text-success'>Player 2 win!</div>`);
*/

// ---------- FUNCTIONS ----------

// gameplay
function join_room(api) {
  $.ajax(api).done(resp => {
    // update room data
    room_data = resp.data || get_default_data();

    // update online player
    room_data.online += 1;
    player_no = room_data.online;

    // reject if room full
    if (room_data.online > 2) {
      location.href = './index.html';
      return;
    }

    // sync db
    room_data.ts = now();
    ajax_post(api, room_data);

    // update ui
    $('.label-player').html(`Player ${player_no}`);
    $('.label-room').html(`Room ${room_no}`);

    // TODO p1 input secret ?
    // TODO p2 input secret ?
    // TODO whose turn ?
    // TODO game end ?
  });
}
