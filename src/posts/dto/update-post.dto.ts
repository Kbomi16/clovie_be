import { IsNumber } from 'class-validator';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends CreatePostDto {
  @IsNumber()
  id: number;
}
