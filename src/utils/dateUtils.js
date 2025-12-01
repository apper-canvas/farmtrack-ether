import { format, formatDistanceToNow, isToday, isTomorrow, isPast, addDays, differenceInDays } from "date-fns";

export const formatDate = (date, formatString = "MMM d, yyyy") => {
  if (!date) return "";
  return format(new Date(date), formatString);
};

export const formatDateTime = (date) => {
  if (!date) return "";
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
};

export const formatRelativeTime = (date) => {
  if (!date) return "";
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return "Today";
  }
  
  if (isTomorrow(dateObj)) {
    return "Tomorrow";
  }
  
  if (isPast(dateObj)) {
    return `${formatDistanceToNow(dateObj)} ago`;
  }
  
  return `in ${formatDistanceToNow(dateObj)}`;
};

export const getDaysUntilHarvest = (plantingDate, expectedHarvestDate) => {
  if (!plantingDate || !expectedHarvestDate) return null;
  
  const today = new Date();
  const harvest = new Date(expectedHarvestDate);
  
  return differenceInDays(harvest, today);
};

export const getCropGrowthStage = (plantingDate, expectedHarvestDate) => {
  if (!plantingDate || !expectedHarvestDate) return { stage: "unknown", progress: 0 };
  
  const planted = new Date(plantingDate);
  const harvest = new Date(expectedHarvestDate);
  const today = new Date();
  
  const totalDays = differenceInDays(harvest, planted);
  const daysPassed = differenceInDays(today, planted);
  
  const progress = Math.min(Math.max((daysPassed / totalDays) * 100, 0), 100);
  
  let stage = "planted";
  if (progress > 75) stage = "ready";
  else if (progress > 25) stage = "growing";
  
  return { stage, progress: Math.round(progress) };
};

export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  return due < today;
};

export const isDueSoon = (dueDate, daysThreshold = 3) => {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const threshold = addDays(new Date(), daysThreshold);
  return due <= threshold && !isPast(due);
};

export const getMonthName = (monthIndex) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months[monthIndex] || "";
};

export const getCurrentMonth = () => {
  const now = new Date();
  return {
    month: now.getMonth(),
    year: now.getFullYear(),
    name: getMonthName(now.getMonth())
  };
};

export const filterByMonth = (items, month, year, dateField = 'date') => {
  if (!Array.isArray(items)) return [];
  
  return items.filter(item => {
    const itemDate = new Date(item[dateField]);
    return itemDate.getMonth() === month && itemDate.getFullYear() === year;
  });
};

export const getLastNMonths = (n = 6) => {
  const months = [];
  const now = new Date();
  
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: date.getMonth(),
      year: date.getFullYear(),
      name: getMonthName(date.getMonth()),
      short: getMonthName(date.getMonth()).substring(0, 3)
    });
  }
  
  return months;
};