import { ANNOUNCEMENTS as ANN } from "features/announcements";

// Sort announcements latest first
const SORTED_ANNOUNCEMENTS = ANN.sort(
  (a, b) => b.date.getTime() - a.date.getTime()
);
//过去的公告
export const PAST_ANNOUNCEMENTS = SORTED_ANNOUNCEMENTS.filter(
  (announcement) => announcement.date < new Date()
);

export function hasAnnouncements() {
  const lastRead = getAnnouncementLastRead();
  console.log("lasteRead ", lastRead);
  console.log("PAST_ANNOUNCEMENTS", PAST_ANNOUNCEMENTS[0]);
  if (lastRead) {
    console.log(new Date(lastRead) < PAST_ANNOUNCEMENTS[0].date);
    return new Date(lastRead) < PAST_ANNOUNCEMENTS[0].date;
  } else return true;
}
export function getAnnouncements() {
  const storedDate = getAnnouncementLastRead();
  console.log("storeDate", storedDate);
  // Filter out announcements already read
  return storedDate
    ? PAST_ANNOUNCEMENTS.filter(
        (announcement) => announcement.date > new Date(storedDate)
      )
    : PAST_ANNOUNCEMENTS;
}

export function getAnnouncementLastRead() {
  return localStorage.getItem("announcementLastRead");
}
//确认阅读
export function acknowledgeRead() {
  return localStorage.setItem(
    "announcementLastRead",
    PAST_ANNOUNCEMENTS[0].date.toISOString()
  );
}

export function getGameRulesLastRead(): Date | null {
  const value = localStorage.getItem("gameRulesLastRead");
  if (!value) {
    return null;
  }

  return new Date(value);
}

export function acknowledgeGameRules() {
  return localStorage.setItem("gameRulesLastRead", new Date().toISOString());
}
