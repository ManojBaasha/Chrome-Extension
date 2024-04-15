// Function to handle response from content script
function handleResponse(response) {
    console.log("Response received: ", response);
    var statusLabel = document.getElementById('statusLabel');
    statusLabel.innerHTML = 'Saving';
    var important = importantContent(response);
    var jsonString = JSON.stringify(important, null, 2);
    var blob = new Blob([jsonString], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    console.log(url);
    const apiUrl = 'https://alumni-backend-6954.onrender.com/alumnis';
    fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonString
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Response:', data);
            saveComplete();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
    });
}

function importantContent(data){
    var important = {};
    important["url"] = data["url"];
    important["name"] = data["name"];
    important["html"] = data["html_content"];
    important["errorParsing"] = data["error"];
    
    for(const key in data.education){
        const education = data.education[key];
        if(!key.toLowerCase().includes('university of california, davis')){
            const degree = education.degree? education.degree : "";
            const graduation = education.graduation? education.graduation.split(" - ")[1] : "";
            important["otherEducation"] = degree + " at " + key + " in " + graduation
        }
        else{
            const ucDavisGraduationYear = education ? education.graduation.split(' - ')[1] : null;
            important["major"] = education ? education.degree : "";
            important["graduationYear"] = ucDavisGraduationYear? ucDavisGraduationYear.split(' ') : null;
            important["graduationYear"] = important["graduationYear"] ? important["graduationYear"][important["graduationYear"].length - 1] : "";
            important["graduationYear"] = parseInt(important["graduationYear"]);
        }
    }

    for (const key in data.experience) {
        const jobArray = data.experience[key];
        // Iterate through each job object in the jobArray
        jobArray.forEach(job => {
            important["company"] = key;
            important["job"] = job.job ? job.job : "";
            important["location"] = job.location? job.location : data["location"];
        });
    }

    console.log(important);
    return important;
}

// Function to send message to content script to scrape data
function scrapeData() {
    var statusLabel = document.getElementById('statusLabel');
    statusLabel.innerHTML = 'Parse';
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        console.log('Sending message to:\n' + tabs[0].id);
        chrome.tabs.sendMessage(tabs[0].id, { text: 'scrapeData', url: tabs[0].url }, handleResponse);
    });
}

// Function to handle completion of download
function saveComplete() {
    var statusLabel = document.getElementById('statusLabel');
    statusLabel.innerHTML = 'Saved';
    window.close();
}

// Attach click event listener to download button
document.getElementById('statusLabel').addEventListener('click', scrapeData);