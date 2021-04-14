// ---------- MAIN ----------

update_room_status();
$('.btn-refresh').click(update_room_status);

// bind busy room
$('body').on('click', '.rooms .nes-btn.is-error', evt => {
  let room_no = $(evt.target).text();
  let yes = confirm(`Room ${room_no} is busy, Do you want to reset ?`);
  if (yes) {
    let api = get_api_url(room_no);
    ajax_post(api, null, update_room_status);
  }
});

// ---------- FUNCTIONS ----------

function update_room_status() {
  // reset html
  $('.rooms').html('');

  // build requests
  let reqs = $.map(new Array(9), (_, i) => {
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
  let data = resp.data || DEFAULT_DATA;
  if (data.online < 2) {
    return `<div class='col-4 mt-2'><a class="nes-btn is-success w-100" href='./play.html?r=${no}'>${no}</a></div>`;
  }
  else {
    return `<div class='col-4 mt-2'><a class="nes-btn is-error w-100" href='#/'>${no}</a></div>`;
  }
}
