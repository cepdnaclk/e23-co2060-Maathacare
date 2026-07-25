export interface Appointment {
  id: string | number;
  fullDate?: string;
  time?: string;
  motherName?: string;
  reason?: string;
  status?: string;
  location?: string;
  gestationalAge?: string;
}

export interface Supplement {
  id?: string;
  name: string;
  dosage?: string;
  instructions: string;
}