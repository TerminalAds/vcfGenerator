const express = require('express');
const bodyParser = require('body-parser')
const vCardsJS = require('vcards-js');
const cors = require("cors");
const axios = require("axios");
const striptags = require("striptags");


const app = express();
const vCard = vCardsJS();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
const port = 2500;

async function convertToBase64(img) {
    let base64 = null;
    await axios.get(img,{responseType:"arraybuffer"}).then((x) => {
        base64 = Buffer.from(x.data).toString('base64');
    }).catch((e) => {
    });
    return base64;
}

app.post('/', async (req, res) => {

    //set properties
    vCard.firstName = req.body.userName;
    vCard.nickname = req.body.visitName;
    vCard.organization = req.body.organizationName;
    vCard.title = req.body.subOrgan;
    vCard.url = req.body.website;
    vCard.workPhone = req.body.companyNumber;
    vCard.role = req.body.workField;
    vCard.homeAddress.postalCode = req.body.codePostal;
    vCard.note = req.body.aboutUs;
    vCard.email = req.body.socialMedia?.['email']?.[0]?.url;
    vCard.workEmail = req.body.email;
    vCard.cellPhone = req.body.phoneNumber?.[0]?.number;
    vCard.note = striptags(req.body.aboutUs, [], '\n');
    vCard.workFax = req.body.fax;

//or embed image
    vCard.photo.embedFromString(await convertToBase64(req.body?.photo?.profile), 'PNG');

//set URL where the vCard can be found
//     vCard.source = 'http://mywebpage/myvcard.vcf';

//set address information
    vCard.homeAddress.label = 'آدرس';
    vCard.homeAddress.street = req.body.location;
    vCard.homeAddress.city = req.body.city;
    vCard.homeAddress.stateProvince = req.body.province;
    vCard.homeAddress.countryRegion = req.body.country;

//set social media URLs
    vCard.socialUrls['whatsapp'] = req.body.socialMedia?.['whatsapp']?.[0]?.url;
    vCard.socialUrls['linkedIn'] = req.body.socialMedia?.['linkedin']?.[0]?.url;
    vCard.socialUrls['telegram'] = req.body.socialMedia?.['telegram']?.[0]?.url;
    vCard.socialUrls['pinterest'] = req.body.socialMedia?.['pinterest']?.[0]?.url;
    vCard.socialUrls['bale'] = req.body.socialMedia?.['bale']?.[0]?.url;


    //set content-type and disposition including desired filename
    res.set('Content-Type', 'text/vcard; name="enesser.vcf"');
    res.set('Content-Disposition', 'inline; filename="enesser.vcf"');

    //send the response
    res.send(Buffer.from(vCard.getFormattedString()).toString("base64"));
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
