export type OutreachRecipient = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  unsubscribeToken?: string | null;
};

export type OutreachStep = {
  step: number;
  dayOffset: number;
  subject: string;
  bodyHtml: string;
  renderHtml: (recipient: OutreachRecipient) => string;
};
