import {
  IsEmail,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Grade } from '../constants/grade.enum';

export class CreateUserDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^[가-힣a-zA-Z0-9_]{2,20}$/)
  nickname: string;

  @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
  @Matches(/^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])\S{8,64}$/, {
    message:
      '비밀번호는 8~64자이며, 소문자·숫자·특수문자를 포함하고 공백이 없어야 합니다.',
  })
  password: string;

  // 기본값(새싹)
  @IsEnum(Grade)
  @IsOptional()
  grade?: Grade;
}
