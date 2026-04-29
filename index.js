const express = require("express");
const bodyParser = require("body-parser");
const vCardsJS = require("vcards-js");
const cors = require("cors");
const axios = require("axios");
const striptags = require("striptags");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
const port = 2500;

async function convertToBase64(img) {
  if (!img) return null;
  try {
    const response = await axios.get(img, { responseType: "arraybuffer" });
    return Buffer.from(response.data).toString("base64");
  } catch (e) {
    console.error("Error fetching image:", e.message);
    return null;
  }
}

app.post("/", async (req, res) => {
  const vCard = vCardsJS();

  vCard.firstName = req.body.userName || "";
  vCard.nickname = req.body.visitName || "";
  vCard.organization = req.body.organizationName || "";
  vCard.title = req.body.subOrgan || "";
  vCard.url = req.body.website || "";
  vCard.workPhone = req.body.companyNumber || "";
  vCard.role = req.body.workField || "";
  vCard.homeAddress.postalCode = req.body.codePostal || "";

  if (req.body.aboutUs) {
    vCard.note = striptags(req.body.aboutUs, [], "\n");
  }

  vCard.email = req.body.socialMedia?.["email"]?.[0]?.url || "";
  vCard.workEmail = req.body.email || "";
  vCard.cellPhone = req.body.phoneNumber?.[0]?.number || "";
  vCard.workFax = req.body.fax || "";

  if (req.body?.photo?.profile) {
    const base64Profile = await convertToBase64(req.body.photo.profile);
    if (base64Profile) {
      vCard.photo.embedFromString(base64Profile, "PNG");
    }
  }

  vCard.homeAddress.label = "آدرس";
  vCard.homeAddress.street = req.body.location || "";
  vCard.homeAddress.city = req.body.city || "";
  vCard.homeAddress.stateProvince = req.body.province || "";
  vCard.homeAddress.countryRegion = req.body.country || "";

  let vcardString = vCard.getFormattedString();

  vcardString = vcardString.replace(/END:VCARD[\r\n]*/gi, "");

  const sm = req.body.socialMedia;
  if (sm?.["whatsapp"]?.[0]?.url)
    vcardString += `X-WHATSAPP:${sm["whatsapp"][0].url}\r\n`;
  if (sm?.["linkedIn"]?.[0]?.url)
    vcardString += `X-LINKEDIN:${sm["linkedin"][0].url}\r\n`;
  if (sm?.["telegram"]?.[0]?.url)
    vcardString += `X-TELEGRAM:${sm["telegram"][0].url}\r\n`;
  if (sm?.["pinterest"]?.[0]?.url)
    vcardString += `X-PINTEREST:${sm["pinterest"][0].url}\r\n`;
  if (sm?.["bale"]?.[0]?.url) vcardString += `X-BALE:${sm["bale"][0].url}\r\n`;

  vcardString += "END:VCARD\r\n";

  res.set("Content-Type", 'text/vcard; charset=utf-8; name="enesser.vcf"');
  res.set("Content-Disposition", 'inline; filename="enesser.vcf"');

  res.send(Buffer.from(vcardString, "utf8").toString("base64"));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
