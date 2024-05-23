function scrapePage() {
    var crs = courses();
    return crs;
}

function getCourseTitle(courseItem) {
    return courseItem.querySelector(".classTitle").textContent;
}

function courses() {
    var courses = [];
    var courseItems = document.querySelectorAll(
        ".CourseItem.gray-shadow-border.clearfix"
    );
    
    // Iterate over each selected element
    courseItems.forEach(function (courseItem) {
        var registeredCourse =
            courseItem.querySelector(".statusIndicator").textContent ===
            "Registered";
        if (registeredCourse) {
          var courseTitle = getCourseTitle(courseItem);
          var meetingItems = courseItem.querySelectorAll(".meeting.clearfix");
          var course = {
              title: courseTitle,
              meetings: [], 
          };
          meetingItems.forEach(function (meetingItem) {
            meetingElements = meetingItem.querySelectorAll(".float-left, .height-justified");
            var meeting = {
                type: meetingElements[0].textContent,
                time: meetingElements[1].textContent,
                days: meetingElements[2].textContent,
                location: meetingElements[3].textContent,
            };
            course.meetings.push(meeting);
          });
          courses.push(course);
        }
    });
    console.log(courses);
    return courses;
}

function sendDataToBackend(data) {
    chrome.runtime.sendMessage({ action: "sendData", data });
}

function scheduleScrape() {
    var data = scrapePage();
    sendDataToBackend(data);
}

scheduleScrape();