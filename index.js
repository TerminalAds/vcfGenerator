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
  let base64 = null;
  try {
    const response = await axios.get(img, { responseType: "arraybuffer" });
    base64 = Buffer.from(response.data).toString("base64");
  } catch (e) {
    console.error("Error fetching image: ", e.message);
  }
  return base64;
}

app.post("/", async (req, res) => {
  try {
    const vCard = vCardsJS();

    // set properties
    vCard.firstName = req.body.userName || "";
    vCard.nickname = req.body.visitName || "";
    vCard.organization = req.body.organizationName || "";
    vCard.title = req.body.subOrgan || "";
    vCard.url = req.body.website || "";
    vCard.workPhone = req.body.companyNumber || "";
    vCard.role = req.body.workField || "";

    if (vCard.homeAddress) {
      vCard.homeAddress.postalCode = req.body.codePostal || "";
      vCard.homeAddress.label = "آدرس";
      vCard.homeAddress.street = req.body.location || "";
      vCard.homeAddress.city = req.body.city || "";
      vCard.homeAddress.stateProvince = req.body.province || "";
      vCard.homeAddress.countryRegion = req.body.country || "";
    }

    vCard.email = req.body.socialMedia?.["email"]?.[0]?.url || "";
    vCard.workEmail = req.body.email || "";
    vCard.cellPhone = req.body.phoneNumber?.[0]?.number || "";

    const aboutUsRaw = req.body.aboutUs || "";
    vCard.note = striptags(aboutUsRaw, [], "\n");
    vCard.workFax = req.body.fax || "";

    if (req.body?.photo?.profile) {
      const base64Img = await convertToBase64(req.body.photo.profile);
      if (base64Img) {
        vCard.photo.embedFromString(base64Img, "PNG");
      }
    }

    let vcardString = vCard.getFormattedString();

    vcardString = vcardString.replace(/END:VCARD[\r\n]*/g, "");

    const sm = req.body.socialMedia;
    if (sm) {
      if (sm["whatsapp"]?.[0]?.url)
        vcardString += `X-SOCIALPROFILE;type=WhatsApp:${sm["whatsapp"][0].url}\r\n`;
      if (sm["linkedin"]?.[0]?.url)
        vcardString += `X-SOCIALPROFILE;type=LinkedIn:${sm["linkedin"][0].url}\r\n`;
      if (sm["telegram"]?.[0]?.url)
        vcardString += `X-SOCIALPROFILE;type=Telegram:${sm["telegram"][0].url}\r\n`;
      if (sm["pinterest"]?.[0]?.url)
        vcardString += `X-SOCIALPROFILE;type=Pinterest:${sm["pinterest"][0].url}\r\n`;
      if (sm["bale"]?.[0]?.url)
        vcardString += `X-SOCIALPROFILE;type=Bale:${sm["bale"][0].url}\r\n`;
    }

    vcardString += "END:VCARD\r\n";

    res.set("Content-Type", 'text/vcard; charset=utf-8; name="enesser.vcf"');
    res.set("Content-Disposition", 'inline; filename="enesser.vcf"');

    res.send(Buffer.from(vcardString, "utf8").toString("base64"));
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
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
  let base64 = null;
  try {
    const response = await axios.get(img, { responseType: "arraybuffer" });
    base64 = Buffer.from(response.data).toString("base64");
  } catch (e) {
    console.error("Error fetching image: ", e.message);
  }
  return base64;
}

app.post("/", async (req, res) => {
  try {
    const vCard = vCardsJS();

    // set properties
    vCard.firstName = req.body.userName || "";
    vCard.nickname = req.body.visitName || "";
    vCard.organization = req.body.organizationName || "";
    vCard.title = req.body.subOrgan || "";
    vCard.url = req.body.website || "";
    vCard.workPhone = req.body.companyNumber || "";
    vCard.role = req.body.workField || "";

    if (vCard.homeAddress) {
      vCard.homeAddress.postalCode = req.body.codePostal || "";
      vCard.homeAddress.label = "آدرس";
      vCard.homeAddress.street = req.body.location || "";
      vCard.homeAddress.city = req.body.city || "";
      vCard.homeAddress.stateProvince = req.body.province || "";
      vCard.homeAddress.countryRegion = req.body.country || "";
    }

    vCard.email = req.body.socialMedia?.["email"]?.[0]?.url || "";
    vCard.workEmail = req.body.email || "";
    vCard.cellPhone = req.body.phoneNumber?.[0]?.number || "";

    const aboutUsRaw = req.body.aboutUs || "";
    vCard.note = striptags(aboutUsRaw, [], "\n");
    vCard.workFax = req.body.fax || "";

    // embed image
    if (req.body?.photo?.profile) {
      const base64Img = await convertToBase64(req.body.photo.profile);
      if (base64Img) {
        vCard.photo.embedFromString(base64Img, "PNG");
      }
    }

    let vcardString = vCard.getFormattedString();

    // حذف تگ END برای اضافه کردن دستی
    vcardString = vcardString.replace(/END:VCARD[\r\n]*/g, "");

    // اضافه کردن شبکه‌های اجتماعی با فرمت استاندارد دفترچه تلفن اپل (X-ABLabel)
    const sm = req.body.socialMedia;
    if (sm) {
      let itemCounter = 10; // شروع از 10 تا با سایر فیلدهای احتمالی vCard تداخل نداشته باشد

      const addSocial = (platform, label) => {
        if (sm[platform]?.[0]?.url) {
          vcardString += `item${itemCounter}.URL:${sm[platform][0].url}\r\n`;
          vcardString += `item${itemCounter}.X-ABLabel:${label}\r\n`;
          itemCounter++;
        }
      };

      addSocial("whatsapp", "WhatsApp");
      addSocial("linkedin", "LinkedIn");
      addSocial("telegram", "Telegram");
      addSocial("pinterest", "Pinterest");
      addSocial("bale", "Bale"); // برای بله
    }

    // بستن فایل
    vcardString += "END:VCARD\r\n";

    // تنظیم هدرها
    res.set("Content-Type", 'text/vcard; charset=utf-8; name="enesser.vcf"');
    res.set("Content-Disposition", 'inline; filename="enesser.vcf"');

    res.send(Buffer.from(vcardString, "utf8").toString("base64"));
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
