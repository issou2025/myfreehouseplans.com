export type Message = {
  id: string;
  name: string;
  email: string;
  country: string;
  subject: string;
  planConcerned: string;
  message?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  status: "New" | "Read" | "Replied" | "Archived";
  type?: "Custom plan request" | "Question before purchase" | "Download problem" | "Modification request" | "Professional service";
  date: string;
};
