// Helper function to determine if a pass is still valid based on pass type and check-in time
export const isPassValid = (passType: string, checkInTime: string): boolean => {
  const checkInDate = new Date(checkInTime);
  const now = new Date();
  
  switch (passType) {
    case 'day-pass':
      // Day pass is valid from 8am to 7:59pm (20:00) on the same day
      const dayPassEnd = new Date(checkInDate);
      dayPassEnd.setHours(19, 59, 59, 999); // 7:59:59 PM
      return now <= dayPassEnd && checkInDate.getDate() === now.getDate();
      
    case 'night-pass':
      // Night pass is valid from 8pm (20:00) to 7:59am next day
      const nightPassEnd = new Date(checkInDate);
      if (checkInDate.getHours() >= 20) {
        // If checked in after 8pm, pass is valid until 7:59am next day
        nightPassEnd.setDate(nightPassEnd.getDate() + 1);
        nightPassEnd.setHours(7, 59, 59, 999); // 7:59:59 AM next day
      } else {
        // If checked in before 8pm, treat as same-day night pass until 7:59am next day
        nightPassEnd.setHours(7, 59, 59, 999);
        if (now > nightPassEnd) {
          nightPassEnd.setDate(nightPassEnd.getDate() + 1);
        }
      }
      return now <= nightPassEnd;
      
    case '1-day':
      // 1-day pass is valid for 24 hours from check-in time
      const oneDayEnd = new Date(checkInDate);
      oneDayEnd.setHours(oneDayEnd.getHours() + 24);
      return now <= oneDayEnd;
      
    case 'weekly':
      // Weekly pass is valid for 7 days from check-in time
      const weeklyEnd = new Date(checkInDate);
      weeklyEnd.setDate(weeklyEnd.getDate() + 7);
      return now <= weeklyEnd;
      
    case 'monthly':
      // Monthly pass is valid for 30 days from check-in time
      const monthlyEnd = new Date(checkInDate);
      monthlyEnd.setDate(monthlyEnd.getDate() + 30);
      return now <= monthlyEnd;
      
    case 'walk-in':
      // Walk-in customers are active until they check out (handled separately)
      return false;
      
    default:
      return false;
  }
};

// Helper function to calculate the end time of a pass
export const getPassEndTime = (passType: string, checkInTime: string): Date => {
  const checkInDate = new Date(checkInTime);
  
  switch (passType) {
    case 'day-pass':
      const dayPassEnd = new Date(checkInDate);
      dayPassEnd.setHours(19, 59, 59, 999); // 7:59:59 PM
      return dayPassEnd;
      
    case 'night-pass':
      const nightPassEnd = new Date(checkInDate);
      nightPassEnd.setDate(nightPassEnd.getDate() + 1);
      nightPassEnd.setHours(7, 59, 59, 999); // 7:59:59 AM next day
      return nightPassEnd;
      
    case '1-day':
      const oneDayEnd = new Date(checkInDate);
      oneDayEnd.setHours(oneDayEnd.getHours() + 24);
      return oneDayEnd;
      
    case 'weekly':
      const weeklyEnd = new Date(checkInDate);
      weeklyEnd.setDate(weeklyEnd.getDate() + 7);
      return weeklyEnd;
      
    case 'monthly':
      const monthlyEnd = new Date(checkInDate);
      monthlyEnd.setDate(monthlyEnd.getDate() + 30);
      return monthlyEnd;
      
    default:
      return checkInDate;
  }
};