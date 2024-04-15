chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.text === "scrapeData") {
        sendResponse(scrapePage(msg.url));
    }
});

//checks if it needs to fetch the entire linkedin page
function scrapeError() {
    console.error("There was an error scraping the page");
    return document.documentElement.innerHTML;
}

function scrapePage(url) {
    const alumni = {
        "url": url,
        "name": null,
        "education": null,
        "experience": null,
        "html_content": null,
        "error": false,
        "location": null
    };

    // Scrape the name
    alumni["name"] = scrapeName() || "FetchLinkedInPage";

    // Scrape the education 
    alumni["education"] = scrapeEducation() || "FetchLinkedInPage";

    // Scrape the location
    alumni["location"] = scrapeLocation();

    // Scrape the experience
    alumni["experience"] = scrapeExperience() || "FetchLinkedInPage";
    console.log(alumni.experience);
    if (alumni.name === "FetchLinkedInPage" ||
        alumni["education"] === "FetchLinkedInPage" ||
        alumni["experience"] === "FetchLinkedInPage") {
        alumni["html_content"] = scrapeError();
        alumni["error"] = true;
    }

    console.log(alumni);
    return alumni;
}

function scrapeName() {
    const name = document.querySelector('.artdeco-card > div.ph5 > div.mt2 > div > div > span > a > h1').innerText;
    return name;
}

function scrapeLocation() {
    const location = document.querySelector('.artdeco-card > div.ph5 > div.mt2 > div.mt2 > span.inline, span.t-black--light').innerText;
    return location;
}

function scrapeEducation() {
    var education = {}

    // Find the HTML element pertaining to the education section
    const profileCards = document.querySelectorAll(".artdeco-card, .pv-profile-card, .break-words");
    var educationCard = null
    profileCards.forEach((card) => {
        const educationSelector = card.querySelector("#education");
        if (educationSelector !== null) {
            educationCard = card;
        }
    });
    // Exit here if we're unable to find the education section
    if (educationCard === null) {
        //console.log("There was an error finding education.");
        return;
    }
    
    // Parse the information from every place of education and return it in a JSON object
    const schools = educationCard.querySelector(".pvs-list__outer-container > .pvs-list");
    schools.querySelectorAll('.artdeco-list__item').forEach((school) => {
        var schooltype = school.querySelector("div > div.display-flex > div.display-flex > a > div > div > div > div > span[aria-hidden='true']")
        var schoolName = schooltype ? schooltype.innerText : null
        var degreetype = school.querySelector("div > div.display-flex > div.display-flex > a > span > span[aria-hidden='true']")
        var degree = degreetype ? degreetype.innerText : null
        var grad = school.querySelector("div > div.display-flex > div.display-flex > a > span.t-black--light > span[aria-hidden='true']")
        var graduation = grad ? grad.innerText : null
        if (schoolName === null) {
            console.log("There was an error parsing a school");
            return ;
        }
        education[schoolName] = {}
        if (degree !== null) {
            education[schoolName]["degree"] = degree;
        }
        if (graduation !== null) {
            education[schoolName]["graduation"] = graduation;
        }
    })
    return education
}

function timelineParser(input, job){
    var total = job.querySelectorAll(input)
    var timeline = null
    var location = null
    //console.log(total)
    if(total.length > 0){
        count = 0
        total.forEach((element) => {
            if (count === 0) {
                // timeline = element.querySelector("span[aria-hidden='true']")
                // timeline = timeline? timeline.innerText : null
                timeline = queryResolver(element, "span[aria-hidden='true']")
            }else if (count === 1){
                // location = element.querySelector("span[aria-hidden='true']")
                // location = location? location.innerText : null
                location = queryResolver(element, "span[aria-hidden='true']")
            }
            count++
        })
    }
    return [timeline, location]
}

function scrapeExperience(){
    var experience = {}
    const profileCards = document.querySelectorAll(".artdeco-card, .pv-profile-card, .break-words");
    var jobCard = null
    
    //Get all the job cards
    profileCards.forEach((card) => {
        const educationSelector = card.querySelector("#experience");
        if (educationSelector !== null) {
            jobCard = card;
        }
    });

    // Exit here if we're unable to find the job section
    if (jobCard === null) {
        console.error("There was an error finding jobs.");
        return;
    }

    firstJobProcessed = false
    // Parse the information from every place of job and return it in a JSON object
    const jobs = jobCard.querySelector(".pvs-list__outer-container > .pvs-list");
    jobs.querySelectorAll('.artdeco-list__item').forEach((job) => {  
        
        if(!firstJobProcessed){
            //If there are no multiple positions in the company
            //finding job name when the single job in a company
            let jobName = queryResolver(job, "div[data-view-name='profile-component-entity'] > div.display-flex > div.display-flex > div.display-flex > div.display-flex > div.display-flex > div.display-flex > div.display-flex > span[aria-hidden='true']")
            
            //finding company name when the single job in a company
            let company = queryResolver(job, "div[data-view-name='profile-component-entity'] > div.display-flex > div.display-flex > div.display-flex > span.t-14, span.t-normal > span[aria-hidden='true']")
            
            //finding timeline and location when the single job in a company
            let [timeline, location] = timelineParser("div[data-view-name='profile-component-entity'] > div.display-flex > div.display-flex > div.display-flex > span.t-black--light", job)
            
            //if there are multiple jobs in a company
            if (jobName === null) {
                let company = queryResolver(job, "div[data-view-name='profile-component-entity'] span[aria-hidden='true']")
                let [timeline, location] = timelineParser("div[data-view-name='profile-component-entity'] > div.display-flex > div.display-flex > a > span.t-14, span.t-normal", job)
                
                // Parse multiple jobs
                const jobQueries = job.querySelectorAll("div[data-view-name='profile-component-entity'] > div.display-flex > div.pvs-entity__sub-components > ul.pvs-list > li");
                jobQueries.forEach((query) => {
                    jobName = queryResolver(query, "div > div.display-flex > div > a > div > div > div > div > span[aria-hidden='true']")
                    var jobTimeline = queryResolver(query, "div > div.display-flex > div > a > span > span[aria-hidden='true']")
                    
                    if (!experience.hasOwnProperty(company)) {
                        experience[company] = [];
                        experience[company]["overalltime"] = timeline
                    }

                    experience[company].push({
                        job: jobName,
                        timeline: jobTimeline,
                        location: location
                    });
                });

            } else {
                // Store single job details in the experience object
                if (!experience.hasOwnProperty(company)) {
                    experience[company] = [];
                }

                experience[company].push({
                    job: jobName,
                    timeline: timeline,
                    location: location
                });
            }
            firstJobProcessed = true
        }
    })
    return experience
}

function extraLineRemover(text) {
    // Remove everything after the first newline character
    let new_text = text.trim().replace(/\n.*/, '');
    // Remove everything after the first '·' character
    new_text = new_text.trim().replace(/\·.*/, '');
    // Trim the extra whitespace at the beginning and end of the string
    new_text = new_text.trim();
    return new_text;
}


function queryResolver(jobCardElement, query){
    let element = jobCardElement.querySelector(query)
    const item = element !== null ? extraLineRemover(element.innerText) : null;
    return item
}