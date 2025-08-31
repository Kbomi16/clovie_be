export class SuccessResponse<T> {
  message: string;
  data: T;

  // 선택적 페이징 필드
  offset?: number;
  limit?: number;
  totalCount?: number;

  constructor(
    message: string,
    data: T,
    offset?: number,
    limit?: number,
    totalCount?: number,
  ) {
    this.message = message;
    this.data = data;
    this.offset = offset;
    this.limit = limit;
    this.totalCount = totalCount;
  }
}
