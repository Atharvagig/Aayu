
export enum Sender {
  User = 'user',
  AI = 'ai',
}

export interface Message {
  id: number;
  text: string;
  sender: Sender;
  isError?: boolean;
}
