// query string
function get_qs(k) {
  let params = new URLSearchParams(window.location.search);
  return params.get(k);
}

// api
function now() {
  return +new Date();
}
function get_default_data() {
  return {
    online: 0,
    //finish: false,
    answer: [null, null],
    number: [[], []],
    ts: now(),
  };
}
function get_api_url(room_no) {
  // prevent cache by t param
  return `./db/api.php?filename=room${room_no}.json&t=${now()}`;
}
function ajax_get(api, callback) {
  $.ajax(api, { success: callback });
}
function ajax_post(api, data, callback=null) {
  $.ajax({
    type: "POST",
    url: api,
    data: JSON.stringify(data),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: callback,
  });
}
