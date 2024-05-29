"use strict";

function handleResponse(data) {
  console.log(data);
}

// Example data
/*
const courses = [
  {
    title: "AAS 010 A01 - African-American Culture & Society",
    meetings: [
      { type: 'Lecture', time: '1:40 PM - 3:00 PM', days: 'TR', location: 'Cruess Hall 107' },
      { type: 'Discussion', time: '4:10 PM - 5:00 PM', days: 'T', location: 'Wellman Hall 103' }
    ]
  },
  {
    title: "ECS 199 033 - Special Study for Advanced Undergraduates",
    meetings: [
      { type: 'Variable', time: '', days: '', location: 'TBA' }
    ]
  },
  {
    title: "EEC 018 A02 - Digital Systems I",
    meetings: [
      { type: 'Lecture', time: '4:10 PM - 5:30 PM', days: 'MW', location: 'Giedt 1003' },
      { type: 'Laboratory', time: '8:00 AM - 11:50 AM', days: 'T', location: 'Kemper Hall 2110' }
    ]
  },
  {
    title: "EEC 161 001 - Applied Probability for Electrical & Computer Engineers",
    meetings: [
      { type: 'Lecture', time: '10:00 AM - 11:20 AM', days: 'MW', location: 'Giedt 1003' },
      { type: 'Discussion', time: '11:30 AM - 11:50 AM', days: 'MW', location: 'Giedt 1003' }
    ]
  },
  {
    title: "EEC 195B A01 - Autonomous Vehicle Design Project",
    meetings: [
      { type: 'Workshop', time: '9:00 AM - 9:50 AM', days: 'F', location: 'Wellman Hall 212' },
      { type: 'Laboratory', time: '10:00 AM - 12:50 PM', days: 'F', location: 'Kemper Hall 2147' }
    ]
  }
];
*/

// Event page to export the calendar events to Google Calendar
chrome.runtime.onMessage.addListener(
  // When we receive a message from the content script...
  function (request, sender, sendResponse) {
    // Authorize the user
    console.log(request);
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
      if (chrome.runtime.lastError || !token) {
        console.error("Failed to get auth token:", chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError });
        return;
      }

      var url =
        "https://www.googleapis.com/calendar/v3/calendars/primary/events";

      request.forEach((event) => {
        var http = new XMLHttpRequest();
        http.open("POST", url, true);
        http.setRequestHeader("Content-type", "application/json");
        http.setRequestHeader("Authorization", "Bearer " + token);

        var eventParams = {
          summary: event.title,
          location: event.meetings[0].location,
          start: {
            dateTime: event.meetings[0].startDateTime,
            timeZone: "America/Los_Angeles", // or your specific time zone
          },
          end: {
            dateTime: event.meetings[0].endDateTime,
            timeZone: "America/Los_Angeles", // or your specific time zone
          },
          recurrence: [
            "RRULE:FREQ=WEEKLY;COUNT=10", // Example rule, adjust as needed
          ],
        };

        http.send(JSON.stringify(eventParams));
        http.onload = function () {
          if (http.status === 200) {
            console.log("Event created:", http.responseText);
          } else {
            console.error("Error creating event:", http.responseText);
          }
        };
      });

      chrome.tabs.create({ url: "https://calendar.google.com" }); // link to calendar
      sendResponse({ success: true });
    });

    // Return true to indicate that the response is asynchronous
    return true;
  },
);
