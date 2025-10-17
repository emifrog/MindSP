export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  type: string;
  color: string;
  location: string | null;
  creator: {
    firstName: string;
    lastName: string;
  };
  participants: Array<{
    status: string;
    user: {
      firstName: string;
      lastName: string;
    };
  }>;
}
