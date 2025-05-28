import { ValidationArguments } from 'class-validator';

export const EmailValidationMessage = (args: ValidationArguments) => {
  return `${args.property}은 이메일 형식이어야 합니다.`;
};
