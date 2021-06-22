const serverless = require('serverless-http');
const express = require('express')
const app = express();
const got = require('got');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
var xpath = require('xpath'), 
xmldom = require('xmldom').DOMParser

const linkedinProfileUrl = 'https://run.mocky.io/v3/66de2cca-4f16-45ee-b3d5-efd28da73b49';

app.get('/', function (req, res) {

    got(linkedinProfileUrl).then(response => {

        const dom = new JSDOM(response.body);

        var name = dom.window.document.querySelector('h1.text-heading-xlarge').textContent;
        var nameArray = name.split(" ");

        var content = dom.window.document.documentElement.outerHTML;
        var doc = new xmldom().parseFromString(content)
        var nodes = xpath.select("//h2[normalize-space()='Experience']/following::h3[1]", doc)

        res.status(200).json({
            pageTitle: dom.window.document.querySelector('title').textContent,
            firstName: nameArray[0],
            lastName: nameArray[nameArray.length - 1],
            jobTitle: dom.window.document.querySelector('div.text-body-medium').textContent.trim(),
            company: "",
            description: "",
            contactInformation: {
                email: "",
                twitter: ""
            },
            birthday: "",
            workedCompanies: {
                companyName: "",
                started: "",
                end: "",
                description: "",
                jobTitle: nodes[0].firstChild.data
            },
            education: [],
            certifications: [],
            references: [{
                name: "",
                text: ""
            }],
            qualifications: [{
                name: "",
                description: "",
                date: ""
            }],
            interests: [],
            mutualConnections: []
        })

    }).catch(err => {
        console.log(err);
    });
});

module.exports.handler = serverless(app);