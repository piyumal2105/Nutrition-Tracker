import { useEffect } from "react";

// Reminders Component
const Reminders = () => {
  useEffect(() => {
    // Lunch reminder at 12 PM
    const lunchReminder = setInterval(() => {
      if (new Date().getHours() === 12) {
        alert("Don't forget to log your lunch 🍱");
      }
    }, 3600000); // Check every hour

    // Water reminder every 2 hours
    const waterReminder = setInterval(() => {
      if (new Date().getHours() % 2 === 0) {
        alert("Drink a glass of water 💧");
      }
    }, 3600000);

    // Cleanup intervals
    return () => {
      clearInterval(lunchReminder);
      clearInterval(waterReminder);
    };
  }, []);

  return null;
};

export default Reminders;
