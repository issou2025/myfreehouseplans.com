import type { Message } from "@/types/message";

export const mockMessages: Message[] = [
  { id: "msg-001", name: "Amina Diallo", email: "amina@example.com", country: "Niger", subject: "Need a 20x20m / 66x66 ft family plan", planConcerned: "Modern 3 Bedroom House Plan", status: "New", type: "Custom plan request", date: "May 27, 2026", message: "I have a 20x20m / 66x66 ft plot and need a family house with shaded outdoor living." },
  { id: "msg-002", name: "Samuel Okoro", email: "samuel@example.com", country: "Nigeria", subject: "DWG package question", planConcerned: "Duplex House Plan with Revit Files", status: "Read", type: "Question before purchase", date: "May 26, 2026", message: "Does the CAD/Revit package include IFC and editable source files?" },
  { id: "msg-003", name: "Fatou Ndiaye", email: "fatou@example.com", country: "Senegal", subject: "Can you modify terrace size?", planConcerned: "African Family House Plan with Veranda", status: "Replied", type: "Modification request", date: "May 25, 2026", message: "I want a bigger veranda and an extra outdoor kitchen area." },
  { id: "msg-004", name: "Chris Mensah", email: "chris@example.com", country: "Ghana", subject: "Budget rental units", planConcerned: "Simple Rental Unit House Plan", status: "New", type: "Professional service", date: "May 24, 2026", message: "I need a compound layout with repeatable rental units." },
  { id: "msg-005", name: "Leila Haddad", email: "leila@example.com", country: "Morocco", subject: "Premium PDF contents", planConcerned: "Small 2 Bedroom House Plan with Terrace", status: "Archived", type: "Download problem", date: "May 22, 2026", message: "I want to know exactly which drawings are included in the premium PDF." }
];
