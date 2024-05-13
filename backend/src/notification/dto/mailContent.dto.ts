import { Address } from 'nodemailer/lib/mailer';

export class mailContent {
  from?: Address;
  recipients: Address[];
  subject: string;
  html: string;
  placeholderReplacements?: Record<string, string>;
}
