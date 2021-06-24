const serverless = require('serverless-http');
const express = require('express')
const app = express();
const got = require('got');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const xpath = require('xpath'),
    xmldom = require('xmldom').DOMParser

const linkedinProfileUrl = 'https://run.mocky.io/v3/66de2cca-4f16-45ee-b3d5-efd28da73b49';

app.get('/', function (req, res) {

    got(linkedinProfileUrl).then(response => {

        const dom = new JSDOM(response.body);

        const name = dom.window.document.querySelector('h1.text-heading-xlarge').textContent;
        const nameArray = name.split(" ");

        const content = dom.window.document.documentElement.outerHTML;
        const doc = new xmldom().parseFromString(content);
        let interests = dom.window.document.querySelectorAll('pv-entity__summary-title-text');
        let inArr = [];
        dom.window.document.querySelectorAll('pv-entity__summary-title-text').forEach(element => {
            inArr.push(element.textContent);
        });

        let linkedinProfileUrl = xpath.select("string(//h3[normalize-space()='Your Profile']/following::a[1])", doc);
        let website = xpath.select("string(//h3[normalize-space()='Website']/following::a[1])", doc);
        let phone = xpath.select("string(//h3[normalize-space()='Phone']/following::span[1])", doc);
        let email = xpath.select("string(//h3[normalize-space()='Email']/following::a[1])", doc);

        let workExperience = [];
        let elementListOfExperience = dom.window.document
            .querySelectorAll("a[data-control-name=background_details_company]");

        elementListOfExperience.forEach(element => {
            let job = {}
            let jobTitle = element.getElementsByTagName("div")[1]
                .getElementsByTagName("h3")[0];
            let companyName = element.getElementsByTagName("div")[1]
                .getElementsByTagName("p")[1];
            let duration = element.getElementsByTagName("div")[1]
                .getElementsByTagName("h4")[0].getElementsByTagName("span")[1];
            let description = element.parentElement.getElementsByTagName("div")[3];
            let descriptionText = description === undefined ? "" : description.textContent.trim();
            job.jobTitle = jobTitle.textContent.trim();
            job.companyName = companyName.textContent.trim();
            // job.duration = duration.textContent.trim();
            job.description = descriptionText;
            job.startDate = duration.textContent.split("–")[0].trim();
            job.endDate = duration.textContent.split("–")[1].trim();
            workExperience.push(job)
        })

        let education = [];
        let elementListOfEducation = dom.window.document
            .querySelectorAll("a[data-control-name=background_details_school]")
        elementListOfEducation.forEach(element => {
            let institution = {}
            let name = element.getElementsByTagName("h3")[0];
            let degree = element
                .getElementsByTagName("p")[0].getElementsByTagName("span")[1];
            let fieldsOfStudy = element
                .getElementsByTagName("p")[1].getElementsByTagName("span")[1];
            let duration = element
                .getElementsByTagName("p")[2].getElementsByTagName("span")[1];
            institution.name = name.textContent.trim();
            institution.degree = degree.textContent.trim();
            institution.fieldsOfStudy = fieldsOfStudy.textContent.trim();
            institution.duration = duration.textContent.trim();
            institution.startYear = duration.textContent.split("–")[0].trim();
            institution.GraduateYear = duration.textContent.split("–")[1].trim();
            education.push(institution)
        })


        let interestProfiles = []
        let elementListOfInterest = dom.window.document
            .querySelectorAll(".pv-interest-entity-link")
        elementListOfInterest.forEach(element => {
            let profileName = element.getElementsByTagName("h3")[0].textContent.trim();
            interestProfiles.push(profileName)
        })

        let mutualConnections;
        let elementOfMutualConnection = dom.window.document
            .querySelector(".ivm-image-view-model__img-list--stacked");
        if (elementOfMutualConnection === null) {
            mutualConnections = null
        } else {
            mutualConnections = elementOfMutualConnection.parentElement.parentElement
                .getElementsByTagName("strong")[0].textContent;
        }

        let certifications = [];
        let elementListOfCertifications = dom.window.document
            .querySelectorAll("a[data-control-name=background_details_certification]");

        elementListOfCertifications.forEach(element => {
            let certificate = {}
            let certificateTitle = element.getElementsByTagName("div")[1]
                .getElementsByTagName("h3")[0];
            let organization = element.getElementsByTagName("div")[1]
                .getElementsByTagName("p")[0];
            let issuedDate = element.getElementsByTagName("div")[1]
                .getElementsByTagName("p")[1];
            let credentials = element.getElementsByTagName("div")[1]
                .getElementsByTagName("p")[2];
            let credentailsText = credentials === undefined ? "" : credentials.textContent.trim();
            certificate.certificateTitle = certificateTitle.textContent.trim();
            certificate.organization = organization.textContent.trim();
            certificate.issuedDate = issuedDate.textContent.trim();
            certificate.credentials = credentailsText;
            certifications.push(certificate)
        })

        res.status(200).json({
            firstName: nameArray[0],
            lastName: nameArray[nameArray.length - 1],
            headline: dom.window.document.querySelector('.text-body-medium.break-words').textContent.trim(),
            jobTitle: xpath.select("string(//h2[normalize-space()='Experience']/following::h3[1])", doc).trim(), //dom.window.document.querySelector('div.text-body-medium').textContent.trim()
            company: xpath.select("string(//h2[normalize-space()='Experience']/following::p[2])", doc).trim(),
            about: xpath.select("string(//h2[normalize-space()='About']/following::div[1])", doc).trim(),
            contactInformation: {
                linkedinProfileUrl: linkedinProfileUrl === "" ? null : linkedinProfileUrl,
                website: website === "" ? null : website,
                phone: phone === "" ? null : phone,
                email: email === "" ? null : email
            },
            birthday: xpath.select("string(//h3[normalize-space()='Birthday']/following::span[1])", doc),
            workedCompanies: workExperience.length === 0 ? null : workExperience,
            education: education.length === 0 ? null : education,
            certifications: certifications.length === 0 ? null : certifications,
            references: [{
                name: "",
                text: ""
            }],
            qualifications: [
                {
                    "name": "",
                    "description": "",
                    "date": ""
                }
            ],
            interests: interestProfiles.toString(),
            mutualConnections: mutualConnections
        })

    }).catch(err => {
        console.log(err);
    });
});

module.exports.handler = serverless(app);