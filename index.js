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
        var doc = new xmldom().parseFromString(content);
        var interests = dom.window.document.querySelectorAll('pv-entity__summary-title-text');
        var inArr = [];
        dom.window.document.querySelectorAll('pv-entity__summary-title-text').forEach(element => {
            inArr.push(element.textContent);
        });

        console.log(inArr.toString());

        res.status(200).json({
            firstName: nameArray[0],
            lastName: nameArray[nameArray.length - 1],
            headline: dom.window.document.querySelector('.text-body-medium.break-words').textContent.trim(),
            jobTitle: xpath.select("string(//h2[normalize-space()='Experience']/following::h3[1])", doc).trim(), //dom.window.document.querySelector('div.text-body-medium').textContent.trim()
            company: xpath.select("string(//h2[normalize-space()='Experience']/following::p[2])", doc).trim(),
            about: xpath.select("string(//h2[normalize-space()='About']/following::div[1])", doc).trim(),
            contactInformation: {
                linkedinProfileUrl: xpath.select("string(//h3[normalize-space()='Your Profile']/following::a[1])", doc),
                website: xpath.select("string(//h3[normalize-space()='Website']/following::a[1])", doc),
                phone: xpath.select("string(//h3[normalize-space()='Phone']/following::span[1])", doc),
                email: xpath.select("string(//h3[normalize-space()='Email']/following::a[1])", doc)
            },
            birthday: xpath.select("string(//h3[normalize-space()='Birthday']/following::span[1])", doc),
            workedCompanies: [{
                companyName: "",
                started: "",
                end: "",
                description: "",
                jobTitle: ""
            }],
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
            interests: inArr.toString(),
            mutualConnections: []
        })

    }).catch(err => {
        console.log(err);
    });
});

module.exports.handler = serverless(app);