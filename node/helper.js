const languages = {
  eng_IN: "English",
  kan_IN: "Kannada",
  tam_IN: "Tamil",
  tel_IN: "Telugu",
  guj_IN: "Gujrati",
  mar_IN: "Marathi",
  hin_eng_IN: "Bi-Lingual",
  hin_IN: "Hindi"
};
const langcode = (json => {
  var ret = {};
  for (var key in json) {
    ret[json[key]] = key;
  }
  return ret;
})(languages);
var getlang = lang => languages[lang];
var getlangCode = code => langcode[code];
var getLangArr = str => {
  if (!str) return [];
  return str
    .split(",")
    .map(getlang)
    .filter(Boolean);
};
var cors = (req, res, next) => {
  if (req.headers.origin) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, token"
    );
  }
  next();
};
module.exports = { getlang, getLangArr, getlangCode, cors };
