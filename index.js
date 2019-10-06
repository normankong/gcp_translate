require('dotenv').config();
const authHelper = require("./lib/authHelper.js");

// Imports the Google Cloud client library
const {
  Translate
} = require('@google-cloud/translate');

let GCP_CLIENT = null; // Lazy Initialzation
/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.processTranslate = (req, res) => {

  var opts = {
    req: req,
    res: res
  }
  if (!authHelper().verifyToken(opts)) return;

  var text = req.body.text;
  var lang = req.body.lang;
  if (text == null) res.end("Bad request");
  if (lang == null) lang = "zh-TW";

  // Initialize the GCP Client if necessary
  let client = getGCPClient();

  client.translate(text, lang)
    .then(results => {
      const translation = results[0];

      console.log(`Text: ${text}`);
      console.log(`Translation: ${translation}`);

      if (results.error != null) {
        response = {
          code: results.error.code.toString(),
          message: results.error.message
        };
      } else {
        response = {
          code: "000",
          message: translation.replace(/(\r\n|\n|\r)/gm, " "),
          raw: translation
        }
      }

      // Send Response
      res.status(200).send(JSON.stringify(response));

    })
    .catch(err => {
      res.end(`Unknown error :  ${err}`);

    });
}

function getGCPClient() {
  if (GCP_CLIENT == null) {
    console.log("=============================================================");
    console.log("Google Application Credentials : " + process.env.GOOGLE_APPLICATION_CREDENTIALS);
    GCP_CLIENT = new Translate();
    console.log("=============================================================");
  }
  return GCP_CLIENT;
}