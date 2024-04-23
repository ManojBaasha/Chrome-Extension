chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.text === "scrapeData") {
    sendResponse(scrapePage(msg.url));
  }
});

function scrapePage(url) {
  var crs = courses();
  return crs;
}

function courses() {
  // Select all elements with the class "CourseItem gray-shadow-border clearfix"
  var courseItems = document.querySelectorAll(
    ".CourseItem.gray-shadow-border.clearfix",
  );

  // Iterate over each selected element
  courseItems.forEach(function (courseItem) {
    var courseTitle = courseItem.querySelector(".classTitle");
    console.log(courseTitle.textContent);
    // Find all elements with the class "meeting clearfix" within the current course item
    var meetingElements = courseItem.querySelectorAll(".meeting.clearfix");

    // Iterate over each meeting element found within the current course item
    meetingElements.forEach(function (meetingElement) {
      // Print the content of the meeting element
      console.log(meetingElement.textContent);
    });
  });
}
