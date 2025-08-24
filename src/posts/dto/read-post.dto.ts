export class ReadPostDto {
  id: number;
  title: string;
  content: string; // 마크다운
  tags: string[];
  author: {
    id: number;
    nickname: string;
    profileUrl: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
