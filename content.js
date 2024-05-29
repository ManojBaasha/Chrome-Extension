function scrapePage() {
  var crs = courses();
  console.log(crs);
  return crs;
}

function getCourseTitle(courseItem) {
  return courseItem.querySelector(".classTitle").textContent;
}

function createEvent(
  year,
  month,
  day,
  numWeeks,
  courseName,
  parsedName,
  parsedTime,
  parsedDays,
  parsedLocation,
) {
  console.log(
    year,
    month,
    day,
    numWeeks,
    courseName,
    parsedName,
    parsedTime,
    parsedDays,
    parsedLocation,
  );
  if (parsedLocation == "TBA") {
    return;
  }
  if (parsedTime == "" || parsedDays == "") {
    return;
  }
  //convert AM/PM time into 24-hr
  var splitTime = parsedTime.split("-"); //Split into start/end times
  var startAMPM = splitTime[0].trim(); //Start time in AM/PM format
  var startAMPMStr = startAMPM.match(/\s(.*)$/)[1];
  var endAMPM = splitTime[1].trim();
  var endAMPMStr = endAMPM.match(/\s(.*)$/)[1];
  var start = {
    hours: Number(startAMPM.match(/^(\d+)/)[1]),
    minutes: Number(startAMPM.match(/:(\d+)/)[1]),
  };
  if (startAMPMStr == "PM" && start.hours < 12) {
    start.hours += 12;
  }
  if (startAMPMStr == "AM" && start.hours == 12) {
    start.hours = 0;
  }
  var end = {
    hours: Number(endAMPM.match(/^(\d+)/)[1]),
    minutes: Number(endAMPM.match(/:(\d+)/)[1]),
  };
  if (endAMPMStr == "PM" && end.hours < 12) {
    end.hours += 12;
  }
  if (endAMPMStr == "AM" && end.hours == 12) {
    end.hours = 0;
  }

  var days = toBYDAY(parsedDays); //convert into correct format for RRULE
  var startDateTime = new Date(year, month, day, start.hours, start.minutes); //Default start/end date to the Monday the user selected
  var endDateTime = new Date(year, month, day, end.hours, end.minutes);
  //Calculate the correct starting date for each class depending on it's first meeting day.
  //e.g. if a course meets Tuesday, we add one day to the original starting day (monday)
  switch (parsedDays[0]) {
    case "M":
      break;
    case "T":
      startDateTime.setDate(startDateTime.getDate() + 1);
      endDateTime.setDate(endDateTime.getDate() + 1);
      break;
    case "W":
      startDateTime.setDate(startDateTime.getDate() + 2);
      endDateTime.setDate(endDateTime.getDate() + 2);
      break;
    case "R":
      startDateTime.setDate(startDateTime.getDate() + 3);
      endDateTime.setDate(endDateTime.getDate() + 3);
      break;
    case "F":
      startDateTime.setDate(startDateTime.getDate() + 4);
      endDateTime.setDate(endDateTime.getDate() + 4);
      break;
  }

  //Date the event will run until (start date + numWeeks weeks)
  var newDate = new Date(
    endDateTime.getFullYear(),
    endDateTime.getMonth(),
    endDateTime.getDate(),
    end.hours,
    end.minutes,
  );

  var untilDate = addDays(newDate, numWeeks * 7);

  var endMonth = untilDate.getMonth();
  var endDay = untilDate.getDay();
  if (endMonth + 1 < 10) {
    endMonth = "0" + "" + (endMonth + 1);
  } else {
    endMonth = endMonth + 1;
  }
  var endDay = untilDate.getDate();
  if (endDay < 10) {
    endDay = "0" + "" + endDay;
  }
  console.log(untilDate.getFullYear() + "" + endMonth + "" + endDay);
  //Format the calendar event into a proper request
  var event = {
    kind: "calendar#event",
    summary: courseName + " " + parsedName,
    location: parsedLocation,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: "America/Los_Angeles",
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: "America/Los_Angeles",
    },
    recurrence: [
      "RRULE:FREQ=WEEKLY;UNTIL=" +
        untilDate.getFullYear() +
        "" +
        endMonth +
        "" +
        endDay +
        ";BYDAY=" +
        days,
    ],
  };
  return event;
}

function courses() {
  var courses = [];
  var courseItems = document.querySelectorAll(
    ".CourseItem.gray-shadow-border.clearfix",
  );
  var API_KEY = "AIzaSyC1YTPl8VqCagwOxZdWqe3TXoAhYU5gHlM";
  calenderEvent = [];

  // Iterate over each selected element
  courseItems.forEach(function (courseItem) {
    var registeredCourse =
      courseItem.querySelector(".statusIndicator").textContent === "Registered";
    if (registeredCourse) {
      var courseTitle = getCourseTitle(courseItem);
      var meetingItems = courseItem.querySelectorAll(".meeting.clearfix");
      var course = {
        title: courseTitle, // Course Titla - String
        meetings: [], // Array of Meeting Objects
      };
      meetingItems.forEach(function (meetingItem) {
        meetingElements = meetingItem.querySelectorAll(
          ".float-left, .height-justified",
        );
        var meeting = {
          type: meetingElements[0].textContent, // Lecture/Tutorial/Lab
          time: meetingElements[1].textContent, // Time (e.g. 9:00 AM - 10:00 AM)
          days: meetingElements[2].textContent, // Days (e.g. MWF)
          location: meetingElements[3].textContent, // Location (e.g. MC 2035)
        };
        //formatting according to google calendar
        var numWeeks = 13;
        var startDate = "2024-09-25";
        var date = startDate.split("-");
        var month = parseInt(date[1]);
        var day = parseInt(date[2]);
        var year = parseInt(date[0]);
        calenderEvent = createEvent(
          year,
          month,
          day,
          numWeeks,
          courseTitle,
          meeting.type,
          meeting.time,
          meeting.days,
          meeting.location,
        );
        // console.log(calenderEvent);
        // course.meetings.push(meeting);
      });
      courses.push(calenderEvent);
    }
  });
  // console.log(courses);
  return courses;
}

function sendDataToBackend(data) {
  chrome.runtime.sendMessage({ data: data }, function (response) {
    console.log(response);
  });
}

function scheduleScrape() {
  var data = scrapePage();
  sendDataToBackend(data);
}

function addDays(date, days) {
  var out = new Date(date.getTime());
  out.setDate(date.getDate() + days);
  return out;
}
function numDays(year, month) {
  return new Date(year, month, 0).getDate();
}

function toBYDAY(parsedDays) {
  var days = "";
  for (var i = 0; i < parsedDays.length; i++) {
    if (i != 0) {
      days += ",";
    }
    switch (parsedDays[i]) {
      case "M":
        days += "MO";
        break;
      case "T":
        days += "TU";
        break;
      case "W":
        days += "WE";
        break;
      case "R":
        days += "TH";
        break;
      case "F":
        days += "FR";
        break;
    }
  }
  return days;
}

scheduleScrape();
