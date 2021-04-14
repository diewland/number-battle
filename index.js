const MAX_ROOM_NUM = 9;
const RESET_ROOM_SEC = 10 * 60; // 10 minutes

// ---------- MAIN ----------

update_room_status();
$('.btn-refresh').click(update_room_status);

// bind busy room
$('body').on('click', '.rooms .nes-btn.is-error', evt => {
  let room_no = $(evt.target).text();
  //let ok = confirm(`Room ${room_no} busy, Do you want to reset ?`);
  //if (ok) empty_room(room_no, update_room_status);
  alert(`Room ${room_no} busy. This room will be free within 10 minutes.`);
});

// ---------- FUNCTIONS ----------

function empty_room(room_no, callback=null) {
  let api = get_api_url(room_no);
  ajax_post(api, null, callback);
}

function update_room_status() {
  // reset html
  $('.rooms').html('');

  // build requests
  let reqs = $.map(new Array(MAX_ROOM_NUM), (_, i) => {
    let url = get_api_url(i+1);
    return $.ajax(url);
  });

  // fetch data
  Promise.all(reqs).then(resps => {
    resps.forEach((r, i) => {
      let html = render_room_button(i+1, r);
      $('.rooms').append(html);
    });
  });
}
function render_room_button(no, resp) {
  let data = resp.data || get_default_data();
  // no player in room
  if (data.online == 0) {
    return `<div class='col-4 mt-2'><a class="nes-btn is-success w-100" href='./play.html?r=${no}'>${no}</a></div>`;
  }
  // 1 player in room
  else if (data.online == 1) {
    return `<div class='col-4 mt-2'><a class="nes-btn is-warning w-100" href='./play.html?r=${no}'>${no}</a></div>`;
  }
  // room busy
  else {
    let last_active = (now() - data.ts) / 1000; // seconds
    // auto empty room
    if (last_active > RESET_ROOM_SEC) {
      empty_room(no);
      return `<div class='col-4 mt-2'><a class="nes-btn is-success w-100" href='./play.html?r=${no}'>${no}</a></div>`;
    }
    else {
      return `<div class='col-4 mt-2'><a class="nes-btn is-error w-100" href='#/'>${no}</a></div>`;
    }
  }
}
