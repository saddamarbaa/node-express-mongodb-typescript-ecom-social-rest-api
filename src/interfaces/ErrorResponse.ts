import MessageResponse from './MessageResponse';

export interface ErrorResponse extends MessageResponse {
  stack?: string;
}

export default ErrorResponse;
