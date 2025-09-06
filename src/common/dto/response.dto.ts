export class SuccessResponse<T> {
  message: string;
  data: T;

  page?: number;
  limit?: number;
  totalCount?: number;
  totalPages?: number;

  constructor(
    message: string,
    data: T,
    page?: number,
    limit?: number,
    totalCount?: number,
  ) {
    this.message = message;
    this.data = data;
    this.page = page;
    this.limit = limit;
    this.totalCount = totalCount;
    this.totalPages =
      totalCount && limit ? Math.ceil(totalCount / limit) : undefined;
  }
}
