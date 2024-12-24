class Notification {
  constructor() {
    this.notificationsContainer = document.createElement('div');
    this.notificationsContainer.className = 'notifications-container';
    document.body.appendChild(this.notificationsContainer);

    // Load the notification sound
    this.notificationSound = new Audio('audio/alarm.mp3'); // Ganti dengan path ke file suara Anda
  }

  createNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerText = message;

    // Append the notification to the container
    this.notificationsContainer.appendChild(notification);

    // Play the notification sound
    this.notificationSound.play();

    // Automatically dismiss the notification after the specified duration
    setTimeout(() => {
      this.dismissNotification(notification);
    }, duration);
  }

  dismissNotification(notification) {
    notification.classList.add('fade-out');
    notification.addEventListener('transitionend', () => {
      this.notificationsContainer.removeChild(notification);
    });
  }
}

class Calendar {
  constructor() {
    this.today = new Date();
    this.activeDay = null;
    this.month = this.today.getMonth();
    this.year = this.today.getFullYear();
    this.eventsArr = [];
    this.notifier = new Notification();

    this.months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    this.cacheDOM();
    this.bindEvents();
    this.getEvents();
    this.initCalendar();
    this.checkAlarm(); // Memanggil fungsi untuk memeriksa alarm
  }

  cacheDOM() {
    this.calendar = document.querySelector(".calendar");
    this.date = document.querySelector(".date");
    this.daysContainer = document.querySelector(".days");
    this.prev = document.querySelector(".prev");
    this.next = document.querySelector(".next");
    this.todayBtn = document.querySelector(".today-btn");
    this.gotoBtn = document.querySelector(".goto-btn");
    this.dateInput = document.querySelector(".date-input");
    this.eventDay = document.querySelector(".event-day");
    this.eventDate = document.querySelector(".event-date");
    this.eventsContainer = document.querySelector(".events");
    this.addEventSubmit = document.querySelector(".add-event-btn");
    this.addEventBtn = document.querySelector(".add-event");
    this.addEventContainer = document.querySelector(".add-event-wrapper");
    this.addEventCloseBtn = document.querySelector(".close");
    this.addEventTitle = document.querySelector(".event-name");
    this.addEventFrom = document.querySelector(".event-time-from");
    this.addEventTo = document.querySelector(".event-time-to");
  }

  bindEvents() {
    this.prev.addEventListener("click", () => this.prevMonth());
    this.next.addEventListener("click", () => this.nextMonth());
    this.todayBtn.addEventListener("click", () => this.goToToday());
    this.gotoBtn.addEventListener("click", () => this.gotoDate());
    this.addEventBtn.addEventListener("click", () => this.toggleAddEvent());
    this.addEventCloseBtn.addEventListener("click", () => this.closeAddEvent());
    this.addEventSubmit.addEventListener("click", () => this.addEvent());
    document.addEventListener("click", (e) => this.handleOutsideClick(e));
    this.dateInput.addEventListener("input", (e) => this.handleDateInput(e));
    this.addEventTitle.addEventListener("input", (e) => this.limitTitleInput(e));
    this.addEventFrom.addEventListener("input", (e) => this.formatTimeInput(e));
    this.addEventTo.addEventListener("input", (e) => this.formatTimeInput(e));
    this.eventsContainer.addEventListener("click", (e) => this.deleteEvent(e));
  }

  initCalendar() {
    const firstDay = new Date(this.year, this.month, 1);
    const lastDay = new Date(this.year, this.month + 1, 0);
    const prevLastDay = new Date(this.year, this.month, 0);
    const prevDays = prevLastDay.getDate();
    const lastDate = lastDay.getDate();
    const day = firstDay.getDay();
    const nextDays = 7 - lastDay.getDay() - 1;

    this.date.innerHTML = `${this.months[this.month]} ${this.year}`;
    this.renderDays(day, prevDays, lastDate, nextDays);
    this.addListeners();
  }

  renderDays(day, prevDays, lastDate, nextDays) {
    let days = "";

    // Previous month's days
    for (let x = day; x > 0; x--) {
      days += `<div class="day prev-date">${prevDays - x + 1}</div>`;
    }

    // Current month's days
    for (let i = 1; i <= lastDate; i++) {
      const event = this.eventsArr.some(eventObj => 
        eventObj.day === i && eventObj.month === this.month + 1 && eventObj.year === this.year
      );

      if (this.isToday(i)) {
        this.activeDay = i;
        this.getActiveDay(i);
        this.updateEvents(i);
        days += `<div class="day today active ${event ? 'event' : ''}">${i}</div>`;
      } else {
        days += `<div class="day ${event ? 'event' : ''}">${i}</div>`;
      }
    }

    // Next month's days
    for (let i = 1; i <= nextDays; i++) {
      days += `<div class="day next-date">${i}</div>`;
    }

    this.daysContainer.innerHTML = days;
  }

  isToday(day) {
    return day === new Date().getDate() && this.year === new Date().getFullYear() && this.month === new Date().getMonth();
  }

  addListeners() {
    const days = document.querySelectorAll(".day");
    days.forEach(day => {
      day.addEventListener("click", (e) => this.handleDayClick(e));
    });
  }

  handleDayClick(e) {
    this.activeDay = Number(e.target.innerHTML);
    this.getActiveDay(this.activeDay);
    this.updateEvents(this.activeDay);

    const days = document.querySelectorAll(".day");
    days.forEach(day => day.classList.remove("active"));
    e.target.classList.add("active");

    if (e.target.classList.contains("prev-date")) {
      this.prevMonth();
      this.reactivateDay(e.target.innerHTML);
    } else if (e.target.classList.contains("next-date")) {
      this.nextMonth();
      this.reactivateDay(e.target.innerHTML);
    }
  }

  reactivateDay(day) {
    setTimeout(() => {
      const days = document.querySelectorAll(".day");
      days.forEach(dayElem => {
        if (dayElem.innerHTML === day) {
          dayElem.classList.add("active");
        }
      });
    }, 100);
  }

  prevMonth() {
    this.month--;
    if (this.month < 0) {
      this.month = 11;
      this.year--;
    }
    this.initCalendar();
  }

  nextMonth() {
    this.month++;
    if (this.month > 11) {
      this.month = 0;
      this.year++;
    }
    this.initCalendar();
  }

  goToToday() {
    this.today = new Date();
    this.month = this.today.getMonth();
    this.year = this.today.getFullYear();
    this.initCalendar();
  }

  handleDateInput(e) {
    this.dateInput.value = this.dateInput.value.replace(/[^0-9/]/g, "");
    if (this.dateInput.value.length === 2) {
      this.dateInput.value += "/";
    }
    if (this.dateInput.value.length > 7) {
      this.dateInput.value = this.dateInput.value.slice(0, 7);
    }
    if (e.inputType === "deleteContentBackward" && this.dateInput.value.length === 3) {
      this.dateInput.value = this.dateInput.value.slice(0, 2);
    }
  }

  gotoDate() {
    const dateArr = this.dateInput.value.split("/");
    if (dateArr.length === 2 && dateArr[0] > 0 && dateArr[0] < 13 && dateArr[1].length === 4) {
      this.month = dateArr[0] - 1;
      this.year = dateArr[1];
      this.initCalendar();
    } else {
      alert("Invalid date. Please enter a valid date in format MM/YYYY");
    }
  }

  toggleAddEvent() {
    this.addEventContainer.classList.toggle("active");
  }

  closeAddEvent() {
    this.addEventContainer.classList.remove("active");
  }

  limitTitleInput(e) {
    this.addEventTitle.value = this.addEventTitle.value.slice(0, 50);
  }

  formatTimeInput(e) {
    e.target.value = e.target.value.replace(/[^0-9:]/g, "");
    if (e.target.value.length === 2) {
      e.target.value += ":";
    }
    if (e.target.value.length > 5) {
      e.target.value = e .target.value.slice(0, 5);
    }
  }

  handleOutsideClick(e) {
    if (e.target !== this.addEventBtn && !this.addEventContainer.contains(e.target)) {
      this.closeAddEvent();
    }
  }

  addEvent() {
    const eventTitle = this.addEventTitle.value;
    const eventTimeFrom = this.addEventFrom.value;
    const eventTimeTo = this.addEventTo.value;

    if (eventTitle === "" || eventTimeFrom === "" || eventTimeTo === "") {
      alert("Please fill all fields");
      return;
    }

    const timeFromArr = eventTimeFrom.split(":");
    const timeToArr = eventTimeTo.split(":");

    if (this.isInvalidTimeFormat(timeFromArr) || this.isInvalidTimeFormat(timeToArr)) {
      alert("Invalid time format. Please use HH:MM");
      return;
    }

    const newEvent = {
      title: eventTitle,
      time: `${this.convertTime(eventTimeFrom)} - ${this.convertTime(eventTimeTo)}`,
      alarmTime: eventTimeFrom // Menyimpan waktu alarm
    };

    let eventAdded = false;

    if (this.eventsArr.length > 0) {
      this.eventsArr.forEach(item => {
        if (item.day === this.activeDay && item.month === this.month + 1 && item.year === this.year) {
          item.events.push(newEvent);
          eventAdded = true;
        }
      });
    }

    if (!eventAdded) {
      this.eventsArr.push({
        day: this.activeDay,
        month: this.month + 1,
        year: this.year,
        events: [newEvent],
      });
    }

    this.notifier.createNotification(`Event "${eventTitle}" added!`);
    this.closeAddEvent();
    this.clearEventFields();
    this.updateEvents(this.activeDay);
    this.addEventClassToActiveDay();
  }

  isInvalidTimeFormat(timeArr) {
    return timeArr.length !== 2 || timeArr[0] > 23 || timeArr[1] > 59;
  }

  clearEventFields() {
    this.addEventTitle.value = "";
    this.addEventFrom.value = "";
    this.addEventTo.value = "";
  }

  addEventClassToActiveDay() {
    const activeDayElem = document.querySelector(".day.active");
    if (!activeDayElem.classList.contains("event")) {
      activeDayElem.classList.add("event");
    }
  }

  convertTime(time) {
    const timeArr = time.split(":");
    let timeHour = timeArr[0];
    const timeMin = timeArr[1];
    const timeFormat = timeHour >= 12 ? "PM" : "AM";
    timeHour = timeHour % 12 || 12;
    return `${timeHour} ${timeMin} ${timeFormat}`;
  }

  updateEvents(date) {
    let events = "";
    this.eventsArr.forEach(event => {
      if (date === event.day && this.month + 1 === event.month && this.year === event.year) {
        event.events.forEach(ev => {
          events += `
            <div class="event">
              <div class="title">
                <i class="fas fa-circle"></i>
                <h3 class="event-title">${ev.title}</h3>
              </div>
              <div class="event-time">
                <span class="event-time">${ev.time}</span>
              </div>
            </div>`;
        });
      }
    });

    if (events === "") {
      events = `<div class="no-event"><h3>No Events</h3></div>`;
    }

    this.eventsContainer.innerHTML = events;
    this.saveEvents();
  }

  deleteEvent(e) {
    if (e.target.classList.contains("event")) {
      const eventTitle = e.target.children[0].children[1].innerHTML;
      this.eventsArr.forEach(event => {
        if (event.day === this.activeDay && event.month === this.month + 1 && event.year === this.year) {
          event.events.forEach((item, index) => {
            if (item.title === eventTitle) {
              event.events.splice(index, 1);
            }
          });

          if (event.events.length === 0) {
            this.eventsArr.splice(this.eventsArr.indexOf(event), 1);
            const activeDayElem = document.querySelector(".day.active");
            if (activeDayElem.classList.contains("event")) {
              activeDayElem.classList.remove("event");
            }
          }
        }
      });

      this.updateEvents(this.activeDay);
    }
  }

  saveEvents() {
    localStorage.setItem("events", JSON.stringify(this.eventsArr));
  }

  getEvents() {
    const storedEvents = localStorage.getItem("events");
    if (storedEvents === null) {
      return;
    }

    try {
      const parsedEvents = JSON.parse(storedEvents);
      if (Array.isArray(parsedEvents)) {
        this.eventsArr.push(...parsedEvents);
      } else {
        console.error("Invalid data in localStorage: Not an array.");
      }
    } catch (error) {
      console.error("Error parsing JSON from localStorage:", error);
    }
  }

  getActiveDay(date) {
    const day = new Date(this.year, this.month, date);
    const dayName = day.toString().split(" ")[0];
    this.eventDay.innerHTML = dayName;
    this.eventDate.innerHTML = `${date} ${this.months[this.month]} ${this.year}`;
  }

  checkAlarm() {
    setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      this.eventsArr.forEach(event => {
        event.events.forEach(ev => {
          const [eventHour, eventMinute] = ev.alarmTime.split(":").map(Number);
          if (currentHour === eventHour && currentMinute === eventMinute) {
            this.notifier.createNotification(`Alarm: ${ev.title} is starting now!`, 5000);
          }
        });
      });
    }, 60000); // Memeriksa setiap menit
  }
}

// Initialize the calendar
const calendar = new Calendar();

// CSS for notifications
const style = document.createElement('style');
style.innerHTML = `
  .notifications-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
  }
  .notification {
    background-color: #4caf50; /* Green */
    color: white;
    padding: 15px;
    margin: 10px 0;
    border-radius: 5px;
    transition: opacity 0.5s ease;
  }
  .notification.fade-out {
    opacity: 0;
  }
`;
document.head.appendChild(style);