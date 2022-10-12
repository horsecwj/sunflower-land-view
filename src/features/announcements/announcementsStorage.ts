import { ANNOUNCEMENTS as ANN } from "features/announcements";

// Sort announcements latest first
const SORTED_ANNOUNCEMENTS = ANN.sort(
  (a, b) => b.date.getTime() - a.date.getTime()
);

export const PAST_ANNOUNCEMENTS = SORTED_ANNOUNCEMENTS.filter(
  (announcement) => announcement.date < new Date()
);

export function hasAnnouncements() {
  const lastRead = getAnnouncementLastRead();
  let flag = false;
  if (lastRead) {
    flag = new Date(lastRead) < PAST_ANNOUNCEMENTS[0].date;
  } else {
    flag = true;
  }
  console.log("i am in hasAnnouceMents return,return flag is  ", flag);
}

export function getAnnouncements() {
  const storedDate = getAnnouncementLastRead();

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

export function acknowledgeRead() {
  return localStorage.setItem(
    "announcementLastRead",
    PAST_ANNOUNCEMENTS[0].date.toISOString()
  );
}
