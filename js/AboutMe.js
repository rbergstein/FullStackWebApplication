function clock() {
    var datetoday = new Date();
    var timenow = datetoday.toLocaleTimeString();
    if (datetoday.getHours() == 12) { // HOURS
        document.getElementById("hours").innerText = "12";
    } else if (datetoday.getHours() == 0) {
        document.getElementById("hours").innerText = "12";
    } else {
        document.getElementById("hours").innerText = (datetoday.getHours() % 12);
    }
    if (datetoday.getMinutes() < 10) { //  MINUTES
        document.getElementById("minutes").innerText = "0" + datetoday.getMinutes()
    } else {
        document.getElementById("minutes").innerText = datetoday.getMinutes();
    }
    if (datetoday.getSeconds() < 10) { // SECONDS
        document.getElementById("seconds").innerText = "0" + datetoday.getSeconds()
    } else {
        document.getElementById("seconds").innerText = datetoday.getSeconds();
    }
    if ((datetoday.getHours() - 12) > 0) { // AM or PM
        document.getElementById("timeofday").innerText = "PM";
    } else {
        document.getElementById("timeofday").innerText = "AM";
    }
}

var intID = setInterval(function(){clock()},1000);
